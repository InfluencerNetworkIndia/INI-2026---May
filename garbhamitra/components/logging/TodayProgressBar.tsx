'use client'

import type { DailySummary, NutritionTargets } from '@/types'

type NutrientDef = {
  label: string
  color: string
  consumed: number
  target: number
  display: string
}

function pct(consumed: number, target: number) {
  return target > 0 ? Math.min((consumed / target) * 100, 100) : 0
}

function nutrients(s: DailySummary, t: NutritionTargets): NutrientDef[] {
  return [
    {
      label: 'Calories',
      color: '#7F77DD',
      consumed: s.total_calories,
      target: t.target_calories,
      display: `${Math.round(s.total_calories)} kcal`,
    },
    {
      label: 'Protein',
      color: '#D4537E',
      consumed: s.total_protein_g,
      target: t.target_protein_g,
      display: `${Math.round(s.total_protein_g)}g`,
    },
    {
      label: 'Iron',
      color: '#EF9F27',
      consumed: s.total_iron_mg,
      target: t.target_iron_mg,
      display: `${s.total_iron_mg.toFixed(1)}mg`,
    },
    {
      label: 'Water',
      color: '#378ADD',
      consumed: s.total_hydration_ml / 1000,
      target: t.target_water_ml / 1000,
      display: `${(s.total_hydration_ml / 1000).toFixed(1)}L`,
    },
  ]
}

type Props = { summary: DailySummary; targets: NutritionTargets }

export default function TodayProgressBar({ summary, targets }: Props) {
  const defs = nutrients(summary, targets)

  return (
    <div
      className="px-4 py-2 flex items-center gap-4 overflow-x-auto"
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F0EDE8',
        scrollbarWidth: 'none',
        minHeight: 48,
      }}
    >
      {defs.map(n => (
        <div key={n.label} className="flex items-center gap-1.5 flex-shrink-0">
          <span style={{ fontSize: 11, color: '#9B9590', fontWeight: 500 }}>{n.label}</span>
          <div
            className="rounded-full overflow-hidden"
            style={{ width: 40, height: 4, backgroundColor: '#F0EDE8' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct(n.consumed, n.target)}%`, backgroundColor: n.color }}
            />
          </div>
          <span style={{ fontSize: 11, color: n.color, fontWeight: 600 }}>{n.display}</span>
        </div>
      ))}
    </div>
  )
}
