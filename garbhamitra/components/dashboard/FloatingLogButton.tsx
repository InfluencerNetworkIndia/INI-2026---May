'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function FloatingLogButton() {
  const router = useRouter()

  return (
    <motion.button
      type="button"
      onClick={() => router.push('/log')}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-lg"
      style={{ backgroundColor: '#D4537E' }}
    >
      <Plus size={18} strokeWidth={2.5} />
      Log food
    </motion.button>
  )
}
