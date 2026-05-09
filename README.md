# CareTarget — Hospital Readmission Intervention Targeting

**Live demo:** [caretarget-kwaqy47o0-abhayjulooris-projects.vercel.app](https://caretarget-kwaqy47o0-abhayjulooris-projects.vercel.app)

> Most readmission programs ask *"who's sickest?"* — then send nurses to patients who would have been fine anyway. CareTarget asks *"who actually benefits from intervention?"* That's a different question, and it requires a different model.

---

## The Problem

U.S. hospitals pay **$500M+ annually** in HRRP penalties for preventable readmissions. Naive solutions target highest-risk patients — but high-risk patients are often already complex cases where intervention has little marginal impact. A patient readmitting regardless of what you do is wasted capacity.

Uplift modeling reframes the question: among all patients, who will *respond* to a home-health intervention and not readmit as a result?

---

## What This Project Does

| Layer | What it solves |
|-------|---------------|
| **Risk model** | XGBoost baseline — who is likely to readmit? |
| **Uplift model** | T-learner causal model — who *benefits* from intervention? |
| **Decision layer** | Gray Zone tiering (AUTO-ENROLL / REVIEW / STANDARD) under a fixed budget |
| **Survival analysis** | Cox PH model — when is readmission most likely? |
| **Fairness audit** | Enrollment rates and uplift distributions by race, flagging disparities |
| **Dashboard** | Interactive Next.js app backed by a live FastAPI model server |

---

## Model Performance

| Metric | Value |
|--------|-------|
| Risk AUC | 0.689 |
| Risk Brier score | 0.084 (well-calibrated) |
| Precision@10% | 0.276 |
| AUUC (uplift) | 0.081 |
| Cox PH c-index | 0.662 |

Training data: **73,136 encounters** from the UCI Diabetes 130-US Hospitals dataset (1999–2008), filtered to routine and home-health discharges.

---

## Methodology

### 1. Risk Model
XGBoost with 584 features — numeric vitals, one-hot diagnosis codes (ICD-9 chapters + 3-digit prefixes), medication changes, payer/specialty, and **patient history features** (prior 30-day readmissions, cumulative inpatient history, encounter gaps). Trained with logloss objective; no `scale_pos_weight` to preserve calibration.

### 2. Uplift Model (T-Learner)
Treatment = home-health discharge (disposition code 6). Propensity trimming [0.05, 0.95] using XGBoost propensity model on pre-treatment covariates (discharge column excluded to avoid perfect separation). Separate XGBoost models for treated and control groups. Uplift = P(readmit | treated) − P(readmit | control).

### 3. Decision Layer
Three tiers:
- **AUTO-ENROLL**: uplift > 15% — schedule home visit before discharge
- **REVIEW**: uplift 5–15% — care-manager screens for social barriers
- **STANDARD**: uplift < 5% — standard protocol

Budget optimization: rank by uplift descending, fill budget greedily.

### 4. Fairness Audit
Enrollment rates and median uplift computed for all 73,136 encounters by race. Hispanic patients show the highest mean uplift (+0.9%) — the model does not systematically deprioritize minority groups. Maximum enrollment rate gap across groups: ~7 percentage points (below the 15-point flag threshold).

---

## Stack

```
Backend          FastAPI + XGBoost + lifelines + scikit-learn
Frontend         Next.js 14 (App Router) + Tailwind CSS + Framer Motion + Recharts
Data             UCI Diabetes 130-US Hospitals (Clore et al., 2014)
Deploy           Vercel (frontend) + Render (API)
```

---

## Running Locally

**Backend**
```bash
pip install -r requirements.txt
uvicorn api.main:app --port 8000 --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend auto-connects to the API at `http://localhost:8000`.

---

## Project Structure

```
src/
  preprocessing.py    # Feature engineering (584 features, patient history)
  risk_model.py       # XGBoost risk model training + evaluation
  uplift_model.py     # T-learner uplift model + Qini curve
  survival_model.py   # Cox PH time-to-readmission model
  decision_layer.py   # Tier assignment + budget optimization
  fairness.py         # Enrollment parity + uplift audit by race
api/
  main.py             # FastAPI endpoints: /predict, /qini, /fairness, /budget
frontend/
  src/app/page.tsx    # Single-page dashboard
data/
  raw/diabetic_data.csv  # UCI Diabetes 130-US (not committed — download below)
```

**Download the dataset:**
```bash
mkdir -p data/raw
curl -L "https://archive.ics.uci.edu/ml/machine-learning-databases/00296/dataset_diabetes.zip" -o /tmp/diabetes.zip
unzip /tmp/diabetes.zip -d data/raw/
```

---

## Limitations

- Dataset covers 1999–2008; clinical patterns and treatment protocols have shifted
- Treatment assignment (home-health discharge) is observational — propensity trimming reduces but does not eliminate confounding
- No clinical notes, lab values, or social determinants — AUC ceiling ~0.70 for tabular features alone
- Demo patients are synthetic profiles; do not use for clinical decisions

---

## Dataset

Clore, J., Cios, K., DeShazo, J., & Strack, B. (2014). *Diabetes 130-US Hospitals for Years 1999-2008* [Dataset]. UCI Machine Learning Repository. [https://doi.org/10.24432/C5230J](https://doi.org/10.24432/C5230J)
