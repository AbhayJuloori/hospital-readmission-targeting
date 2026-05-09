"""Preprocessing stubs for the diabetes readmission dataset.

This module is intended to load ``diabetic_data.csv``, drop unusable
high-missingness columns such as ``weight``, bin age values, group ICD-9
diagnosis codes using CCS-style categories, create a binary readmission target
from ``readmitted == '<30'``, create a treatment indicator for home health
discharge from ``discharge_disposition_id == 6``, and return feature, target,
and treatment DataFrames for downstream modeling.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd


def load_raw(path: str | Path = "data/raw/diabetic_data.csv") -> pd.DataFrame:
    """Load the raw diabetes readmission CSV."""
    path = Path(path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[1] / path

    return pd.read_csv(path).replace("?", np.nan)


def clean(df: pd.DataFrame, missing_threshold: float = 0.40) -> pd.DataFrame:
    """Clean raw patient rows and drop unusable high-missingness columns."""
    cleaned = df.copy()

    cleaned = cleaned.drop(
        columns=["weight"],
        errors="ignore",
    )
    cleaned = cleaned.drop_duplicates(subset="encounter_id", keep="first")
    cleaned = cleaned[
        ~cleaned["discharge_disposition_id"].isin([11, 13, 14, 19, 20, 21])
    ]
    cleaned = cleaned[cleaned["discharge_disposition_id"].isin([1, 6])]

    cleaned["race"] = cleaned["race"].fillna("Unknown")
    for col in ["diag_1", "diag_2", "diag_3"]:
        cleaned[col] = cleaned[col].fillna("0")

    return cleaned


CCS_GROUPS = {
    "250": "Diabetes",
    "401": "Hypertension",
    "428": "Heart Failure",
    "414": "Coronary Artery Disease",
    "496": "COPD",
    "276": "Electrolyte Disorders",
    "427": "Cardiac Arrhythmia",
    "584": "Acute Kidney Failure",
    "585": "Chronic Kidney Disease",
    "486": "Pneumonia",
}


AGE_MIDPOINTS = {
    "[0-10)": 5,
    "[10-20)": 15,
    "[20-30)": 25,
    "[30-40)": 35,
    "[40-50)": 45,
    "[50-60)": 55,
    "[60-70)": 65,
    "[70-80)": 75,
    "[80-90)": 85,
    "[90-100)": 95,
}


MEDICATION_COLS = [
    "metformin",
    "repaglinide",
    "nateglinide",
    "chlorpropamide",
    "glimepiride",
    "glipizide",
    "glyburide",
    "pioglitazone",
    "rosiglitazone",
    "acarbose",
    "miglitol",
    "insulin",
    "glyburide-metformin",
    "tolbutamide",
    "tolazamide",
]


DIAG_TOP_N = 100


ICD9_CHAPTERS = [
    (1, 139, "infectious"),
    (140, 239, "neoplasms"),
    (240, 279, "endocrine"),
    (280, 289, "blood"),
    (290, 319, "mental"),
    (320, 389, "nervous"),
    (390, 459, "circulatory"),
    (460, 519, "respiratory"),
    (520, 579, "digestive"),
    (580, 629, "genitourinary"),
    (630, 679, "pregnancy"),
    (680, 709, "skin"),
    (710, 739, "musculoskeletal"),
    (740, 759, "congenital"),
    (760, 779, "perinatal"),
    (780, 799, "symptoms"),
    (800, 999, "injury"),
]


FEATURE_COLS = [
    "age_numeric",
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
    "admission_type_id",
    "admission_source_id",
    "discharge_disposition_id",
    "prior_visits",
    "total_service_count",
    "labs_per_day",
    "meds_per_day",
    "time_x_meds",
    "inpatient_x_meds",
    "on_insulin",
    "insulin_changed",
    "med_changed",
    "on_diabetes_med",
    "num_med_changes",
    "num_active_meds",
    "gender_male",
    "gender_unknown",
    "a1c_high",
    "a1c_missing",
    "glu_high",
    "glu_missing",
    "patient_prior_encounters",
    "patient_is_repeat",
    "patient_prior_30d_readmissions",
    "patient_prior_any_readmissions",
    "patient_last_30d_readmission",
    "patient_last_any_readmission",
    "patient_prior_home_health",
    "patient_last_home_health",
    "patient_prior_inpatient_sum",
    "patient_last_inpatient",
    "patient_prior_emergency_sum",
    "patient_last_emergency",
    "patient_prior_outpatient_sum",
    "patient_last_outpatient",
    "patient_prior_medication_sum",
    "patient_last_medication",
    "patient_prior_lab_sum",
    "patient_last_lab",
    "patient_prior_time_sum",
    "patient_last_time",
    "patient_prior_30d_rate",
    "patient_prior_any_rate",
    "patient_prior_home_health_rate",
    "patient_encounter_gap_log",
    "total_encounters",
    "poly_inpatient_meds",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create model-ready features including age bins and ICD-9 group features."""
    engineered = _add_patient_history(df.copy())

    engineered["age_numeric"] = engineered["age"].map(AGE_MIDPOINTS)
    engineered["number_diagnoses"] = engineered["number_diagnoses"].astype(int)
    engineered["prior_visits"] = (
        engineered["number_outpatient"]
        + engineered["number_emergency"]
        + engineered["number_inpatient"]
    )
    engineered["diag1_group"] = engineered["diag_1"].apply(get_icd9_group)
    engineered["on_insulin"] = (~engineered["insulin"].isin(["No", "Steady"])).astype(int)
    engineered["insulin_changed"] = engineered["insulin"].isin(["Up", "Down"]).astype(int)
    engineered["med_changed"] = (engineered["change"] == "Ch").astype(int)
    engineered["on_diabetes_med"] = (engineered["diabetesMed"] == "Yes").astype(int)
    engineered["num_med_changes"] = sum(
        engineered[col].isin(["Up", "Down"]).astype(int)
        for col in MEDICATION_COLS
        if col in engineered
    )
    engineered["num_active_meds"] = sum(
        (engineered[col] != "No").astype(int)
        for col in MEDICATION_COLS
        if col in engineered
    )
    engineered["gender_male"] = (engineered["gender"] == "Male").astype(int)
    engineered["gender_unknown"] = (engineered["gender"] == "Unknown/Invalid").astype(int)
    engineered["a1c_high"] = engineered["A1Cresult"].isin([">8", ">7"]).astype(int)
    engineered["a1c_missing"] = engineered["A1Cresult"].isna().astype(int)
    engineered["glu_high"] = engineered["max_glu_serum"].isin([">200", ">300"]).astype(int)
    engineered["glu_missing"] = engineered["max_glu_serum"].isna().astype(int)
    engineered["admission_type_emergency"] = (
        engineered["admission_type_id"] == 1
    ).astype(int)
    engineered["total_service_count"] = (
        engineered["num_lab_procedures"]
        + engineered["num_procedures"]
        + engineered["num_medications"]
    )
    engineered["labs_per_day"] = (
        engineered["num_lab_procedures"] / engineered["time_in_hospital"].clip(lower=1)
    )
    engineered["meds_per_day"] = (
        engineered["num_medications"] / engineered["time_in_hospital"].clip(lower=1)
    )
    engineered["time_x_meds"] = (
        engineered["time_in_hospital"] * engineered["num_medications"]
    )
    engineered["inpatient_x_meds"] = (
        engineered["number_inpatient"] * engineered["num_medications"]
    )
    engineered["total_encounters"] = (
        engineered["number_outpatient"]
        + engineered["number_emergency"]
        + engineered["number_inpatient"]
        + engineered["time_in_hospital"]
    )
    engineered["poly_inpatient_meds"] = (
        engineered["number_inpatient"] * engineered["num_medications"]
    )

    return engineered


