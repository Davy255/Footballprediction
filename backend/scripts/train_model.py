"""
XGBoost Model Training Script (19 Features)
Trains on 87,000+ matches using team form, Elo ratings, and head-to-head stats.
Run: py scripts/train_model.py
"""
import os
import sys
import joblib
import numpy as np
import pandas as pd
from sqlalchemy import create_engine

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings

MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")
MODEL_PATH = os.path.join(MODEL_DIR, "prediction_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")
os.makedirs(MODEL_DIR, exist_ok=True)


def train():
    from xgboost import XGBClassifier
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import classification_report

    print("Connecting to database and loading match history...")
    engine = create_engine(settings.DATABASE_URL)
    
    query = """
    SELECT id, league_id, home_team_id, away_team_id, status, utc_date, home_score, away_score, winner
    FROM matches
    WHERE status = 'FINISHED' AND winner IS NOT NULL AND home_score IS NOT NULL AND away_score IS NOT NULL
    ORDER BY utc_date ASC
    """
    df = pd.read_sql_query(query, engine)
    
    if len(df) < 50:
        print(f"Only {len(df)} finished matches. Exiting.")
        return

    print(f"Loaded {len(df)} finished matches for 19-feature extraction...")

    # Dynamic Elo ratings tracking
    elo_ratings = {}
    team_history = {}  # team_id -> list of (goals_for, goals_against, points)

    def get_elo(team_id):
        return elo_ratings.get(team_id, 1500.0)

    def get_form(team_id, n=5):
        hist = team_history.get(team_id, [])[-n:]
        if not hist:
            return 1.2, 1.2, 1.3
        gf = np.mean([h[0] for h in hist])
        ga = np.mean([h[1] for h in hist])
        pts = np.mean([h[2] for h in hist])
        return gf, ga, pts

    X_rows = []
    y_labels = []

    for idx, row in df.iterrows():
        h_id, a_id = row['home_team_id'], row['away_team_id']
        h_elo = get_elo(h_id)
        a_elo = get_elo(a_id)
        elo_diff = h_elo - a_elo

        hgs5, hgc5, hpts5 = get_form(h_id, 5)
        hgs10, hgc10, hpts10 = get_form(h_id, 10)
        ags5, agc5, apts5 = get_form(a_id, 5)
        ags10, agc10, apts10 = get_form(a_id, 10)

        feat = [
            elo_diff, h_elo, a_elo,
            hgs5, hgc5, hpts5,
            hgs10, hgc10, hpts10,
            ags5, agc5, apts5,
            ags10, agc10, apts10,
            hgs5 - ags5,
            hgc5 - agc5,
            hpts5 - apts5,
            h_elo / max(1.0, a_elo)
        ]

        X_rows.append(feat)
        y_labels.append(row['winner'])

        # Update history and Elo
        winner = row['winner']
        h_g, a_g = row['home_score'], row['away_score']
        h_pts = 3 if winner == 'HOME_TEAM' else 1 if winner == 'DRAW' else 0
        a_pts = 3 if winner == 'AWAY_TEAM' else 1 if winner == 'DRAW' else 0

        if h_id not in team_history: team_history[h_id] = []
        if a_id not in team_history: team_history[a_id] = []
        team_history[h_id].append((h_g, a_g, h_pts))
        team_history[a_id].append((a_g, h_g, a_pts))

        s_h = 1.0 if winner == 'HOME_TEAM' else 0.5 if winner == 'DRAW' else 0.0
        e_h = 1.0 / (1.0 + 10.0 ** ((a_elo - h_elo - 50.0) / 400.0))
        k = 32.0
        elo_ratings[h_id] = h_elo + k * (s_h - e_h)
        elo_ratings[a_id] = a_elo + k * ((1.0 - s_h) - (1.0 - e_h))

    X_features = np.array(X_rows)
    le = LabelEncoder()
    y_encoded = le.fit_transform(y_labels)

    # Split train/test
    split = int(len(X_features) * 0.8)
    X_train, X_test = X_features[:split], X_features[split:]
    y_train, y_test = y_encoded[:split], y_encoded[split:]

    print(f"Training XGBoost Classifier on {len(X_train)} training matches...")
    model = XGBClassifier(
        n_estimators=350,
        max_depth=5,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    print("\nClassification Report (Evaluation):")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)
    print(f"\nModel trained on {len(df)} matches and saved to {MODEL_PATH}")
    print(f"Label encoder saved to {ENCODER_PATH}")


if __name__ == "__main__":
    train()
