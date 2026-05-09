"""Fairness analysis utilities for enrollment and uplift targeting."""

from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from src.decision_layer import assign_tier
from src.preprocessing import clean, engineer_features, get_model_arrays, load_raw
from src.uplift_model import predict_uplift_t_learner


MODEL_DIR = Path(__file__).resolve().parents[1] / "api" / "models"


def _aligned_series(values: Any, index: pd.Index, name: str) -> pd.Series:
    """Return values as a Series aligned to the requested index."""
    if isinstance(values, pd.Series):
        return values.reindex(index).rename(name)
    return pd.Series(np.asarray(values), index=index, name=name)


def enrollment_rate_by_group(
    enrolled_mask: pd.Series,
    df: pd.DataFrame,
    group_col: str,
) -> pd.DataFrame:
    """Compute enrollment rates by demographic or clinical group."""
    aligned_mask = (
        _aligned_series(enrolled_mask, df.index, "enrolled")
        .fillna(False)
        .astype(bool)
    )
    grouped = (
        df[[group_col]]
        .assign(enrolled=aligned_mask)
        .groupby(group_col, dropna=False)["enrolled"]
        .agg(n_enrolled="sum", n_total="count")
        .reset_index()
    )
    grouped["n_enrolled"] = grouped["n_enrolled"].astype(int)
    grouped["enrollment_rate"] = grouped["n_enrolled"] / grouped["n_total"]
    return grouped[[group_col, "n_enrolled", "n_total", "enrollment_rate"]]


def uplift_distribution_by_group(
    uplift_scores: pd.Series,
    df: pd.DataFrame,
    group_col: str,
) -> pd.DataFrame:
    """Summarize uplift-score distributions by group."""
    aligned_scores = _aligned_series(uplift_scores, df.index, "uplift")
    grouped = (
        df[[group_col]]
        .assign(uplift=aligned_scores)
        .groupby(group_col, dropna=False)["uplift"]
        .agg(
            mean_uplift="mean",
            median_uplift="median",
            p75_uplift=lambda score: score.quantile(0.75),
            count="count",
        )
        .reset_index()
    )
    grouped["count"] = grouped["count"].astype(int)
    return grouped[
        [group_col, "mean_uplift", "median_uplift", "p75_uplift", "count"]
    ]


def compute_fairness_report(
    X: pd.DataFrame,
    y: pd.Series,
    treatment: pd.Series,
    uplift_scores: pd.Series,
    race_series: pd.Series,
) -> dict[str, dict[str, dict[str, float]]]:
    """Compute race-stratified enrollment and uplift summaries."""
    _ = (y, treatment)
    uplift = _aligned_series(uplift_scores, X.index, "uplift")
    race = _aligned_series(race_series, X.index, "race").fillna("Unknown")
    audit_df = pd.DataFrame({"race": race}, index=X.index)

    enrolled_mask = uplift.map(assign_tier).eq("AUTO_ENROLL")
    enrollment_by_race = enrollment_rate_by_group(enrolled_mask, audit_df, "race")
    uplift_by_race = uplift_distribution_by_group(uplift, audit_df, "race")

    return {
        "enrollment_by_race": enrollment_by_race.set_index("race").to_dict(orient="index"),
        "uplift_by_race": uplift_by_race.set_index("race").to_dict(orient="index"),
    }


def run_full_audit(
    output_path: str | Path = MODEL_DIR / "fairness_report.pkl",
) -> dict[str, Any]:
    """Score the full model array with the saved T-learner and persist the race audit."""
    X, y, treatment = get_model_arrays()
    with (MODEL_DIR / "uplift_scores.pkl").open("rb") as file:
        _trimmed_uplift_scores = pickle.load(file)

    with (MODEL_DIR / "t_learner.pkl").open("rb") as file:
        model_treated, model_control = pickle.load(file)

    uplift = pd.Series(
        predict_uplift_t_learner(model_treated, model_control, X),
        index=X.index,
        name="uplift",
    )
    engineered = engineer_features(clean(load_raw()))
    race = engineered["race"].loc[X.index]

    report = compute_fairness_report(X, y, treatment, uplift, race)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as file:
        pickle.dump(report, file)

    print("Enrollment rates by race")
    print(pd.DataFrame.from_dict(report["enrollment_by_race"], orient="index"))
    print("\nUplift by race")
    print(pd.DataFrame.from_dict(report["uplift_by_race"], orient="index"))
    print(f"\nSaved fairness report to {output_path}")
    return report


def counterfactual_audit(
    patient_row: pd.Series,
    model: Any,
    feature_ranges: dict[str, Any],
) -> pd.DataFrame:
    """Generate counterfactual examples for a patient using DiCE-ML."""
    # TODO: Build a DiCE explainer and return counterfactual rows within feature_ranges.
    raise NotImplementedError


def compute_fairness_metrics(
    enrolled_mask: pd.Series,
    outcomes: pd.Series,
    df: pd.DataFrame,
    group_col: str,
) -> dict[str, float]:
    """Compute group fairness metrics for enrollment and observed outcomes."""
    # TODO: Calculate demographic parity, outcome rates, and group disparities.
    raise NotImplementedError


if __name__ == "__main__":
    run_full_audit()
