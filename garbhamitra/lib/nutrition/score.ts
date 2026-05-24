import type { DailySummary, NutritionTargets, FoodLog } from '@/types'
import type { TargetValues } from './targets'

type Targets = NutritionTargets | TargetValues

// Approximate caffeine per serving (mg) by food name keyword
function estimateCaffeineMg(logs: FoodLog[]): number {
  let mg = 0
  for (const log of logs) {
    const name = log.food_name_raw.toLowerCase()
    const qty = log.quantity || 1
    if (name.includes('coffee')) mg += 80 * qty
    else if (name.includes('chai') || (name.includes('tea') && !name.includes('green tea'))) mg += 25 * qty
    else if (name.includes('green tea')) mg += 15 * qty
  }
  return mg
}

export function calculatePregnancySafeScore(
  summary: DailySummary,
  targets: Targets,
  logs: FoodLog[]
): number {
  let score = 60

  // +10 if calories within 80–110% of target
  const calRatio = summary.total_calories / (targets.target_calories || 1)
  if (calRatio >= 0.8 && calRatio <= 1.1) score += 10

  // +8 if protein > 70% of target
  if (summary.total_protein_g >= targets.target_protein_g * 0.7) score += 8

  // +8 if iron > 70% of target
  if (summary.total_iron_mg >= targets.target_iron_mg * 0.7) score += 8

  // +6 if calcium > 70% of target
  if (summary.total_calcium_mg >= targets.target_calcium_mg * 0.7) score += 6

  // +6 if hydration > 70% of target
  if (summary.total_hydration_ml >= targets.target_water_ml * 0.7) score += 6

  // +4 if folate > 70% of target
  if (summary.total_folate_mcg >= targets.target_folate_mcg * 0.7) score += 4

  // +4 if fiber > 60% of target
  if (summary.total_fiber_g >= targets.target_fiber_g * 0.6) score += 4

  // -10 per danger-flagged food, -5 per warn-flagged food
  for (const log of logs) {
    if (log.safety_flag === 'danger') score -= 10
    else if (log.safety_flag === 'warn') score -= 5
  }

  // -5 if caffeine intake exceeds 200mg
  if (estimateCaffeineMg(logs) > 200) score -= 5

  return Math.max(0, Math.min(100, score))
}
