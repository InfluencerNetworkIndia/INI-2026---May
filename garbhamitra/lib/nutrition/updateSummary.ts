import { createClient } from '@/lib/supabase/server'
import { calculatePregnancySafeScore } from './score'
import type { DailySummary, FoodLog, NutritionTargets } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Pairs of [summary_column, target_column, display_name]
const NUTRIENT_PAIRS: Array<[keyof typeof ZERO_TOTALS, keyof NutritionTargets, string]> = [
  ['total_calories',   'target_calories',   'calories'],
  ['total_protein_g',  'target_protein_g',  'protein'],
  ['total_iron_mg',    'target_iron_mg',    'iron'],
  ['total_calcium_mg', 'target_calcium_mg', 'calcium'],
  ['total_folate_mcg', 'target_folate_mcg', 'folate'],
  ['total_b12_mcg',    'target_b12_mcg',    'b12'],
  ['total_hydration_ml','target_water_ml',  'water'],
  ['total_fiber_g',    'target_fiber_g',    'fiber'],
]

const ZERO_TOTALS = {
  total_calories: 0,
  total_protein_g: 0,
  total_iron_mg: 0,
  total_calcium_mg: 0,
  total_folate_mcg: 0,
  total_b12_mcg: 0,
  total_hydration_ml: 0,
  total_fiber_g: 0,
  meal_count: 0,
} as const

async function _updateSummary(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<DailySummary> {
  // 1. Fetch all food logs for the day
  const { data: rawLogs, error: logsError } = await client
    .from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', `${date}T00:00:00.000Z`)
    .lte('logged_at', `${date}T23:59:59.999Z`)

  if (logsError) throw new Error(`Logs fetch failed: ${logsError.message}`)
  const logs = (rawLogs ?? []) as FoodLog[]

  // 2. Sum all nutritional values
  const totals = logs.reduce(
    (acc, log) => {
      acc.total_calories    += log.calories     ?? 0
      acc.total_protein_g   += log.protein_g    ?? 0
      acc.total_iron_mg     += log.iron_mg      ?? 0
      acc.total_calcium_mg  += log.calcium_mg   ?? 0
      acc.total_folate_mcg  += log.folate_mcg   ?? 0
      acc.total_b12_mcg     += log.b12_mcg      ?? 0
      acc.total_hydration_ml += log.hydration_ml ?? 0
      acc.total_fiber_g     += log.fiber_g      ?? 0
      acc.meal_count        += 1
      return acc
    },
    { ...ZERO_TOTALS }
  )

  // 3. Fetch user's nutrition targets
  const { data: targetsRow } = await client
    .from('nutrition_targets')
    .select('*')
    .eq('user_id', userId)
    .single()

  const targets = targetsRow as NutritionTargets | null

  // 4. Calculate pregnancy safe score
  const partialSummary = { ...totals, user_id: userId, date } as unknown as DailySummary
  const score = targets ? calculatePregnancySafeScore(partialSummary, targets, logs) : null

  // 5. Deficiency flags — nutrients below 50% of target
  const deficiency_flags: string[] = []
  if (targets) {
    for (const [summaryKey, targetKey, name] of NUTRIENT_PAIRS) {
      const actual = totals[summaryKey] as number
      const target = (targets[targetKey] as number) ?? 0
      if (target > 0 && actual < target * 0.5) deficiency_flags.push(name)
    }
  }

  // 6. Positive flags — nutrients at or above 80% of target
  const positive_flags: string[] = []
  if (targets) {
    for (const [summaryKey, targetKey, name] of NUTRIENT_PAIRS) {
      const actual = totals[summaryKey] as number
      const target = (targets[targetKey] as number) ?? 0
      if (target > 0 && actual >= target * 0.8) positive_flags.push(name)
    }
  }

  // 7. Upsert into daily_summaries
  const { data: upserted, error: upsertError } = await client
    .from('daily_summaries')
    .upsert(
      {
        user_id: userId,
        date,
        ...totals,
        pregnancy_safe_score: score,
        deficiency_flags,
        positive_flags,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (upsertError) throw new Error(`Summary upsert failed: ${upsertError.message}`)

  return upserted as DailySummary
}

// Standard server-component version (reads cookies for auth)
export async function updateDailySummary(userId: string, date: string): Promise<DailySummary> {
  const supabase = await createClient()
  return _updateSummary(supabase as unknown as SupabaseClient, userId, date)
}

// Admin / non-cookie version — pass any Supabase client (service role, anon, etc.)
export async function updateDailySummaryWithClient(
  client: SupabaseClient,
  userId: string,
  date: string
): Promise<DailySummary> {
  return _updateSummary(client, userId, date)
}
