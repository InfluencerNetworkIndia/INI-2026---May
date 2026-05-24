'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'

const QUICK_CHIPS = [
  { emoji: '🍽', label: 'Breakfast' },
  { emoji: '☕', label: 'Chai' },
  { emoji: '🍱', label: 'Lunch' },
  { emoji: '💧', label: 'Water' },
]

function TypingDots() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 ml-9 mb-3">
      <div
        className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
        style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #FFB3CF' }}
      >
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="block w-2 h-2 rounded-full"
            style={{ backgroundColor: '#D4537E' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.55, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}

type Props = {
  onSend: (message: string) => void
  isLoading: boolean
  isEmpty: boolean
}

export function TypingIndicator() {
  return <TypingDots />
}

export default function ChatInput({ onSend, isLoading, isEmpty }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus()
  }, [isLoading])

  function handleSend() {
    const text = value.trim()
    if (!text || isLoading) return
    onSend(text)
    setValue('')
  }

  function handleChip(label: string) {
    setValue(label + ' ')
    inputRef.current?.focus()
  }

  return (
    <div
      className="px-4 pt-2 pb-3"
      style={{ backgroundColor: '#FFFDF9', borderTop: '1px solid #F0EDE8' }}
    >
      {/* Quick suggestion chips — shown when chat is empty */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChip(chip.label)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all"
                style={{ borderColor: '#F0EDE8', backgroundColor: '#FFF0F5', color: '#D4537E' }}
              >
                <span>{chip.emoji}</span>
                <span className="font-medium">{chip.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Tell me what you ate…"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none border"
          style={{
            borderColor: '#F0EDE8',
            backgroundColor: '#FFFFFF',
            color: '#1a1a1a',
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            backgroundColor: value.trim() && !isLoading ? '#D4537E' : '#F0EDE8',
            color: value.trim() && !isLoading ? '#fff' : '#9B9590',
          }}
        >
          <Send size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
