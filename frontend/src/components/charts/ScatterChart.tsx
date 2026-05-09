'use client'

import { Patient } from '@/lib/data'
import { TierBadge } from '@/components/ui/TierBadge'
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart as RechartsScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ScatterPoint = Patient & {
  risk_score: number
  uplift_score: number
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ScatterPoint }> }) {
  if (!active || !payload?.length) return null
  const patient = payload[0].payload

  return (
    <div className="w-64 rounded-xl border border-surface-border bg-white p-4 text-sm shadow-card">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Patient</p>
          <p className="text-lg font-extrabold text-ink">#{patient.patient_nbr}</p>
        </div>
        {patient.tier ? <TierBadge tier={patient.tier} /> : null}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted">
        <span>Age</span><strong className="text-right text-ink">{patient.age}</strong>
        <span>Gender</span><strong className="text-right text-ink">{patient.gender}</strong>
        <span>Risk</span><strong className="text-right text-ink">{Math.round(patient.risk_score * 100)}%</strong>
        <span>Uplift</span><strong className="text-right text-ink">{Math.round(patient.uplift_score * 100)}%</strong>
      </div>
    </div>
  )
}

function QuadrantLabels() {
  return (
    <g pointerEvents="none">
      <text x="17%" y="13%" fill="#E63946" fontSize={12} fontWeight={800}>High risk / low uplift</text>
      <text x="62%" y="13%" fill="#1B4332" fontSize={12} fontWeight={800}>Priority targets</text>
      <text x="17%" y="88%" fill="#718096" fontSize={12} fontWeight={800}>Routine discharge</text>
      <text x="62%" y="88%" fill="#0077B6" fontSize={12} fontWeight={800}>Hidden responders</text>
    </g>
  )
}

export function ScatterChart({ patients, enrolled }: { patients: Patient[]; enrolled: Set<number> }) {
  const data = patients.filter((patient): patient is ScatterPoint => patient.risk_score !== undefined && patient.uplift_score !== undefined)

  return (
    <div className="h-[390px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart margin={{ top: 28, right: 20, bottom: 50, left: 70 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="risk_score"
            name="Risk"
            domain={[0, 1]}
            tickFormatter={value => `${Math.round(value * 100)}%`}
            label={{ value: 'Readmission Risk Score →', position: 'insideBottom', dy: 20, fill: '#4A5568', fontSize: 12 }}
            tick={{ fill: '#718096', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="uplift_score"
            name="Uplift"
            domain={[-0.05, 0.4]}
            tickFormatter={value => `${Math.round(value * 100)}%`}
            label={{ value: '← Expected Uplift from Intervention', angle: -90, position: 'insideLeft', dx: -15, dy: 100, fill: '#4A5568', fontSize: 12 }}
            tick={{ fill: '#718096', fontSize: 12 }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
          <ReferenceLine x={0.5} stroke="#94A3B8" strokeDasharray="5 5" />
          <ReferenceLine y={0.15} stroke="#0077B6" strokeDasharray="5 5" />
          <QuadrantLabels />
          <Scatter data={data}>
            {data.map(patient => {
              const isEnrolled = enrolled.has(patient.patient_nbr)
              return (
                <Cell
                  key={patient.patient_nbr}
                  fill={isEnrolled ? '#0077B6' : '#94A3B8'}
                  fillOpacity={isEnrolled ? 0.95 : 0.35}
                  stroke={isEnrolled ? '#003256' : '#CBD5E1'}
                  strokeWidth={isEnrolled ? 1.5 : 1}
                />
              )
            })}
          </Scatter>
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
