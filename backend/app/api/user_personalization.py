from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserFavoriteTeam, UserFollowedLeague, UserSavedPrediction, UserNotificationPreference
from app.models.match import Team, League, Match
from app.models.prediction import Prediction

router = APIRouter(prefix="/api/user", tags=["user_personalization"])


@router.get("/personalization")
def get_user_personalization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav_teams = db.query(UserFavoriteTeam.team_id).filter(UserFavoriteTeam.user_id == current_user.id).all()
    fol_leagues = db.query(UserFollowedLeague.league_id).filter(UserFollowedLeague.user_id == current_user.id).all()
    saved_preds = db.query(UserSavedPrediction.match_id).filter(UserSavedPrediction.user_id == current_user.id).all()

    prefs = db.query(UserNotificationPreference).filter(UserNotificationPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = UserNotificationPreference(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return {
        "favorite_team_ids": [t[0] for t in fav_teams],
        "followed_league_ids": [l[0] for l in fol_leagues],
        "saved_match_ids": [m[0] for m in saved_preds],
        "notification_preferences": {
            "match_reminders": prefs.match_reminders,
            "prediction_alerts": prefs.prediction_alerts,
            "live_alerts": prefs.live_alerts,
            "final_results": prefs.final_results,
            "favorite_team_alerts": prefs.favorite_team_alerts,
        },
    }


@router.post("/favorite-team/{team_id}")
def toggle_favorite_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    existing = db.query(UserFavoriteTeam).filter(
        UserFavoriteTeam.user_id == current_user.id,
        UserFavoriteTeam.team_id == team_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "team_id": team_id, "is_favorite": False}
    else:
        new_fav = UserFavoriteTeam(user_id=current_user.id, team_id=team_id)
        db.add(new_fav)
        db.commit()
        return {"status": "added", "team_id": team_id, "is_favorite": True}


@router.post("/followed-league/{league_id}")
def toggle_followed_league(
    league_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    existing = db.query(UserFollowedLeague).filter(
        UserFollowedLeague.user_id == current_user.id,
        UserFollowedLeague.league_id == league_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "league_id": league_id, "is_followed": False}
    else:
        new_fol = UserFollowedLeague(user_id=current_user.id, league_id=league_id)
        db.add(new_fol)
        db.commit()
        return {"status": "added", "league_id": league_id, "is_followed": True}


@router.post("/saved-prediction/{match_id}")
def toggle_saved_prediction(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    existing = db.query(UserSavedPrediction).filter(
        UserSavedPrediction.user_id == current_user.id,
        UserSavedPrediction.match_id == match_id,
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "match_id": match_id, "is_saved": False}
    else:
        new_save = UserSavedPrediction(user_id=current_user.id, match_id=match_id)
        db.add(new_save)
        db.commit()
        return {"status": "added", "match_id": match_id, "is_saved": True}


@router.put("/notifications")
def update_notification_preferences(
    prefs_in: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prefs = db.query(UserNotificationPreference).filter(UserNotificationPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = UserNotificationPreference(user_id=current_user.id)
        db.add(prefs)

    if "match_reminders" in prefs_in:
        prefs.match_reminders = bool(prefs_in["match_reminders"])
    if "prediction_alerts" in prefs_in:
        prefs.prediction_alerts = bool(prefs_in["prediction_alerts"])
    if "live_alerts" in prefs_in:
        prefs.live_alerts = bool(prefs_in["live_alerts"])
    if "final_results" in prefs_in:
        prefs.final_results = bool(prefs_in["final_results"])
    if "favorite_team_alerts" in prefs_in:
        prefs.favorite_team_alerts = bool(prefs_in["favorite_team_alerts"])

    db.commit()
    db.refresh(prefs)
    return {
        "status": "updated",
        "notification_preferences": {
            "match_reminders": prefs.match_reminders,
            "prediction_alerts": prefs.prediction_alerts,
            "live_alerts": prefs.live_alerts,
            "final_results": prefs.final_results,
            "favorite_team_alerts": prefs.favorite_team_alerts,
        },
    }


@router.get("/dashboard")
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Followed Teams with their next upcoming fixture
    fav_team_records = (
        db.query(UserFavoriteTeam)
        .options(joinedload(UserFavoriteTeam.team))
        .filter(UserFavoriteTeam.user_id == current_user.id)
        .all()
    )

    followed_teams_data = []
    for f in fav_team_records:
        team = f.team
        if not team:
            continue
        next_match = (
            db.query(Match)
            .options(joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league))
            .filter((Match.home_team_id == team.id) | (Match.away_team_id == team.id))
            .filter(Match.status.in_(["SCHEDULED", "TIMED", "LIVE", "IN_PLAY"]))
            .order_by(Match.utc_date.asc())
            .first()
        )
        followed_teams_data.append({
            "id": team.id,
            "name": team.name,
            "short_name": team.short_name,
            "crest": team.crest,
            "elo_rating": team.elo_rating,
            "next_match": next_match,
        })

    # 2. Followed Leagues
    fol_league_records = (
        db.query(UserFollowedLeague)
        .options(joinedload(UserFollowedLeague.league))
        .filter(UserFollowedLeague.user_id == current_user.id)
        .all()
    )
    followed_leagues_data = [l.league for l in fol_league_records if l.league]

    # 3. Saved Predictions
    saved_records = (
        db.query(UserSavedPrediction)
        .options(
            joinedload(UserSavedPrediction.match).joinedload(Match.home_team),
            joinedload(UserSavedPrediction.match).joinedload(Match.away_team),
            joinedload(UserSavedPrediction.match).joinedload(Match.league),
        )
        .filter(UserSavedPrediction.user_id == current_user.id)
        .all()
    )
    saved_matches = [s.match for s in saved_records if s.match]

    # 4. User's Recent Community Predictions
    recent_preds = (
        db.query(Prediction)
        .options(
            joinedload(Prediction.match).joinedload(Match.home_team),
            joinedload(Prediction.match).joinedload(Match.away_team),
            joinedload(Prediction.match).joinedload(Match.league),
        )
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "total_points": current_user.total_points,
            "total_predictions": current_user.total_predictions,
            "correct_results": current_user.correct_results,
            "correct_scores": current_user.correct_scores,
            "accuracy": current_user.accuracy,
            "created_at": current_user.created_at,
        },
        "followed_teams": followed_teams_data,
        "followed_leagues": followed_leagues_data,
        "saved_matches": saved_matches,
        "recent_predictions": recent_preds,
    }
