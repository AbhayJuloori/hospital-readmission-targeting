export function Footer() {
  return (
    <footer className="bg-brand-900 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-lg font-extrabold">CareTarget Readmission Intelligence</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
            Built on the UCI Diabetes 130-US Hospitals dataset (101,766 encounters). Models are trained and live — scores reflect a real XGBoost risk model (AUC 0.69) and T-learner uplift model (AUUC 0.08).
            Clinical deployment requires local validation, fairness review, workflow governance, and clinician oversight.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-4 text-sm font-semibold text-white/80 md:justify-end">
          <a href="#methodology" className="hover:text-white">Methodology</a>
          <a href="#fairness" className="hover:text-white">Fairness Audit</a>
          <a href="#demo" className="hover:text-white">Live Demo</a>
        </div>
      </div>
    </footer>
  )
}
