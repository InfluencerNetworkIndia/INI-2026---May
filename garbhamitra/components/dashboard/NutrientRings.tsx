'use client'

import { motion } from 'framer-motion'
import type { DailySummary, NutritionTargets } from '@/types'

const RADIUS = 28
const STROKE = 7
const CIRC = 2 * Math.PI * RADIUS
const CX = 32
const CY = 32

type RingDef = {
  label: string
  color: string
  consumed: number
  target: number
  format: (v: number) => string
}

function rings(s: DailySummary, t: NutritionTargets): RingDef[] {
  return [
    {
      label: 'Protein',
      color: '#D4537E',
      consumed: s.total_protein_g,
      target: t.target_protein_g,
      format: v => `${Math.round(v)}g`,
    },
    {
      label: 'Iron',
      color: '#EF9F27',
      consumed: s.total_iron_mg,
      target: t.target_iron_mg,
      format: v => `${v.toFixed(1)}mg`,
    },
    {
      label: 'Calcium',
      color: '#5DCAA5',
      consumed: s.total_calcium_mg,
      target: t.target_calcium_mg,
      format: v => `${Math.round(v)}mg`,
    },
    {
      label: 'Water',
      color: '#378ADD',
      consumed: s.total_hydration_ml / 1000,
      target: t.target_water_ml / 1000,
      format: v => `${v.toFixed(1)}L`,
    },
    {
      label: 'Folate',
      color: '#7F77DD',
      consumed: s.total_folate_mcg,
      target: t.target_folate_mcg,
      format: v => `${Math.round(v)}mcg`,
    },
  ]
}

function Ring({ def, index }: { def: RingDef; index: number }) {
  const pct = def.target > 0 ? Math.min(def.consumed / def.target, 1) : 0
  const offset = CIRC * (1 - pct)

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1" style={{ width: 72 }}>
      <div className="relative" style={{ width: 64, height: 64 }}>
        {/* Rotated SVG so arc starts from top */}
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="#F0EDE8"
            strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <motion.circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke={def.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
          />
        </svg>
        {/* Center percentage — stays upright */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>

      {/* Amount text */}
      <span style={{ fontSize: 11, color: '#9B9590', textAlign: 'center', lineHeight: 1.3 }}>
        {def.format(def.consumed)} / {def.format(def.target)}
      </span>

      {/* Label */}
      <span style={{ fontSize: 11, color: '#6B6560', fontWeight: 500, textAlign: 'center' }}>
        {def.label}
      </span>
    </div>
  )
}

type Props = { summary: DailySummary; targets: NutritionTargets }

export default function NutrientRings({ summary, targets }: Props) {
  const defs = rings(summary, targets)

  return (
    <div
      className="flex gap-4 overflow-x-auto py-3 px-1 -mx-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {defs.map((def, i) => (
        <Ring key={def.label} def={def} index={i} />
      ))}
    </div>
  )
}
