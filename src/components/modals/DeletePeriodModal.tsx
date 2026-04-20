'use client'

// ============================================================
// CashFlow — DeletePeriodModal
// Konfirmasi penghapusan laporan periode
// ============================================================

import React, { useState } from 'react'
import { Period } from '@/types'

interface Props {
  period: Period
  label: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeletePeriodModal({ period, label, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Hapus Laporan?</h2>
        <p className="text-sm text-gray-600 mb-6">
          Anda akan menghapus semua transaksi pada periode <strong>{label}</strong>. Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
