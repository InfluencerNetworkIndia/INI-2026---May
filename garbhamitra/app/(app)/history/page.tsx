'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { DailySummary, FoodLog, NutritionTargets, MealType } from '@/types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getWeekDates(offset: number): Date[] {
  const today = new Date()
  const dow = today.getDay() // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatWeekRange(dates: Date[]): string {
  const start = dates[0]
  const end   = dates[6]
  return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

type PctCardProps = {
  label: string
  actual: number
  target: number
  display: string
  color: string
}

function PctCard({ label, actual, target, display, color }: PctCardProps) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0
  const met = actual >= target * 0.9
  const over = actual > target * 1.1
  const barColor = over ? '#EF9F27' : met ? '#3B9E7E' : color

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1.5"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}
    >
      <div className="flex justify-between items-center">
        <span style={{ fontSize: 11, color: '#9B9590' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: barColor }}>
          {met ? '✓' : over ? '↑' : '↓'}
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 5, backgroundColor: '#F0EDE8' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: barColor, transition: 'width 0.5s ease' }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{display}</span>
      <span style={{ fontSize: 10, color: '#9B9590' }}>/ {label === 'Water' ? `${(target / 1000).toFixed(1)}L` : `${Math.round(target)}${label === 'Calories' ? ' kcal' : label === 'Protein' ? 'g' : 'mg'}`} target</span>
    </div>
  )
}

const MEAL_COLORS: Record<MealType, { bg: string; text: string }> = {
  breakfast: { bg: '#FFE8D0', text: '#E07B3A' },
  lunch:     { bg: '#F0FAF5', text: '#3B9E7E' },
  snack:     { bg: '#F0EFFF', text: '#5A53C0' },
  dinner:    { bg: '#FFF0F5', text: '#D4537E' },
  drink:     { bg: '#EBF5FF', text: '#378ADD' },
}

