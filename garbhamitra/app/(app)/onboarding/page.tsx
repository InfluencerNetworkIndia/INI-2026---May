'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import type { FoodPreference } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'

interface OnboardingData {
  // Step 2 — Personal info
  name: string
  age: string
  city: string
  state: string

  // Step 3 — Pregnancy details
  pregnancy_week: string
  due_date: string

  // Step 4 — Body metrics
  height_cm: string
  weight_kg: string
  pre_pregnancy_weight_kg: string

  // Step 5 — Food identity
  food_preference: FoodPreference | ''
  regional_cuisine: string

  // Step 6 — Health conditions
  has_gestational_diabetes: boolean
  has_thyroid: boolean
  has_iron_deficiency: boolean
  has_b12_deficiency: boolean
  has_bp_issue: boolean
  has_pcos: boolean
  has_anemia: boolean

  // Step 7 — Allergies
  allergies: string[]
  allergy_input: string

  // Step 8 — Daily routine
  activity_level: ActivityLevel
  meals_per_day: string
  sleep_hours: string
  nausea_level: string

  // Step 9 — Supplements
  current_supplements: string[]
  supplement_input: string

  // Step 10 — Doctor notes
  doctor_restrictions: string
}

const INITIAL: OnboardingData = {
  name: '',
  age: '',
  city: '',
  state: '',
  pregnancy_week: '',
  due_date: '',
  height_cm: '',
  weight_kg: '',
  pre_pregnancy_weight_kg: '',
  food_preference: '',
  regional_cuisine: '',
  has_gestational_diabetes: false,
  has_thyroid: false,
  has_iron_deficiency: false,
  has_b12_deficiency: false,
  has_bp_issue: false,
  has_pcos: false,
  has_anemia: false,
  allergies: [],
  allergy_input: '',
  activity_level: 'light',
  meals_per_day: '3',
  sleep_hours: '7',
  nausea_level: '0',
  current_supplements: [],
  supplement_input: '',
  doctor_restrictions: '',
}

// ─── Animation variants ──────────────────────────────────────────────────────

const SLIDE = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

const TRANSITION = { type: 'tween' as const, duration: 0.28, ease: [0.4, 0, 0.2, 1] } as const

// ─── Shared UI helpers ───────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1" style={{ color: '#4A4540' }}>{children}</label>
}

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  inputMode,
  unit,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  unit?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#F0EDE8' }}>
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: '#FFFDF9', color: '#1a1a1a' }}
        />
        {unit && (
          <span
            className="px-3 flex items-center text-xs font-medium select-none"
            style={{ background: '#FFF7F0', color: '#9B9590', borderLeft: '1px solid #F0EDE8' }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all"
      style={{
        borderColor: checked ? '#D4537E' : '#F0EDE8',
        backgroundColor: checked ? '#FFF0F5' : '#FFFDF9',
      }}
    >
      <span
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{ backgroundColor: checked ? '#D4537E' : '#F0EDE8' }}
      >
        {checked && <span className="text-white text-xs">✓</span>}
      </span>
      <span className="text-sm" style={{ color: checked ? '#D4537E' : '#4A4540' }}>{label}</span>
    </button>
  )
}

// ─── Step components ─────────────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="text-6xl">🤱</div>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#D4537E' }}>Welcome to GarbhaMitra</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B6560' }}>
          Your personal AI nutrition companion for a healthy pregnancy journey.
          We&apos;ll set up your profile in just a few minutes to give you
          personalized guidance tailored to Indian foods and your health needs.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full mt-2">
        {[
          { emoji: '🥘', label: 'Indian Foods' },
          { emoji: '📊', label: 'Smart Tracking' },
          { emoji: '🩺', label: 'Health Safe' },
        ].map(item => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-2 p-3 rounded-xl"
            style={{ backgroundColor: '#FFF0F5' }}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-medium" style={{ color: '#D4537E' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepPersonal({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Input label="Your name" value={data.name} onChange={v => set({ name: v })} placeholder="e.g. Priya Sharma" />
      <Input label="Age" type="number" inputMode="numeric" value={data.age} onChange={v => set({ age: v })} placeholder="25" unit="yrs" />
      <Input label="City" value={data.city} onChange={v => set({ city: v })} placeholder="e.g. Mumbai" />
      <Input label="State" value={data.state} onChange={v => set({ state: v })} placeholder="e.g. Maharashtra" />
    </div>
  )
}

