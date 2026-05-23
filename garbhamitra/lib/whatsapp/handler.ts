import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import { FoodLogger } from '@/lib/ai/foodLogger'
import { calculateNutritionTargets } from '@/lib/nutrition/targets'
import { updateDailySummaryWithClient } from '@/lib/nutrition/updateSummary'
import { sendWhatsAppMessage } from './sender'
import {
  formatDailySummary,
  formatNutritionTargets,
  formatFoodLogged,
  formatWelcomeMessage,
  formatHelpMessage,
  formatOnboardingWelcome,
} from './messages'
import type { Profile, HealthProfile, NutritionTargets, DailySummary } from '@/types'
import type { FoodPreference } from '@/types'
import type Anthropic from '@anthropic-ai/sdk'

// ─── Lazy singletons ──────────────────────────────────────────────────────────

let _redis: Redis | null = null
function redis() {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ─── Session types ─────────────────────────────────────────────────────────────

type OnboardingData = {
  name?: string
  pregnancy_week?: number
  food_preference?: FoodPreference
  health_conditions?: string[]
  city?: string
}

type WASession = {
  phone: string
  userId?: string
  state: 'idle' | 'logging' | 'onboarding'
  history: Anthropic.MessageParam[]
  onboarding_step?: number
  onboarding_data?: OnboardingData
}

const SESSION_TTL = 60 * 60 * 24 // 24 hours

async function loadSession(phone: string): Promise<WASession> {
  const key = `wa:session:${phone}`
  const stored = await redis().get<WASession>(key)
  return stored ?? { phone, state: 'idle', history: [] }
}

async function saveSession(session: WASession): Promise<void> {
  await redis().set(`wa:session:${session.phone}`, session, { ex: SESSION_TTL })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `+${digits}`
}

function mapFoodPreference(msg: string): FoodPreference | null {
  const m = msg.toLowerCase()
  if (m.includes('jain'))                              return 'jain'
  if (m.includes('egg'))                               return 'eggetarian'
  if (m.includes('non'))                               return 'non-vegetarian'
  if (m.includes('veg'))                               return 'vegetarian'
  return null
}

function parseHealthConditions(msg: string): string[] {
  const m = msg.toLowerCase()
  if (m === 'none' || m === 'no' || m === 'nothing') return []
  const conds: string[] = []
  if (m.includes('diabet')) conds.push('has_gestational_diabetes')
  if (m.includes('thyroid')) conds.push('has_thyroid')
  if (m.includes('iron')) conds.push('has_iron_deficiency')
  if (m.includes('b12') || m.includes('b-12')) conds.push('has_b12_deficiency')
  if (m.includes('bp') || m.includes('blood pressure') || m.includes('pressure')) conds.push('has_bp_issue')
  if (m.includes('pcos') || m.includes('pcod')) conds.push('has_pcos')
  if (m.includes('anaemi') || m.includes('anemia')) conds.push('has_anemia')
  return conds
}

function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1
  if (week <= 26) return 2
  return 3
}

function isCommandMessage(msg: string): boolean {
  const m = msg.toLowerCase().trim()
  return (
    m === 'summary' || m === 'aaj ka' || m === 'today' ||
    m === 'targets' || m === 'target' ||
    m === 'help' ||
    /^weight\s+\d/.test(m)
  )
}

// ─── Onboarding flow ──────────────────────────────────────────────────────────

