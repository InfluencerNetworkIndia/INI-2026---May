import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'
import { FoodLogger } from '@/lib/ai/foodLogger'
import { updateDailySummary } from '@/lib/nutrition/updateSummary'
import type { Profile, NutritionTargets, DailySummary } from '@/types'
import type Anthropic from '@anthropic-ai/sdk'

// Lazy init — avoids URL validation at build time when env vars are placeholders
let _redis: Redis | null = null
function getRedis() {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

const SESSION_TTL = 60 * 60 * 2 // 2 hours

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json() as {
      message: string
      sessionId: string
    }

    if (!message?.trim() || !sessionId) {
      return Response.json({ error: 'message and sessionId are required' }, { status: 400 })
    }

    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Load profile, targets, today's summary in parallel
    const today = new Date().toISOString().split('T')[0]
    const [profileRes, targetsRes, summaryRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('nutrition_targets').select('*').eq('user_id', user.id).single(),
      supabase.from('daily_summaries').select('*').eq('user_id', user.id).eq('date', today).single(),
    ])

    const profile = profileRes.data as Profile | null
    const targets = targetsRes.data as NutritionTargets | null
    const todaySummary = summaryRes.data as DailySummary | null

    if (!profile || !targets) {
      return Response.json(
        { error: 'Complete onboarding before logging food.' },
        { status: 422 }
      )
    }

    // 3. Load conversation history from Redis
    const redisKey = `chat:${sessionId}`
    const storedHistory = await getRedis().get<Anthropic.MessageParam[]>(redisKey)
    const history = storedHistory ?? []

    // 4. Process message
    const logger = new FoodLogger(profile, targets, todaySummary, history)
    const result = await logger.processMessage(message)

    if (result.status === 'logged' || result.status === 'flagged') {
      const fd = result.food_data!

      // 5a. Save food log to DB
      const safetyFlag =
        result.status === 'flagged' || fd.pregnancy_safe === 'avoid'
          ? 'danger'
          : fd.pregnancy_safe === 'moderate'
          ? 'warn'
          : null

      await supabase.from('food_logs').insert({
        user_id: user.id,
        logged_at: new Date().toISOString(),
        meal_type: fd.meal_type,
        food_name_raw: fd.name,
        quantity: fd.quantity,
        quantity_unit: fd.quantity_unit,
        source: fd.source,
        calories: fd.calories,
        protein_g: fd.protein_g,
        carbs_g: fd.carbs_g,
        fat_g: fd.fat_g,
        iron_mg: fd.iron_mg,
        calcium_mg: fd.calcium_mg,
        folate_mcg: fd.folate_mcg,
        b12_mcg: fd.b12_mcg,
        hydration_ml: fd.hydration_ml,
        safety_flag: safetyFlag,
        ai_notes: fd.safety_note ?? null,
      })

      // 5b. Recalculate daily summary
      const updatedSummary = await updateDailySummary(user.id, today)

      // 5c. Clear Redis session after successful log
      await getRedis().del(redisKey)
      logger.reset()

      return Response.json({
        ...result,
        updated_summary: updatedSummary,
      })
    }

    // 6. Clarifying or error — persist updated history
    await getRedis().set(redisKey, logger.conversationHistory, { ex: SESSION_TTL })

    return Response.json(result)
  } catch (err) {
    console.error('Chat route error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
