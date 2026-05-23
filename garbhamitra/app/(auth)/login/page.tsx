'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF7F0 100%)' }}>
      <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: '#D4537E' }}>GarbhaMitra</h1>
          <p className="mt-2 text-sm" style={{ color: '#9B9590' }}>Your pregnancy nutrition companion</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <label htmlFor="phone" className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
            Mobile Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
            style={{
              borderColor: '#F0EDE8',
              backgroundColor: '#FFFDF9',
            }}
          />
          <button
            type="button"
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#D4537E' }}
          >
            Send OTP
          </button>
        </div>
      </div>
    </main>
  )
}
