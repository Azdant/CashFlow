'use client'

// ============================================================
// CashFlow — useAccounts Hook
// Semua operasi CRUD account ke Supabase
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Account, AccountInput } from '@/types'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setAccounts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  // ── Tambah akun ────────────────────────────────────────────
  const addAccount = async (input: AccountInput) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('accounts')
      .insert({ 
        ...input, 
        user_id: user.id,
        balance: 0 
      })
      .select()
      .single()

    if (!error && data) {
      setAccounts(prev => [...prev, data])
    }
    return { data, error }
  }

  // ── Update akun ────────────────────────────────────────────
  const updateAccount = async (id: string, input: Partial<AccountInput>) => {
    const { data, error } = await supabase
      .from('accounts')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setAccounts(prev => prev.map(a => a.id === id ? data : a))
    }
    return { data, error }
  }

  // ── Hapus akun ─────────────────────────────────────────────
  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)

    if (!error) {
      setAccounts(prev => prev.filter(a => a.id !== id))
    }
    return { error }
  }

  // ── Total balance ──────────────────────────────────────────
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  return {
    accounts,
    loading,
    error,
    fetch,
    addAccount,
    updateAccount,
    deleteAccount,
    totalBalance,
  }
}
