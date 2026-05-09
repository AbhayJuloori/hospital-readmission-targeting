"""Survival modeling for time-to-readmission analysis."""

from pathlib import Path
import pickle
from typing import Any

import pandas as pd
from lifelines import CoxPHFitter
from lifelines.utils import concordance_index

from src.preprocessing import FEATURE_COLS, clean, engineer_features, load_raw


MODEL_PATH = Path(__file__).resolve().parents[1] / "api" / "models" / "survival_cox.pkl"


def prepare_survival_data(df: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    """Prepare duration and event arrays for readmission survival modeling."""
    duration_map = {"<30": 15, ">30": 45, "NO": 90}
    durations = df["readmitted"].map(duration_map)
    if durations.isna().any():
        unknown = sorted(df.loc[durations.isna(), "readmitted"].dropna().unique())
        raise ValueError(f"Unknown readmitted values: {unknown}")

    events = (df["readmitted"] != "NO").astype(int)
    return durations.astype(int), events


def train_cox(X: pd.DataFrame, durations: pd.Series, events: pd.Series) -> "CoxPHFitter":
    """Train a lifelines Cox proportional hazards model."""
    feature_cols = [col for col in FEATURE_COLS if col in X.columns]
    X_numeric = X[feature_cols].select_dtypes(include="number").astype(float)

    cox_data = X_numeric.copy()
    cox_data["duration"] = durations
    cox_data["event"] = events
    cox_data = cox_data.dropna()

    model = CoxPHFitter(penalizer=0.1)
    model.fit(cox_data, duration_col="duration", event_col="event")
    return model


def train_rsf(X: pd.DataFrame, durations: pd.Series, events: pd.Series) -> "RandomSurvivalForest":
    """Train a RandomSurvivalForest model."""
    raise NotImplementedError("Random survival forest training is intentionally skipped.")


def evaluate_survival(model: Any, X: pd.DataFrame, durations: pd.Series, events: pd.Series) -> float:
    """Evaluate a survival model using concordance index."""
    X_eval = X[list(model.params_.index)].select_dtypes(include="number").astype(float)
    eval_data = X_eval.copy()
    eval_data["duration"] = durations
    eval_data["event"] = events
    eval_data = eval_data.dropna()

    risk_scores = model.predict_partial_hazard(eval_data[X_eval.columns])
    return float(
        concordance_index(
            eval_data["duration"],
            -risk_scores,
            eval_data["event"],
        )
    )


def main() -> None:
    """Train and save the Cox survival model."""
    df = engineer_features(clean(load_raw()))
    durations, events = prepare_survival_data(df)
    X = df[FEATURE_COLS].copy()

    model = train_cox(X, durations, events)
    cindex = evaluate_survival(model, X, durations, events)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as file:
        pickle.dump(model, file)

    print({"cox_cindex": cindex})


if __name__ == "__main__":
    main()
