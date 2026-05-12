'use client'

import { useEffect, useState } from 'react'
import { QINI_DATA } from '@/lib/data'
import { fetchQiniData, type QiniApiResponse } from '@/lib/api'
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const fallbackQiniData: QiniApiResponse = {
  fractions: QINI_DATA.fractions,
  qini: QINI_DATA.uplift,
  risk_targeting: QINI_DATA.risk,
  random: QINI_DATA.random,
  auuc: 0,
}

function toChartData(data: QiniApiResponse) {
  return data.fractions.map((fraction, index) => ({
    x: fraction * 100,
    'Uplift Targeting': (data.qini[index] ?? 0) * 100,
    'Risk Targeting': (data.risk_targeting[index] ?? 0) * 100,
    Random: (data.random[index] ?? 0) * 100,
  }))
}

type TooltipPayload = {
  name?: string
  value?: number
  color?: string
}

function QiniTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: number }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-surface-border bg-white p-3 text-sm shadow-card">
      <p className="mb-2 font-semibold text-ink">{Math.round(label ?? 0)}% targeted</p>
      <div className="space-y-1">
        {payload.map(item => (
          <div key={item.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-ink-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold text-ink">{Math.round(item.value ?? 0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QiniChart({ height = 360 }: { width?: number; height?: number }) {
  const [data, setData] = useState<QiniApiResponse>(fallbackQiniData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchQiniData().then(apiData => {
      if (!isMounted) return
      if (apiData) setData(apiData)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const chartData = toChartData(data)

  return (
    <div className="h-full w-full transition-opacity duration-200" style={{ minHeight: height, opacity: isLoading ? 0.55 : 1 }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 8, right: 30, bottom: 44, left: 70 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            domain={[0, 100]}
            tickFormatter={value => `${value}%`}
            label={{ value: '% of Population Targeted', position: 'insideBottom', dy: 28, fill: '#4A5568', fontSize: 12 }}
            tick={{ fill: '#718096', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={value => `${value}%`}
            label={{ value: '% of Readmissions Prevented', angle: -90, position: 'insideLeft', dx: -15, dy: 70, fill: '#4A5568', fontSize: 12 }}
            tick={{ fill: '#718096', fontSize: 12 }}
          />
          <Tooltip content={<QiniTooltip />} />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '12px' }} />
          <ReferenceLine x={10} stroke="#0077B6" strokeDasharray="4 4">
            <Label value="10% budget" position="top" fill="#0077B6" fontSize={12} fontWeight={700} />
          </ReferenceLine>
          <text x="19%" y="30%" fill="#0077B6" fontSize={14} fontWeight={800}>
            +2x vs risk
          </text>
          <Line type="monotone" dataKey="Uplift Targeting" stroke="#0077B6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="Risk Targeting" stroke="#F4A261" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Random" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
