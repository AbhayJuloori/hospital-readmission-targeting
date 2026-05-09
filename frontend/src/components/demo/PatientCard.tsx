'use client'

import { Patient } from '@/lib/data'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { TierBadge } from '@/components/ui/TierBadge'
import { CheckCircle2, MinusCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface PatientCardProps {
  patient: Patient
  rank: number
  enrolled: boolean
  onSelect: () => void
}

function formatAge(age: string) { return age.replace(/[\[\]()]/g, '').replace('-', '–') + ' yrs' }

export function PatientCard({ patient, rank, enrolled, onSelect }: PatientCardProps) {
  const risk = patient.risk_score ?? 0
  const uplift = patient.uplift_score ?? 0

  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className="card-hover w-full text-left focus:outline-none focus:ring-4 focus:ring-brand-100"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-700">
            {rank}
          </span>
          <div>
            <p className="font-bold text-ink">Patient #{patient.patient_nbr}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[formatAge(patient.age), patient.gender, patient.race].map(item => (
                <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        {enrolled ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success-mid" aria-label="Enrolled" />
        ) : (
          <MinusCircle className="h-5 w-5 shrink-0 text-slate-300" aria-label="Not enrolled" />
        )}
      </div>

      <div className="space-y-4">
        <ScoreBar value={risk} type="risk" label="Readmission risk" />
        <ScoreBar value={Math.max(0, uplift / 0.4)} type="uplift" label="Intervention uplift" />
        <div className="flex items-center justify-between gap-3 pt-1">
          {patient.tier ? <TierBadge tier={patient.tier} /> : null}
          <span className="text-xs font-semibold text-ink-subtle">{enrolled ? 'Slot assigned' : 'Not selected'}</span>
        </div>
      </div>
    </motion.button>
  )
}
