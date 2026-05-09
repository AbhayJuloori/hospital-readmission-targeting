"""Uplift and causal modeling stubs for home health targeting."""

from typing import Any, Sequence

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier


def _scale_pos_weight(y: pd.Series) -> float:
    positives = (y == 1).sum()
    if positives == 0:
        return 1.0
    return float((y == 0).sum() / positives)


def _xgb_classifier(n_estimators: int = 300, scale_pos_weight: float = 1.0) -> XGBClassifier:
    return XGBClassifier(
        n_estimators=n_estimators,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        scale_pos_weight=scale_pos_weight,
    )


def train_propensity(X: pd.DataFrame, treatment: pd.Series) -> XGBClassifier:
    """Train an XGBClassifier propensity model for home health assignment.

    XGBoost handles high-dimensional one-hot features without numerical
    overflow, unlike logistic regression on 500+ sparse columns.
    """
    model = XGBClassifier(
        n_estimators=200,
        max_depth=3,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        tree_method="hist",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, treatment)
    return model


def check_overlap(propensity_scores: pd.Series) -> dict[str, float]:
    """Plot and summarize propensity-score overlap diagnostics."""
    return {
        "min": float(propensity_scores.min()),
        "p10": float(propensity_scores.quantile(0.10)),
        "median": float(propensity_scores.median()),
        "p90": float(propensity_scores.quantile(0.90)),
        "max": float(propensity_scores.max()),
    }


def trim_propensity(
    X: pd.DataFrame,
    treatment: pd.Series,
    y: pd.Series,
    lo: float = 0.05,
    hi: float = 0.95,
) -> tuple[pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """Trim rows outside the requested propensity-score support range.

    Propensity is estimated on pre-treatment covariates only (discharge_disposition_id
    columns are excluded to avoid trivial perfect separation since treatment IS
    derived from discharge_disposition_id).
    """
    # Exclude the treatment-derived column from propensity estimation
    propensity_cols = [c for c in X.columns if not c.startswith("discharge_disposition_id")]
    X_propensity = X[propensity_cols]

    propensity_model = train_propensity(X_propensity, treatment)
    propensity_scores = pd.Series(
        propensity_model.predict_proba(X_propensity)[:, 1],
        index=X.index,
        name="propensity_score",
    )
    mask = propensity_scores.between(lo, hi, inclusive="both")
    return X.loc[mask], treatment.loc[mask], y.loc[mask], propensity_scores.loc[mask]


def train_t_learner(X: pd.DataFrame, y: pd.Series, treatment: pd.Series) -> tuple[Any, Any]:
    """Train separate XGBClassifiers for treated and control groups."""
    treated_mask = treatment == 1
    control_mask = treatment == 0

    model_treated = _xgb_classifier(
        n_estimators=300,
        scale_pos_weight=_scale_pos_weight(y.loc[treated_mask]),
    )
    model_control = _xgb_classifier(
        n_estimators=300,
        scale_pos_weight=_scale_pos_weight(y.loc[control_mask]),
    )
    model_treated.fit(X.loc[treated_mask], y.loc[treated_mask])
    model_control.fit(X.loc[control_mask], y.loc[control_mask])

    return model_treated, model_control


def train_causal_forest(X: pd.DataFrame, y: pd.Series, treatment: pd.Series) -> "CausalForestDML":
    """Train an econml CausalForestDML model for heterogeneous treatment effects."""
    try:
        from econml.dml import CausalForestDML
    except ImportError as exc:
        raise ImportError("train_causal_forest requires the optional 'econml' package.") from exc

    model = CausalForestDML(
        model_y=_xgb_classifier(n_estimators=200),
        model_t=LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        discrete_treatment=True,
        random_state=42,
    )
    model.fit(y, treatment, X=X)
    return model


def predict_uplift_t_learner(model_treated: Any, model_control: Any, X: pd.DataFrame) -> np.ndarray:
    """Predict T-learner uplift as treated risk minus control risk."""
    treated_prob = model_treated.predict_proba(X)[:, 1]
    control_prob = model_control.predict_proba(X)[:, 1]
    return treated_prob - control_prob


def compute_qini(
    uplift_scores: np.ndarray,
    y: pd.Series,
    treatment: pd.Series,
) -> tuple[np.ndarray, np.ndarray]:
    """Compute Qini curve x/y values for an uplift model."""
    scored = pd.DataFrame(
        {
            "uplift": np.asarray(uplift_scores),
            "y": y.to_numpy(),
            "treatment": treatment.to_numpy(),
        }
    ).sort_values("uplift", ascending=False)

    total_treated = max((scored["treatment"] == 1).sum(), 1)
    total_control = max((scored["treatment"] == 0).sum(), 1)
    fractions = np.linspace(0.0, 1.0, 50)
    qini_values = []

    for fraction in fractions:
        top_n = int(len(scored) * fraction)
        top = scored.iloc[:top_n]
        k_treated = (top["treatment"] == 1).sum()
        k_control = (top["treatment"] == 0).sum()
        treated_conversions = top.loc[top["treatment"] == 1, "y"].sum()
        control_conversions = top.loc[top["treatment"] == 0, "y"].sum()
        control_scale = k_treated / k_control if k_control else 0.0
        qini = (treated_conversions / total_treated) - (
            control_conversions / total_control
        ) * control_scale
        qini_values.append(qini)

    return fractions, np.asarray(qini_values, dtype=float)


def compute_auuc(qini_x: Sequence[float], qini_y: Sequence[float]) -> float:
    """Compute area under the uplift curve from Qini coordinates."""
    return float(np.trapz(qini_y, qini_x))
