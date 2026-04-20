'use client'

import { useState } from 'react'

interface DatePickerProps {
  value: Date
  onChange: (date: Date) => void
  onClose: () => void
}

export default function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const [month, setMonth] = useState(value.getMonth())
  const [year, setYear] = useState(value.getFullYear())

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay()

  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const handleSelectDay = (day: number) => {
    onChange(new Date(year, month, day))
    onClose()
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const currentDay = value.getDate()
  const currentMonth = value.getMonth()
  const currentYear = value.getFullYear()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in">
      <div className="bg-white w-full rounded-t-3xl p-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ◀
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">Pilih Tanggal</p>
            <p className="text-lg font-semibold text-gray-900">
              {months[month]} {year}
            </p>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ▶
          </button>
        </div>

        {/* Year & Month Selector */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 uppercase">Bulan</label>
            <select
              value={month}
              onChange={e => setMonth(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 uppercase">Tahun</label>
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {Array.from({ length: 10 }, (_, i) => year - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const isSelected = day === currentDay && month === currentMonth && year === currentYear
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
              return (
                <button
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : isToday
                      ? 'border-2 border-emerald-600 text-emerald-600'
                      : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onChange(new Date(year, month, 1))
              onClose()
            }}
            className="flex-1 py-3 rounded-xl bg-emerald-700 text-white font-medium"
          >
            Pilih
          </button>
        </div>
      </div>
    </div>
  )
}
