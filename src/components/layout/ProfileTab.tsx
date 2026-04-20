'use client'

// ============================================================
// CashFlow — ProfileTab
// Tab Profil: manage akun, settings, logout
// ============================================================

import React, { useState } from 'react'

interface Props {
  profile: any
  spendLimit: number
  limitInput: string
  onLimitChange: (val: string) => void
  onSaveLimit: () => void
  onLogout: () => Promise<void>
  onDeleteAccount: () => Promise<void>
}

export default function ProfileTab(props: Props) {
  const {
    profile,
    spendLimit,
    limitInput,
    onLimitChange,
    onSaveLimit,
    onLogout,
    onDeleteAccount,
  } = props

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    setLoading(true)
    try {
      await onDeleteAccount()
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (confirm('Keluar dari aplikasi?')) {
      await onLogout()
    }
  }

  return (
    <>
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <span className="text-base font-medium text-gray-900">Profil</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-4">
        {/* Profile info */}
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'Pengguna'}</p>
              <p className="text-xs text-gray-400">{profile?.id?.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Spend limit */}
        <div className="border border-gray-100 rounded-xl p-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
            Batas Pengeluaran Bulanan
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Notifikasi muncul saat pengeluaran ≥ 80% dari batas.
          </p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="cth. 5.000.000"
              value={limitInput}
              onChange={e => {
                const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '')
                onLimitChange(raw ? new Intl.NumberFormat('id-ID').format(parseInt(raw)) : '')
              }}
            />
            <button
              onClick={onSaveLimit}
              className="px-4 py-2 bg-emerald-700 text-white text-sm rounded-xl font-medium hover:bg-emerald-800"
            >
              Simpan
            </button>
          </div>
          {spendLimit > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Batas aktif: Rp {new Intl.NumberFormat('id-ID').format(spendLimit)} / bulan
            </p>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-blue-100 text-blue-600 text-sm font-medium hover:bg-blue-50"
        >
          Keluar
        </button>

        {/* Delete account */}
        <button
          onClick={handleDelete}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
            deleteConfirm
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-red-100 text-red-600 hover:bg-red-50'
          }`}
          disabled={loading}
        >
          {loading
            ? 'Menghapus...'
            : deleteConfirm
            ? 'Yakin? Klik lagi untuk konfirmasi'
            : 'Hapus Akun'}
        </button>

        {deleteConfirm && (
          <p className="text-xs text-red-600 text-center">
            ⚠️ Semua data akan dihapus permanen dan tidak bisa dikembalikan!
          </p>
        )}
      </div>
    </>
  )
}
