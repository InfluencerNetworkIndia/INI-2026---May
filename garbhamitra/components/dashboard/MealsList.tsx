'use client'

import Link from 'next/link'
import type { FoodLog, MealType } from '@/types'

const MEAL_BADGE: Record<MealType, { bg: string; text: string; label: string }> = {
  breakfast: { bg: '#FFE8D0', text: '#E07B3A', label: 'Breakfast' },
  lunch:     { bg: '#F0FAF5', text: '#3B9E7E', label: 'Lunch' },
  snack:     { bg: '#F0EFFF', text: '#5A53C0', label: 'Snack' },
  dinner:    { bg: '#FFF0F5', text: '#D4537E', label: 'Dinner' },
  drink:     { bg: '#EBF5FF', text: '#378ADD', label: 'Drink' },
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function MealRow({ log }: { log: FoodLog }) {
  const badge = MEAL_BADGE[log.meal_type] ?? MEAL_BADGE.snack

  return (
    <div
      className="flex items-start justify-between gap-2 py-3"
      style={{ borderBottom: '1px solid #F0EDE8' }}
    >
      {/* Left */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>
            {log.food_name_raw}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs" style={{ color: '#9B9590' }}>
          {formatTime(log.logged_at)} · {log.quantity} {log.quantity_unit}
        </p>
        {/* Nutrient pills */}
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {log.protein_g > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: '#F0EDE8', color: '#6B6560' }}
            >
              P: {log.protein_g.toFixed(1)}g
            </span>
          )}
          {log.iron_mg > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: '#F0EDE8', color: '#6B6560' }}
            >
              Fe: {log.iron_mg.toFixed(1)}mg
            </span>
          )}
          {log.calcium_mg > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ backgroundColor: '#F0EDE8', color: '#6B6560' }}
            >
              Ca: {Math.round(log.calcium_mg)}mg
            </span>
          )}
        </div>
      </div>

      {/* Right — calories */}
      <div className="flex-shrink-0 text-right">
        <span className="text-sm font-medium" style={{ color: '#4A4540' }}>
          {Math.round(log.calories)} kcal
        </span>
        {log.safety_flag === 'danger' && (
          <p className="text-xs mt-0.5" style={{ color: '#E05C5C' }}>⚠ caution</p>
        )}
        {log.safety_flag === 'warn' && (
          <p className="text-xs mt-0.5" style={{ color: '#EF9F27' }}>⚠ moderate</p>
        )}
      </div>
    </div>
  )
}

type Props = { logs: FoodLog[] }

export default function MealsList({ logs }: Props) {
  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
          Today&apos;s meals
        </h3>
        <Link
          href="/log"
          className="text-xs font-medium"
          style={{ color: '#D4537E' }}
        >
          + Log food
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm" style={{ color: '#9B9590' }}>
            Nothing logged yet today
          </p>
          <Link
            href="/log"
            className="mt-2 inline-block text-sm font-medium"
            style={{ color: '#D4537E' }}
          >
            Start by telling me what you had for breakfast →
          </Link>
        </div>
      ) : (
        <div>
          {logs.map(log => (
            <MealRow key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