def _add_patient_history(df: pd.DataFrame) -> pd.DataFrame:
    """Add history available before each encounter, ordered by encounter id."""
    ordered = df.sort_values(["patient_nbr", "encounter_id"]).copy()
    patient_groups = ordered.groupby("patient_nbr", sort=False)
    readmit_30d = (ordered["readmitted"] == "<30").astype(int)
    readmit_any = (ordered["readmitted"] != "NO").astype(int)
    home_health = (ordered["discharge_disposition_id"] == 6).astype(int)

    ordered["patient_prior_encounters"] = patient_groups.cumcount()
    ordered["patient_is_repeat"] = (ordered["patient_prior_encounters"] > 0).astype(int)
    ordered["patient_prior_30d_readmissions"] = (
        readmit_30d.groupby(ordered["patient_nbr"]).cumsum() - readmit_30d
    )
    ordered["patient_prior_any_readmissions"] = (
        readmit_any.groupby(ordered["patient_nbr"]).cumsum() - readmit_any
    )
    ordered["patient_last_30d_readmission"] = (
        patient_groups["readmitted"].shift().eq("<30").astype(int)
    )
    ordered["patient_last_any_readmission"] = (
        patient_groups["readmitted"].shift().fillna("NO").ne("NO").astype(int)
    )
    ordered["patient_prior_home_health"] = (
        home_health.groupby(ordered["patient_nbr"]).cumsum() - home_health
    )
    ordered["patient_last_home_health"] = (
        patient_groups["discharge_disposition_id"].shift().eq(6).astype(int)
    )

    prior_sum_cols = {
        "number_inpatient": "inpatient",
        "number_emergency": "emergency",
        "number_outpatient": "outpatient",
        "num_medications": "medication",
        "num_lab_procedures": "lab",
        "time_in_hospital": "time",
    }
    for source_col, feature_name in prior_sum_cols.items():
        ordered[f"patient_prior_{feature_name}_sum"] = (
            patient_groups[source_col].cumsum() - ordered[source_col]
        )
        ordered[f"patient_last_{feature_name}"] = (
            patient_groups[source_col].shift().fillna(0)
        )

    prior_encounters = ordered["patient_prior_encounters"].replace(0, np.nan)
    ordered["patient_prior_30d_rate"] = (
        ordered["patient_prior_30d_readmissions"] / prior_encounters
    ).fillna(0)
    ordered["patient_prior_any_rate"] = (
        ordered["patient_prior_any_readmissions"] / prior_encounters
    ).fillna(0)
    ordered["patient_prior_home_health_rate"] = (
        ordered["patient_prior_home_health"] / prior_encounters
    ).fillna(0)
    encounter_gap = patient_groups["encounter_id"].diff().fillna(0).clip(lower=0)
    ordered["patient_encounter_gap_log"] = np.log1p(encounter_gap)

    return ordered.sort_index()