function StepPregnancy({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  const week = Number(data.pregnancy_week)
  const trimesterLabel = week <= 13 ? '1st Trimester' : week <= 26 ? '2nd Trimester' : '3rd Trimester'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Input
          label="Current pregnancy week"
          type="number"
          inputMode="numeric"
          value={data.pregnancy_week}
          onChange={v => set({ pregnancy_week: v })}
          placeholder="e.g. 20"
          unit="weeks"
        />
        {week >= 1 && week <= 42 && (
          <p className="mt-1 text-xs font-medium" style={{ color: '#5DCAA5' }}>
            {trimesterLabel}
          </p>
        )}
      </div>
      <div>
        <Label>Expected due date</Label>
        <input
          type="date"
          value={data.due_date}
          onChange={e => set({ due_date: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9', color: '#1a1a1a' }}
        />
        <p className="mt-1 text-xs" style={{ color: '#9B9590' }}>Optional — helps us track your progress</p>
      </div>
    </div>
  )
}

function StepBody({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Input label="Height" type="number" inputMode="decimal" value={data.height_cm} onChange={v => set({ height_cm: v })} placeholder="162" unit="cm" />
      <Input label="Current weight" type="number" inputMode="decimal" value={data.weight_kg} onChange={v => set({ weight_kg: v })} placeholder="65" unit="kg" />
      <Input label="Pre-pregnancy weight" type="number" inputMode="decimal" value={data.pre_pregnancy_weight_kg} onChange={v => set({ pre_pregnancy_weight_kg: v })} placeholder="58" unit="kg" />
      <p className="text-xs" style={{ color: '#9B9590' }}>
        Pre-pregnancy weight helps calculate your personalised nutrition targets
      </p>
    </div>
  )
}

function StepFoodIdentity({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  const preferences: { value: FoodPreference; label: string; emoji: string }[] = [
    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
    { value: 'eggetarian', label: 'Eggetarian', emoji: '🥚' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian', emoji: '🍗' },
    { value: 'jain', label: 'Jain', emoji: '🌿' },
  ]

  const cuisines = ['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Maharashtrian', 'Punjabi', 'Tamil', 'Kerala', 'Rajasthani', 'Other']

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label>Food preference</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {preferences.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => set({ food_preference: p.value })}
              className="flex items-center gap-2 p-3 rounded-xl border text-left transition-all"
              style={{
                borderColor: data.food_preference === p.value ? '#D4537E' : '#F0EDE8',
                backgroundColor: data.food_preference === p.value ? '#FFF0F5' : '#FFFDF9',
              }}
            >
              <span className="text-xl">{p.emoji}</span>
              <span className="text-sm font-medium" style={{ color: data.food_preference === p.value ? '#D4537E' : '#4A4540' }}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Regional cuisine</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {cuisines.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set({ regional_cuisine: c })}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: data.regional_cuisine === c ? '#D4537E' : '#F0EDE8',
                backgroundColor: data.regional_cuisine === c ? '#D4537E' : '#FFFDF9',
                color: data.regional_cuisine === c ? '#fff' : '#6B6560',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepHealthConditions({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  const conditions: { key: keyof OnboardingData; label: string }[] = [
    { key: 'has_gestational_diabetes', label: 'Gestational Diabetes (GDM)' },
    { key: 'has_thyroid', label: 'Thyroid issues' },
    { key: 'has_iron_deficiency', label: 'Iron Deficiency' },
    { key: 'has_b12_deficiency', label: 'B12 Deficiency' },
    { key: 'has_bp_issue', label: 'High / Low Blood Pressure' },
    { key: 'has_pcos', label: 'PCOS / PCOD' },
    { key: 'has_anemia', label: 'Anaemia' },
  ]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs mb-2" style={{ color: '#9B9590' }}>
        Select any conditions your doctor has diagnosed
      </p>
      {conditions.map(c => (
        <Checkbox
          key={c.key}
          label={c.label}
          checked={Boolean(data[c.key])}
          onChange={v => set({ [c.key]: v })}
        />
      ))}
    </div>
  )
}

function StepAllergies({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  const common = ['Peanuts', 'Tree nuts', 'Milk / Lactose', 'Eggs', 'Wheat / Gluten', 'Soy', 'Fish', 'Shellfish']

  function addAllergy(item: string) {
    if (!data.allergies.includes(item)) {
      set({ allergies: [...data.allergies, item] })
    }
  }
  function removeAllergy(item: string) {
    set({ allergies: data.allergies.filter(a => a !== item) })
  }
  function addCustom() {
    const val = data.allergy_input.trim()
    if (val && !data.allergies.includes(val)) {
      set({ allergies: [...data.allergies, val], allergy_input: '' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: '#9B9590' }}>Select common allergens or add your own</p>

      <div className="flex flex-wrap gap-2">
        {common.map(item => {
          const selected = data.allergies.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => selected ? removeAllergy(item) : addAllergy(item)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: selected ? '#D4537E' : '#F0EDE8',
                backgroundColor: selected ? '#D4537E' : '#FFFDF9',
                color: selected ? '#fff' : '#6B6560',
              }}
            >
              {selected ? `✕ ${item}` : item}
            </button>
          )
        })}
      </div>

      {data.allergies.filter(a => !common.includes(a)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.allergies.filter(a => !common.includes(a)).map(a => (
            <span
              key={a}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ backgroundColor: '#D4537E', color: '#fff' }}
            >
              {a}
              <button type="button" onClick={() => removeAllergy(a)} className="ml-1">✕</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add custom allergy…"
          value={data.allergy_input}
          onChange={e => set({ allergy_input: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9' }}
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#D4537E' }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

function StepRoutine({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  const activities: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Mostly resting / bed rest' },
    { value: 'light', label: 'Light', desc: 'Short walks, light chores' },
    { value: 'moderate', label: 'Moderate', desc: 'Daily walks, yoga' },
    { value: 'active', label: 'Active', desc: 'Regular exercise' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label>Activity level</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {activities.map(a => (
            <button
              key={a.value}
              type="button"
              onClick={() => set({ activity_level: a.value })}
              className="p-3 rounded-xl border text-left transition-all"
              style={{
                borderColor: data.activity_level === a.value ? '#D4537E' : '#F0EDE8',
                backgroundColor: data.activity_level === a.value ? '#FFF0F5' : '#FFFDF9',
              }}
            >
              <p className="text-sm font-medium" style={{ color: data.activity_level === a.value ? '#D4537E' : '#1a1a1a' }}>
                {a.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9B9590' }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Meals per day" type="number" inputMode="numeric" value={data.meals_per_day} onChange={v => set({ meals_per_day: v })} placeholder="3" unit="meals" />
        <Input label="Sleep" type="number" inputMode="numeric" value={data.sleep_hours} onChange={v => set({ sleep_hours: v })} placeholder="7" unit="hrs" />
      </div>

      <div>
        <Label>Nausea / morning sickness level</Label>
        <div className="flex gap-1 mt-1">
          {[0, 1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => set({ nausea_level: String(n) })}
              className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: Number(data.nausea_level) === n ? '#D4537E' : '#F0EDE8',
                backgroundColor: Number(data.nausea_level) === n ? '#D4537E' : '#FFFDF9',
                color: Number(data.nausea_level) === n ? '#fff' : '#6B6560',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#C4C0BB' }}>
          <span>None</span><span>Severe</span>
        </div>
      </div>
    </div>
  )
}

function StepSupplements({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  const common = ['Folic Acid', 'Iron', 'Calcium', 'Vitamin D', 'B12', 'DHA / Omega-3', 'Prenatal multivitamin', 'Iodine']

  function toggle(item: string) {
    if (data.current_supplements.includes(item)) {
      set({ current_supplements: data.current_supplements.filter(s => s !== item) })
    } else {
      set({ current_supplements: [...data.current_supplements, item] })
    }
  }

  function addCustom() {
    const val = data.supplement_input.trim()
    if (val && !data.current_supplements.includes(val)) {
      set({ current_supplements: [...data.current_supplements, val], supplement_input: '' })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: '#9B9590' }}>
        Select supplements you are currently taking
      </p>

      <div className="flex flex-wrap gap-2">
        {common.map(item => {
          const selected = data.current_supplements.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: selected ? '#5DCAA5' : '#F0EDE8',
                backgroundColor: selected ? '#5DCAA5' : '#FFFDF9',
                color: selected ? '#fff' : '#6B6560',
              }}
            >
              {selected ? `✓ ${item}` : item}
            </button>
          )
        })}
      </div>

      {data.current_supplements.filter(s => !common.includes(s)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.current_supplements.filter(s => !common.includes(s)).map(s => (
            <span
              key={s}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
              style={{ backgroundColor: '#5DCAA5', color: '#fff' }}
            >
              {s}
              <button type="button" onClick={() => set({ current_supplements: data.current_supplements.filter(x => x !== s) })}>✕</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add other supplement…"
          value={data.supplement_input}
          onChange={e => set({ supplement_input: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
          style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9' }}
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: '#5DCAA5' }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

function StepDoctorNotes({ data, set }: { data: OnboardingData; set: (d: Partial<OnboardingData>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: '#6B6560' }}>
        Any dietary restrictions or special instructions from your doctor?
      </p>
      <textarea
        rows={5}
        placeholder="e.g. Avoid raw papaya, limit salt, doctor said reduce sugar…"
        value={data.doctor_restrictions}
        onChange={e => set({ doctor_restrictions: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
        style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9', color: '#1a1a1a' }}
      />
      <p className="text-xs" style={{ color: '#9B9590' }}>
        This is optional. Our AI will use this to give you safer food recommendations.
      </p>
    </div>
  )
}

function StepComplete() {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#D4537E' }}>You&apos;re all set!</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B6560' }}>
          Your personalised pregnancy nutrition plan is ready.
          Start logging your meals and we&apos;ll help you stay nourished every day.
        </p>
      </div>
      <div
        className="w-full p-4 rounded-xl text-left"
        style={{ backgroundColor: '#F0FBF7', border: '1px solid #5DCAA5' }}
      >
        <p className="text-sm font-semibold mb-2" style={{ color: '#5DCAA5' }}>What&apos;s next?</p>
        <ul className="text-sm space-y-1" style={{ color: '#4A4540' }}>
          <li>📊 View your personalised nutrition targets</li>
          <li>🍽️ Log your first meal with the AI assistant</li>
          <li>📈 Track your weekly nutrition trends</li>
        </ul>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 10

const STEP_TITLES = [
  'Welcome',
  'About You',
  'Pregnancy',
  'Body Metrics',
  'Food Identity',
  'Health Conditions',
  'Allergies',
  'Daily Routine',
  'Supplements',
  'Doctor Notes',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<OnboardingData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const confettiRef = useRef(false)

  function set(partial: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...partial }))
  }

  function canAdvance(): boolean {
    if (step === 1) return data.name.trim().length > 0 && Number(data.age) >= 15
    if (step === 2) return Number(data.pregnancy_week) >= 1 && Number(data.pregnancy_week) <= 42
    if (step === 3) return Number(data.height_cm) >= 100 && Number(data.weight_kg) >= 30
    if (step === 4) return data.food_preference !== ''
    return true
  }

  function goNext() {
    if (!canAdvance()) return
    setDir(1)
    setStep(s => s + 1)
    setError(null)
  }

  function goBack() {
    setDir(-1)
    setStep(s => s - 1)
    setError(null)
  }

  async function submit() {
    setLoading(true)
    setError(null)

    const payload = {
      name: data.name.trim(),
      age: Number(data.age),
      city: data.city.trim() || undefined,
      state: data.state.trim() || undefined,
      pregnancy_week: Number(data.pregnancy_week),
      due_date: data.due_date || undefined,
      height_cm: Number(data.height_cm),
      weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
      pre_pregnancy_weight_kg: data.pre_pregnancy_weight_kg ? Number(data.pre_pregnancy_weight_kg) : undefined,
      food_preference: data.food_preference,
      regional_cuisine: data.regional_cuisine || undefined,
      has_gestational_diabetes: data.has_gestational_diabetes,
      has_thyroid: data.has_thyroid,
      has_iron_deficiency: data.has_iron_deficiency,
      has_b12_deficiency: data.has_b12_deficiency,
      has_bp_issue: data.has_bp_issue,
      has_pcos: data.has_pcos,
      has_anemia: data.has_anemia,
      allergies: data.allergies,
      activity_level: data.activity_level,
      meals_per_day: Number(data.meals_per_day),
      sleep_hours: data.sleep_hours ? Number(data.sleep_hours) : undefined,
      nausea_level: Number(data.nausea_level),
      current_supplements: data.current_supplements,
      doctor_restrictions: data.doctor_restrictions.trim() || undefined,
    }

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Something went wrong')
      }

      setDir(1)
      setStep(TOTAL_STEPS)
      setDone(true)

      // Confetti
      if (!confettiRef.current) {
        confettiRef.current = true
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#D4537E', '#F5A86A', '#5DCAA5', '#FFD700'] })
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const isLastDataStep = step === TOTAL_STEPS - 1

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF7F0 100%)' }}
    >
      {/* Header */}
      {!done && (
        <div className="px-4 pt-6 pb-2 flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ backgroundColor: '#FFF0F5', color: '#D4537E' }}
            >
              ←
            </button>
          )}
          <div className="flex-1">
            {step > 0 && (
              <>
                <p className="text-xs font-medium" style={{ color: '#9B9590' }}>
                  Step {step} of {TOTAL_STEPS - 1} — {STEP_TITLES[step]}
                </p>
                {/* Progress bar */}
                <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F0EDE8' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%`, backgroundColor: '#D4537E' }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 px-4 py-4 overflow-hidden">
        <div className="max-w-md mx-auto">
          {step > 0 && step < TOTAL_STEPS && (
            <h2 className="text-lg font-bold mb-4" style={{ color: '#1a1a1a' }}>
              {STEP_TITLES[step]}
            </h2>
          )}

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
            >
              {step === 0 && <StepWelcome />}
              {step === 1 && <StepPersonal data={data} set={set} />}
              {step === 2 && <StepPregnancy data={data} set={set} />}
              {step === 3 && <StepBody data={data} set={set} />}
              {step === 4 && <StepFoodIdentity data={data} set={set} />}
              {step === 5 && <StepHealthConditions data={data} set={set} />}
              {step === 6 && <StepAllergies data={data} set={set} />}
              {step === 7 && <StepRoutine data={data} set={set} />}
              {step === 8 && <StepSupplements data={data} set={set} />}
              {step === 9 && <StepDoctorNotes data={data} set={set} />}
              {step === TOTAL_STEPS && <StepComplete />}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: '#E05C5C' }}>{error}</p>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-8 pt-2">
        <div className="max-w-md mx-auto">
          {done ? (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#D4537E' }}
            >
              Go to Dashboard →
            </button>
          ) : isLastDataStep ? (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#D4537E' }}
            >
              {loading ? 'Setting up your profile…' : 'Complete Setup 🎉'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance()}
              className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#D4537E' }}
            >
              {step === 0 ? 'Get Started →' : 'Continue →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
