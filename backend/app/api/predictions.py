from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.prediction import Prediction
from app.models.match import Match
from app.models.user import User
from app.schemas.schemas import PredictionCreate, PredictionOut

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("/", response_model=PredictionOut)
def create_prediction(
    pred_in: PredictionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match = db.query(Match).filter(Match.id == pred_in.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    PREDICTABLE_STATUSES = ("SCHEDULED", "TIMED", "LIVE", "IN_PLAY", "PAUSED", "HALFTIME")
    if match.status not in PREDICTABLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Predictions are closed — this match has already finished."
        )

    existing = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.match_id == pred_in.match_id,
    ).first()
    if existing:
        # Update existing prediction
        existing.predicted_outcome = pred_in.predicted_outcome
        existing.predicted_home_score = pred_in.predicted_home_score
        existing.predicted_away_score = pred_in.predicted_away_score
        existing.predicted_btts = pred_in.predicted_btts
        existing.predicted_over25 = pred_in.predicted_over25
        existing.predicted_dc = pred_in.predicted_dc
        existing.is_scored = False
        db.commit()
        db.refresh(existing)
        return existing

    if pred_in.predicted_outcome not in ("HOME_TEAM", "DRAW", "AWAY_TEAM"):
        raise HTTPException(status_code=400, detail="Invalid outcome. Use HOME_TEAM, DRAW or AWAY_TEAM")

    pred = Prediction(
        user_id=current_user.id,
        match_id=pred_in.match_id,
        predicted_outcome=pred_in.predicted_outcome,
        predicted_home_score=pred_in.predicted_home_score,
        predicted_away_score=pred_in.predicted_away_score,
        predicted_btts=pred_in.predicted_btts,
        predicted_over25=pred_in.predicted_over25,
        predicted_dc=pred_in.predicted_dc,
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    return pred


@router.get("/my", response_model=list[PredictionOut])
def get_my_predictions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.sync_service import score_finished_predictions
    score_finished_predictions(db)

    return (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/match/{match_id}", response_model=PredictionOut)
def get_my_prediction_for_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pred = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.match_id == match_id,
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="No prediction found")
    return pred


@router.delete("/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pred = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == current_user.id,
    ).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if pred.is_scored:
        raise HTTPException(status_code=400, detail="Cannot delete a scored prediction")
    db.delete(pred)
    db.commit()
    return {"detail": "Prediction deleted"}
