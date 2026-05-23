import { createClient } from '@/lib/supabase/server'
import type {
  Profile,
  HealthProfile,
  FoodItem,
  FoodLog,
  DailySummary,
  NutritionTargets,
} from '@/types'

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

// ── Health profiles ───────────────────────────────────────────────────────────

export async function getUserHealthProfile(
  userId: string
): Promise<HealthProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as HealthProfile
}

// ── Nutrition targets ─────────────────────────────────────────────────────────

export async function getNutritionTargets(
  userId: string
): Promise<NutritionTargets | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('nutrition_targets')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data as NutritionTargets
}

// ── Daily summary ─────────────────────────────────────────────────────────────

export async function getTodaysSummary(
  userId: string
): Promise<DailySummary | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  if (error) return null
  return data as DailySummary
}

export async function getWeeklySummaries(
  userId: string,
  days = 7
): Promise<DailySummary[]> {
  const supabase = await createClient()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  const fromDate = from.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDate)
    .order('date', { ascending: true })

  if (error) return []
  return (data ?? []) as DailySummary[]
}

// ── Food logs ─────────────────────────────────────────────────────────────────

export async function getTodaysFoodLogs(userId: string): Promise<FoodLog[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', `${today}T00:00:00.000Z`)
    .lte('logged_at', `${today}T23:59:59.999Z`)
    .order('logged_at', { ascending: true })

  if (error) return []
  return (data ?? []) as FoodLog[]
}

export async function saveFoodLog(log: Partial<FoodLog>): Promise<FoodLog> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('food_logs')
    .insert(log)
    .select()
    .single()

  if (error) throw new Error(`Failed to save food log: ${error.message}`)
  return data as FoodLog
}

// ── Daily summary recalculation ───────────────────────────────────────────────

export async function updateDailySummary(
  userId: string,
  date: string
): Promise<void> {
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('food_logs')
    .select(
      'calories, protein_g, iron_mg, calcium_mg, folate_mcg, b12_mcg, hydration_ml, fiber_g'
    )
    .eq('user_id', userId)
    .gte('logged_at', `${date}T00:00:00.000Z`)
    .lte('logged_at', `${date}T23:59:59.999Z`)

  if (error) throw new Error(`Failed to fetch logs for summary: ${error.message}`)

  const zero = {
    total_calories: 0,
    total_protein_g: 0,
    total_iron_mg: 0,
    total_calcium_mg: 0,
    total_folate_mcg: 0,
    total_b12_mcg: 0,
    total_hydration_ml: 0,
    total_fiber_g: 0,
    meal_count: 0,
  }

  const totals = (logs ?? []).reduce((acc, log) => {
    acc.total_calories += log.calories ?? 0
    acc.total_protein_g += log.protein_g ?? 0
    acc.total_iron_mg += log.iron_mg ?? 0
    acc.total_calcium_mg += log.calcium_mg ?? 0
    acc.total_folate_mcg += log.folate_mcg ?? 0
    acc.total_b12_mcg += log.b12_mcg ?? 0
    acc.total_hydration_ml += log.hydration_ml ?? 0
    acc.total_fiber_g += log.fiber_g ?? 0
    acc.meal_count += 1
    return acc
  }, zero)

  const { error: upsertError } = await supabase
    .from('daily_summaries')
    .upsert(
      { user_id: userId, date, ...totals },
      { onConflict: 'user_id,date' }
    )

  if (upsertError)
    throw new Error(`Failed to upsert daily summary: ${upsertError.message}`)
}

// ── Food search ───────────────────────────────────────────────────────────────

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const supabase = await createClient()
  const term = query.trim()
  if (!term) return []

  // Primary: full-text search on name_english (uses GIN index)
  // Fallback: ilike match so partial strings and Hindi names also hit
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .or(
      `name_english.ilike.%${term}%,name_hindi.ilike.%${term}%,name_regional.ilike.%${term}%`
    )
    .order('is_verified', { ascending: false })
    .limit(20)

  if (error) return []
  return (data ?? []) as FoodItem[]
}
