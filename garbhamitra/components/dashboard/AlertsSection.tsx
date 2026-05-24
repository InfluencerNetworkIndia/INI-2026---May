'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Alert } from '@/lib/nutrition/alerts'

const STYLES = {
  warning: {
    bg: '#FFF0F5',
    border: '#D4537E',
    msg: '#993556',
    action: '#D4537E',
  },
  tip: {
    bg: '#FFFBF0',
    border: '#EF9F27',
    msg: '#92620A',
    action: '#EF9F27',
  },
  positive: {
    bg: '#F0FAF5',
    border: '#5DCAA5',
    msg: '#2D7A5E',
    action: '#3B9E7E',
  },
}

type Props = { alerts: Alert[] }

export default function AlertsSection({ alerts }: Props) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)

  if (alerts.length === 0) return null

  const visible = showAll ? alerts : alerts.slice(0, 3)

  return (
    <div className="space-y-2">
      {visible.map((alert, i) => {
        const s = STYLES[alert.type]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{
              backgroundColor: s.bg,
              borderLeft: `3px solid ${s.border}`,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug" style={{ color: s.msg }}>
                {alert.message}
              </p>
              {alert.action && (
                <button
                  type="button"
                  onClick={() => router.push('/log')}
                  className="mt-1 text-xs font-medium underline"
                  style={{ color: s.action }}
                >
                  {alert.action} ↗
                </button>
              )}
            </div>
          </motion.div>
        )
      })}

      {alerts.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="text-xs font-medium w-full text-center py-1"
          style={{ color: '#9B9590' }}
        >
          {showAll ? 'Show less ↑' : `See all ${alerts.length} alerts ↓`}
        </button>
      )}
    </div>
  )
}
