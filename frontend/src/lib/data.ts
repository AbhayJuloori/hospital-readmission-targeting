export interface Patient {
  patient_nbr: number
  race: string
  gender: string
  age: string
  time_in_hospital: number
  num_medications: number
  number_inpatient: number
  number_diagnoses: number
  diabetesMed: string
  discharge_disposition_id: number
  readmitted: string
  risk_score?: number
  uplift_score?: number
  tier?: 'AUTO_ENROLL' | 'REVIEW' | 'STANDARD'
  enrolled?: boolean
  shap_reasons?: string[]
}

export const DEMO_PATIENTS: Patient[] = [
  { patient_nbr: 100001, race: 'Caucasian', gender: 'Female', age: '[70-80)', time_in_hospital: 5, num_medications: 22, number_inpatient: 2, number_diagnoses: 9, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: '<30' },
  { patient_nbr: 100002, race: 'African American', gender: 'Male', age: '[60-70)', time_in_hospital: 3, num_medications: 14, number_inpatient: 0, number_diagnoses: 7, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100003, race: 'Hispanic', gender: 'Female', age: '[50-60)', time_in_hospital: 2, num_medications: 11, number_inpatient: 0, number_diagnoses: 6, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100004, race: 'Caucasian', gender: 'Male', age: '[80-90)', time_in_hospital: 7, num_medications: 28, number_inpatient: 3, number_diagnoses: 9, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: '<30' },
  { patient_nbr: 100005, race: 'Asian', gender: 'Female', age: '[40-50)', time_in_hospital: 2, num_medications: 9, number_inpatient: 0, number_diagnoses: 5, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100006, race: 'Caucasian', gender: 'Female', age: '[70-80)', time_in_hospital: 4, num_medications: 19, number_inpatient: 1, number_diagnoses: 8, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: '>30' },
  { patient_nbr: 100007, race: 'African American', gender: 'Female', age: '[60-70)', time_in_hospital: 6, num_medications: 24, number_inpatient: 2, number_diagnoses: 9, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: '<30' },
  { patient_nbr: 100008, race: 'Other', gender: 'Male', age: '[50-60)', time_in_hospital: 3, num_medications: 13, number_inpatient: 0, number_diagnoses: 6, diabetesMed: 'No', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100009, race: 'Caucasian', gender: 'Male', age: '[70-80)', time_in_hospital: 5, num_medications: 21, number_inpatient: 1, number_diagnoses: 8, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: '>30' },
  { patient_nbr: 100010, race: 'Hispanic', gender: 'Male', age: '[60-70)', time_in_hospital: 4, num_medications: 17, number_inpatient: 1, number_diagnoses: 7, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: 'NO' },
  { patient_nbr: 100011, race: 'Caucasian', gender: 'Female', age: '[80-90)', time_in_hospital: 8, num_medications: 31, number_inpatient: 2, number_diagnoses: 9, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: '<30' },
  { patient_nbr: 100012, race: 'African American', gender: 'Male', age: '[50-60)', time_in_hospital: 2, num_medications: 10, number_inpatient: 0, number_diagnoses: 6, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100013, race: 'Caucasian', gender: 'Female', age: '[60-70)', time_in_hospital: 5, num_medications: 23, number_inpatient: 1, number_diagnoses: 8, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: 'NO' },
  { patient_nbr: 100014, race: 'Asian', gender: 'Male', age: '[70-80)', time_in_hospital: 3, num_medications: 16, number_inpatient: 0, number_diagnoses: 7, diabetesMed: 'No', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100015, race: 'Hispanic', gender: 'Female', age: '[30-40)', time_in_hospital: 2, num_medications: 8, number_inpatient: 0, number_diagnoses: 5, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100016, race: 'Caucasian', gender: 'Male', age: '[60-70)', time_in_hospital: 6, num_medications: 26, number_inpatient: 2, number_diagnoses: 9, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: '>30' },
  { patient_nbr: 100017, race: 'African American', gender: 'Female', age: '[70-80)', time_in_hospital: 4, num_medications: 18, number_inpatient: 1, number_diagnoses: 8, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100018, race: 'Other', gender: 'Female', age: '[50-60)', time_in_hospital: 3, num_medications: 12, number_inpatient: 0, number_diagnoses: 6, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
  { patient_nbr: 100019, race: 'Caucasian', gender: 'Male', age: '[80-90)', time_in_hospital: 9, num_medications: 34, number_inpatient: 4, number_diagnoses: 9, diabetesMed: 'Yes', discharge_disposition_id: 6, readmitted: '>30' },
  { patient_nbr: 100020, race: 'Hispanic', gender: 'Female', age: '[60-70)', time_in_hospital: 4, num_medications: 15, number_inpatient: 1, number_diagnoses: 7, diabetesMed: 'Yes', discharge_disposition_id: 1, readmitted: 'NO' },
]

// Deterministic seeded random
function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

export function simulateScores(patients: Patient[]): Patient[] {
  const SHAP_REASONS = [
    'Prior hospitalizations', 'Medication complexity', 'Length of stay',
    'Diabetes management', 'Discharge readiness', 'Follow-up adherence history',
  ]
  return patients.map(p => {
    const rng = seededRandom(p.patient_nbr % 10000)
    const noise = () => rng() * 0.10 - 0.05
    const risk = Math.min(0.95, Math.max(0.05,
      p.number_inpatient * 0.12 + p.time_in_hospital * 0.025 + p.num_medications * 0.006 +
      (p.diabetesMed === 'Yes' ? 0.05 : 0) + noise()
    ))
    const uplift = Math.min(0.40, Math.max(-0.05, 0.22 - risk * 0.35 + rng() * 0.20))
    const sortedReasons = [...SHAP_REASONS].sort(() => rng() - 0.5).slice(0, 3)
    const tier: Patient['tier'] = uplift > 0.15 ? 'AUTO_ENROLL' : uplift > 0.05 ? 'REVIEW' : 'STANDARD'
    return { ...p, risk_score: Math.round(risk * 100) / 100, uplift_score: Math.round(uplift * 100) / 100, tier, shap_reasons: sortedReasons }
  })
}

export const QINI_DATA = {
  fractions: [0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.50, 1.0],
  uplift:    [0, 0.18, 0.32, 0.42, 0.50, 0.62, 0.78, 1.0],
  risk:      [0, 0.08, 0.16, 0.24, 0.31, 0.44, 0.66, 1.0],
  random:    [0, 0.05, 0.10, 0.15, 0.20, 0.30, 0.50, 1.0],
}

export const FAIRNESS_DATA = {
  races: ['Caucasian', 'African American', 'Hispanic', 'Asian', 'Other'],
  enrollmentRates: [0.38, 0.29, 0.33, 0.25, 0.31],
  medianUplift: [0.12, 0.09, 0.11, 0.07, 0.10],
}
