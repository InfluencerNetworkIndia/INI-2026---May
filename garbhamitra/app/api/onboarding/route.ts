import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { createClient } from '@/lib/supabase/server'
import { calculateNutritionTargets } from '@/lib/nutrition/targets'
import type { Profile, HealthProfile } from '@/types'

const OnboardingSchema = z.object({
  // Personal info
  name: z.string().min(1),
  age: z.number().int().min(15).max(55),
  height_cm: z.number().min(100).max(220),
  city: z.string().optional(),
  state: z.string().optional(),
  food_preference: z.enum(['vegetarian', 'non-vegetarian', 'eggetarian', 'jain']),
  regional_cuisine: z.string().optional(),

  // Pregnancy details
  pregnancy_week: z.number().int().min(1).max(42),
  due_date: z.string().optional(),

  // Body metrics
  weight_kg: z.number().min(30).max(200).optional(),
  pre_pregnancy_weight_kg: z.number().min(30).max(200).optional(),

  // Health conditions
  has_gestational_diabetes: z.boolean().default(false),
  has_thyroid: z.boolean().default(false),
  has_iron_deficiency: z.boolean().default(false),
  has_b12_deficiency: z.boolean().default(false),
  has_bp_issue: z.boolean().default(false),
  has_pcos: z.boolean().default(false),
  has_anemia: z.boolean().default(false),
  allergies: z.array(z.string()).default([]),

  // Daily routine
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active']).default('light'),
  meals_per_day: z.number().int().min(2).max(8).default(3),
  sleep_hours: z.number().min(4).max(12).optional(),
  nausea_level: z.number().int().min(0).max(5).optional(),

  // Supplements & doctor notes
  current_supplements: z.array(z.string()).default([]),
  doctor_restrictions: z.string().optional(),
})


export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = OnboardingSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }

    const d = parsed.data
    const today = new Date().toISOString().split('T')[0]

    // 1. Upsert profile — trimester is a GENERATED ALWAYS column, never set it manually
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: d.name,
        phone: user.phone ?? null,
        age: d.age,
        height_cm: d.height_cm,
        city: d.city ?? null,
        state: d.state ?? null,
        food_preference: d.food_preference,
        regional_cuisine: d.regional_cuisine ?? null,
        pregnancy_week: d.pregnancy_week,
        due_date: d.due_date ?? null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) throw profileError

    // 2. Upsert health_profile (conflict on user_id unique column)
    const { data: healthProfile, error: healthError } = await supabase
      .from('health_profiles')
      .upsert({
        user_id: user.id,
        weight_kg: d.weight_kg ?? null,
        pre_pregnancy_weight_kg: d.pre_pregnancy_weight_kg ?? null,
        has_gestational_diabetes: d.has_gestational_diabetes,
        has_thyroid: d.has_thyroid,
        has_iron_deficiency: d.has_iron_deficiency,
        has_b12_deficiency: d.has_b12_deficiency,
        has_bp_issue: d.has_bp_issue,
        has_pcos: d.has_pcos,
        has_anemia: d.has_anemia,
        allergies: d.allergies,
        activity_level: d.activity_level,
        meals_per_day: d.meals_per_day,
        sleep_hours: d.sleep_hours ?? null,
        nausea_level: d.nausea_level ?? null,
        current_supplements: d.current_supplements,
        doctor_restrictions: d.doctor_restrictions ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (healthError) throw healthError

    // 3. Calculate and save nutrition targets (conflict on user_id unique column)
    const targetValues = calculateNutritionTargets(
      profile as Profile,
      healthProfile as HealthProfile
    )

    const { data: targets, error: targetsError } = await supabase
      .from('nutrition_targets')
      .upsert({
        user_id: user.id,
        ...targetValues,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (targetsError) throw targetsError

    // 4. Create empty daily_summary for today (if not exists)
    await supabase
      .from('daily_summaries')
      .upsert(
        {
          user_id: user.id,
          date: today,
          total_calories: 0,
          total_protein_g: 0,
          total_iron_mg: 0,
          total_calcium_mg: 0,
          total_folate_mcg: 0,
          total_b12_mcg: 0,
          total_hydration_ml: 0,
          total_fiber_g: 0,
          pregnancy_safe_score: 0,
          deficiency_flags: [],
          positive_flags: [],
          meal_count: 0,
          weight_kg: d.weight_kg ?? null,
        },
        { onConflict: 'user_id,date', ignoreDuplicates: true }
      )

    return Response.json({ success: true, profile, targets })
  } catch (err) {
    console.error('POST /api/onboarding error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
