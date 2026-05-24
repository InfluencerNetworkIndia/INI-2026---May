export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'

export type FoodPreference = 'vegetarian' | 'non-vegetarian' | 'eggetarian' | 'jain'

export type FoodSource = 'homemade' | 'restaurant' | 'packaged' | 'unknown'

export type PregnancySafe = 'safe' | 'avoid' | 'moderate'

export type Trimester = 1 | 2 | 3

export interface Profile {
  id: string
  name: string | null
  phone: string | null
  age: number | null
  height_cm: number | null
  city: string | null
  state: string | null
  food_preference: FoodPreference | null
  regional_cuisine: string | null
  pregnancy_week: number | null
  due_date: string | null
  trimester: Trimester | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface HealthProfile {
  id: string
  user_id: string
  weight_kg: number | null
  pre_pregnancy_weight_kg: number | null
  has_gestational_diabetes: boolean
  has_thyroid: boolean
  has_iron_deficiency: boolean
  has_b12_deficiency: boolean
  has_bp_issue: boolean
  has_pcos: boolean
  has_anemia: boolean
  allergies: string[]
  current_supplements: string[]
  doctor_restrictions: string | null
  nausea_level: number | null
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | null
  sleep_hours: number | null
  meals_per_day: number
  updated_at: string
}

export interface FoodItem {
  id: string
  name_english: string
  name_hindi: string | null
  name_regional: string | null
  aliases: string[]
  category: string
  cuisine_tag: string | null
  serving_unit: string
  serving_size_grams: number | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fiber_g: number | null
  fat_g: number | null
  saturated_fat_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  iron_mg: number | null
  calcium_mg: number | null
  folate_mcg: number | null
  b12_mcg: number | null
  vitamin_d_iu: number | null
  zinc_mg: number | null
  omega3_mg: number | null
  dha_mg: number | null
  choline_mg: number | null
  magnesium_mg: number | null
  potassium_mg: number | null
  hydration_per_serving_ml: number | null
  pregnancy_safe: PregnancySafe
  pregnancy_notes: string | null
  trimester_notes: Record<string, string>
  is_verified: boolean
  created_at: string
}

export interface FoodLog {
  id: string
  user_id: string
  logged_at: string
  meal_type: MealType
  food_item_id: string | null
  food_name_raw: string
  quantity: number
  quantity_unit: string
  source: FoodSource
  calories: number
  protein_g: number
  carbs_g: number
  fiber_g: number
  fat_g: number
  iron_mg: number
  calcium_mg: number
  folate_mcg: number
  b12_mcg: number
  hydration_ml: number
  safety_flag: string | null
  ai_notes: string | null
  created_at: string
}

export interface DailySummary {
  id: string
  user_id: string
  date: string
  total_calories: number
  total_protein_g: number
  total_iron_mg: number
  total_calcium_mg: number
  total_folate_mcg: number
  total_b12_mcg: number
  total_hydration_ml: number
  total_fiber_g: number
  pregnancy_safe_score: number | null
  deficiency_flags: string[]
  positive_flags: string[]
  meal_count: number
  weight_kg: number | null
}

export interface NutritionTargets {
  id: string
  user_id: string
  trimester: Trimester | null
  target_calories: number
  target_protein_g: number
  target_iron_mg: number
  target_calcium_mg: number
  target_folate_mcg: number
  target_b12_mcg: number
  target_water_ml: number
  target_fiber_g: number
  target_dha_mg: number
  target_vitamin_d_iu: number
  adjustment_reasons: string[]
  updated_at: string
}

export interface WhatsAppSession {
  id: string
  user_id: string | null
  phone: string
  session_state: string
  pending_log: Record<string, unknown>
  conversation_history: unknown[]
  last_message_at: string
}

export interface TrimesterTargets {
  trimester: Trimester
  targets: Omit<NutritionTargets, 'id' | 'user_id' | 'adjustment_reasons' | 'updated_at'>
  notes: string[]
}

export interface DeficiencyAlert {
  id: string
  user_id: string
  nutrient: string
  severity: 'mild' | 'moderate' | 'severe'
  current_value: number
  target_value: number
  recommendation: string
  created_at: string
  resolved_at: string | null
}
