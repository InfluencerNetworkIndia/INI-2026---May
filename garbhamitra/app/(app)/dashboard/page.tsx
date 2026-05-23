import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateDailyAlerts } from '@/lib/nutrition/alerts'
import { calculatePregnancySafeScore } from '@/lib/nutrition/score'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Profile, HealthProfile, NutritionTargets, DailySummary, FoodLog } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const weekStart = sevenDaysAgo.toISOString().split('T')[0]

  const [profileRes, healthRes, targetsRes, summaryRes, logsRes, weeklyRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('health_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('nutrition_targets').select('*').eq('user_id', user.id).single(),
    supabase.from('daily_summaries').select('*').eq('user_id', user.id).eq('date', today).single(),
    supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', `${today}T00:00:00.000Z`)
      .lte('logged_at', `${today}T23:59:59.999Z`)
      .order('logged_at', { ascending: false }),
    supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStart)
      .order('date', { ascending: true }),
  ])

  const profile = profileRes.data as Profile | null
  if (!profile) redirect('/onboarding')
  if (!profile.onboarding_completed) redirect('/onboarding')

  const healthProfile = healthRes.data as HealthProfile | null
  const targets = targetsRes.data as NutritionTargets | null
  const todaySummary = summaryRes.data as DailySummary | null
  const todaysLogs = (logsRes.data ?? []) as FoodLog[]
  const weeklySummaries = (weeklyRes.data ?? []) as DailySummary[]

  const alerts =
    todaySummary && targets
      ? generateDailyAlerts(todaySummary, targets, profile, healthProfile)
      : []

  const pregnancySafeScore =
    todaySummary && targets
      ? calculatePregnancySafeScore(todaySummary, targets, todaysLogs)
      : 0

  return (
    <DashboardClient
      initialData={{
        profile,
        targets: targets!,
        todaySummary,
        todaysLogs,
        weeklySummaries,
        alerts,
        pregnancySafeScore,
      }}
    />
  )
}
