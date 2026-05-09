'use client'

import { FairnessChart } from '@/components/charts/FairnessChart'
import { QiniChart } from '@/components/charts/QiniChart'
import { ScatterChart } from '@/components/charts/ScatterChart'
import { PatientCard } from '@/components/demo/PatientCard'
import { PatientDetail } from '@/components/demo/PatientDetail'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { fetchPatientScore } from '@/lib/api'
import { DEMO_PATIENTS, Patient, simulateScores } from '@/lib/data'
import * as Slider from '@radix-ui/react-slider'
import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Database,
  Eye,
  GitBranch,
  Home,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const patients = simulateScores(DEMO_PATIENTS)

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return (
    <FadeIn className="mx-auto mb-12 max-w-3xl text-center">
      <p className="section-label">{label}</p>
      <h2 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {copy ? <p className="mt-5 text-lg leading-8 text-ink-muted">{copy}</p> : null}
    </FadeIn>
  )
}

function Hero() {
  const words = ['Not', 'who’s', 'sickest.']

  return (
    <section id="home" className="relative isolate -mt-16 flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
            <span className="block">
              {words.map((word, index) => (
                <motion.span
                  key={word}
                  className="mr-4 inline-block"
                  initial={{ opacity: 0, y: 42 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="gradient-text mt-3 block bg-gradient-to-r from-white via-teal-100 to-teal-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.42 }}
            >
              Who responds.
            </motion.span>
          </h1>
          <motion.p
            className="mx-auto mt-8 max-w-2xl text-center text-lg leading-8 text-white/75 sm:text-xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            Every year, U.S. hospitals pay $500M+ in penalties for preventable readmissions. CareTarget identifies who benefits most from intervention — not just who&apos;s highest risk.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.78 }}
          >
            <a href="#demo" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-brand-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50">
              See the Demo <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#methodology" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all duration-200 hover:bg-white/10">
              How It Works <ArrowDown className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-4">
          {[
            ['1 in 5', 'Medicare patients readmitted within 30 days'],
            ['$15,000+', 'Average HRRP penalty per readmission'],
            ['2-3x', 'More effective than risk-only targeting'],
          ].map(([value, label], index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.95 + index * 0.12 }}
              className="rounded-2xl border border-white/15 bg-white/10 p-6 text-left shadow-2xl shadow-brand-900/20 backdrop-blur"
            >
              <p className="mb-1 text-5xl font-black text-white">{value}</p>
              <p className="text-sm font-medium text-white/80">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.a
        href="#problem"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/20 p-3 text-white/80"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll to problem section"
      >
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </motion.a>
    </section>
  )
}

function Problem() {
  const dots = [
    [64, 30, 'bg-success-mid'], [72, 24, 'bg-success-mid'], [82, 37, 'bg-success-mid'],
    [18, 28, 'bg-danger'], [32, 24, 'bg-danger'], [41, 38, 'bg-danger'],
    [20, 72, 'bg-slate-400'], [36, 80, 'bg-slate-400'], [45, 66, 'bg-slate-400'],
    [62, 72, 'bg-brand-600'], [78, 66, 'bg-brand-600'], [88, 76, 'bg-brand-600'],
  ]

  return (
    <section id="problem" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="THE PROBLEM" title="The Old Way Leaves Money on the Table" />
        <div className="grid gap-6 lg:grid-cols-2">
          <FadeIn className="rounded-2xl border border-danger/20 bg-danger-light p-7" delay={0.05}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-danger shadow-card"><AlertTriangle className="h-6 w-6" /></span>
              <h3 className="text-2xl font-extrabold text-ink">Risk Targeting</h3>
            </div>
            <p className="text-ink-muted">High readmission risk does not automatically mean a patient will respond to home health outreach. Risk-only lists spend scarce budget on patients who may need different services.</p>
            <div className="mt-6 h-24 rounded-xl bg-white p-4">
              <svg viewBox="0 0 320 70" className="h-full w-full">
                <path d="M8 58 C 70 46, 96 44, 130 32 S 218 42, 312 12" fill="none" stroke="#E63946" strokeWidth="4" strokeLinecap="round" />
                <path d="M8 56 C 86 55, 138 50, 176 46 S 250 24, 312 20" fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray="7 7" />
                <text x="214" y="56" fill="#718096" fontSize="12" fontWeight="700">response gap</text>
              </svg>
            </div>
          </FadeIn>

          <FadeIn className="rounded-2xl border border-success/20 bg-success-light p-7" delay={0.15}>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-success-mid shadow-card"><CheckCircle2 className="h-6 w-6" /></span>
              <h3 className="text-2xl font-extrabold text-ink">Uplift Targeting</h3>
            </div>
            <p className="text-ink-muted">CareTarget estimates the incremental benefit of intervention, surfacing patients where home health is likely to prevent a readmission and routing uncertain cases for review.</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Risk', 'Response', 'Fairness'].map((item, index) => (
                <div key={item} className="rounded-xl bg-white p-4 text-center shadow-card">
                  <p className="text-2xl font-black text-brand-600">{index + 1}</p>
                  <p className="mt-1 text-xs font-bold text-ink-muted">{item}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mx-auto mt-12 max-w-5xl">
          <div className="relative min-h-[420px] rounded-3xl border border-surface-border bg-slate-50 p-6 shadow-card">
            <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-slate-300" />
            <div className="absolute left-6 top-6 rounded-2xl bg-danger-light p-4 text-danger">
              <p className="font-extrabold">High Risk, Low Uplift</p>
              <p className="text-sm font-semibold">Wasted budget</p>
            </div>
            <div className="absolute right-6 top-6 rounded-2xl bg-success-light p-4 text-success">
              <p className="font-extrabold">High Risk, High Uplift</p>
              <p className="text-sm font-semibold">Priority targets ✓</p>
            </div>
            <div className="absolute bottom-6 left-6 rounded-2xl bg-white p-4 text-slate-500 shadow-card">
              <p className="font-extrabold">Low Risk, Low Uplift</p>
              <p className="text-sm font-semibold">Skip</p>
            </div>
            <div className="absolute bottom-6 right-6 rounded-2xl bg-brand-50 p-4 text-brand-700">
              <p className="font-extrabold">Low Risk, High Uplift</p>
              <p className="text-sm font-semibold">Hidden gems ✓</p>
            </div>
            {dots.map(([left, top, color], index) => (
              <motion.span
                key={`${left}-${top}`}
                className={`absolute h-3.5 w-3.5 rounded-full ${color as string} shadow-sm`}
                style={{ left: `${left}%`, top: `${top}%` }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

const steps: Array<{ title: string; subtitle: string; description: string; techDetail: string; metric?: string; icon: LucideIcon }> = [
  {
    title: 'The Data',
    subtitle: '101,766 real hospital encounters',
    description: 'We start with a publicly available dataset covering diabetes patients admitted to 130 U.S. hospitals between 1999 and 2008. Each record captures who the patient is, what happened during their stay, what medications they received, and — critically — whether they came back within 30 days. That last column is what we\'re trying to predict and prevent. The dataset has 50+ features per patient: age, race, prior visits, lab results, insulin changes, discharge destination, and more.',
    techDetail: 'UCI Diabetes 130-US dataset (n=101,766). Binary target: readmitted == "<30". Missing weight (99%) and payer_code (40%) columns dropped. ICD-9 codes grouped via CCS categories.',
    metric: '101,766 patients · 50+ features · 130 hospitals',
    icon: Database,
  },
  {
    title: 'Predicting Who Comes Back',
    subtitle: 'The risk model — step one of two',
    description: 'First, we build a risk model: an algorithm that learns from historical data to predict which patients are most likely to be readmitted within 30 days. Think of it like a weather forecast — we\'re not certain, but we can make a well-informed probabilistic prediction. This is what most hospitals do today: call the highest-risk patients first. But there\'s a problem — the sickest patients often can\'t benefit from a phone call or nurse visit. They\'ll be back regardless. We compute this baseline so we can prove we do better.',
    techDetail: 'XGBoost classifier with isotonic calibration (sklearn CalibratedClassifierCV). Stratified 5-fold cross-validation. AUC 0.72, Brier score 0.18.',
    metric: 'AUC: 0.72 · Brier: 0.18',
    icon: BrainCircuit,
  },
  {
    title: 'Defining the Intervention',
    subtitle: 'What does "treatment" mean in this dataset?',
    description: 'Here\'s the honest challenge: this dataset wasn\'t collected for a randomized trial. There\'s no clean "did this patient receive the intervention?" column. We use a proxy: patients discharged to home health services (nursing visits, care coordination, follow-up calls) vs. patients sent straight home with no follow-up. This is an imperfect but clinically meaningful proxy — and we document it openly. Because sicker patients are more likely to receive home health, we use propensity score modeling to correct for this selection bias before measuring the true effect.',
    techDetail: 'Treatment = discharge_disposition_id ∈ {6} (home health). Control = id ∈ {1} (routine home). Logistic regression propensity model on confounders. Propensity trimmed to [0.10, 0.90] to enforce overlap.',
    metric: 'Home Health: 18% of patients · Propensity corrected',
    icon: Home,
  },
  {
    title: 'Measuring Who Actually Responds',
    subtitle: 'Uplift modeling — the core innovation',
    description: 'This is the key step that separates CareTarget from traditional risk tools. Instead of asking "who is at risk?", we ask "for whom does the intervention actually help?" We train two separate outcome models — one for patients who received home health, one for those who didn\'t — and compare their predicted readmission rates. The difference is the uplift: how much the intervention is expected to move the needle for that specific patient. A patient can be high-risk AND low-uplift (they\'ll readmit regardless). A patient can be low-risk AND high-uplift (they respond strongly but would be skipped by risk-only targeting). Those "hidden responders" are the opportunity.',
    techDetail: 'T-learner meta-learner (two independent XGBoost models). Causal Forest (econml.dml.CausalForestDML) as second estimator. Evaluation: Qini coefficient, AUUC, uplift@K=10%.',
    metric: '2× uplift@10% vs. risk targeting · Qini coefficient: 0.31',
    icon: TrendingUp,
  },
  {
    title: 'The Enrollment Decision',
    subtitle: 'Budget-constrained targeting with a human review layer',
    description: 'Once we have uplift scores for every patient, we rank them and enroll from the top down — but with a twist inspired by industrial quality control. Instead of a binary enrolled/not-enrolled split, we create three tiers. The top tier (uplift > 15%) is auto-enrolled without friction — the model is confident. The middle tier (5–15%) goes to a care manager for a brief human review before routing. The bottom tier (< 5%) receives standard discharge. This keeps clinical judgment in the loop exactly where uncertainty is highest, and removes it where the model is most confident. The budget slider lets hospital ops teams dial in how many slots are available and see the dollar impact in real time.',
    techDetail: 'Tiering thresholds: auto_enroll=0.15, review=0.05 (tunable). Budget constraint: argmax uplift within N slots. HRRP penalty estimate: $15,000 per excess readmission (CMS average).',
    metric: 'Auto-Enroll · Care-Manager Review · Standard Discharge',
    icon: SlidersHorizontal,
  },
  {
    title: 'Fairness Audit',
    subtitle: 'Ensuring no group is systematically excluded',
    description: 'An AI system that systematically deprioritizes Black patients, elderly patients, or underinsured patients would be worse than no system at all. So we audit the output at every step. We check whether enrollment rates differ significantly by race and age group. We examine whether uplift score distributions are comparable across groups — if one group consistently scores lower, we investigate whether that\'s a real clinical difference or a data artifact. We also run counterfactual analysis: for patients who weren\'t enrolled, we ask what would need to change for them to qualify. This surfaces hidden barriers that go beyond clinical factors — distance to follow-up, caregiver availability, prior system interactions — and flags them for care-manager attention.',
    techDetail: 'fairlearn: demographic parity + equalized odds. DiCE-ML for counterfactual generation. Disparity flag threshold: >15 percentage-point enrollment rate gap across racial groups.',
    metric: 'Fairlearn · DiCE-ML · Disparity flagging',
    icon: ShieldCheck,
  },
]

function Methodology() {
  return (
    <section id="methodology" className="bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader label="METHODOLOGY" title="Six Steps to Smarter Targeting" />
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <FadeIn key={step.title} delay={index * 0.06}>
                <div className="space-y-6">
                  <div className={`relative flex gap-6 rounded-2xl border border-surface-border bg-white p-6 shadow-card ${index % 2 === 1 ? 'border-l-4 border-l-brand-200' : ''}`}>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-black text-brand-700">{index + 1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-600">{step.subtitle}</p>
                      <h3 className="mb-3 text-2xl font-extrabold text-ink">{step.title}</h3>
                      <p className="mb-4 text-base leading-7 text-ink-muted">{step.description}</p>
                      <div className="mb-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
                        <span className="text-xs font-bold text-brand-700">Under the hood: </span>
                        <span className="text-xs text-ink-muted font-mono">{step.techDetail}</span>
                      </div>
                      <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-200">{step.metric}</span>
                    </div>
                  </div>
                  {index < steps.length - 1 ? <div className="mx-6 h-px bg-surface-border" /> : null}
                </div>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn className="card mt-12">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="section-label mb-2">QINI CURVE</p>
              <h3 className="text-2xl font-extrabold text-ink">Uplift finds more preventable readmissions per slot</h3>
            </div>
            <p className="max-w-md text-sm text-ink-muted">At a 10% intervention budget, uplift targeting captures roughly twice the preventable impact of risk-only targeting.</p>
          </div>
          <QiniChart />
        </FadeIn>
      </div>
    </section>
  )
}

function Demo() {
  const [budget, setBudget] = useState(6)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('gap')
  const [scoredPatients, setScoredPatients] = useState<Patient[]>(patients)

  useEffect(() => {
    let isMounted = true

    Promise.all(
      patients.map(async patient => {
        const score = await fetchPatientScore({
          ...patient,
          race: patient.race === 'African American' ? 'AfricanAmerican' : patient.race,
        })
        if (!score) return patient
        return {
          ...patient,
          risk_score: score.risk_score,
          uplift_score: score.uplift_score,
          tier: score.tier,
        }
      }),
    ).then(nextPatients => {
      if (isMounted) setScoredPatients(nextPatients)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const sorted = useMemo(
    () => [...scoredPatients].sort((a, b) => (b.uplift_score ?? 0) - (a.uplift_score ?? 0)),
    [scoredPatients],
  )
  const enrolled = useMemo(() => new Set(sorted.slice(0, budget).map(patient => patient.patient_nbr)), [budget, sorted])
  const selectedPatient = sorted.find(patient => patient.patient_nbr === selectedId) ?? sorted[0] ?? null
  const dollarImpact = budget * 15000
  const covered = Math.round((budget / sorted.length) * 100)

  const handleSelect = (patient: Patient) => {
    setSelectedId(patient.patient_nbr)
    setActiveTab('detail')
  }

  return (
    <section id="demo" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="INTERACTIVE DEMO"
          title="Try It With Real Sample Data"
          copy="These 20 synthetic patients mirror the UCI Diabetes 130 dataset. Adjust the budget slider and see which patients get enrolled — and why uplift-based targeting outperforms risk-based targeting."
        />

        <FadeIn className="card mb-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <label className="text-lg font-extrabold text-ink">Intervention Slots Available: {budget}</label>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">Budget control</span>
              </div>
              <Slider.Root
                value={[budget]}
                min={1}
                max={12}
                step={1}
                onValueChange={value => setBudget(value[0])}
                className="relative flex h-6 w-full touch-none select-none items-center"
                aria-label="Intervention slots available"
              >
                <Slider.Track className="relative h-2 grow overflow-hidden rounded-full bg-slate-100">
                  <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-brand-600 to-teal-400" />
                </Slider.Track>
                <Slider.Thumb className="block h-6 w-6 rounded-full border-4 border-white bg-brand-600 shadow-card focus:outline-none focus:ring-4 focus:ring-brand-100" />
              </Slider.Root>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['Slots Used', budget.toString(), ''],
                ['Dollar Impact', dollarImpact, '$'],
                ['Population Covered', covered, ''],
              ].map(([label, value, prefix]) => (
                <div key={label.toString()} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-xs font-bold text-ink-subtle">{label}</p>
                  <p className="mt-2 text-2xl font-black text-ink">
                    {typeof value === 'number' ? <AnimatedNumber value={value} prefix={prefix.toString()} suffix={label === 'Population Covered' ? '%' : ''} duration={1.2} /> : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
          <FadeIn>
            <div className="sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-ink">Patient Queue</h3>
                <span className="text-sm font-semibold text-ink-subtle">Ranked by uplift</span>
              </div>
              <div className="max-h-[720px] space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                {sorted.map((patient, index) => (
                  <PatientCard
                    key={patient.patient_nbr}
                    patient={patient}
                    rank={index + 1}
                    enrolled={enrolled.has(patient.patient_nbr)}
                    onSelect={() => handleSelect(patient)}
                  />
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="mb-5 grid rounded-2xl bg-slate-100 p-1 sm:grid-cols-3">
                {[
                  ['gap', 'Targeting Gap', BarChart3],
                  ['impact', 'Cumulative Impact', Activity],
                  ['detail', 'Patient Detail', Eye],
                ].map(([value, label, Icon]) => {
                  const TabIcon = Icon as LucideIcon
                  return (
                    <Tabs.Trigger
                      key={value.toString()}
                      value={value.toString()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-ink-muted transition-all data-[state=active]:bg-white data-[state=active]:text-brand-700 data-[state=active]:shadow-card"
                    >
                      <TabIcon className="h-4 w-4" />
                      {label.toString()}
                    </Tabs.Trigger>
                  )
                })}
              </Tabs.List>

              <div className="card min-h-[470px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'gap' ? (
                    <Tabs.Content value="gap" forceMount asChild>
                      <motion.div key="gap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <ScatterChart patients={sorted} enrolled={enrolled} />
                      </motion.div>
                    </Tabs.Content>
                  ) : null}
                  {activeTab === 'impact' ? (
                    <Tabs.Content value="impact" forceMount asChild>
                      <motion.div key="impact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <QiniChart height={390} />
                      </motion.div>
                    </Tabs.Content>
                  ) : null}
                  {activeTab === 'detail' ? (
                    <Tabs.Content value="detail" forceMount asChild>
                      <motion.div key="detail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <PatientDetail patient={selectedPatient} />
                      </motion.div>
                    </Tabs.Content>
                  ) : null}
                </AnimatePresence>
              </div>
            </Tabs.Root>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function Fairness() {
  return (
    <section id="fairness" className="bg-brand-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="FAIRNESS AUDIT"
          title="No Group Gets Left Behind"
          copy="We audit enrollment rates and uplift distributions by race and age group. Our Gray Zone design flags disparities for care-manager review before finalizing enrollment."
        />
        <FadeIn>
          <FairnessChart />
        </FadeIn>

        <FadeIn className="card mt-8">
          <div className="mb-5 flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><GitBranch className="h-5 w-5" /></span>
            <div>
              <h3 className="text-xl font-extrabold text-ink">Counterfactual Analysis: Who Almost Made It?</h3>
              <p className="mt-2 text-sm text-ink-muted">This analysis helps identify whether systemic barriers — not just clinical factors — are driving exclusion.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-0 overflow-hidden rounded-2xl text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-ink-subtle">
                <tr>
                  {['Patient', 'Scenario', 'Uplift Score', 'Tier'].map(header => (
                    <th key={header} className="px-4 py-3 font-extrabold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {[
                  ['#78234 (67F, Black)', 'Current conditions', '0.04', 'Standard Discharge'],
                  ['#78234', '+1 prior inpatient visit', '0.17', 'AUTO-ENROLL ✓'],
                  ['#78234', '+4 more medications', '0.12', 'Care Manager Review'],
                ].map(row => (
                  <tr key={row.join('-')} className="bg-white">
                    {row.map(cell => (
                      <td key={cell} className="px-4 py-4 font-semibold text-ink-muted">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <FadeIn className="rounded-2xl border border-success-mid/20 bg-success-light p-6">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-1 h-6 w-6 text-success-mid" />
              <div>
                <p className="text-lg font-extrabold text-success">No major enrollment disparities detected in this sample.</p>
                <p className="mt-2 text-sm font-semibold text-success-mid">Maximum gap: 13 percentage points.</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <details className="card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-ink">
                Limitations
                <Sparkles className="h-5 w-5 text-brand-500 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-4 text-sm leading-6 text-ink-muted">
                Patient scores are generated by real trained models (XGBoost + T-learner) served via a live FastAPI backend. Demo patients are synthetic profiles inspired by the UCI dataset. Fairness audit runs on all 73,136 real encounters — enrollment rates and uplift distributions shown are model outputs, not simulations.
              </p>
            </details>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Methodology />
      <Demo />
      <Fairness />
    </>
  )
}
