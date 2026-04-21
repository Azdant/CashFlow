'use client'

import { useState, useEffect } from 'react'
import { GoalInput, GoalWithProgress } from '@/types'
import { INCOME_CATEGORIES, formatInputRupiah, parseRupiah } from '@/lib/utils'

interface Props {
  goal?: GoalWithProgress | null
  onClose: () => void
  onSave: (input: GoalInput) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export default function GoalModal({ goal, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [catError, setCatError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const isEditing = !!goal

  // Pre-fill form jika editing
  useEffect(() => {
    if (goal) {
      setName(goal.name)
      setTargetInput(new Intl.NumberFormat('id-ID').format(goal.target_amount))
      setSelectedCats(goal.tracked_categories)
    }
  }, [goal])

  const toggleCat = (c: string) => {
    setSelectedCats(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
    setCatError(false)
  }

  const handleSave = async () => {
    if (!name || !targetInput) return
    if (!selectedCats.length) { setCatError(true); return }
    setLoading(true)
    await onSave({
      name,
      target_amount: parseRupiah(targetInput),
      tracked_categories: selectedCats as any,
    })
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!goal) return
    setLoading(true)
    await onDelete?.(goal.id)
    setLoading(false)
  }

  return (
    <div
      className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 rounded-[inherit]"
      onClick={e => e.target === e.currentTarget && !showDeleteConfirm && onClose()}
    >
      {showDeleteConfirm ? (
        // Delete Confirmation View
        <div className="bg-white rounded-2xl w-[88%] max-w-sm">
          <div className="p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">Hapus Goal?</p>
            <p className="text-xs text-gray-600 mb-6">
              Goal "{goal?.name}" akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Menghapus...' : 'Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Edit/Create View
        <div className="bg-white rounded-2xl w-[88%] max-w-sm max-h-[90%] overflow-y-auto">
          <div className="p-4">
            <div className="relative flex items-center justify-center mb-4">
              <p className="text-sm font-medium text-gray-800">
                {isEditing ? 'Edit Goal' : 'Tambah Goal'}
              </p>
              <button onClick={onClose} className="absolute right-0 text-gray-400 text-xl leading-none p-1">×</button>
            </div>

            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Progress goal dihitung otomatis dari total pemasukan pada kategori yang kamu pilih.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Nama goal <span className="text-red-500">*</span></p>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="cth. Dana darurat..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Target (Rp) <span className="text-red-500">*</span></p>
                <input
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-gray-300"
                  placeholder="cth. 10.000.000"
                  value={targetInput}
                  onChange={e => setTargetInput(formatInputRupiah(e.target.value))}
                  inputMode="numeric"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Lacak dari kategori <span className="text-red-500">*</span></p>
                <div className="flex flex-wrap gap-1.5">
                  {INCOME_CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCat(c)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                        selectedCats.includes(c)
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'border-gray-200 text-gray-500 bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {catError && <p className="text-xs text-red-500 mt-1.5">Pilih minimal satu kategori.</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 btn-primary bg-blue-700"
              >
                {loading ? 'Menyimpan...' : isEditing ? 'Update Goal' : 'Simpan Goal'}
              </button>
              {isEditing && onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
