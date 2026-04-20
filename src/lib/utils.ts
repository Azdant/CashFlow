// ============================================================
// CashFlow — Utility Functions
// ============================================================

import { format, startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  addDays, addWeeks, addMonths, addYears } from 'date-fns'
import { id } from 'date-fns/locale'
import { Period } from '@/types'

// ── Format angka ke Rupiah ──────────────────────────────────
export function fmtRp(amount: number): string {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(amount))
}

// ── Format singkat untuk grafik ────────────────────────────
export function fmtShort(amount: number): string {
  const n = Math.round(amount)
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'M'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt'
  if (n >= 1_000) return Math.round(n / 1_000) + 'rb'
  return String(n)
}

// ── Format input saat mengetik (otomatis tambah titik) ──────
export function formatInputRupiah(value: string): string {
  const raw = value.replace(/\./g, '').replace(/\D/g, '')
  if (!raw) return ''
  return new Intl.NumberFormat('id-ID').format(parseInt(raw))
}

// ── Parse input rupiah yang sudah diformat ──────────────────
export function parseRupiah(value: string): number {
  return parseInt(value.replace(/\./g, '').replace(/\D/g, '')) || 0
}

// ── Template nominal cepat ──────────────────────────────────
export const QUICK_AMOUNTS_INCOME = [
  50_000, 100_000, 200_000, 500_000,
  1_000_000, 2_000_000, 5_000_000,
]
export const QUICK_AMOUNTS_EXPENSE = [
  10_000, 20_000, 50_000, 100_000,
  200_000, 500_000, 1_000_000,
]

// ── Kategori ────────────────────────────────────────────────
export const INCOME_CATEGORIES = [
  'Gaji', 'Freelance', 'Investasi', 'Bisnis', 'Hadiah', 'Tabungan', 'Lainnya',
] as const

export const EXPENSE_CATEGORIES = [
  'Makanan', 'Transport', 'Belanja', 'Tagihan',
  'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya',
] as const

export const ACCOUNT_TYPES = [
  'bank', 'ewallet', 'cash', 'investment', 'savings', 'other'
] as const

export const FUND_TYPES = [
  'bank', 'ewallet', 'cash'
] as const

export const FUND_TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai',
}

export const FUND_TYPE_ICONS: Record<string, string> = {
  bank: '🏦',
  ewallet: '📱',
  cash: '💵',
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai',
  investment: 'Investasi',
  savings: 'Tabungan',
  other: 'Lainnya',
}

export const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  bank: '🏦',
  ewallet: '📱',
  cash: '💵',
  investment: '📈',
  savings: '🏧',
  other: '💼',
}

export const ACCOUNT_COLORS: Record<string, string> = {
  bank: '#2563eb',
  ewallet: '#7c3aed',
  cash: '#059669',
  investment: '#dc2626',
  savings: '#0891b2',
  other: '#6b7280',
}

export const CATEGORY_COLORS: Record<string, string> = {
  Makanan: '#059669', Transport: '#2563eb', Belanja: '#d97706',
  Tagihan: '#ea580c', Hiburan: '#7c3aed', Kesehatan: '#dc2626',
  Pendidikan: '#db2777', Lainnya: '#6b7280', Gaji: '#059669',
  Freelance: '#2563eb', Investasi: '#7c3aed', Bisnis: '#d97706',
  Hadiah: '#db2777', Tabungan: '#0891b2',
}

export const CATEGORY_BG: Record<string, string> = {
  Makanan: '#d1fae5', Transport: '#dbeafe', Belanja: '#fef3c7',
  Tagihan: '#ffedd5', Hiburan: '#ede9fe', Kesehatan: '#fee2e2',
  Pendidikan: '#fce7f3', Lainnya: '#f3f4f6', Gaji: '#d1fae5',
  Freelance: '#dbeafe', Investasi: '#ede9fe', Bisnis: '#fef3c7',
  Hadiah: '#fce7f3', Tabungan: '#cffafe',
}

export const CATEGORY_ICONS: Record<string, string> = {
  Makanan: '🍜', Transport: '🚗', Belanja: '🛍️', Tagihan: '💡',
  Hiburan: '🎬', Kesehatan: '❤️', Pendidikan: '📚', Gaji: '💼',
  Freelance: '💻', Investasi: '📈', Bisnis: '🏪', Hadiah: '🎁',
  Tabungan: '🏦', Lainnya: '💰',
}

// ── Period date range ────────────────────────────────────────
export function getPeriodRange(period: Period, offset: number = 0) {
  const now = new Date()

  if (period === 'all') {
    return { start: null, end: null, label: 'Semua Data' }
  }

  let base: Date
  let start: Date
  let end: Date
  let label: string

  if (period === 'day') {
    base = addDays(now, offset)
    start = startOfDay(base)
    end = endOfDay(base)
    label = format(base, 'EEEE, d MMM yyyy', { locale: id })
  } else if (period === 'week') {
    base = addWeeks(now, offset)
    start = startOfWeek(base, { weekStartsOn: 0 })
    end = endOfWeek(base, { weekStartsOn: 0 })
    label = format(start, 'd MMM', { locale: id }) + ' – ' + format(end, 'd MMM yyyy', { locale: id })
  } else if (period === 'month') {
    base = addMonths(now, offset)
    start = startOfMonth(base)
    end = endOfMonth(base)
    label = format(base, 'MMMM yyyy', { locale: id })
  } else {
    base = addYears(now, offset)
    start = startOfYear(base)
    end = endOfYear(base)
    label = 'Tahun ' + format(base, 'yyyy')
  }

  return { start, end, label }
}

// ── clsx helper sederhana ────────────────────────────────────
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
