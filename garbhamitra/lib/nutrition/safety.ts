import type { FoodItem, Profile, HealthProfile } from '@/types'

export type SafetyResult = {
  level: 'safe' | 'warn' | 'danger'
  message: string | null
  recommendation: string | null
}

const CAFFEINE_KEYWORDS = ['chai', 'coffee', 'tea', 'green tea']

function isCaffeinated(food: FoodItem): boolean {
  const name = food.name_english.toLowerCase()
  return CAFFEINE_KEYWORDS.some((k) => name.includes(k))
}

export function checkFoodSafety(
  food: FoodItem,
  profile: Profile,
  healthProfile: HealthProfile
): SafetyResult {
  // 1. Hard avoid
  if (food.pregnancy_safe === 'avoid') {
    return {
      level: 'danger',
      message: food.pregnancy_notes ?? 'This food should be avoided during pregnancy.',
      recommendation: 'Please avoid this food during pregnancy.',
    }
  }

  // 2. Moderate caution — use trimester-specific note if available
  if (food.pregnancy_safe === 'moderate') {
    const trimKey = `T${profile.trimester ?? 2}`
    const trimNote = food.trimester_notes?.[trimKey]
    return {
      level: 'warn',
      message: trimNote ?? food.pregnancy_notes ?? 'Consume in moderation during pregnancy.',
      recommendation: 'Limit portions and frequency.',
    }
  }

  // 3. High sodium + BP issue
  if ((food.sodium_mg ?? 0) > 500 && healthProfile.has_bp_issue) {
    return {
      level: 'warn',
      message: 'High sodium — not ideal with BP concerns.',
      recommendation: 'Consider a lower-sodium alternative or reduce portion size.',
    }
  }

  // 4. High sugar + gestational diabetes
  if ((food.sugar_g ?? 0) > 20 && healthProfile.has_gestational_diabetes) {
    return {
      level: 'warn',
      message: 'High sugar — monitor blood sugar after this.',
      recommendation: 'Check blood sugar 2 hours after eating. Pair with protein to slow absorption.',
    }
  }

  // 5. Caffeine in first trimester
  if (isCaffeinated(food) && profile.trimester === 1) {
    return {
      level: 'warn',
      message: 'Limit caffeine especially in the first trimester.',
      recommendation: 'Maximum 1 cup per day. Consider warm milk or a caffeine-free herbal drink.',
    }
  }

  // 6. Good iron source when user is iron-deficient — positive nudge
  if ((food.iron_mg ?? 0) > 0 && (healthProfile.has_iron_deficiency || healthProfile.has_anemia)) {
    return {
      level: 'safe',
      message: 'Great iron source!',
      recommendation: 'Pair with vitamin C (lemon juice, amla, or orange) for best absorption.',
    }
  }

  // 7. Default safe
  return { level: 'safe', message: null, recommendation: null }
}
