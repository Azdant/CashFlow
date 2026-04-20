'use client'

// ============================================================
// CashFlow — TransactionModal
// Popup input pemasukan / pengeluaran
// ============================================================

import { useState } from 'react'
import { TransactionType, TransactionInput, FundType } from '@/types'
import {
  fmtRp, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
  QUICK_AMOUNTS_INCOME, QUICK_AMOUNTS_EXPENSE, fmtShort,
  FUND_TYPE_ICONS, FUND_TYPES,
} from '@/lib/utils'

interface Props {
  type: TransactionType
  onClose: () => void
  onSave: (input: TransactionInput) => Promise<void>
}

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','000','0','⌫']

export default function TransactionModal({ type, onClose, onSave }: Props) {
  const isIncome = type === 'income'
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const quickAmounts = isIncome ? QUICK_AMOUNTS_INCOME : QUICK_AMOUNTS_EXPENSE

  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [fundType, setFundType] = useState<FundType>('cash')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [catError, setCatError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleNumpad = (key: string) => {
    setAmount(prev => {
      const raw = prev.toString()
      let next: string
      if (key === '⌫') next = raw.length > 1 ? raw.slice(0, -1) : '0'
      else if (key === '000') next = raw === '0' ? '0' : raw + '000'
      else next = raw === '0' ? key : raw + key
      return Math.min(parseInt(next) || 0, 999_999_999)
    })
  }

  const handleSave = async () => {
    if (!category) { setCatError(true); return }
    if (!amount) return
    setLoading(true)
    await onSave({ 
      type, 
      amount, 
      description: description || (isIncome ? 'Pemasukan' : 'Pengeluaran'), 
      category: category as any,
      fund_type: fundType,
      date 
    })
    setLoading(false)
  }

  const accent = isIncome ? 'emerald' : 'red'
  const accentBg = isIncome ? '#d1fae5' : '#fee2e2'
  const accentText = isIncome ? '#065f46' : '#991b1b'

  return (
    <div
      className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-[inherit]"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-[88%] max-w-sm max-h-[90%] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg absolute left-0 opacity-0"
            />
            <div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base mx-auto mb-1"
                style={{ background: accentBg }}
              >
                {isIncome ? '↑' : '↓'}
              </div>
              <p className="text-sm font-medium text-center" style={{ color: accentText }}>
                {isIncome ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="absolute right-0 top-0 text-gray-400 text-xl leading-none p-1"
            >
              ×
            </button>
          </div>

          {/* Amount display */}
          <div className="text-center py-2 px-3 bg-gray-50 rounded-xl mb-3 text-lg font-medium text-gray-800">
            {fmtRp(amount)}
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickAmounts.map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  amount === v
                    ? isIncome
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-700 border-red-300'
                    : 'border-gray-200 text-gray-500 bg-gray-50'
                }`}
              >
                {fmtShort(v)}
              </button>
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {NUMPAD_KEYS.map(k => (
              <button
                key={k}
                onClick={() => handleNumpad(k)}
                className="py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 font-medium active:bg-gray-100 transition-colors"
              >
                {k}
              </button>
            ))}
          </div>

          {/* Description */}
          <input
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 mb-3 focus:outline-none focus:border-gray-300"
            placeholder={isIncome ? 'cth. Gaji bulanan...' : 'cth. Makan siang...'}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {/* Date */}
          <input
            type="date"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 mb-3 focus:outline-none focus:border-gray-300"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {/* Fund Type */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">
              Jenis Dana <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(FUND_TYPES as readonly FundType[]).map(ft => (
                <button
                  key={ft}
                  onClick={() => setFundType(ft)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1 ${
                    fundType === ft
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'border-gray-200 text-gray-500 bg-gray-50'
                  }`}
                >
                  <span>{FUND_TYPE_ICONS[ft]}</span>
                  {ft === 'bank' ? 'Bank' : ft === 'ewallet' ? 'E-Wallet' : 'Tunai'}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">
              Kategori <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setCatError(false) }}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                    category === c
                      ? isIncome
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-700 border-red-300'
                      : 'border-gray-200 text-gray-500 bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {catError && (
              <p className="text-xs text-red-500 mt-1.5">Pilih kategori terlebih dahulu.</p>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
            style={{ background: isIncome ? '#065f46' : '#dc2626' }}
          >
            {loading ? 'Menyimpan...' : isIncome ? 'Simpan Pemasukan' : 'Simpan Pengeluaran'}
          </button>
        </div>
      </div>
    </div>
  )
}
