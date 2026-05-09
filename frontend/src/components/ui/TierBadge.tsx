'use client'

import { CheckCircle2, Eye, MinusCircle } from 'lucide-react'

type Tier = 'AUTO_ENROLL' | 'REVIEW' | 'STANDARD'

const tierMap: Record<Tier, { className: string; label: string; icon: typeof CheckCircle2 }> = {
  AUTO_ENROLL: { className: 'badge-auto', label: 'Auto-Enroll', icon: CheckCircle2 },
  REVIEW: { className: 'badge-review', label: 'Care Manager Review', icon: Eye },
  STANDARD: { className: 'badge-standard', label: 'Standard Discharge', icon: MinusCircle },
}

export function TierBadge({ tier }: { tier: Tier }) {
  const config = tierMap[tier]
  const Icon = config.icon

  return (
    <span className={config.className}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  )
}
