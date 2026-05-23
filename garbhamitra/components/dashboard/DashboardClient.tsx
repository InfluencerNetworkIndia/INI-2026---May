'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Profile, NutritionTargets, DailySummary, FoodLog } from '@/types'
import type { Alert } from '@/lib/nutrition/alerts'
import DashboardHeader from './DashboardHeader'
import NutrientRings from './NutrientRings'
import CalorieBar from './CalorieBar'
import AlertsSection from './AlertsSection'
import MealsList from './MealsList'
import WeeklyChart from './WeeklyChart'
import FloatingLogButton from './FloatingLogButton'

export type DashboardData = {
  profile: Profile
  targets: NutritionTargets
  todaySummary: DailySummary | null
  todaysLogs: FoodLog[]
  weeklySummaries: DailySummary[]
  alerts: Alert[]
  pregnancySafeScore: number
}

const EMPTY_SUMMARY: DailySummary = {
  id: '',
  user_id: '',
  date: '',
  total_calories: 0,
  total_protein_g: 0,
  total_iron_mg: 0,
  total_calcium_mg: 0,
  total_folate_mcg: 0,
  total_b12_mcg: 0,
  total_hydration_ml: 0,
  total_fiber_g: 0,
  pregnancy_safe_score: 0,
  deficiency_flags: [],
  positive_flags: [],
  meal_count: 0,
  weight_kg: null,
}

function DashboardSkeleton() {
  const pulse = 'rounded-xl animate-pulse'
  return (
    <div className="px-4 pt-4 space-y-4 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className={`h-5 w-40 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
          <div className={`h-3 w-56 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
        </div>
        <div className={`h-14 w-14 rounded-full animate-pulse`} style={{ backgroundColor: '#F0EDE8' }} />
      </div>
      <div className="flex gap-4 overflow-x-auto py-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`flex-shrink-0 w-20 h-24 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
        ))}
      </div>
      <div className={`h-20 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
      {[0, 1].map(i => (
        <div key={i} className={`h-16 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
      ))}
      <div className={`h-48 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
      <div className={`h-56 ${pulse}`} style={{ backgroundColor: '#F0EDE8' }} />
    </div>
  )
}

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json() as DashboardData
      setData(json)
      setError(null)
    } catch {
      setError('Failed to refresh data')
    }
  }, [])

  useEffect(() => {
    const id = setInterval(refresh, 30_000)
    return () => clearInterval(id)
  }, [refresh])

  if (!data) return <DashboardSkeleton />

  const summary = data.todaySummary ?? EMPTY_SUMMARY

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-32 space-y-4">
      {error && (
        <div
          className="text-xs px-3 py-2 rounded-lg text-center"
          style={{ backgroundColor: '#FFF0F5', color: '#D4537E' }}
        >
          {error} — showing last data
        </div>
      )}

      <DashboardHeader profile={data.profile} pregnancySafeScore={data.pregnancySafeScore} />

      <NutrientRings summary={summary} targets={data.targets} />

      <CalorieBar
        consumed={summary.total_calories}
        target={data.targets.target_calories}
        mealCount={data.todaysLogs.length}
      />

      {data.alerts.length > 0 && <AlertsSection alerts={data.alerts} />}

      <MealsList logs={data.todaysLogs} />

      <WeeklyChart weeklySummaries={data.weeklySummaries} targets={data.targets} />

      <FloatingLogButton />
    </div>
  )
}
