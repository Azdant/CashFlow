'use client'

// ============================================================
// CashFlow — useTransactions Hook
// Semua operasi CRUD transaksi ke Supabase
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Transaction, TransactionInput, Period } from '@/types'
import { getPeriodRange } from '@/lib/utils'

export function useTransactions(period: Period = 'all', offset: number = 0) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { start, end } = getPeriodRange(period, offset)

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (start && end) {
      query = query
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }, [period, offset])

  useEffect(() => { fetch() }, [fetch])

  // ── Tambah transaksi ──────────────────────────────────────
  const addTransaction = async (input: TransactionInput) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      setTransactions(prev => [data, ...prev])
    }
    return { data, error }
  }

  // ── Hapus transaksi ───────────────────────────────────────
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id))
    }
    return { error }
  }

  // ── Transfer antar fund type ───────────────────────────────
  const transferFund = async (fromFund: string, toFund: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Buat 2 transaksi: expense dari source, income ke destination
    const baseData = {
      user_id: user.id,
      amount,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }

    const expenseData = {
      ...baseData,
      type: 'expense' as const,
      category: 'Lainnya' as const,
      description: `Transfer ke ${toFund === 'bank' ? 'Bank' : toFund === 'ewallet' ? 'E-Wallet' : 'Tunai'}`,
      fund_type: fromFund,
    }

    const incomeData = {
      ...baseData,
      type: 'income' as const,
      category: 'Lainnya' as const,
      description: `Transfer dari ${fromFund === 'bank' ? 'Bank' : fromFund === 'ewallet' ? 'E-Wallet' : 'Tunai'}`,
      fund_type: toFund,
    }

    // Insert both transactions
    const { error: expErr } = await supabase
      .from('transactions')
      .insert(expenseData)

    if (expErr) return { error: expErr.message }

    const { error: incErr } = await supabase
      .from('transactions')
      .insert(incomeData)

    if (incErr) return { error: incErr.message }

    // Refresh transactions
    await fetch()
    return { error: null }
  }

  // ── Computed values ───────────────────────────────────────
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expense

  // Pengeluaran per kategori
  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categorySummary = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => ({
      category,
      total,
      percentage: expense > 0 ? Math.round((total / expense) * 100) : 0,
    }))

  // Pemasukan per jenis uang penyimpanan (fund type)
  const incomeByFundType = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.fund_type] = (acc[t.fund_type] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const fundTypeIncomeSummary = Object.entries(incomeByFundType)
    .sort((a, b) => b[1] - a[1])
    .map(([fund_type, total]) => ({
      fund_type,
      total,
      percentage: income > 0 ? Math.round((total / income) * 100) : 0,
    }))

  // Pengeluaran per jenis uang penyimpanan (fund type)
  const expenseByFundType = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.fund_type] = (acc[t.fund_type] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const fundTypeExpenseSummary = Object.entries(expenseByFundType)
    .sort((a, b) => b[1] - a[1])
    .map(([fund_type, total]) => ({
      fund_type,
      total,
      percentage: expense > 0 ? Math.round((total / expense) * 100) : 0,
    }))

  // Fund balances (income - expense per fund type)
  const fundBalances = {
    bank: (incomeByFundType['bank'] || 0) - (expenseByFundType['bank'] || 0),
    ewallet: (incomeByFundType['ewallet'] || 0) - (expenseByFundType['ewallet'] || 0),
    cash: (incomeByFundType['cash'] || 0) - (expenseByFundType['cash'] || 0),
  }

  return {
    transactions,
    loading,
    error,
    refetch: fetch,
    addTransaction,
    deleteTransaction,
    transferFund,
    // summary
    income,
    expense,
    balance,
    categorySummary,
    fundTypeIncomeSummary,
    fundBalances,
  }
}
