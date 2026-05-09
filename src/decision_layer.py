"""Decision-layer utilities for readmission intervention targeting."""

from typing import Sequence

import pandas as pd


THRESHOLDS = {"auto_enroll": 0.15, "review": 0.05}


def assign_tier(uplift_score: float) -> str:
    """Assign an intervention tier from an uplift score."""
    if uplift_score > THRESHOLDS["auto_enroll"]:
        return "AUTO_ENROLL"
    if uplift_score > THRESHOLDS["review"]:
        return "REVIEW"
    return "STANDARD"


def optimize_enrollment(uplift_scores: pd.Series, budget_n: int) -> list[int]:
    """Return patient indices sorted by uplift score under a fixed enrollment budget."""
    return uplift_scores.sort_values(ascending=False).head(budget_n).index.tolist()


def compute_dollar_impact(n_prevented: int, hrrp_penalty_per: float = 15000) -> float:
    """Estimate avoided penalty dollars from prevented readmissions."""
    return float(n_prevented * hrrp_penalty_per)


def budget_sweep(uplift_scores: pd.Series, k_pcts: Sequence[float]) -> pd.DataFrame:
    """Create a budget sweep table across K-percent enrollment levels."""
    rows = []
    ranked = uplift_scores.sort_values(ascending=False)
    for k_pct in k_pcts:
        n = int(len(uplift_scores) * k_pct)
        top_scores = ranked.head(n)
        mean_uplift = float(top_scores.mean()) if n else 0.0
        rows.append(
            {
                "k_pct": k_pct,
                "n_enrolled": n,
                "mean_uplift": mean_uplift,
                "dollar_impact": float(n * mean_uplift * 15000),
            }
        )

    return pd.DataFrame(rows, columns=["k_pct", "n_enrolled", "mean_uplift", "dollar_impact"])
