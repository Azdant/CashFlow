// ============================================================
// CashFlow — Export CSV Utility
// ============================================================

import { Transaction } from '@/types'
import { fmtRp } from '@/lib/utils'

export function exportTransactionsToCsv(
  transactions: Transaction[],
  filename: string = 'cashflow-export.csv'
) {
  const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Dibuat']
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category,
    t.description,
    fmtRp(t.amount),
    new Date(t.created_at).toLocaleString('id-ID'),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
