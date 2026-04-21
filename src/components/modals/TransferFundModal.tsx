'use client'

// ============================================================
// CashFlow — TransferFundModal
// Modal untuk transfer uang antar fund type
// ============================================================

import { useState } from 'react'
import { FundType } from '@/types'
import { fmtRp, FUND_TYPES } from '@/lib/utils'

interface Props {
  fundBalances: Record<string, number>
  onClose: () => void
  onSave: (fromFund: FundType, toFund: FundType, amount: number) => Promise<void>
}

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','000','0','⌫']
const FUND_LABELS = { bank: 'Bank', ewallet: 'E-Wallet', cash: 'Tunai' }
const FUND_ICONS = { bank: '🏦', ewallet: '📱', cash: '💵' }

export default function TransferFundModal({ fundBalances, onClose, onSave }: Props) {
  const [fromFund, setFromFund] = useState<FundType>('cash')
  const [toFund, setToFund] = useState<FundType>('bank')
  const [amount, setAmount] = useState(0)
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

  const fromBalance = fundBalances[fromFund] || 0
  const canTransfer = amount > 0 && amount <= fromBalance && fromFund !== toFund

  const handleSave = async () => {
    if (!canTransfer) return
    setLoading(true)
    await onSave(fromFund, toFund, amount)
    setLoading(false)
  }

  return (
    <div
      className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-[inherit]"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-[88%] max-w-sm max-h-[90%] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-base mx-auto mb-1 bg-blue-100">
                💱
              </div>
              <p className="text-sm font-medium text-center text-blue-900">
                Transfer Antar Jenis Uang
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
          <div className="text-center py-3 px-3 bg-gray-50 rounded-xl mb-4 text-lg font-medium text-gray-800">
            {fmtRp(amount)}
          </div>

          {/* Fund type selector */}
          <div className="space-y-3 mb-4">
            {/* From */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Dari</p>
              <div className="flex gap-2">
                {FUND_TYPES.map(ft => (
                  <button
                    key={ft}
                    onClick={() => setFromFund(ft as FundType)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      fromFund === ft
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm mb-0.5">{FUND_ICONS[ft]}</div>
                    <div>{FUND_LABELS[ft]}</div>
                    <div className="text-xs opacity-70 mt-0.5">{fmtRp(fundBalances[ft] || 0)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* To */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-2">Ke</p>
              <div className="flex gap-2">
                {FUND_TYPES.map(ft => (
                  <button
                    key={ft}
                    onClick={() => setToFund(ft as FundType)}
                    disabled={ft === fromFund}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      toFund === ft && ft !== fromFund
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : ft === fromFund
                        ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm mb-0.5">{FUND_ICONS[ft]}</div>
                    <div>{FUND_LABELS[ft]}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {NUMPAD_KEYS.map(key => (
              <button
                key={key}
                onClick={() => handleNumpad(key)}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  key === '⌫'
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Error message */}
          {amount > fromBalance && amount > 0 && (
            <p className="text-xs text-red-600 mb-3 text-center">
              Saldo tidak cukup. Saldo: {fmtRp(fromBalance)}
            </p>
          )}

          {fromFund === toFund && amount > 0 && (
            <p className="text-xs text-amber-600 mb-3 text-center">
              Pilih jenis uang tujuan yang berbeda
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!canTransfer || loading}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                canTransfer && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Transfer...' : 'Transfer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
