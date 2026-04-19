'use client'

// ============================================================
// CashFlow — Login Page
// Email + Password auth via Supabase
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatInputRupiah } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) setError(error.message)
      else setMessage('Cek email kamu untuk konfirmasi akun.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email atau password salah.')
      else router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="app-shell justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-2xl font-medium">CF</span>
        </div>
        <h1 className="text-xl font-medium text-gray-900">CashFlow</h1>
        <p className="text-sm text-gray-500 mt-1">Keuangan pribadi, terorganisir</p>
      </div>

      {/* Form */}
      <div className="space-y-3">
        {isRegister && (
          <input
            className="input"
            placeholder="Nama lengkap"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        )}
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {message && (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{message}</p>
        )}

        <button
          className="btn-primary bg-emerald-800"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Memuat...' : isRegister ? 'Daftar' : 'Masuk'}
        </button>
      </div>

      <button
        className="w-full text-center text-sm text-gray-500 mt-4 py-2"
        onClick={() => { setIsRegister(!isRegister); setError(null) }}
      >
        {isRegister
          ? 'Sudah punya akun? Masuk'
          : 'Belum punya akun? Daftar gratis'}
      </button>
    </div>
  )
}
