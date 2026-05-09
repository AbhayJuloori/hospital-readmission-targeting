import type { Patient } from '@/lib/data'

export type PredictionResponse = {
  risk_score: number
  uplift_score: number
  tier: 'AUTO_ENROLL' | 'REVIEW' | 'STANDARD'
  shap_reasons: unknown[]
}

export type QiniApiResponse = {
  fractions: number[]
  qini: number[]
  risk_targeting: number[]
  random: number[]
  auuc: number
}

export type FairnessApiResponse = {
  races: string[]
  enrollment_rates: number[]
  median_uplifts: number[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, init)
    if (!response.ok) return null
    return await response.json() as T
  } catch {
    return null
  }
}

export async function fetchPatientScore(patient: Partial<Patient>): Promise<PredictionResponse | null> {
  return fetchJson<PredictionResponse>('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  })
}

export async function fetchQiniData(): Promise<QiniApiResponse | null> {
  return fetchJson<QiniApiResponse>('/qini')
}

export async function fetchFairnessData(): Promise<FairnessApiResponse | null> {
  return fetchJson<FairnessApiResponse>('/fairness')
}