export default function HistoryPage() {
  const supabase = createClient()
  const today = toDateStr(new Date())

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekDates, setWeekDates] = useState<Date[]>(() => getWeekDates(0))

  const [summaryMap, setSummaryMap] = useState<Record<string, DailySummary>>({})
  const [targets, setTargets] = useState<NutritionTargets | null>(null)
  const [dayLogs, setDayLogs] = useState<FoodLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Fetch week data
  useEffect(() => {
    const dates = getWeekDates(weekOffset)
    setWeekDates(dates)
    const start = toDateStr(dates[0])
    const end   = toDateStr(dates[6])

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      Promise.all([
        supabase
          .from('daily_summaries')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', start)
          .lte('date', end),
        supabase
          .from('nutrition_targets')
          .select('*')
          .eq('user_id', user.id)
          .single(),
      ]).then(([summariesRes, targetsRes]) => {
        const map: Record<string, DailySummary> = {}
        ;(summariesRes.data ?? []).forEach((s: DailySummary) => { map[s.date] = s })
        setSummaryMap(map)
        if (targetsRes.data) setTargets(targetsRes.data as NutritionTargets)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  // Fetch logs for selected day
  const fetchDayLogs = useCallback(async (date: string) => {
    setLoadingLogs(true)
    try {
      const res = await fetch(`/api/logs?date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setDayLogs(data as FoodLog[])
      }
    } finally {
      setLoadingLogs(false)
    }
  }, [])

  useEffect(() => {
    fetchDayLogs(selectedDate)
  }, [selectedDate, fetchDayLogs])

  const selectedSummary = summaryMap[selectedDate] ?? null

  const isThisWeek = weekOffset === 0

  return (
    <div className="px-4 py-4 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset(o => o - 1)}
          className="p-2 rounded-full hover:bg-rose-50 transition-colors"
          style={{ color: '#D4537E' }}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
            {isThisWeek ? 'This week' : weekOffset === -1 ? 'Last week' : formatWeekRange(weekDates)}
          </p>
          <p style={{ fontSize: 11, color: '#9B9590' }}>{formatWeekRange(weekDates)}</p>
        </div>

        <button
          type="button"
          onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
          disabled={isThisWeek}
          className="p-2 rounded-full hover:bg-rose-50 transition-colors disabled:opacity-30"
          style={{ color: '#D4537E' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 7-day strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {weekDates.map((d, i) => {
          const dateStr = toDateStr(d)
          const isSelected = dateStr === selectedDate
          const isToday = dateStr === today
          const hasSummary = !!summaryMap[dateStr]
          const score = summaryMap[dateStr]?.pregnancy_safe_score ?? null

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setSelectedDate(dateStr)}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-2.5 py-2 rounded-2xl transition-all"
              style={{
                minWidth: 46,
                backgroundColor: isSelected ? '#D4537E' : isToday ? '#FFF0F5' : '#FFFFFF',
                border: `1px solid ${isSelected ? '#D4537E' : '#F0EDE8'}`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: isSelected ? '#fff' : '#9B9590',
                  fontWeight: 500,
                }}
              >
                {DAY_LABELS[i]}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: isSelected ? '#fff' : isToday ? '#D4537E' : '#1a1a1a',
                }}
              >
                {d.getDate()}
              </span>
              {hasSummary && score !== null && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: score >= 80 ? '#3B9E7E' : score >= 60 ? '#EF9F27' : '#E05C5C',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day summary cards */}
      {selectedSummary && targets ? (
        <div className="grid grid-cols-2 gap-2">
          <PctCard
            label="Calories"
            actual={selectedSummary.total_calories}
            target={targets.target_calories}
            display={`${Math.round(selectedSummary.total_calories)} kcal`}
            color="#7F77DD"
          />
          <PctCard
            label="Protein"
            actual={selectedSummary.total_protein_g}
            target={targets.target_protein_g}
            display={`${Math.round(selectedSummary.total_protein_g)}g`}
            color="#D4537E"
          />
          <PctCard
            label="Iron"
            actual={selectedSummary.total_iron_mg}
            target={targets.target_iron_mg}
            display={`${selectedSummary.total_iron_mg.toFixed(1)}mg`}
            color="#EF9F27"
          />
          <PctCard
            label="Water"
            actual={selectedSummary.total_hydration_ml}
            target={targets.target_water_ml}
            display={`${(selectedSummary.total_hydration_ml / 1000).toFixed(1)}L`}
            color="#378ADD"
          />
        </div>
      ) : (
        selectedDate !== today && (
          <div
            className="py-6 text-center rounded-2xl"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}
          >
            <p style={{ color: '#9B9590', fontSize: 13 }}>No data for this day</p>
          </div>
        )
      )}

      {/* Food logs for selected day */}
      <div
        className="rounded-2xl px-4 py-4"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #F0EDE8' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
            Meals · {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </h3>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
            style={{ borderColor: '#F0EDE8', color: '#9B9590' }}
          >
            <Printer size={12} />
            PDF
          </button>
        </div>

        {loadingLogs ? (
          <div className="space-y-2 py-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: '#F0EDE8' }} />
            ))}
          </div>
        ) : dayLogs.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: '#9B9590' }}>
            No meals logged for this day
          </p>
        ) : (
          <div>
            {dayLogs.map(log => {
              const badge = MEAL_COLORS[log.meal_type] ?? MEAL_COLORS.snack
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-2 py-2.5"
                  style={{ borderBottom: '1px solid #F0EDE8' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate" style={{ color: '#1a1a1a' }}>
                        {log.food_name_raw}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 capitalize"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {log.meal_type}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#9B9590', marginTop: 2 }}>
                      {formatTime(log.logged_at)} · {log.quantity} {log.quantity_unit}
                    </p>
                  </div>
                  <span className="text-sm font-medium flex-shrink-0" style={{ color: '#4A4540' }}>
                    {Math.round(log.calories)} kcal
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Score for selected day */}
      {selectedSummary?.pregnancy_safe_score != null && (
        <div
          className="rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: '#FFF0F5', border: '1px solid #FFB3CF' }}
        >
          <span className="text-sm font-medium" style={{ color: '#D4537E' }}>
            Pregnancy safe score
          </span>
          <span className="text-xl font-bold" style={{ color: '#D4537E' }}>
            {selectedSummary.pregnancy_safe_score}/100
          </span>
        </div>
      )}
    </div>
  )
}
