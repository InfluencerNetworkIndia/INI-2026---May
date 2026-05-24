import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const { phone, otp } = await request.json()
  const digits = String(phone ?? '').replace(/\D/g, '')

  if (digits.length !== 10 || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const authKey = process.env.MSG91_AUTH_KEY
  if (!authKey) {
    return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
  }

  // Verify OTP with MSG91
  const verifyRes = await fetch(
    `https://control.msg91.com/api/v5/otp/verify?mobile=91${digits}&otp=${encodeURIComponent(otp)}`,
    { headers: { authkey: authKey } }
  )
  const verifyData = await verifyRes.json()

  if (verifyData.type !== 'success') {
    return NextResponse.json(
      { error: 'Invalid or expired OTP. Please try again.' },
      { status: 400 }
    )
  }

  // OTP valid — get or create Supabase user
  const phoneE164 = `+91${digits}`
  const derivedEmail = `${digits}@phone.garbhamitra.app`

  // Look up existing user via profiles table (phone column)
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, onboarding_completed')
    .eq('phone', phoneE164)
    .single()

  let userId: string
  let onboardingCompleted = false

  if (existingProfile) {
    userId = existingProfile.id
    onboardingCompleted = existingProfile.onboarding_completed ?? false
  } else {
    // New user — create auth account
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email: derivedEmail,
      phone: phoneE164,
      email_confirm: true,
      phone_confirm: true,
    })

    if (createErr || !newUser.user) {
      console.error('createUser error:', createErr)
      return NextResponse.json({ error: 'Account creation failed' }, { status: 500 })
    }

    userId = newUser.user.id

    // Seed profile row so future logins can find this user by phone
    await admin.from('profiles').insert({ id: userId, phone: phoneE164 })
  }

  // Ensure the user has an email for magic-link exchange
  const { data: userRecord } = await admin.auth.admin.getUserById(userId)
  const emailForLink = userRecord?.user.email ?? derivedEmail

  if (!userRecord?.user.email) {
    await admin.auth.admin.updateUserById(userId, {
      email: derivedEmail,
      email_confirm: true,
    })
  }

  // Generate a one-time magic-link token the client will exchange for a session
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: emailForLink,
  })

  if (linkErr || !linkData) {
    console.error('generateLink error:', linkErr)
    return NextResponse.json({ error: 'Session creation failed' }, { status: 500 })
  }

  return NextResponse.json({
    email: emailForLink,
    token: linkData.properties.email_otp,
    onboarding_completed: onboardingCompleted,
  })
}