async function handleOnboarding(
  session: WASession,
  message: string
): Promise<WASession> {
  const step = session.onboarding_step ?? 0
  const data = session.onboarding_data ?? {}
  const phone = session.phone

  switch (step) {
    case 0: {
      // Just entered onboarding — this message triggers sending Q1 (name)
      // Actually step=0 means we haven't asked the first Q yet.
      // This case shouldn't happen; onboarding_step starts at 1 after first message.
      await sendWhatsAppMessage(phone, formatOnboardingWelcome())
      return { ...session, state: 'onboarding', onboarding_step: 1, onboarding_data: {} }
    }

    case 1: {
      // Received name
      data.name = message.trim() || 'Friend'
      await sendWhatsAppMessage(
        phone,
        `Nice to meet you, ${data.name}! 😊\n\nHow many weeks pregnant are you?\n(Enter a number, e.g. *20*)`
      )
      return { ...session, onboarding_step: 2, onboarding_data: data }
    }

    case 2: {
      // Received pregnancy week
      const week = parseInt(message.trim(), 10)
      if (isNaN(week) || week < 1 || week > 42) {
        await sendWhatsAppMessage(phone, 'Please enter a valid week number between 1 and 42 🙏')
        return session
      }
      data.pregnancy_week = week
      await sendWhatsAppMessage(
        phone,
        `Week ${week} — you're doing amazing! 🌸\n\nAre you:\n1️⃣ Vegetarian\n2️⃣ Non-vegetarian\n3️⃣ Eggetarian\n4️⃣ Jain\n\nJust type the word 😊`
      )
      return { ...session, onboarding_step: 3, onboarding_data: data }
    }

    case 3: {
      // Received food preference
      const pref = mapFoodPreference(message)
      if (!pref) {
        await sendWhatsAppMessage(phone, 'Please type: *vegetarian*, *non-veg*, *eggetarian*, or *jain* 😊')
        return session
      }
      data.food_preference = pref
      await sendWhatsAppMessage(
        phone,
        `Got it! 🙏\n\nDo you have any of these health conditions?\n• Gestational diabetes\n• Thyroid\n• Iron deficiency\n• B12 deficiency\n• BP issues\n• Anaemia\n• PCOS\n\nType them (e.g. *"iron, thyroid"*) or type *none* 😊`
      )
      return { ...session, onboarding_step: 4, onboarding_data: data }
    }

    case 4: {
      // Received health conditions
      data.health_conditions = parseHealthConditions(message)
      await sendWhatsAppMessage(phone, `Almost done! 🎉\n\nWhat city are you in?`)
      return { ...session, onboarding_step: 5, onboarding_data: data }
    }

    case 5: {
      // Received city — create the profile
      data.city = message.trim()
      const db = admin()

      try {
        const normalPhone = normalizePhone(phone)
        const week = data.pregnancy_week ?? 20
        const trimester = getTrimester(week)

        // Create auth user
        const { data: { user }, error: userError } = await db.auth.admin.createUser({
          phone: normalPhone,
          phone_confirm: true,
          user_metadata: { name: data.name },
        })
        if (userError || !user) throw userError ?? new Error('User creation failed')

        // Create profile
        const profilePayload = {
          id: user.id,
          name: data.name ?? null,
          phone: normalPhone,
          food_preference: data.food_preference ?? 'vegetarian',
          pregnancy_week: week,
          trimester,
          city: data.city ?? null,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }
        await db.from('profiles').upsert(profilePayload)

        // Create minimal health profile
        const healthPayload: Record<string, unknown> = {
          user_id: user.id,
          meals_per_day: 3,
          has_gestational_diabetes: false,
          has_thyroid: false,
          has_iron_deficiency: false,
          has_b12_deficiency: false,
          has_bp_issue: false,
          has_pcos: false,
          has_anemia: false,
          allergies: [],
          current_supplements: [],
          updated_at: new Date().toISOString(),
        }
        if (data.health_conditions) {
          data.health_conditions.forEach(c => { healthPayload[c] = true })
        }
        await db.from('health_profiles').upsert(healthPayload).eq('user_id', user.id)

        // Calculate and save targets
        const { data: profileRow } = await db.from('profiles').select('*').eq('id', user.id).single()
        const { data: healthRow } = await db.from('health_profiles').select('*').eq('user_id', user.id).single()
        const targets = calculateNutritionTargets(
          profileRow as Profile,
          healthRow as HealthProfile
        )
        await db.from('nutrition_targets').upsert({
          user_id: user.id,
          ...targets,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id)

        await sendWhatsAppMessage(
          phone,
          formatWelcomeMessage(data.name ?? 'Mama', trimester)
        )

        return {
          ...session,
          state: 'idle',
          userId: user.id,
          onboarding_step: undefined,
          onboarding_data: undefined,
        }
      } catch (err) {
        console.error('WhatsApp onboarding error:', err)
        await sendWhatsAppMessage(
          phone,
          `Sorry, something went wrong setting up your profile 😔 Please try signing up at our website or type *start* to try again.`
        )
        return { phone, state: 'idle', history: [] }
      }
    }
  }

  return session
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export class WhatsAppHandler {
  static async processMessage(phone: string, message: string): Promise<void> {
    const db = admin()
    const normalPhone = normalizePhone(phone)
    const today = new Date().toISOString().split('T')[0]

    let session = await loadSession(phone)

    // ── Look up user by phone ────────────────────────────────────────────────
    const { data: profile } = await db
      .from('profiles')
      .select('*')
      .eq('phone', normalPhone)
      .maybeSingle()

    const p = profile as Profile | null

    // ── No profile — start onboarding ────────────────────────────────────────
    if (!p) {
      if (session.state !== 'onboarding') {
        await sendWhatsAppMessage(phone, formatOnboardingWelcome())
        session = { phone, state: 'onboarding', history: [], onboarding_step: 1, onboarding_data: {} }
        await saveSession(session)
        return
      }
      // Continue onboarding
      session = await handleOnboarding(session, message)
      await saveSession(session)
      return
    }

    // ── Profile exists but onboarding incomplete ─────────────────────────────
    if (!p.onboarding_completed) {
      await sendWhatsAppMessage(
        phone,
        `Hi ${p.name ?? 'there'} 🙏 Please complete your profile setup on the GarbhaMitra app first. Visit us at garbhamitra.app to continue! 🌸`
      )
      return
    }

    // ── Onboarded user — handle commands ─────────────────────────────────────
    if (session.userId === undefined) {
      session.userId = p.id
    }

    const msg = message.trim().toLowerCase()

    // Commands
    if (isCommandMessage(message)) {
      if (msg.includes('summary') || msg.includes('aaj') || msg.includes('today')) {
        const [targetsRes, summaryRes] = await Promise.all([
          db.from('nutrition_targets').select('*').eq('user_id', p.id).single(),
          db.from('daily_summaries').select('*').eq('user_id', p.id).eq('date', today).single(),
        ])
        if (targetsRes.data && summaryRes.data) {
          await sendWhatsAppMessage(
            phone,
            formatDailySummary(summaryRes.data as DailySummary, targetsRes.data as NutritionTargets, p.name ?? 'Mama')
          )
        } else {
          await sendWhatsAppMessage(phone, `No meals logged yet today! Tell me what you ate 🍽`)
        }
        return
      }

      if (msg.includes('target')) {
        const { data: targets } = await db.from('nutrition_targets').select('*').eq('user_id', p.id).single()
        if (targets) {
          await sendWhatsAppMessage(phone, formatNutritionTargets(targets as NutritionTargets, p))
        }
        return
      }

      if (msg === 'help') {
        await sendWhatsAppMessage(phone, formatHelpMessage())
        return
      }

      const weightMatch = message.match(/weight\s+(\d+\.?\d*)\s*kg/i)
      if (weightMatch) {
        const kg = parseFloat(weightMatch[1])
        await db.from('health_profiles').update({ weight_kg: kg, updated_at: new Date().toISOString() }).eq('user_id', p.id)
        await db.from('daily_summaries').upsert({ user_id: p.id, date: today, weight_kg: kg }, { onConflict: 'user_id,date' })
        await sendWhatsAppMessage(phone, `✅ Logged your weight: *${kg} kg* 📊\n\nKeep tracking regularly for the best insights! 💕`)
        return
      }
    }

    // ── Food logging state ────────────────────────────────────────────────────
    const [targetsRes, summaryRes] = await Promise.all([
      db.from('nutrition_targets').select('*').eq('user_id', p.id).single(),
      db.from('daily_summaries').select('*').eq('user_id', p.id).eq('date', today).single(),
    ])

    const targets = targetsRes.data as NutritionTargets | null
    const todaySummary = summaryRes.data as DailySummary | null

    if (!targets) {
      await sendWhatsAppMessage(phone, `Please complete your nutrition profile setup at garbhamitra.app 🙏`)
      return
    }

    // Ensure we're in logging state
    session.state = 'logging'

    const logger = new FoodLogger(p, targets, todaySummary, session.history)
    let result

    try {
      result = await logger.processMessage(message)
    } catch {
      await sendWhatsAppMessage(phone, `Sorry, I had trouble understanding that 😔 Could you try again?`)
      return
    }

    if (result.status === 'clarifying') {
      session.history = logger.conversationHistory
      await saveSession(session)
      await sendWhatsAppMessage(phone, result.message + (result.clarifying_question ? `\n\n${result.clarifying_question}` : ''))
      return
    }

    if (result.status === 'logged' || result.status === 'flagged') {
      const fd = result.food_data!
      const safetyFlag =
        result.status === 'flagged' || fd.pregnancy_safe === 'avoid' ? 'danger'
        : fd.pregnancy_safe === 'moderate' ? 'warn'
        : null

      await db.from('food_logs').insert({
        user_id: p.id,
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

      const updatedSummary = await updateDailySummaryWithClient(db, p.id, today)

      // Reset session
      session.state = 'idle'
      session.history = []
      await saveSession(session)

      await sendWhatsAppMessage(phone, formatFoodLogged(fd, updatedSummary, targets))
      return
    }

    // Error response
    await sendWhatsAppMessage(phone, `I'm sorry, I had trouble with that. Please try again 🙏`)
  }
}
