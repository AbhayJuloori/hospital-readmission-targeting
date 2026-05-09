"""Risk modeling for baseline readmission prediction."""

from typing import Any, Sequence

import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss, roc_auc_score
from xgboost import XGBClassifier


def train_risk_model(X: pd.DataFrame, y: pd.Series) -> XGBClassifier:
    """Train an XGBClassifier for readmission risk prediction.

    XGBoost 1.7.x is incompatible with sklearn 1.6 CalibratedClassifierCV tags API.
    XGB's own probability outputs are used directly.
    """
    # Keep the objective unweighted. scale_pos_weight improves the decision
    # threshold story but badly distorts probabilities for this imbalanced task.
    params = {
        "n_estimators": 900,
        "max_depth": 4,
        "learning_rate": 0.018,
        "subsample": 0.90,
        "colsample_bytree": 0.85,
        "min_child_weight": 10,
        "gamma": 0.03,
        "reg_alpha": 0.02,
        "reg_lambda": 3.0,
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "tree_method": "hist",
        "random_state": 11,
        "n_jobs": -1,
    }
    model = XGBClassifier(**params)
    model.fit(X, y)
    return model


def evaluate_risk_model(model: XGBClassifier, X: pd.DataFrame, y: pd.Series) -> dict[str, float]:
    """Evaluate a readmission risk model with AUC and Brier score."""
    y_prob = model.predict_proba(X)[:, 1]
    top_n = max(int(len(X) * 0.10), 1)
    top_idx = pd.Series(y_prob, index=X.index).sort_values(ascending=False).head(top_n).index

    return {
        "auc": float(roc_auc_score(y, y_prob)),
        "brier": float(brier_score_loss(y, y_prob)),
        "precision_at_10pct": float(y.loc[top_idx].mean()),
    }


def compute_baseline_targeting(
    model: Any,
    X: pd.DataFrame,
    y: pd.Series,
    k_pcts: Sequence[float] = (0.05, 0.10, 0.20),
) -> dict[float, float]:
    """Compute readmissions captured when targeting the top K percent by risk."""
    y_prob = pd.Series(model.predict_proba(X)[:, 1], index=X.index)
    ranked_idx = y_prob.sort_values(ascending=False).index
    total_readmissions = y.sum()
    if total_readmissions == 0:
        return {float(k_pct): 0.0 for k_pct in k_pcts}

    captured = {}
    for k_pct in k_pcts:
        top_n = max(int(len(X) * k_pct), 1)
        top_idx = ranked_idx[:top_n]
        captured[float(k_pct)] = float(y.loc[top_idx].sum() / total_readmissions)

    return captured
