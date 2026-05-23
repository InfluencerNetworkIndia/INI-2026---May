'use client'

import type { Profile } from '@/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TRIMESTER_NAMES: Record<number, string> = { 1: 'first', 2: 'second', 3: 'third' }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function scoreColor(score: number): string {
  if (score <= 50) return '#E05C5C'
  if (score <= 70) return '#EF9F27'
  if (score <= 85) return '#D4537E'
  return '#3B9E7E'
}

function scoreLabel(score: number): string {
  if (score <= 50) return 'Needs attention'
  if (score <= 85) return 'On track'
  return 'Great day!'
}

function formatDueDate(raw: string): string {
  const [y, m, d] = raw.split('-')
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`
}

type Props = { profile: Profile; pregnancySafeScore: number }

export default function DashboardHeader({ profile, pregnancySafeScore }: Props) {
  const color = scoreColor(pregnancySafeScore)
  const name = profile.name?.split(' ')[0] ?? 'Mama'
  const week = profile.pregnancy_week ?? '—'
  const trimester = profile.trimester ? TRIMESTER_NAMES[profile.trimester] : null
  const dueDate = profile.due_date ? formatDueDate(profile.due_date) : null

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      {/* Left */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold truncate" style={{ color: '#1a1a1a' }}>
          {greeting()}, {name}!
        </h2>
        <p className="mt-0.5 text-xs" style={{ color: '#9B9590' }}>
          Week {week}
          {trimester && ` · ${trimester} trimester`}
          {dueDate && ` · Due ${dueDate}`}
        </p>
      </div>

      {/* Right — score */}
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="text-3xl font-bold leading-none" style={{ color }}>
          {pregnancySafeScore}
        </span>
        <span className="mt-0.5" style={{ fontSize: 10, color: '#9B9590', lineHeight: 1.2 }}>
          today&apos;s score
        </span>
        <span
          className="mt-1 px-2 py-0.5 rounded-full text-white font-medium"
          style={{ fontSize: 10, backgroundColor: color }}
        >
          {scoreLabel(pregnancySafeScore)}
        </span>
      </div>
    </div>
  )
}
