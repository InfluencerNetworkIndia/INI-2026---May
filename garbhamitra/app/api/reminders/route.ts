import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sender'
import { formatDailySummary } from '@/lib/whatsapp/messages'
import type { Profile, NutritionTargets, DailySummary } from '@/types'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

type UserRow = {
  id: string
  name: string | null
  phone: string | null
  pregnancy_week: number | null
}

export async function POST(request: NextRequest) {
  // Verify Vercel cron secret
  const auth = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get('type') as
    | 'morning'
    | 'hydration'
    | 'evening_summary'
    | null

  if (!type) {
    return Response.json({ error: 'type param required' }, { status: 400 })
  }

  const db = admin()
  const today = new Date().toISOString().split('T')[0]

  // Fetch all onboarded users with a phone number
  const { data: users, error } = await db
    .from('profiles')
    .select('id, name, phone, pregnancy_week')
    .eq('onboarding_completed', true)
    .not('phone', 'is', null)

  if (error) {
    console.error('Reminders: profiles fetch error', error)
    return Response.json({ error: 'DB error' }, { status: 500 })
  }

  const rows = (users ?? []) as UserRow[]
  let sent = 0

  for (const user of rows) {
    if (!user.phone) continue

    try {
      if (type === 'morning') {
        // Fetch supplements
        const { data: health } = await db
          .from('health_profiles')
          .select('current_supplements')
          .eq('user_id', user.id)
          .single()

        const supplements = (health?.current_supplements as string[] | null)?.join(', ') || 'your supplements'
        const name = user.name ?? 'Mama'
        await sendWhatsAppMessage(
          user.phone,
          `🌅 ${greeting()}, ${name}!\n\nDon't forget: *${supplements}* today 💊\n\nWhat did you have for breakfast? Tell me and I'll track it! 🍽`
        )
        sent++
      }

      if (type === 'hydration') {
        const { data: summary } = await db
          .from('daily_summaries')
          .select('total_hydration_ml')
          .eq('user_id', user.id)
          .eq('date', today)
          .single()

        const { data: targets } = await db
          .from('nutrition_targets')
          .select('target_water_ml')
          .eq('user_id', user.id)
          .single()

        const current   = (summary?.total_hydration_ml as number | null) ?? 0
        const target    = (targets?.target_water_ml as number | null) ?? 2500
        const remaining = Math.max(0, target - current)

        if (current < target * 0.5) {
          const name = user.name ?? 'Mama'
          await sendWhatsAppMessage(
            user.phone,
            `💧 Hydration check, ${name}!\n\nYou've had *${(current / 1000).toFixed(1)}L* today. Try drinking *${(remaining / 1000).toFixed(1)}L* more 💧\n\nCoconut water or nimbu pani is great! 🥥`
          )
          sent++
        }
      }

      if (type === 'evening_summary') {
        const [summaryRes, targetsRes] = await Promise.all([
          db.from('daily_summaries').select('*').eq('user_id', user.id).eq('date', today).single(),
          db.from('nutrition_targets').select('*').eq('user_id', user.id).single(),
        ])

        if (summaryRes.data && targetsRes.data) {
          await sendWhatsAppMessage(
            user.phone,
            formatDailySummary(
              summaryRes.data as DailySummary,
              targetsRes.data as NutritionTargets,
              user.name ?? 'Mama'
            )
          )
          sent++
        }
      }
    } catch (err) {
      console.error(`Reminder send failed for ${user.id}:`, err)
    }
  }

  return Response.json({ ok: true, type, sent, total: rows.length })
}
