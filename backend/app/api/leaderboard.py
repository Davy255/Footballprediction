from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.user import User
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=list[dict])
def get_leaderboard(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.is_active == True, User.total_predictions > 0)
        .order_by(desc(User.total_points), desc(User.accuracy))
        .limit(limit)
        .all()
    )
    result = []
    for rank, user in enumerate(users, 1):
        result.append({
            "rank": rank,
            "id": user.id,
            "username": user.username,
            "avatar": user.avatar,
            "total_points": user.total_points,
            "total_predictions": user.total_predictions,
            "correct_results": user.correct_results,
            "correct_scores": user.correct_scores,
            "accuracy": user.accuracy,
        })
    return result


@router.get("/me")
def get_my_rank(
    db: Session = Depends(get_db),
    current_user: User = Depends(__import__("app.core.security", fromlist=["get_current_user"]).get_current_user),
):
    users = (
        db.query(User)
        .filter(User.is_active == True, User.total_predictions > 0)
        .order_by(desc(User.total_points), desc(User.accuracy))
        .all()
    )
    for rank, user in enumerate(users, 1):
        if user.id == current_user.id:
            return {
                "rank": rank,
                "total_users": len(users),
                "total_points": user.total_points,
                "accuracy": user.accuracy,
            }
    return {"rank": None, "total_users": len(users), "total_points": 0, "accuracy": 0}