def get_icd9_group(code: Optional[str]) -> str:
    """Map an ICD-9 diagnosis code to a broad CCS-style clinical group."""
    if pd.isna(code):
        return "Other"

    code_str = str(code).strip()
    if not code_str:
        return "Other"
    if code_str[0].upper() in {"V", "E"}:
        return "External/Supplementary"

    return CCS_GROUPS.get(code_str[:3], "Other")


def get_icd9_prefix(code: Optional[str]) -> str:
    """Return a stable 3-digit ICD-9 prefix, preserving V/E code families."""
    if pd.isna(code):
        return "missing"

    code_str = str(code).strip()
    if not code_str:
        return "missing"
    if code_str[0].upper() in {"V", "E"}:
        return code_str[0].upper()

    try:
        return str(int(float(code_str)))[:3]
    except ValueError:
        return "other"


def get_icd9_chapter(code: Optional[str]) -> str:
    """Map an ICD-9 code to a broad body-system chapter."""
    if pd.isna(code):
        return "missing"

    code_str = str(code).strip()
    if not code_str:
        return "missing"
    if code_str[0].upper() in {"V", "E"}:
        return code_str[0].upper()

    try:
        numeric_code = float(code_str)
    except ValueError:
        return "other"

    for low, high, chapter in ICD9_CHAPTERS:
        if low <= numeric_code <= high:
            return chapter
    return "other"


def make_target(df: pd.DataFrame) -> pd.Series:
    """Create a binary target where 1 means readmitted within 30 days."""
    return (df["readmitted"] == "<30").astype(int)


def make_treatment(df: pd.DataFrame) -> pd.Series:
    """Create a binary treatment indicator for home health discharge."""
    return (df["discharge_disposition_id"] == 6).astype(int)


def get_model_arrays(
    df: Optional[pd.DataFrame] = None,
) -> tuple[pd.DataFrame, pd.Series, pd.Series]:
    """Return aligned model features, readmission target, and treatment indicator."""
    if df is None:
        df = clean(load_raw())

    engineered = engineer_features(df)
    y = make_target(engineered)
    treatment = make_treatment(engineered)

    X_numeric = engineered[FEATURE_COLS].copy()
    dummy_frames = [
        pd.get_dummies(engineered["diag1_group"], prefix="diag", drop_first=True),
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
        if col not in engineered:
            continue
        dummy_frames.append(
            pd.get_dummies(
                engineered[col].fillna("Missing").astype(str),
                prefix=col,
                drop_first=True,
            )
        )

    for col in MEDICATION_COLS:
        if col in engineered:
            dummy_frames.append(
                pd.get_dummies(
                    engineered[col].fillna("No").astype(str),
                    prefix=col.replace("-", "_"),
                    drop_first=True,
                )
            )

    for col in ["diag_1", "diag_2", "diag_3"]:
        dummy_frames.append(
            pd.get_dummies(
                engineered[col].map(get_icd9_chapter),
                prefix=f"{col}_chapter",
                drop_first=True,
            )
        )

        prefixes = engineered[col].map(get_icd9_prefix)
        top_prefixes = prefixes.value_counts().head(DIAG_TOP_N).index
        bucketed = prefixes.where(prefixes.isin(top_prefixes), "other")
        dummy_frames.append(
            pd.get_dummies(bucketed, prefix=col, drop_first=True)
        )

    X = pd.concat([X_numeric, *dummy_frames], axis=1)
    X = X.astype(float)

    mask = X.notna().all(axis=1)
    return X.loc[mask], y.loc[mask], treatment.loc[mask]
