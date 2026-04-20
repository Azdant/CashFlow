'use client'

// ============================================================
// CashFlow — Dashboard Page
// ============================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useGoals } from '@/hooks/useGoals'
import { fmtRp, fmtShort, getPeriodRange, CATEGORY_COLORS, CATEGORY_BG, CATEGORY_ICONS, ACCOUNT_TYPE_ICONS } from '@/lib/utils'
import { Period, AccountInput, Profile } from '@/types'
import { exportTransactionsToCsv } from '@/lib/export'
import TransactionModal from '@/components/modals/TransactionModal'
import AccountModal from '@/components/modals/AccountModal'
import GoalModal from '@/components/modals/GoalModal'
import DeletePeriodModal from '@/components/modals/DeletePeriodModal'
import CashFlowChart from '@/components/ui/CashFlowChart'
import ProfileTab from '@/components/layout/ProfileTab'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'day', label: 'Hari' },
  { key: 'week', label: 'Minggu' },
  { key: 'month', label: 'Bulan' },
  { key: 'year', label: 'Tahun' },
]

type Tab = 'home' | 'accounts' | 'goals' | 'profile'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('home')
  const [period, setPeriod] = useState<Period>('all')
  const [offset, setOffset] = useState(0)
  const [incomeModal, setIncomeModal] = useState(false)
  const [expenseModal, setExpenseModal] = useState(false)
  const [accountModal, setAccountModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [goalModal, setGoalModal] = useState(false)
  const [spendLimit, setSpendLimit] = useState(0)
  const [limitInput, setLimitInput] = useState('')
  const [deletePeriodModal, setDeletePeriodModal] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const { transactions, loading, addTransaction, deleteTransaction,
    income, expense, balance, categorySummary, refetch } = useTransactions(period, offset)
  const { accounts, addAccount, updateAccount, deleteAccount, totalBalance } = useAccounts()
  const { goals, addGoal, deleteGoal, refetch: refetchGoals } = useGoals()

  // Cek auth & load profile
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) router.push('/auth/login')
      
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .single()
      if (profileData) setProfile(profileData)
    }
    init()
    
    // Load spend limit dari localStorage
    const saved = localStorage.getItem('cf_spend_limit')
    if (saved) { setSpendLimit(parseInt(saved)); setLimitInput(new Intl.NumberFormat('id-ID').format(parseInt(saved))) }
  }, [])

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    setOffset(0)
  }

  const { label: periodLabel } = getPeriodRange(period, offset)

  const spendPct = spendLimit > 0 ? Math.round((expense / spendLimit) * 100) : 0

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleDeleteAccount = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.user) return
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', data.session.user.id)
    
    if (!error) {
      await supabase.auth.signOut()
      router.push('/auth/login')
    }
  }

  const saveLimit = () => {
    const val = parseInt(limitInput.replace(/\./g, '').replace(/\D/g, '')) || 0
    setSpendLimit(val)
    localStorage.setItem('cf_spend_limit', String(val))
  }

  const handleDeletePeriod = async () => {
    if (period === 'all') return
    const { start, end } = getPeriodRange(period, offset)
    if (!start || !end) return
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .gte('date', startStr)
      .lte('date', endStr)
    
    if (!error) {
      refetch()
      setDeletePeriodModal(false)
    }
  }

  const handleExport = () => {
    const { label } = getPeriodRange(period, offset)
    exportTransactionsToCsv(transactions, `cashflow-${period}-${label.replace(/\s+/g, '-')}.csv`)
  }

  return (
    <div className="app-shell">

      {/* ── HOME TAB ─────────────────────────────────── */}
      {tab === 'home' && (
        <>
          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-gray-900">CashFlow</span>
              <div className="flex gap-1">
                <button
                  onClick={handleExport}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-xs hover:bg-gray-50"
                  title="Export ke CSV"
                >
                  ↓
                </button>
                {period !== 'all' && (
                  <button
                    onClick={() => setDeletePeriodModal(true)}
                    className="w-7 h-7 rounded-lg border border-red-200 flex items-center justify-center text-red-500 text-xs hover:bg-red-50"
                    title="Hapus periode"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Period selector */}
            {period !== 'all' && (
              <div className="flex items-center justify-between gap-2 mb-3">
                <button
                  onClick={() => setOffset(o => o - 1)}
                  className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50"
                >
                  ‹ Sebelumnya
                </button>
                <select
                  value={period}
                  onChange={(e) => handlePeriodChange(e.target.value as Period)}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg px-2 py-1"
                >
                  {PERIODS.map(p => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setOffset(o => o + 1)}
                  className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50"
                >
                  Berikutnya ›
                </button>
              </div>
            )}

            {/* Period label */}
            {period !== 'all' && (
              <div className="text-xs text-gray-500 text-center mb-2">
                {periodLabel}
              </div>
            )}

            {/* Period tabs (when all) */}
            {period === 'all' && (
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {PERIODS.map(p => (
                  <button
                    key={p.key}
                    onClick={() => handlePeriodChange(p.key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      period === p.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pb-4">
            {/* Alert */}
            {spendLimit > 0 && spendPct >= 80 && (
              <div className={`mx-4 mb-3 px-3 py-2 rounded-xl text-xs ${
                spendPct >= 100
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {spendPct >= 100
                  ? `⚠️ Pengeluaran melebihi batas ${fmtRp(spendLimit)}!`
                  : `⚠️ Pengeluaran sudah ${spendPct}% dari batas ${fmtRp(spendLimit)}.`}
              </div>
            )}

            {/* Balance card */}
            <div className="mx-4 mb-3 bg-emerald-900 rounded-2xl p-4 text-white">
              <p className="text-xs opacity-70 mb-1">Saldo bersih</p>
              <p className="text-2xl font-medium tracking-tight">{fmtRp(balance)}</p>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-xs opacity-70 mb-0.5">↑ Pemasukan</p>
                  <p className="text-sm font-medium">{fmtRp(income)}</p>
                </div>
                <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-xs opacity-70 mb-0.5">↓ Pengeluaran</p>
                  <p className="text-sm font-medium">{fmtRp(expense)}</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mx-4 mb-3">
              <button
                onClick={() => setIncomeModal(true)}
                className="flex-1 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-center gap-1.5"
              >
                + Pemasukan
              </button>
              <button
                onClick={() => setExpenseModal(true)}
                className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium flex items-center justify-center gap-1.5"
              >
                − Pengeluaran
              </button>
            </div>

            {/* Stat cards */}
            <div className="flex gap-2 mx-4 mb-3">
              {[
                { label: 'Pemasukan', val: income, color: 'text-emerald-700' },
                { label: 'Pengeluaran', val: expense, color: 'text-red-700' },
                { label: 'Tabungan', val: Math.max(0, income - expense), color: 'text-blue-700' },
              ].map(s => (
                <div key={s.label} className="flex-1 bg-gray-50 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-xs font-medium ${s.color}`}>{fmtRp(s.val)}</p>
                </div>
              ))}
            </div>

            {/* Pengeluaran per kategori */}
            <div className="mx-4 mb-3 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Pengeluaran per kategori</p>
              {categorySummary.length === 0 ? (
                <p className="text-xs text-gray-400 py-2 text-center">Belum ada pengeluaran.</p>
              ) : (
                <div className="space-y-2">
                  {categorySummary.map(({ category, total, percentage }) => (
                    <div key={category} className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: CATEGORY_BG[category] || '#f3f4f6' }}
                      >
                        {CATEGORY_ICONS[category] || '💰'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700">{category}</p>
                        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percentage}%`,
                              background: CATEGORY_COLORS[category] || '#6b7280',
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-700 min-w-[68px] text-right">{fmtRp(total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="mx-4 mb-3 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Arus kas</p>
              <CashFlowChart transactions={transactions} period={period} />
            </div>

            {/* Transaksi terbaru */}
            <div className="mx-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Transaksi terbaru</p>
              {loading ? (
                <p className="text-xs text-gray-400 text-center py-4">Memuat...</p>
              ) : transactions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada transaksi.</p>
              ) : (
                <div className="space-y-0">
                  {transactions.slice(0, 10).map(t => (
                    <div key={t.id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: CATEGORY_BG[t.category] || '#f3f4f6' }}
                      >
                        {CATEGORY_ICONS[t.category] || '💰'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
                        <p className="text-xs text-gray-400">{t.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${t.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {t.type === 'income' ? '+' : '-'}{fmtRp(t.amount)}
                        </p>
                        <p className="text-xs text-gray-400">{t.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── ACCOUNTS TAB ─────────────────────────────── */}
      {tab === 'accounts' && (
        <>
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-gray-900">Akun</span>
              <button
                onClick={() => { setSelectedAccount(null); setAccountModal(true) }}
                className="text-xs text-emerald-700 font-medium px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                + Tambah
              </button>
            </div>
            
            {/* Total balance */}
            {accounts.length > 0 && (
              <div className="bg-emerald-900 rounded-xl p-3 text-white">
                <p className="text-xs opacity-70 mb-1">Total Saldo</p>
                <p className="text-xl font-medium">{fmtRp(totalBalance)}</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">Belum ada akun. Tambahkan akun untuk mengelola uang Anda.</p>
                <button
                  onClick={() => { setSelectedAccount(null); setAccountModal(true) }}
                  className="mt-3 text-xs text-emerald-700 font-medium"
                >
                  Tambah akun pertama →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { setSelectedAccount(acc); setAccountModal(true) }}
                    className="w-full text-left border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: acc.color + '20' }}
                      >
                        {ACCOUNT_TYPE_ICONS[acc.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{acc.name}</p>
                        <p className="text-xs text-gray-400">{acc.type}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 text-right">{fmtRp(acc.balance)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── GOALS TAB ────────────────────────────────── */}
      {tab === 'goals' && (
        <>
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-900">Goals</span>
              <button
                onClick={() => setGoalModal(true)}
                className="text-xs text-emerald-700 font-medium px-3 py-1.5 rounded-lg border border-emerald-200"
              >
                + Tambah
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-2">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">Belum ada goal.</p>
                <button
                  onClick={() => setGoalModal(true)}
                  className="mt-3 text-xs text-emerald-700 font-medium"
                >
                  Tambah goal pertama →
                </button>
              </div>
            ) : goals.map((g, i) => {
              const emojis = ['🎯','🏖️','🚗','🏠','💎','✈️','📱','🎓','🏦','📊']
              const done = g.percentage >= 100
              return (
                <div key={g.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-gray-800">{emojis[i % 10]} {g.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      done ? 'bg-emerald-50 text-emerald-700' :
                      g.percentage >= 80 ? 'bg-amber-50 text-amber-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {done ? '✓ Tercapai' : g.percentage + '%'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Dari: {g.tracked_categories.join(', ')}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${g.percentage}%`,
                        background: done ? '#059669' : g.percentage >= 80 ? '#d97706' : '#2563eb',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{fmtRp(g.saved_amount)} terkumpul</span>
                    <span>{done ? 'Selesai!' : 'Sisa ' + fmtRp(g.target_amount - g.saved_amount)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── PROFILE TAB ──────────────────────────────── */}
      {tab === 'profile' && (
        <ProfileTab
          profile={profile}
          spendLimit={spendLimit}
          limitInput={limitInput}
          onLimitChange={setLimitInput}
          onSaveLimit={saveLimit}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* ── Bottom Navigation (LOCKED) ──────────────── */}
      <nav className="flex-shrink-0 flex border-t border-gray-100 bg-white">
        {([
          { key: 'home', icon: '🏠', label: 'Beranda' },
          { key: 'accounts', icon: '💳', label: 'Akun' },
          { key: 'goals', icon: '🎯', label: 'Goals' },
          { key: 'profile', icon: '👤', label: 'Profil' },
        ] as { key: Tab; icon: string; label: string }[]).map(n => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs transition-colors ${
              tab === n.key ? 'text-emerald-700' : 'text-gray-400'
            }`}
          >
            <span className="text-base leading-none">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* ── Modals ─────────────────────────────────── */}
      {incomeModal && (
        <TransactionModal
          type="income"
          accounts={accounts}
          onClose={() => setIncomeModal(false)}
          onSave={async (input) => { await addTransaction(input); setIncomeModal(false) }}
        />
      )}
      {expenseModal && (
        <TransactionModal
          type="expense"
          accounts={accounts}
          onClose={() => setExpenseModal(false)}
          onSave={async (input) => { await addTransaction(input); setExpenseModal(false) }}
        />
      )}
      {accountModal && (
        <AccountModal
          account={selectedAccount}
          onClose={() => { setAccountModal(false); setSelectedAccount(null) }}
          onSave={async (input: AccountInput) => {
            if (selectedAccount) {
              await updateAccount(selectedAccount.id, input)
            } else {
              await addAccount(input)
            }
            setAccountModal(false)
            setSelectedAccount(null)
          }}
          onDelete={selectedAccount ? async () => {
            await deleteAccount(selectedAccount.id)
            setAccountModal(false)
            setSelectedAccount(null)
          } : undefined}
        />
      )}
      {goalModal && (
        <GoalModal
          onClose={() => setGoalModal(false)}
          onSave={async (input) => { await addGoal(input); setGoalModal(false) }}
        />
      )}
      {deletePeriodModal && (
        <DeletePeriodModal
          period={period}
          label={getPeriodRange(period, offset).label}
          onClose={() => setDeletePeriodModal(false)}
          onConfirm={handleDeletePeriod}
        />
      )}
    </div>
  )
}
