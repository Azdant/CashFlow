'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { Transaction, Period } from '@/types'
import { fmtShort } from '@/lib/utils'

Chart.register(...registerables)

interface Props {
  transactions: Transaction[]
  period: Period
}

export default function CashFlowChart({ transactions, period }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const labels = getLabels(period)
    const { incData, expData } = getData(transactions, period, labels.length)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: incData,
            borderColor: '#059669',
            backgroundColor: 'rgba(5,150,105,0.07)',
            tension: 0.35,
            fill: true,
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            data: expData,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220,38,38,0.06)',
            tension: 0.35,
            fill: true,
            pointRadius: 2,
            borderWidth: 2,
            borderDash: [4, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { font: { size: 9 }, color: '#9ca3af', maxRotation: 0, autoSkip: true, maxTicksLimit: 7 },
            grid: { display: false },
          },
          y: {
            ticks: { font: { size: 9 }, color: '#9ca3af', callback: v => 'Rp ' + fmtShort(Number(v)) },
            grid: { color: 'rgba(0,0,0,0.04)' },
          },
        },
      },
    })

    return () => { chartRef.current?.destroy() }
  }, [transactions, period])

  return (
    <div style={{ position: 'relative', width: '100%', height: '110px' }}>
      <canvas ref={ref} role="img" aria-label="Grafik arus kas pemasukan dan pengeluaran">Grafik arus kas.</canvas>
    </div>
  )
}

function getLabels(period: Period): string[] {
  if (period === 'year') return ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  if (period === 'day') return Array.from({ length: 6 }, (_, i) => (i * 4) + 'h')
  return ['Min','Sen','Sel','Rab','Kam','Jum','Sab']
}

function getData(transactions: Transaction[], period: Period, len: number) {
  const incData = Array(len).fill(0)
  const expData = Array(len).fill(0)

  transactions.forEach(t => {
    const d = new Date(t.date)
    let idx = -1
    if (period === 'year') idx = d.getMonth()
    else if (period === 'day') idx = Math.floor(d.getHours() / 4)
    else idx = d.getDay()

    if (idx >= 0 && idx < len) {
      if (t.type === 'income') incData[idx] += t.amount
      else expData[idx] += t.amount
    }
  })

  return { incData, expData }
}
