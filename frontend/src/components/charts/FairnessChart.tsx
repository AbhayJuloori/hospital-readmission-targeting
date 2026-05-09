'use client'

import { useEffect, useState } from 'react'
import { FAIRNESS_DATA } from '@/lib/data'
import { fetchFairnessData, type FairnessApiResponse } from '@/lib/api'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const fallbackFairnessData: FairnessApiResponse = {
  races: FAIRNESS_DATA.races,
  enrollment_rates: FAIRNESS_DATA.enrollmentRates,
  median_uplifts: FAIRNESS_DATA.medianUplift,
}

function formatRace(race: string): string {
  return race === 'AfricanAmerican' ? 'African American' : race
}

function toBarData(data: FairnessApiResponse) {
  const enrollmentData = data.races.map((race, index) => ({
    race: formatRace(race),
    value: data.enrollment_rates[index] ?? 0,
  }))

  const upliftData = data.races.map((race, index) => ({
    race: formatRace(race),
    value: data.median_uplifts[index] ?? 0,
  }))

  return { enrollmentData, upliftData }
}

function SimpleTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-surface-border bg-white p-3 text-sm shadow-card">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-ink-muted">{Math.round((payload[0].value ?? 0) * 100)}%</p>
    </div>
  )
}

export function FairnessChart() {
  const [data, setData] = useState<FairnessApiResponse>(fallbackFairnessData)
  const [isLoading, setIsLoading] = useState(true)
  const { enrollmentData, upliftData } = toBarData(data)
  const averageEnrollment = enrollmentData.reduce((sum, item) => sum + item.value, 0) / enrollmentData.length

  useEffect(() => {
    let isMounted = true

    fetchFairnessData().then(apiData => {
      if (!isMounted) return
      if (apiData) setData(apiData)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="grid gap-6 transition-opacity duration-200 lg:grid-cols-2" style={{ opacity: isLoading ? 0.55 : 1 }}>
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-ink">Enrollment Rate by Race</h3>
          <p className="text-sm text-ink-subtle">Dashed line shows sample average.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentData} layout="vertical" margin={{ top: 8, right: 24, left: 22, bottom: 8 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 0.2]} tickFormatter={value => `${Math.round(value * 100)}%`} tick={{ fill: '#718096', fontSize: 12 }} />
              <YAxis type="category" dataKey="race" width={120} tick={{ fill: '#4A5568', fontSize: 12 }} />
              <Tooltip content={<SimpleTooltip />} />
              <ReferenceLine x={averageEnrollment} stroke="#4A5568" strokeDasharray="4 4" />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {enrollmentData.map(item => (
                  <Cell key={item.race} fill={averageEnrollment - item.value > 0.15 ? '#E63946' : '#2D6A4F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-ink">Median Uplift by Race</h3>
          <p className="text-sm text-ink-subtle">Higher values indicate stronger expected benefit.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={upliftData} layout="vertical" margin={{ top: 8, right: 24, left: 22, bottom: 8 }}>
              <defs>
                <linearGradient id="upliftBar" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#80ccf0" />
                  <stop offset="100%" stopColor="#0077B6" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[-0.05, 0.05]} tickFormatter={value => `${Math.round(value * 100)}%`} tick={{ fill: '#718096', fontSize: 12 }} />
              <YAxis type="category" dataKey="race" width={120} tick={{ fill: '#4A5568', fontSize: 12 }} />
              <Tooltip content={<SimpleTooltip />} />
              <Bar dataKey="value" fill="url(#upliftBar)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
