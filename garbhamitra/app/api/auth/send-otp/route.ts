import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { phone } = await request.json()
  const digits = String(phone ?? '').replace(/\D/g, '')

  if (digits.length !== 10) {
    return NextResponse.json({ error: 'Enter a valid 10-digit number' }, { status: 400 })
  }

  const authKey = process.env.MSG91_AUTH_KEY
  if (!authKey) {
    return NextResponse.json({ error: 'SMS service not configured' }, { status: 500 })
  }

  const body: Record<string, unknown> = {
    mobile: `91${digits}`,
    otp_length: 6,
    otp_expiry: 10,
  }
  if (process.env.MSG91_OTP_TEMPLATE_ID) {
    body.template_id = process.env.MSG91_OTP_TEMPLATE_ID
  }

  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { authkey: authKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (data.type === 'error') {
    console.error('MSG91 send-otp error:', data.message)
    return NextResponse.json({ error: data.message ?? 'Failed to send OTP' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
