export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'

export type FoodPreference = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'eggetarian'

export type Trimester = 1 | 2 | 3

export interface Profile {
  id: string
  name: string
  phone: string
  age: number | null
  height_cm: number | null
  city: string | null
  food_preference: FoodPreference | null
  regional_cuisine: string | null
  pregnancy_week: number | null
  due_date: string | null
  trimester: Trimester | null
  created_at: string
}

export interface HealthProfile {
  id: string
  user_id: string
  weight_kg: number | null
  pre_pregnancy_weight_kg: number | null
  bmi: number | null
  blood_group: string | null
  gestational_diabetes: boolean
  anemia: boolean
  hypertension: boolean
  allergies: string[]
  medications: string[]
  updated_at: string
}

export interface FoodItem {
  id: string
  name_english: string
  name_hindi: string | null
  aliases: string[]
  category: string
  cuisine_tag: string | null
  serving_unit: string
  serving_size_grams: number
  calories: number
  protein_g: number
  carbs_g: number
  fiber_g: number
  fat_g: number
  iron_mg: number
  calcium_mg: number
  folate_mcg: number
  b12_mcg: number
  vitamin_d_iu: number
  sodium_mg: number
  pregnancy_safe: boolean
  pregnancy_notes: string | null
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
  source: 'manual' | 'whatsapp' | 'ai' | 'barcode'
  calories: number
  protein_g: number
  iron_mg: number
  calcium_mg: number
  folate_mcg: number
  hydration_ml: number
  notes: string | null
}

export interface DailySummary {
  id: string
  user_id: string
  date: string
  total_calories: number
  total_protein_g: number
  total_carbs_g: number
  total_fat_g: number
  total_fiber_g: number
  total_iron_mg: number
  total_calcium_mg: number
  total_folate_mcg: number
  total_b12_mcg: number
  total_vitamin_d_iu: number
  total_water_ml: number
  meal_count: number
}

export interface NutritionTargets {
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

export interface WhatsAppSession {
  id: string
  user_id: string
  phone: string
  session_state: string
  context: Record<string, unknown>
  last_message_at: string
  created_at: string
}

export interface TrimesterTargets {
  trimester: Trimester
  targets: NutritionTargets
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
