'use client'

import { Patient } from '@/lib/data'
import { TierBadge } from '@/components/ui/TierBadge'
import { motion } from 'framer-motion'
import { ClipboardList, HeartPulse } from 'lucide-react'

function Gauge({ label, value, color, max = 1 }: { label: string; value: number; color: string; max?: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const bounded = Math.min(max, Math.max(0, value))
  const progress = bounded / max
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="flex flex-col items-center rounded-2xl border border-surface-border bg-white p-5">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <motion.circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="10"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-extrabold text-ink">{Math.round(value * 100)}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-ink-muted">{label}</p>
    </div>
  )
}

function recommendationFor(tier?: Patient['tier']) {
  if (tier === 'AUTO_ENROLL') return 'Enroll before discharge, schedule follow-up within 72 hours, and trigger medication reconciliation.'
  if (tier === 'REVIEW') return 'Queue for care-manager review with social support and follow-up access checks before final routing.'
  return 'Continue standard discharge protocol with routine follow-up and passive monitoring.'
}

function formatAge(age: string) { return age.replace(/[\[\]()]/g, '').replace('-', '–') + ' yrs' }

export function PatientDetail({ patient }: { patient: Patient | null }) {
  if (!patient) {
    return (
      <div className="flex min-h-[390px] items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50/50 p-8 text-center">
        <div>
          <HeartPulse className="mx-auto mb-4 h-10 w-10 text-brand-500" />
          <p className="text-lg font-bold text-ink">Select a patient from the list</p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">Details, drivers, and routing guidance will appear here.</p>
        </div>
      </div>
    )
  }

  const demographics = [
    ['Age', formatAge(patient.age)],
    ['Gender', patient.gender],
    ['Race', patient.race],
    ['Hospital Stay', `${patient.time_in_hospital} days`],
    ['Medications', patient.num_medications.toString()],
    ['Prior Admissions', patient.number_inpatient.toString()],
  ]

  return (
    <motion.div
      key={patient.patient_nbr}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid gap-5 lg:grid-cols-[1fr_0.9fr_1.1fr]"
    >
      <div className="card">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-600">Patient #{patient.patient_nbr}</p>
        <div className="grid grid-cols-1 gap-2">
          {demographics.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-ink-subtle">{label}</p>
              <p className="font-bold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Gauge label="Risk Score" value={patient.risk_score ?? 0} color="#E63946" />
        <Gauge label="Uplift Score" value={patient.uplift_score ?? 0} color="#2D6A4F" max={0.4} />
      </div>

      <div className="card">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Recommended Route</p>
            <div className="mt-2">{patient.tier ? <TierBadge tier={patient.tier} /> : null}</div>
          </div>
          <ClipboardList className="h-6 w-6 text-brand-500" aria-hidden="true" />
        </div>

        <p className="mb-4 text-sm font-semibold text-ink-muted">Top model drivers</p>
        <ol className="mb-5 space-y-2">
          {(patient.shap_reasons ?? []).map((reason, index) => (
            <li key={reason} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-ink">
              <span className="text-brand-600">{index + 1}</span>
              {reason}
            </li>
          ))}
        </ol>
        <p className="rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-ink-muted">{recommendationFor(patient.tier)}</p>
      </div>
    </motion.div>
  )
}
