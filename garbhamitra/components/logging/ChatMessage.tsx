'use client'

import { motion } from 'framer-motion'
import type { ChatMessage } from '@/hooks/useChat'

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function FoodLoggedCard({ message }: { message: ChatMessage }) {
  const fd = message.foodData!
  return (
    <div
      className="mt-2 p-3 rounded-xl"
      style={{ backgroundColor: '#F0FAF5', border: '1px solid #5DCAA5' }}
    >
      <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
        {fd.name}
        <span className="ml-2 text-xs font-normal capitalize" style={{ color: '#9B9590' }}>
          {fd.meal_type}
        </span>
      </p>
      <div className="flex gap-2 mt-2 flex-wrap">
        <Pill label={`${Math.round(fd.calories)} kcal`} />
        {fd.protein_g > 0 && <Pill label={`P: ${fd.protein_g.toFixed(1)}g`} />}
        {fd.iron_mg > 0 && <Pill label={`Fe: ${fd.iron_mg.toFixed(1)}mg`} />}
        {fd.calcium_mg > 0 && <Pill label={`Ca: ${Math.round(fd.calcium_mg)}mg`} />}
      </div>
      {fd.safety_note && (
        <p className="mt-1.5 text-xs" style={{ color: '#EF9F27' }}>⚠ {fd.safety_note}</p>
      )}
      <p className="mt-1.5 text-xs font-semibold" style={{ color: '#3B9E7E' }}>
        ✓ Logged
      </p>
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs"
      style={{ backgroundColor: '#F0EDE8', color: '#6B6560' }}
    >
      {label}
    </span>
  )
}

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
        className="flex justify-end mb-3"
      >
        <div className="max-w-[80%]">
          <div
            className="px-4 py-3 text-sm text-white"
            style={{
              backgroundColor: '#D4537E',
              borderRadius: '18px 18px 4px 18px',
            }}
          >
            {message.content}
          </div>
          <p className="mt-1 text-right" style={{ fontSize: 10, color: '#9B9590' }}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </motion.div>
    )
  }

  const isAlert = message.type === 'alert'

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      className="flex items-end gap-2 mb-3"
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ backgroundColor: '#FFF0F5', color: '#D4537E', marginBottom: 18 }}
      >
        GM
      </div>

      <div className="max-w-[80%]">
        <div
          className="px-4 py-3 text-sm"
          style={{
            backgroundColor: isAlert ? '#FFFBF0' : '#FFFFFF',
            border: isAlert ? '1px solid #EF9F27' : '0.5px solid #FFB3CF',
            borderLeft: isAlert ? '3px solid #EF9F27' : undefined,
            borderRadius: '18px 18px 18px 4px',
            color: '#1a1a1a',
            whiteSpace: 'pre-wrap',
          }}
        >
          <span>{message.content}</span>
          {message.type === 'clarifying' && (
            <span className="ml-1" style={{ color: '#9B9590' }}>
              ?
            </span>
          )}
        </div>

        {message.type === 'food-logged' && message.foodData && (
          <FoodLoggedCard message={message} />
        )}

        <p className="mt-1" style={{ fontSize: 10, color: '#9B9590' }}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  )
}
