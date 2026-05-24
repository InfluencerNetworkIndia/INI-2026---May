import type { DailySummary, NutritionTargets, Profile, HealthProfile } from '@/types'
import type { TargetValues } from './targets'

export type Alert = {
  type: 'warning' | 'tip' | 'positive'
  message: string
  action: string | null
}

type Targets = Pick<
  NutritionTargets | TargetValues,
  | 'target_calories'
  | 'target_protein_g'
  | 'target_iron_mg'
  | 'target_calcium_mg'
  | 'target_water_ml'
  | 'target_folate_mcg'
  | 'target_fiber_g'
>

export function generateDailyAlerts(
  summary: DailySummary,
  targets: Targets,
  profile: Profile,
  healthProfile?: HealthProfile | null
): Alert[] {
  const alerts: Alert[] = []
  const trimester = profile.trimester

  // ── Warnings ───────────────────────────────────────────────────────────────

  if (summary.total_protein_g < targets.target_protein_g * 0.6) {
    alerts.push({
      type: 'warning',
      message: 'Protein intake is low today. Add paneer, dal, or eggs at your next meal.',
      action: 'Log a protein-rich food',
    })
  }

  if (summary.total_iron_mg < targets.target_iron_mg * 0.5) {
    alerts.push({
      type: 'warning',
      message: 'Iron is low today. Try palak dal or rajma for dinner. Pair with lemon juice to absorb more iron.',
      action: 'Log an iron-rich meal',
    })
  }

  if (summary.total_calcium_mg < targets.target_calcium_mg * 0.5) {
    alerts.push({
      type: 'warning',
      message: 'Calcium is low. Have a glass of warm milk or some dahi before bed.',
      action: 'Log a calcium-rich food',
    })
  }

  if (summary.total_hydration_ml < targets.target_water_ml * 0.5) {
    alerts.push({
      type: 'warning',
      message: 'You need more water. Try coconut water or nimbu pani in the next hour.',
      action: 'Log a drink',
    })
  }

  if (trimester === 3 && summary.total_fiber_g < targets.target_fiber_g * 0.5) {
    alerts.push({
      type: 'warning',
      message: 'Fiber intake is low. This can cause constipation in the third trimester. Add lauki sabzi or fruits.',
      action: 'Add a fiber-rich food',
    })
  }

  // ── Tips ───────────────────────────────────────────────────────────────────

  if (summary.total_folate_mcg < targets.target_folate_mcg * 0.6) {
    alerts.push({
      type: 'tip',
      message: 'Folate intake needs attention. Leafy greens, dal, and rajma are great sources.',
      action: 'Add a folate-rich food',
    })
  }

  if (trimester === 1 && (healthProfile?.nausea_level ?? 0) >= 3) {
    alerts.push({
      type: 'tip',
      message: 'Feeling nauseous? Try small frequent meals — khichdi, coconut water, and plain roti are easy on the stomach.',
      action: 'Log a light meal',
    })
  }

  // ── Positive ───────────────────────────────────────────────────────────────

  if (summary.total_protein_g >= targets.target_protein_g * 0.9) {
    alerts.push({
      type: 'positive',
      message: "Great protein intake today! Your baby's growth is well supported.",
      action: null,
    })
  }

  if (summary.total_iron_mg >= targets.target_iron_mg * 0.8) {
    alerts.push({
      type: 'positive',
      message: 'Iron levels looking good today. Keep it up!',
      action: null,
    })
  }

  // All-macros excellent (calories + protein + iron + calcium all > 70%)
  if (
    summary.total_calories >= targets.target_calories * 0.7 &&
    summary.total_protein_g >= targets.target_protein_g * 0.7 &&
    summary.total_iron_mg >= targets.target_iron_mg * 0.7 &&
    summary.total_calcium_mg >= targets.target_calcium_mg * 0.7
  ) {
    alerts.push({
      type: 'positive',
      message: "Excellent nutrition day! You're taking great care of yourself and your baby.",
      action: null,
    })
  }

  return alerts
}
