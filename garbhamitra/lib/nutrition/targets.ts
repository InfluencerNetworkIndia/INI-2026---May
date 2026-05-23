import type { Profile, HealthProfile, NutritionTargets, Trimester } from '@/types'

// Pure computed targets — excludes DB-specific id/user_id/updated_at
export type TargetValues = Omit<NutritionTargets, 'id' | 'user_id' | 'updated_at'>

type BaseRow = {
  calories: number
  protein_g: number
  iron_mg: number
  calcium_mg: number
  folate_mcg: number
  b12_mcg: number
  water_ml: number
  fiber_g: number
  dha_mg: number
  vitamin_d_iu: number
}

const BASE_TARGETS: Record<Trimester, BaseRow> = {
  1: { calories: 1800, protein_g: 60,  iron_mg: 27, calcium_mg: 1000, folate_mcg: 600, b12_mcg: 2.6, water_ml: 2000, fiber_g: 25, dha_mg: 200, vitamin_d_iu: 600 },
  2: { calories: 2100, protein_g: 75,  iron_mg: 27, calcium_mg: 1000, folate_mcg: 600, b12_mcg: 2.6, water_ml: 2500, fiber_g: 28, dha_mg: 200, vitamin_d_iu: 600 },
  3: { calories: 2400, protein_g: 80,  iron_mg: 27, calcium_mg: 1200, folate_mcg: 600, b12_mcg: 2.6, water_ml: 3000, fiber_g: 30, dha_mg: 300, vitamin_d_iu: 600 },
}

export function calculateNutritionTargets(
  profile: Profile,
  healthProfile: HealthProfile
): TargetValues {
  const trimester = (profile.trimester ?? 2) as Trimester
  const base: BaseRow = { ...BASE_TARGETS[trimester] }
  const flags: string[] = []

  // Step 2 — BMI
  const heightM = (profile.height_cm ?? 160) / 100
  const preBmi = healthProfile.pre_pregnancy_weight_kg
    ? healthProfile.pre_pregnancy_weight_kg / (heightM * heightM)
    : null

  // Step 3 — Calorie adjustments by pre-pregnancy BMI
  if (preBmi !== null && preBmi < 18.5) {
    base.calories += 300
    flags.push('underweight_extra_calories')
  }
  if (preBmi !== null && preBmi > 30) {
    base.calories -= 100
    flags.push('obese_calorie_reduction')
  }

  // Step 4 — Medical condition adjustments
  if (healthProfile.has_gestational_diabetes) {
    flags.push('monitor_simple_carbs')
    flags.push('limit_sugar_per_meal_to_30g')
  }

  if (healthProfile.has_iron_deficiency || healthProfile.has_anemia) {
    base.iron_mg = 35
    flags.push('pair_iron_with_vitamin_c')
    flags.push('avoid_tea_coffee_with_meals')
  }

  if (healthProfile.has_b12_deficiency) {
    base.b12_mcg = 4.0
    flags.push('b12_supplement_critical')
  }

  if (healthProfile.has_bp_issue) {
    base.water_ml += 500
    flags.push('limit_sodium_to_1500mg')
  }

  if (healthProfile.has_thyroid) {
    flags.push('consistent_iodine_intake')
  }

  // Step 5 — Food preference adjustments
  if (profile.food_preference === 'vegetarian' || profile.food_preference === 'jain') {
    base.b12_mcg = 3.5
    flags.push('b12_supplement_recommended')
    base.dha_mg = 250
    flags.push('consider_algal_dha_supplement')
  }

  // Step 6 — Activity level adjustments
  if (healthProfile.activity_level === 'active') {
    base.calories += 200
    flags.push('active_calorie_bonus')
  }
  if (healthProfile.activity_level === 'sedentary') {
    base.calories -= 100
    flags.push('sedentary_calorie_reduction')
  }

  return {
    trimester,
    target_calories: base.calories,
    target_protein_g: base.protein_g,
    target_iron_mg: base.iron_mg,
    target_calcium_mg: base.calcium_mg,
    target_folate_mcg: base.folate_mcg,
    target_b12_mcg: base.b12_mcg,
    target_water_ml: base.water_ml,
    target_fiber_g: base.fiber_g,
    target_dha_mg: base.dha_mg,
    target_vitamin_d_iu: base.vitamin_d_iu,
    adjustment_reasons: flags,
  }
}
