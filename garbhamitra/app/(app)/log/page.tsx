'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import ChatMessageBubble from '@/components/logging/ChatMessage'
import ChatInput, { TypingIndicator } from '@/components/logging/ChatInput'
import TodayProgressBar from '@/components/logging/TodayProgressBar'
import FoodSuggestions from '@/components/logging/FoodSuggestions'
import type { Profile, DailySummary, NutritionTargets } from '@/types'

type DashboardSnapshot = {
  profile: Profile
  todaySummary: DailySummary | null
  targets: NutritionTargets | null
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

function formatToday(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function LogPage() {
  const router = useRouter()
  const { messages, sendMessage, isLoading, latestSummary } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const confettiFiredRef = useRef<Set<string>>(new Set())

  const [snap, setSnap] = useState<DashboardSnapshot | null>(null)

  // Fetch initial summary + profile
  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then((data: DashboardSnapshot & { alerts: unknown[] }) => {
        setSnap({ profile: data.profile, todaySummary: data.todaySummary, targets: data.targets })
      })
      .catch(() => {})
  }, [])

  // Update progress bar when food is logged
  const currentSummary = latestSummary ?? snap?.todaySummary ?? null
  const targets = snap?.targets ?? null

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Confetti on food-logged messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (
      lastMsg?.type === 'food-logged' &&
      !confettiFiredRef.current.has(lastMsg.id)
    ) {
      confettiFiredRef.current.add(lastMsg.id)
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#D4537E', '#5DCAA5', '#EF9F27'],
        })
      })
    }
  }, [messages])

  const isEmpty = messages.length === 1 && messages[0].id === 'welcome'

  const handleSend = useCallback(
    (text: string) => sendMessage(text),
    [sendMessage]
  )

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Secondary header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#FFFDF9', borderBottom: '1px solid #F0EDE8' }}
      >
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="p-1 rounded-full transition-colors hover:bg-rose-50"
          aria-label="Back"
        >
          <ChevronLeft size={22} style={{ color: '#9B9590' }} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
            Log food
          </h1>
          <p style={{ fontSize: 11, color: '#9B9590' }}>{formatToday()}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-xs font-medium px-3 py-1.5 rounded-full border"
          style={{ borderColor: '#D4537E', color: '#D4537E' }}
        >
          Done
        </button>
      </div>

      {/* Today progress bar */}
      {currentSummary && targets && (
        <TodayProgressBar summary={currentSummary} targets={targets} />
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {messages.map(msg => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        {/* Food suggestions — shown when only welcome message exists */}
        {isEmpty && !isLoading && snap?.profile && (
          <FoodSuggestions profile={snap.profile} onSelect={handleSend} />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Fixed input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={handleSend} isLoading={isLoading} isEmpty={isEmpty} />
      </div>
    </div>
  )
}
