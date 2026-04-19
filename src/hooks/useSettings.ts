'use client'

// ============================================================
// CashFlow — useSettings Hook
// Simpan & ambil settings dari Supabase
// ============================================================

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export function useSettings() {
  const [spendLimit, setSpendLimitState] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('settings')
        .select('spend_limit')
        .eq('user_id', user.id)
        .single()

      if (data) setSpendLimitState(data.spend_limit || 0)
      setLoading(false)
    }
    fetch()
  }, [])

  const saveSpendLimit = async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('settings')
      .upsert({ user_id: user.id, spend_limit: amount, updated_at: new Date().toISOString() })

    setSpendLimitState(amount)
  }

  return { spendLimit, loading, saveSpendLimit }
}
