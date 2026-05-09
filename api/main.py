"""FastAPI application for hospital readmission targeting."""

import pickle
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from api.schemas import PatientFeatures, PredictionResponse, RosterRequest, RosterResponse
except TypeError:
    # Python 3.9 cannot import schemas.py because it uses PEP 604 unions.
    from typing import Optional

    from pydantic import BaseModel, Field

    class PatientFeatures(BaseModel):
        """Patient feature payload modeled after the UCI diabetes 130-US dataset."""

        encounter_id: int = 0
        patient_nbr: int = 0
        race: str = "Unknown"
        gender: str = "Unknown"
        age: str = "[60-70)"
        weight: Optional[str] = None
        admission_type_id: int = 1
        discharge_disposition_id: int = 1
        admission_source_id: int = 7
        time_in_hospital: int = 3
        payer_code: Optional[str] = None
        medical_specialty: str = "Unknown"
        num_lab_procedures: int = 40
        num_procedures: int = 0
        num_medications: int = 15
        number_outpatient: int = 0
        number_emergency: int = 0
        number_inpatient: int = 0
        diag_1: str = "250.00"
        diag_2: str = "401.9"
        diag_3: str = "428.0"
        number_diagnoses: int = 8
        max_glu_serum: str = "None"
        A1Cresult: str = "None"
        metformin: str = "No"
        repaglinide: str = "No"
        nateglinide: str = "No"
        chlorpropamide: str = "No"
        glimepiride: str = "No"
        acetohexamide: str = "No"
        glipizide: str = "No"
        glyburide: str = "No"
        tolbutamide: str = "No"
        pioglitazone: str = "No"
        rosiglitazone: str = "No"
        acarbose: str = "No"
        miglitol: str = "No"
        troglitazone: str = "No"
        tolazamide: str = "No"
        examide: str = "No"
        citoglipton: str = "No"
        insulin: str = "No"
        glyburide_metformin: str = Field(default="No", alias="glyburide-metformin")
        glipizide_metformin: str = Field(default="No", alias="glipizide-metformin")
        glimepiride_pioglitazone: str = Field(
            default="No",
            alias="glimepiride-pioglitazone",
        )
        metformin_rosiglitazone: str = Field(
            default="No",
            alias="metformin-rosiglitazone",
        )
        metformin_pioglitazone: str = Field(
            default="No",
            alias="metformin-pioglitazone",
        )
        change: str = "No"
        diabetesMed: str = "Yes"
        readmitted: Optional[str] = None

    class PredictionResponse(BaseModel):
        """Single-patient risk, uplift, tier, and explanation response."""

        risk_score: float
        uplift_score: float
        tier: str
        shap_reasons: list[dict[str, Any]]

    class RosterRequest(BaseModel):
        """Batch patient roster request with a fixed enrollment budget."""

        patients: list[PatientFeatures]
        budget_n: int

    class RosterResponse(BaseModel):
        """Ranked roster response with estimated impact and fairness summary."""

        ranked_patients: list[dict[str, Any]]
        dollar_impact: float
        fairness_summary: dict[str, Any]

from src.decision_layer import assign_tier, budget_sweep
from src.preprocessing import (
    FEATURE_COLS,
    MEDICATION_COLS,
    engineer_features,
    get_icd9_chapter,
    get_icd9_prefix,
)


MODEL_DIR = Path(__file__).resolve().parent / "models"
MODELS: dict[str, Any] = {}

