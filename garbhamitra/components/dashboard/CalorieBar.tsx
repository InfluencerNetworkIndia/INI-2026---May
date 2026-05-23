'use client'

import { motion } from 'framer-motion'

type Props = { consumed: number; target: number; mealCount: number }

export default function CalorieBar({ consumed, target, mealCount }: Props) {
  const pct = target > 0 ? consumed / target : 0
  const cappedPct = Math.min(pct, 1)
  const remaining = target - consumed
  const isOver = pct > 1.1
  const isHit = pct >= 0.9 && pct <= 1.1

  const barColor = isOver
    ? '#EF9F27'
    : isHit
    ? '#3B9E7E'
    : '#D4537E'

  const barGradient = isOver
    ? 'linear-gradient(90deg, #EF9F27, #F5C86A)'
    : isHit
    ? 'linear-gradient(90deg, #3B9E7E, #5DCAA5)'
    : 'linear-gradient(90deg, #D4537E, #F5A86A)'

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: '#4A4540' }}>
          Calories today
        </span>
        <span className="text-sm font-semibold" style={{ color: barColor }}>
          {Math.round(consumed).toLocaleString()} / {target.toLocaleString()} kcal
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 10, backgroundColor: '#F0EDE8' }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${cappedPct * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: barGradient }}
        />
      </div>

      {/* Subtext */}
      <p className="mt-2 text-xs" style={{ color: '#9B9590' }}>
        {remaining > 0 ? (
          <>{Math.round(remaining).toLocaleString()} kcal remaining · {mealCount} {mealCount === 1 ? 'meal' : 'meals'} logged</>
        ) : (
          <>{Math.abs(Math.round(remaining)).toLocaleString()} kcal over target · {mealCount} {mealCount === 1 ? 'meal' : 'meals'} logged</>
        )}
      </p>
    </div>
  )
}
