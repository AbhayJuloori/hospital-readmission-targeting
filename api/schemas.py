"""Pydantic schemas for the readmission targeting API."""

from typing import Any

from pydantic import BaseModel, Field


class PatientFeatures(BaseModel):
    """Patient feature payload modeled after the UCI diabetes 130-US dataset."""

    encounter_id: int = 0
    patient_nbr: int = 0
    race: str = "Unknown"
    gender: str = "Unknown"
    age: str = "[60-70)"
    weight: str | None = None
    admission_type_id: int = 1
    discharge_disposition_id: int = 1
    admission_source_id: int = 7
    time_in_hospital: int = 3
    payer_code: str | None = None
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
    glimepiride_pioglitazone: str = Field(default="No", alias="glimepiride-pioglitazone")
    metformin_rosiglitazone: str = Field(default="No", alias="metformin-rosiglitazone")
    metformin_pioglitazone: str = Field(default="No", alias="metformin-pioglitazone")
    change: str = "No"
    diabetesMed: str = "Yes"
    readmitted: str | None = None


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
