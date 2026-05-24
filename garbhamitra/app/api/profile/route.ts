import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { createClient } from '@/lib/supabase/server'
import { calculateNutritionTargets } from '@/lib/nutrition/targets'
import type { Profile, HealthProfile } from '@/types'

const PatchSchema = z.object({
  pregnancy_week: z.number().int().min(1).max(42).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  has_gestational_diabetes: z.boolean().optional(),
  has_thyroid: z.boolean().optional(),
  has_iron_deficiency: z.boolean().optional(),
  has_b12_deficiency: z.boolean().optional(),
  has_bp_issue: z.boolean().optional(),
  has_pcos: z.boolean().optional(),
  has_anemia: z.boolean().optional(),
  current_supplements: z.array(z.string()).optional(),
  doctor_restrictions: z.string().optional(),
  recalculate_targets: z.boolean().optional(),
})

function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1
  if (week <= 26) return 2
  return 3
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }

    const d = parsed.data

    // Build profile update
    const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (d.pregnancy_week !== undefined) {
      profileUpdate.pregnancy_week = d.pregnancy_week
      profileUpdate.trimester = getTrimester(d.pregnancy_week)
    }
    if (d.city !== undefined)  profileUpdate.city  = d.city
    if (d.state !== undefined) profileUpdate.state = d.state

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)
      .select()
      .single()

    // Build health update
    const healthUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const healthFields = [
      'has_gestational_diabetes', 'has_thyroid', 'has_iron_deficiency',
      'has_b12_deficiency', 'has_bp_issue', 'has_pcos', 'has_anemia',
      'current_supplements', 'doctor_restrictions',
    ] as const
    healthFields.forEach(f => { if (d[f] !== undefined) healthUpdate[f] = d[f] })

    const { data: updatedHealth } = await supabase
      .from('health_profiles')
      .update(healthUpdate)
      .eq('user_id', user.id)
      .select()
      .single()

    // Recalculate targets if requested or if pregnancy_week changed
    let updatedTargets = null
    if (d.recalculate_targets || d.pregnancy_week !== undefined) {
      const profile  = (updatedProfile  ?? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data) as Profile
      const health   = (updatedHealth   ?? (await supabase.from('health_profiles').select('*').eq('user_id', user.id).single()).data) as HealthProfile

      const targets = calculateNutritionTargets(profile, health)
      const { data: t } = await supabase
        .from('nutrition_targets')
        .upsert({ user_id: user.id, ...targets, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single()
      updatedTargets = t
    }

    return Response.json({ success: true, profile: updatedProfile, targets: updatedTargets })
  } catch (err) {
    console.error('PATCH /api/profile error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
