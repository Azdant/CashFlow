'use client'

// ============================================================
// CashFlow — useGoals Hook
// Goals dengan progress tracking otomatis dari transaksi
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Goal, GoalInput, GoalWithProgress } from '@/types'

export function useGoals() {
  const [goals, setGoals] = useState<GoalWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)

    // Ambil goals
    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: true })

    if (goalsError || !goalsData) {
      setLoading(false)
      return
    }

    // Ambil semua pemasukan untuk menghitung progress
    const { data: incomeData } = await supabase
      .from('transactions')
      .select('amount, category')
      .eq('type', 'income')

    // Hitung progress per goal
    const withProgress: GoalWithProgress[] = goalsData.map((goal: Goal) => {
      const saved = (incomeData || [])
        .filter(t => goal.tracked_categories.includes(t.category as any))
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        ...goal,
        saved_amount: saved,
        percentage: Math.min(100, Math.round((saved / goal.target_amount) * 100)),
      }
    })

    setGoals(withProgress)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  // ── Tambah goal ───────────────────────────────────────────
  const addGoal = async (input: GoalInput) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('goals')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()

    if (!error) await fetch()
    return { data, error }
  }

  // ── Update goal ───────────────────────────────────────────
  const updateGoal = async (id: string, input: GoalInput) => {
    const { error } = await supabase
      .from('goals')
      .update(input)
      .eq('id', id)

    if (!error) await fetch()
    return { error }
  }

  // ── Hapus goal ────────────────────────────────────────────
  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (!error) setGoals(prev => prev.filter(g => g.id !== id))
    return { error }
  }

  return { goals, loading, refetch: fetch, addGoal, updateGoal, deleteGoal }
}