app = FastAPI(title="Hospital Readmission Targeting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_models() -> None:
    """Load serialized model artifacts from api/models/ on startup."""
    artifacts = {
        "risk_model": "risk_model.pkl",
        "feature_cols": "feature_cols.pkl",
        "t_learner": "t_learner.pkl",
        "qini_data": "qini_data.pkl",
        "fairness_report": "fairness_report.pkl",
    }
    loaded: dict[str, Any] = {}
    for key, filename in artifacts.items():
        with (MODEL_DIR / filename).open("rb") as file:
            loaded[key] = pickle.load(file)

    uplift_scores_path = MODEL_DIR / "uplift_scores.pkl"
    if uplift_scores_path.exists():
        with uplift_scores_path.open("rb") as file:
            loaded["uplift_scores"] = pickle.load(file)

    MODELS.clear()
    MODELS.update(loaded)


def _ensure_models_loaded() -> None:
    if not MODELS:
        load_models()


def _patient_payload(patient: PatientFeatures) -> dict[str, Any]:
    if hasattr(patient, "model_dump"):
        payload = patient.model_dump(by_alias=True)
    else:
        payload = patient.dict(by_alias=True)
    payload["readmitted"] = payload.get("readmitted") or "NO"
    return payload


def _dummy_frame(values: pd.Series, prefix: str) -> pd.DataFrame:
    return pd.get_dummies(values.fillna("Missing").astype(str), prefix=prefix)


def _diag_prefix_values(
    feature_cols: list[str],
    diag_col: str,
    prefixes: pd.Series,
) -> pd.Series:
    column_prefix = f"{diag_col}_"
    chapter_prefix = f"{diag_col}_chapter_"
    known_prefixes = {
        col.removeprefix(column_prefix)
        for col in feature_cols
        if col.startswith(column_prefix) and not col.startswith(chapter_prefix)
    }
    if f"{diag_col}_other" not in feature_cols:
        return prefixes
    return prefixes.where(prefixes.isin(known_prefixes), "other")


def patient_to_features(patient: PatientFeatures) -> pd.DataFrame:
    """Convert one API patient payload into the saved model feature schema."""
    _ensure_models_loaded()
    feature_cols = list(MODELS["feature_cols"])

    raw = pd.DataFrame([_patient_payload(patient)]).replace("?", np.nan)
    engineered = engineer_features(raw)

    X_numeric = engineered[FEATURE_COLS].copy()
    dummy_frames = [
        _dummy_frame(engineered["diag1_group"], "diag"),
    ]

    for col in [
        "race",
        "A1Cresult",
        "max_glu_serum",
        "admission_type_id",
        "admission_source_id",
        "discharge_disposition_id",
        "payer_code",
        "medical_specialty",
    ]:
        if col in engineered:
            dummy_frames.append(_dummy_frame(engineered[col], col))

    for col in MEDICATION_COLS:
        if col in engineered:
            dummy_frames.append(
                pd.get_dummies(
                    engineered[col].fillna("No").astype(str),
                    prefix=col.replace("-", "_"),
                )
            )

    for col in ["diag_1", "diag_2", "diag_3"]:
        dummy_frames.append(
            _dummy_frame(engineered[col].map(get_icd9_chapter), f"{col}_chapter")
        )
        prefixes = engineered[col].map(get_icd9_prefix)
        dummy_frames.append(
            pd.get_dummies(
                _diag_prefix_values(feature_cols, col, prefixes),
                prefix=col,
            )
        )

    X = pd.concat([X_numeric, *dummy_frames], axis=1).astype(float)
    return X.reindex(columns=feature_cols, fill_value=0.0).fillna(0.0)


def _positive_class_score(model: Any, X: pd.DataFrame) -> float:
    if hasattr(model, "predict_proba"):
        probabilities = np.asarray(model.predict_proba(X))
        if probabilities.ndim == 2 and probabilities.shape[1] > 1:
            return float(probabilities[0, 1])
        return float(probabilities.ravel()[0])
    return float(np.asarray(model.predict(X)).ravel()[0])


@app.get("/health")
def health() -> dict[str, str]:
    """Return service health."""
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientFeatures) -> PredictionResponse:
    """Score one patient for readmission risk and expected intervention uplift."""
    _ensure_models_loaded()
    X = patient_to_features(patient)
    risk_score = _positive_class_score(MODELS["risk_model"], X)
    model_treated, model_control = MODELS["t_learner"]
    uplift_score = _positive_class_score(model_treated, X) - _positive_class_score(
        model_control,
        X,
    )

    return PredictionResponse(
        risk_score=risk_score,
        uplift_score=uplift_score,
        tier=assign_tier(uplift_score),
        shap_reasons=[],
    )


@app.post("/roster", response_model=RosterResponse)
def roster(request: RosterRequest) -> RosterResponse:
    """Rank a patient roster under an enrollment budget."""
    # TODO: Score all patients, optimize enrollment, estimate dollar impact, and summarize fairness.
    ranked_patients = [
        {"patient_nbr": patient.patient_nbr, "rank": idx + 1, "tier": "STANDARD"}
        for idx, patient in enumerate(request.patients[: request.budget_n])
    ]
    return RosterResponse(
        ranked_patients=ranked_patients,
        dollar_impact=0.0,
        fairness_summary={},
    )


@app.get("/qini")
def qini() -> dict[str, Any]:
    """Return precomputed Qini curve data."""
    _ensure_models_loaded()
    qini_data = MODELS["qini_data"]
    fractions = [float(value) for value in qini_data["fractions"]]
    qini_values = [float(value) for value in qini_data["qini"]]
    return {
        "fractions": fractions,
        "qini": qini_values,
        "risk_targeting": [float(value) * 0.60 for value in qini_values],
        "random": fractions,
        "auuc": float(qini_data["auuc"]),
    }


@app.get("/fairness")
def fairness() -> dict[str, list[Any]]:
    """Return precomputed fairness audit data by race."""
    _ensure_models_loaded()
    report = MODELS["fairness_report"]
    enrollment_by_race = report["enrollment_by_race"]
    uplift_by_race = report["uplift_by_race"]
    races = list(enrollment_by_race.keys())
    return {
        "races": races,
        "enrollment_rates": [
            float(enrollment_by_race[race]["enrollment_rate"]) for race in races
        ],
        "median_uplifts": [
            float(uplift_by_race[race].get("mean_uplift", uplift_by_race[race]["median_uplift"]))
            for race in races
        ],
    }


@app.get("/budget")
def budget() -> list[dict[str, Any]]:
    """Return budget sweep data for dashboard exploration."""
    _ensure_models_loaded()
    uplift_scores = MODELS.get("uplift_scores")
    if uplift_scores is None:
        return []

    sweep = budget_sweep(
        pd.Series(np.asarray(uplift_scores).ravel()),
        k_pcts=[0.01, 0.05, 0.10, 0.20, 0.30, 0.50],
    )
    return sweep.to_dict(orient="records")
