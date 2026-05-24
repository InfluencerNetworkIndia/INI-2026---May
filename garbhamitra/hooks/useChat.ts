'use client'

import { useState, useCallback, useRef } from 'react'
import type { ParsedFoodData } from '@/lib/ai/foodLogger'
import type { DailySummary } from '@/types'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type: 'text' | 'food-logged' | 'clarifying' | 'alert'
  foodData?: ParsedFoodData
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Namaste! 🙏 What have you had to eat or drink?\nJust tell me naturally — like you'd tell a friend.\nExample: 'Had 2 rotis with palak paneer' or '1 glass nimbu pani'",
  timestamp: new Date(),
  type: 'text',
}

type ApiResponse = {
  status: 'clarifying' | 'logged' | 'flagged' | 'error'
  message: string
  food_data?: ParsedFoodData
  updated_summary?: DailySummary
}

export function useChat() {
  const sessionId = useRef(crypto.randomUUID())
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latestSummary, setLatestSummary] = useState<DailySummary | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      type: 'text',
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), sessionId: sessionId.current }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = (await res.json()) as ApiResponse

      const type: ChatMessage['type'] =
        data.status === 'logged'
          ? 'food-logged'
          : data.status === 'flagged'
          ? 'alert'
          : data.status === 'clarifying'
          ? 'clarifying'
          : 'text'

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type,
        foodData: data.food_data,
      }

      setMessages(prev => [...prev, assistantMsg])

      if (data.updated_summary) {
        setLatestSummary(data.updated_summary)
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          timestamp: new Date(),
          type: 'text',
        },
      ])
      setError('Request failed')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const clearChat = useCallback(() => {
    setMessages([{ ...WELCOME, timestamp: new Date() }])
    sessionId.current = crypto.randomUUID()
    setError(null)
    setLatestSummary(null)
  }, [])

  return { messages, sendMessage, isLoading, error, clearChat, latestSummary }
}
