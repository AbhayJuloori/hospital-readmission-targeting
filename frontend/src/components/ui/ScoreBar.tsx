'use client'

import { motion } from 'framer-motion'

interface ScoreBarProps {
  value: number
  type: 'risk' | 'uplift'
  label: string
  showValue?: boolean
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function barColor(value: number, type: 'risk' | 'uplift') {
  if (type === 'uplift') {
    if (value >= 0.45) return '#1B4332'
    if (value >= 0.28) return '#00B4D8'
    return '#80ccf0'
  }
  if (value >= 0.65) return '#E63946'
  if (value >= 0.35) return '#F4A261'
  return '#2D6A4F'
}

export function ScoreBar({ value, type, label, showValue = true }: ScoreBarProps) {
  const bounded = clamp(value)
  const percentage = Math.round(bounded * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink-muted">
        <span>{label}</span>
        {showValue ? <span className="tabular-nums text-ink">{percentage}%</span> : null}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ backgroundColor: barColor(bounded, type) }}
        />
      </div>
    </div>
  )
}
