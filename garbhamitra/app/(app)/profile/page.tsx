'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, HealthProfile, NutritionTargets } from '@/types'

const COMMON_SUPPLEMENTS = ['Folic Acid', 'Iron', 'Calcium', 'Vitamin D', 'B12', 'DHA', 'Iodine', 'Prenatal multivitamin']

const HEALTH_CONDITIONS: { key: keyof HealthProfile; label: string }[] = [
  { key: 'has_gestational_diabetes', label: 'Gestational Diabetes (GDM)' },
  { key: 'has_thyroid',              label: 'Thyroid issues' },
  { key: 'has_iron_deficiency',      label: 'Iron Deficiency' },
  { key: 'has_b12_deficiency',       label: 'B12 Deficiency' },
  { key: 'has_bp_issue',             label: 'Blood Pressure issues' },
  { key: 'has_pcos',                 label: 'PCOS / PCOD' },
  { key: 'has_anemia',               label: 'Anaemia' },
]

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl px-4 py-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a' }}>{title}</h3>
      {children}
    </div>
  )
}

function ToggleChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
      style={{
        borderColor: active ? '#D4537E' : '#F0EDE8',
        backgroundColor: active ? '#FFF0F5' : '#FFFDF9',
        color: active ? '#D4537E' : '#6B6560',
      }}
    >
      {active ? `✓ ${label}` : label}
    </button>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [health, setHealth] = useState<HealthProfile | null>(null)
  const [targets, setTargets] = useState<NutritionTargets | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  // Editable fields
  const [pregnancyWeek, setPregnancyWeek] = useState('')
  const [conditions, setConditions] = useState<Record<string, boolean>>({})
  const [supplements, setSupplements] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const [profileRes, healthRes, targetsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('health_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('nutrition_targets').select('*').eq('user_id', user.id).single(),
      ])
      const p = profileRes.data as Profile
      const h = healthRes.data as HealthProfile
      setProfile(p)
      setHealth(h)
      setTargets(targetsRes.data as NutritionTargets)
      setPregnancyWeek(String(p.pregnancy_week ?? ''))
      setSupplements(h?.current_supplements ?? [])
      const conds: Record<string, boolean> = {}
      HEALTH_CONDITIONS.forEach(c => { conds[c.key] = Boolean((h as unknown as Record<string, unknown>)?.[c.key]) })
      setConditions(conds)
      setLoading(false)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save() {
    setSaving(true)
    setSavedMsg(null)
    try {
      const body: Record<string, unknown> = {
        current_supplements: supplements,
        ...conditions,
      }
      const week = parseInt(pregnancyWeek, 10)
      if (!isNaN(week) && week >= 1 && week <= 42) {
        body.pregnancy_week = week
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.profile) setProfile(data.profile)
        setSavedMsg('Profile saved! ✓')
        setTimeout(() => setSavedMsg(null), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  async function recalculateTargets() {
    setRecalculating(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recalculate_targets: true, ...conditions, current_supplements: supplements }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.targets) setTargets(data.targets)
        setSavedMsg('Targets recalculated! ✓')
        setTimeout(() => setSavedMsg(null), 3000)
      }
    } finally {
      setRecalculating(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ backgroundColor: '#F0EDE8' }} />
        ))}
      </div>
    )
  }

  const trimNames: Record<number, string> = { 1: 'First', 2: 'Second', 3: 'Third' }

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto space-y-4 pb-28">
      {savedMsg && (
        <div
          className="text-sm text-center py-2 px-4 rounded-xl font-medium"
          style={{ backgroundColor: '#F0FAF5', color: '#3B9E7E' }}
        >
          {savedMsg}
        </div>
      )}

      {/* User info card */}
      <SectionCard title="Your profile">
        <div className="flex items-center gap-4 mb-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: '#FFF0F5', color: '#D4537E' }}
          >
            {profile?.name?.[0]?.toUpperCase() ?? 'M'}
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#1a1a1a' }}>{profile?.name ?? 'Mama'}</p>
            <p style={{ fontSize: 12, color: '#9B9590' }}>{profile?.phone ?? '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9B9590' }}>
              Pregnancy week
            </label>
            <input
              type="number"
              min={1}
              max={42}
              value={pregnancyWeek}
              onChange={e => setPregnancyWeek(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9' }}
            />
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#9B9590' }}>Trimester</p>
            <p
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: '#FFF0F5', color: '#D4537E' }}
            >
              {profile?.trimester ? `${trimNames[profile.trimester]} trimester` : '—'}
            </p>
          </div>
        </div>

        {profile?.due_date && (
          <p className="mt-2 text-xs" style={{ color: '#9B9590' }}>
            Due date: {new Date(profile.due_date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </SectionCard>

      {/* Health conditions */}
      <SectionCard title="Health conditions">
        <p className="text-xs mb-3" style={{ color: '#9B9590' }}>
          Tap to toggle conditions your doctor has diagnosed
        </p>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CONDITIONS.map(c => (
            <ToggleChip
              key={c.key}
              label={c.label}
              active={!!conditions[c.key]}
              onToggle={() => setConditions(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
            />
          ))}
        </div>
      </SectionCard>

      {/* Supplements */}
      <SectionCard title="Current supplements">
        <div className="flex flex-wrap gap-2">
          {COMMON_SUPPLEMENTS.map(s => (
            <ToggleChip
              key={s}
              label={s}
              active={supplements.includes(s)}
              onToggle={() =>
                setSupplements(prev =>
                  prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                )
              }
            />
          ))}
        </div>
      </SectionCard>

      {/* Nutrition targets */}
      {targets && (
        <SectionCard title="Nutrition targets">
          <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
            {[
              ['Calories', `${targets.target_calories.toLocaleString()} kcal`],
              ['Protein',  `${targets.target_protein_g}g`],
              ['Iron',     `${targets.target_iron_mg}mg`],
              ['Calcium',  `${targets.target_calcium_mg}mg`],
              ['Folate',   `${targets.target_folate_mcg}mcg`],
              ['Water',    `${(targets.target_water_ml / 1000).toFixed(1)}L`],
            ].map(([label, value]) => (
              <div key={label}>
                <span style={{ color: '#9B9590', fontSize: 11 }}>{label}</span>
                <p style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 13 }}>{value}</p>
              </div>
            ))}
          </div>
          {targets.adjustment_reasons?.length > 0 && (
            <p className="text-xs" style={{ color: '#9B9590' }}>
              Personalised for: {targets.adjustment_reasons.join(', ')}
            </p>
          )}
          <button
            type="button"
            onClick={recalculateTargets}
            disabled={recalculating}
            className="mt-3 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border w-full justify-center transition-all disabled:opacity-60"
            style={{ borderColor: '#D4537E', color: '#D4537E' }}
          >
            <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Recalculating…' : 'Recalculate targets'}
          </button>
        </SectionCard>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#D4537E' }}
      >
        <Save size={16} />
        {saving ? 'Saving…' : 'Save changes'}
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 border transition-all hover:opacity-80"
        style={{ borderColor: '#F0EDE8', color: '#9B9590' }}
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )
}
