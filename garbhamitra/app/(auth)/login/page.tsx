'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  async function sendOtp() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: digits }),
    })
    const data = await res.json()

    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Failed to send OTP')
      return
    }
    setStep('otp')
    setResendCooldown(30)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  async function verifyOtpWithToken(token: string) {
    setLoading(true)
    setError(null)

    // Step 1: verify OTP with MSG91 and get a Supabase magic-link token
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.replace(/\D/g, ''), otp: token }),
    })
    const result = await res.json()

    if (!res.ok) {
      setError(result.error || 'OTP verification failed')
      setLoading(false)
      return
    }

    // Step 2: exchange magic-link token for a real Supabase session
    const { error: sessionErr } = await supabase.auth.verifyOtp({
      email: result.email,
      token: result.token,
      type: 'email',
    })

    setLoading(false)
    if (sessionErr) {
      setError('Could not create session. Please try again.')
      return
    }

    router.push(result.onboarding_completed ? '/dashboard' : '/onboarding')
  }

  async function verifyOtp() {
    const token = otp.join('')
    if (token.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }
    await verifyOtpWithToken(token)
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError(null)

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
    if (digit && index === 5) {
      const token = [...next].join('')
      if (token.length === 6) verifyOtpWithToken(token)
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      verifyOtpWithToken(pasted)
    }
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
    setError(null)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #FFF0F5 0%, #FFF7F0 100%)' }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="text-center">
          <div className="text-4xl mb-2">🤱</div>
          <h1 className="text-2xl font-bold" style={{ color: '#D4537E' }}>GarbhaMitra</h1>
          <p className="mt-1 text-sm" style={{ color: '#9B9590' }}>
            Your pregnancy nutrition companion
          </p>
        </div>

        {step === 'phone' ? (
          <div className="w-full flex flex-col gap-4">
            <p className="text-sm text-center" style={{ color: '#6B6560' }}>
              Enter your mobile number to continue
            </p>

            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#F0EDE8' }}>
              <span
                className="px-3 flex items-center text-sm font-medium select-none"
                style={{ background: '#FFF7F0', color: '#6B6560', borderRight: '1px solid #F0EDE8' }}
              >
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                className="flex-1 px-4 py-3 text-sm outline-none"
                style={{ backgroundColor: '#FFFDF9' }}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: '#E05C5C' }}>{error}</p>
            )}

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#D4537E' }}
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="text-center">
              <p className="text-sm" style={{ color: '#6B6560' }}>
                OTP sent to <span className="font-medium" style={{ color: '#1a1a1a' }}>+91 {phone}</span>
              </p>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(null) }}
                className="text-xs mt-1 underline"
                style={{ color: '#D4537E' }}
              >
                Change number
              </button>
            </div>

            {/* 6-digit OTP input */}
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className="w-11 h-12 text-center text-lg font-semibold rounded-xl border outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: digit ? '#D4537E' : '#F0EDE8',
                    backgroundColor: '#FFFDF9',
                    color: '#1a1a1a',
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: '#E05C5C' }}>{error}</p>
            )}

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#D4537E' }}
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            <p className="text-xs text-center" style={{ color: '#9B9590' }}>
              {resendCooldown > 0 ? (
                <>Resend OTP in <span className="font-medium">{resendCooldown}s</span></>
              ) : (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="underline disabled:opacity-60"
                  style={{ color: '#D4537E' }}
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: '#C4C0BB' }}>
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </main>
  )
}
