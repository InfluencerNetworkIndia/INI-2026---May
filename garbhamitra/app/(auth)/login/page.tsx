'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

// Phone digits → internal email format so Supabase email+password auth works
function toEmail(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.includes('@')) return trimmed.toLowerCase()
  const digits = trimmed.replace(/\D/g, '')
  return `${digits}@phone.garbhamitra.app`
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('signin')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError(null)
    setInfo(null)

    const email = toEmail(identifier)

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      if (data.session) {
        router.push('/onboarding')
      } else {
        setInfo('Account created! Check your email for a confirmation link.')
        setLoading(false)
      }
      return
    }

    // Sign in
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Incorrect email/phone or password.' : err.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single()

    router.push(profile?.onboarding_completed ? '/dashboard' : '/onboarding')
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

        {/* Sign In / Sign Up toggle */}
        <div className="flex w-full rounded-xl border overflow-hidden" style={{ borderColor: '#F0EDE8' }}>
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className="flex-1 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: mode === m ? '#D4537E' : '#FFFDF9',
                color: mode === m ? '#fff' : '#9B9590',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            autoComplete="username"
            placeholder="Email or mobile number"
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setError(null) }}
            required
            className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
            style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9' }}
          />

          {/* Password with show/hide */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              required
              className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none focus:ring-2"
              style={{ borderColor: '#F0EDE8', backgroundColor: '#FFFDF9' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: '#9B9590' }}
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: '#E05C5C' }}>{error}</p>
          )}
          {info && (
            <p className="text-xs text-center" style={{ color: '#5C9B6B' }}>{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#D4537E' }}
          >
            {loading ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
                     : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-xs text-center" style={{ color: '#C4C0BB' }}>
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </main>
  )
}
