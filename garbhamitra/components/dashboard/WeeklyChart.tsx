'use client'

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  Cell,
} from 'recharts'
import type { DailySummary, NutritionTargets } from '@/types'

type Tab = 'protein' | 'iron' | 'calories' | 'water'

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: 'protein',  label: 'Protein',  color: '#D4537E' },
  { key: 'iron',     label: 'Iron',     color: '#EF9F27' },
  { key: 'calories', label: 'Calories', color: '#7F77DD' },
  { key: 'water',    label: 'Water',    color: '#378ADD' },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getValue(summary: DailySummary | undefined, tab: Tab): number {
  if (!summary) return 0
  switch (tab) {
    case 'protein':  return summary.total_protein_g
    case 'iron':     return summary.total_iron_mg
    case 'calories': return summary.total_calories
    case 'water':    return summary.total_hydration_ml / 1000
  }
}

function getTarget(targets: NutritionTargets, tab: Tab): number {
  switch (tab) {
    case 'protein':  return targets.target_protein_g
    case 'iron':     return targets.target_iron_mg
    case 'calories': return targets.target_calories
    case 'water':    return targets.target_water_ml / 1000
  }
}

function getUnit(tab: Tab): string {
  switch (tab) {
    case 'protein':  return 'g'
    case 'iron':     return 'mg'
    case 'calories': return 'kcal'
    case 'water':    return 'L'
  }
}

function formatVal(v: number, tab: Tab): string {
  if (tab === 'water') return `${v.toFixed(1)}L`
  if (tab === 'iron')  return `${v.toFixed(1)}mg`
  return `${Math.round(v)}${getUnit(tab)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, tab }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div
      className="px-3 py-2 rounded-xl shadow-sm text-sm font-medium"
      style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
    >
      <p>{d.day}: {formatVal(d.value, tab)}</p>
    </div>
  )
}

type Props = { weeklySummaries: DailySummary[]; targets: NutritionTargets }

export default function WeeklyChart({ weeklySummaries, targets }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('protein')

  const today = new Date().toISOString().split('T')[0]
  const summaryMap = useMemo(() => {
    const m: Record<string, DailySummary> = {}
    weeklySummaries.forEach(s => { m[s.date] = s })
    return m
  }, [weeklySummaries])

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const date = d.toISOString().split('T')[0]
      const summary = summaryMap[date]
      return {
        day: DAY_LABELS[d.getDay()],
        date,
        value: getValue(summary, activeTab),
        isToday: date === today,
        isPast: date < today,
      }
    })
  }, [summaryMap, activeTab, today])

  const targetValue = getTarget(targets, activeTab)
  const unit = getUnit(activeTab)
  const color = TABS.find(t => t.key === activeTab)!.color

  const pastDays = chartData.filter(d => d.isPast && !d.isToday)
  const avg = pastDays.length
    ? pastDays.reduce((s, d) => s + d.value, 0) / pastDays.length
    : 0
  const metCount = pastDays.filter(d => d.value >= targetValue).length

  return (
    <div
      className="rounded-2xl px-4 pt-4 pb-5"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}
    >
      {/* Section header */}
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#1a1a1a' }}>
        Weekly overview
      </h3>

      {/* Tab selector */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ backgroundColor: '#F0EDE8' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTab === t.key ? '#FFFFFF' : 'transparent',
              color: activeTab === t.key ? t.color : '#9B9590',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9B9590' }}
            />
            <YAxis hide domain={[0, Math.max(targetValue * 1.2, 1)]} />
            <Tooltip
              content={<CustomTooltip tab={activeTab} />}
              cursor={{ fill: 'rgba(240,237,232,0.5)', radius: 6 }}
            />
            <ReferenceLine
              y={targetValue}
              stroke="#F0EDE8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={color}
                  opacity={entry.isToday ? 0.4 : entry.value > 0 ? 0.9 : 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <p className="mt-3 text-xs text-center" style={{ color: '#9B9590' }}>
        Avg {formatVal(avg, activeTab)}/day
        {' · '}Target {formatVal(targetValue, activeTab)}
        {' · '}
        {metCount} of {pastDays.length} days met target
      </p>
    </div>
  )
}
