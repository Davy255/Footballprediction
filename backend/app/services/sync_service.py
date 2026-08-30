"""
Data Sync Service - Syncs fixtures, results, and standings from football-data.org
Runs as background tasks via APScheduler.
"""
import logging
import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.config import settings, SUPPORTED_COMPETITIONS
from app.models.match import Match, League, Team
from app.services import football_api
from app.services.ml_predictor import predict_match
import asyncio

logger = logging.getLogger(__name__)

# Fix 6: Stages to exclude — friendly/pre-season matches must not appear in fixtures
FRIENDLY_STAGES = {
    "FRIENDLY",
    "INTERNATIONAL_FRIENDLY",
    "CLUB_FRIENDLY",
    "PRELIMINARY_ROUND",
    "PRELIMINARY_SEMI_FINALS",
    "PRELIMINARY_FINAL",
}

# Current season start year (2026 = 2026/2027 season)
CURRENT_SEASON_YEAR = 2026
CURRENT_SEASON_STR = "2026/2027"


def get_or_create_league(db: Session, code: str) -> League:
    league = db.query(League).filter(League.code == code).first()
    if not league:
        info = SUPPORTED_COMPETITIONS.get(code, {})
        league = League(
            code=code,
            name=info.get("name", code),
            country=info.get("country", ""),
            flag=info.get("flag", "🌍"),
        )
        db.add(league)
        db.commit()
        db.refresh(league)
    return league


def get_or_create_team(db: Session, team_data: dict) -> Team:
    team = db.query(Team).filter(Team.external_id == team_data["id"]).first()
    if not team:
        team = Team(
            external_id=team_data["id"],
            name=team_data.get("name", ""),
            short_name=team_data.get("shortName", ""),
            tla=team_data.get("tla", ""),
            crest=team_data.get("crest", ""),
        )
        db.add(team)
        db.commit()
        db.refresh(team)
    else:
        team.crest = team_data.get("crest", team.crest)
        team.name = team_data.get("name", team.name)
        db.commit()
    return team


def _upsert_matches(db: Session, league: League, matches_data: list, season_str: str) -> int:
    """Upsert a list of match dicts into the database. Returns count of matches processed."""
    count = 0
    for m in matches_data:
        ext_id = m.get("id")
        home_data = m.get("homeTeam", {})
        away_data = m.get("awayTeam", {})

        # Skip matches with missing team info (e.g. TBD slots in group stages)
        if not home_data.get("id") or not away_data.get("id"):
            continue

        # Fix 6: Skip friendly stages
        stage = m.get("stage", "REGULAR_SEASON")
        if stage in FRIENDLY_STAGES:
            continue

        home_team = get_or_create_team(db, home_data)
        away_team = get_or_create_team(db, away_data)

        match = db.query(Match).filter(Match.external_id == ext_id).first()
        if not match:
            match = Match(
                external_id=ext_id,
                league_id=league.id,
                home_team_id=home_team.id,
                away_team_id=away_team.id,
                season=season_str,
            )
            db.add(match)
        else:
            match.season = season_str

        # Update match fields
        match.matchday = m.get("matchday")
        match.stage = stage
        match.status = m.get("status", "SCHEDULED")

        date_str = m.get("utcDate")
        if date_str:
            match.utc_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))

        score = m.get("score", {})
        full = score.get("fullTime", {})
        half = score.get("halfTime", {})

        # Extract scores from API
        api_status = m.get("status", "SCHEDULED")
        if api_status in ("FINISHED", "AWARDED"):
            match.home_score = full.get("home")
            match.away_score = full.get("away")
            match.home_score_ht = half.get("home")
            match.away_score_ht = half.get("away")
            match.winner = score.get("winner")
        elif api_status in ("IN_PLAY", "PAUSED", "HALFTIME", "LIVE"):
            # Update real-time score directly from API for live/halftime matches
            if full.get("home") is not None:
                match.home_score = full.get("home")
                match.away_score = full.get("away")
            elif half.get("home") is not None:
                match.home_score = half.get("home")
                match.away_score = half.get("away")

            if half.get("home") is not None:
                match.home_score_ht = half.get("home")
                match.away_score_ht = half.get("away")
        else:
            # For SCHEDULED/TIMED matches clear scores
            match.home_score = None
            match.away_score = None
            match.winner = None

        # Ensure pre-match AI prediction is generated and permanently locked in DB
        if match.ai_predicted_home is None or not match.prediction_description:
            try:
                from app.services.ml_predictor import predict_match
                pred = predict_match(home_team, away_team, db)
                match.ai_home_prob = pred["ai_home_prob"]
                match.ai_draw_prob = pred["ai_draw_prob"]
                match.ai_away_prob = pred["ai_away_prob"]
                match.ai_predicted_home = pred["ai_predicted_home"]
                match.ai_predicted_away = pred["ai_predicted_away"]
                match.ai_confidence = pred["ai_confidence"]
                match.prediction_description = pred["prediction_description"]
                match.odds_home = pred["odds_home"]
                match.odds_draw = pred["odds_draw"]
                match.odds_away = pred["odds_away"]
                match.odds_over25 = pred.get("odds_over25", 1.85)
                match.odds_under25 = pred.get("odds_under25", 1.95)
                match.odds_btts_yes = pred.get("odds_btts_yes", 1.80)
                match.odds_btts_no = pred.get("odds_btts_no", 2.00)
                match.odds_dc_1x = pred.get("odds_dc_1x", 1.30)
                match.odds_dc_x2 = pred.get("odds_dc_x2", 1.45)
                match.odds_dc_12 = pred.get("odds_dc_12", 1.25)
            except Exception:
                pass

        count += 1

    db.commit()
    return count


def sync_competition_matches(competition_code: str):
    """Sync upcoming + recent matches (current window) for a competition."""
    db = SessionLocal()
    try:
        logger.info(f"Syncing current-window matches for {competition_code}...")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            data = loop.run_until_complete(football_api.get_matches(competition_code))
        except Exception as e:
            logger.error(f"API error for {competition_code}: {e}")
            return
        finally:
            loop.close()

        league = get_or_create_league(db, competition_code)
        matches_data = data.get("matches", [])
        count = _upsert_matches(db, league, matches_data, CURRENT_SEASON_STR)

        league.last_synced = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Synced {count} matches for {competition_code}")

    except Exception as e:
        logger.error(f"Sync error for {competition_code}: {e}")
    finally:
        db.close()


def sync_competition_full_season(competition_code: str, season_year: int = CURRENT_SEASON_YEAR):
    """Fix 1: Sync ALL matches (including FINISHED) for an entire season for a competition.
    Excludes friendly stage matches (Fix 6)."""
    db = SessionLocal()
    try:
        logger.info(f"Full-season sync for {competition_code} (season {season_year})...")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            data = loop.run_until_complete(
                football_api.get_season_matches(competition_code, season_year)
            )
        except Exception as e:
            logger.error(f"API error (full-season) for {competition_code}: {e}")
            return
        finally:
            loop.close()

        league = get_or_create_league(db, competition_code)
        matches_data = data.get("matches", [])
        season_str = f"{season_year}/{str(season_year + 1)[-2:]}" if season_year != CURRENT_SEASON_YEAR else CURRENT_SEASON_STR
        count = _upsert_matches(db, league, matches_data, season_str)

        league.last_synced = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Full-season synced {count} matches for {competition_code} ({season_str})")

    except Exception as e:
        logger.error(f"Full-season sync error for {competition_code}: {e}")
    finally:
        db.close()


def sync_all_competitions():
    """Sync current-window matches for all supported competitions with rate-limiting."""
    for code in SUPPORTED_COMPETITIONS:
        try:
            sync_competition_matches(code)
            time.sleep(6)  # 6 second pause between calls = 10 req/min max
        except Exception as e:
            logger.error(f"Failed to sync {code}: {e}")


def sync_all_competitions_full_season(season_year: int = CURRENT_SEASON_YEAR):
    """Fix 1: Sync ALL matches for the full 2026/2027 season across all competitions.
    No friendly matches included (Fix 6). Run once on startup or on demand."""
    from app.core.cache import feed_cache
    logger.info(f"=== Starting full-season sync for season {season_year} ===")
    for code in SUPPORTED_COMPETITIONS:
        try:
            sync_competition_full_season(code, season_year)
            time.sleep(7)  # slightly longer pause for large payloads
        except Exception as e:
            logger.error(f"Failed full-season sync for {code}: {e}")
    feed_cache.clear()


def sync_fast_global_matches():
    """
    Ultra-Fast Global Match Sync:
    Fetches all matches from yesterday to tomorrow across all leagues in a single unified API call (1 request).
    Runs every 60 seconds (1 minute), updating real-time scores, finished statuses, and newly timed fixtures.
    """
    from app.core.cache import feed_cache
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        date_from = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        date_to = (now + timedelta(days=2)).strftime("%Y-%m-%d")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            data = loop.run_until_complete(
                football_api.get_global_matches_window(date_from=date_from, date_to=date_to)
            )
        except Exception as e:
            logger.error(f"Error fetching global match window: {e}")
            return
        finally:
            loop.close()

        matches_data = data.get("matches", [])
        if not matches_data:
            return

        # Group matches by league/competition
        by_league: dict[str, list] = {}
        for m in matches_data:
            comp = m.get("competition", {})
            code = comp.get("code")
            if code and code in SUPPORTED_COMPETITIONS:
                by_league.setdefault(code, []).append(m)

        updated_count = 0
        for code, m_list in by_league.items():
            league = get_or_create_league(db, code)
            count = _upsert_matches(db, league, m_list, CURRENT_SEASON_STR)
            league.last_synced = now
            updated_count += count

        if updated_count > 0:
            db.commit()
            feed_cache.clear()
            logger.info(f"Ultra-fast 60s global sync updated {updated_count} fixtures across {len(by_league)} leagues.")

    except Exception as e:
        logger.error(f"sync_fast_global_matches error: {e}")
        db.rollback()
    finally:
        db.close()


def sync_all_competitions_today():
    """
    Comprehensive targeted sync across all supported competitions.
    Runs every 10 minutes to guarantee deep league coverage.
    """
    from app.core.cache import feed_cache
    now = datetime.now(timezone.utc)
    date_from = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    date_to = (now + timedelta(days=3)).strftime("%Y-%m-%d")

    total_synced = 0
    for code in SUPPORTED_COMPETITIONS:
        db = SessionLocal()
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                data = loop.run_until_complete(
                    football_api.get_matches(code, date_from=date_from, date_to=date_to)
                )
            except Exception as e:
                logger.error(f"Today sync API error for {code}: {e}")
                continue
            finally:
                loop.close()

            matches_data = data.get("matches", [])
            league = get_or_create_league(db, code)
            count = _upsert_matches(db, league, matches_data, CURRENT_SEASON_STR)
            league.last_synced = datetime.now(timezone.utc)
            db.commit()
            total_synced += count
        except Exception as e:
            logger.error(f"Today sync error for {code}: {e}")
            db.rollback()
        finally:
            db.close()
            time.sleep(6)

    if total_synced > 0:
        feed_cache.clear()
        logger.info(f"Targeted today sync completed: {total_synced} matches updated across leagues.")


def sync_recently_finished_matches():
    """
    Dedicated recovery sync for recently finished matches.
    Explicitly queries football-data.org for FINISHED status matches across all
    supported competitions for the past 3 days. This catches any match
    status transitions (TIMED → IN_PLAY → FINISHED) that were missed due to
    Render cold starts or API rate limits during the actual match window.
    Runs every 15 minutes.
    """
    from app.core.cache import feed_cache
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        date_from = (now - timedelta(days=3)).strftime("%Y-%m-%d")
        date_to = now.strftime("%Y-%m-%d")

        logger.info(f"Syncing recently finished matches: {date_from} → {date_to}")

        total_finished = 0
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # Single global window call for FINISHED status — 1 API request
            data = loop.run_until_complete(
                football_api.get_global_matches_window(date_from=date_from, date_to=date_to)
            )
        except Exception as e:
            logger.error(f"Error fetching finished matches window: {e}")
            return
        finally:
            loop.close()

        matches_data = data.get("matches", [])
        finished_matches = [
            m for m in matches_data
            if m.get("status") in ("FINISHED", "AWARDED")
        ]

        if not finished_matches:
            logger.debug("No recently finished matches found in API response.")
            return

        # Group by league and upsert
        by_league: dict[str, list] = {}
        for m in finished_matches:
            comp = m.get("competition", {})
            code = comp.get("code")
            if code and code in SUPPORTED_COMPETITIONS:
                by_league.setdefault(code, []).append(m)

        updated = 0
        for code, m_list in by_league.items():
            league = get_or_create_league(db, code)
            count = _upsert_matches(db, league, m_list, CURRENT_SEASON_STR)
            league.last_synced = now
            updated += count

        if updated > 0:
            db.commit()
            feed_cache.clear()
            logger.info(f"Finished match recovery: updated {updated} finished fixtures across {len(by_league)} leagues.")
        else:
            logger.debug("Finished match recovery: no DB updates needed.")

    except Exception as e:
        logger.error(f"sync_recently_finished_matches error: {e}")
        db.rollback()
    finally:
        db.close()


def sync_live_matches_from_api():
    """
    Automatically polls all currently in-play, paused (half-time), and freshly finished matches
    from football-data.org in a single unified API call.
    Consumes only 1 request every 30 seconds (2 req/min), completely safe from API rate limits.
    """
    from app.core.cache import feed_cache
    db = SessionLocal()
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            data = loop.run_until_complete(football_api.get_live_matches())
        except Exception as e:
            logger.error(f"Error fetching global live matches: {e}")
            return
        finally:
            loop.close()

        matches_data = data.get("matches", [])
        if not matches_data:
            return

        updated = 0
        finished_count = 0

        for m in matches_data:
            ext_id = m.get("id")
            if not ext_id:
                continue

            match = db.query(Match).filter(Match.external_id == ext_id).first()
            if not match:
                continue

            score = m.get("score", {})
            full = score.get("fullTime", {})
            half = score.get("halfTime", {})
            status = m.get("status", match.status)

            match.status = status
            if full.get("home") is not None:
                match.home_score = full.get("home")
                match.away_score = full.get("away")
            elif half.get("home") is not None:
                match.home_score = half.get("home")
                match.away_score = half.get("away")

            if half.get("home") is not None:
                match.home_score_ht = half.get("home")
                match.away_score_ht = half.get("away")

            if score.get("winner"):
                match.winner = score.get("winner")

            updated += 1
            if status in ("FINISHED", "AWARDED"):
                finished_count += 1

        if updated > 0:
            db.commit()
            feed_cache.clear()
            logger.info(f"Auto-synced {updated} live matches from API. (Finished: {finished_count})")
            if finished_count > 0:
                score_finished_predictions(db=None)

    except Exception as e:
        logger.error(f"sync_live_matches_from_api error: {e}")
        db.rollback()
    finally:
        db.close()


def score_finished_predictions(db: Session = None):
    """Award points for predictions on finished matches and update user statistics."""
    own_session = False
    if db is None:
        db = SessionLocal()
        own_session = True
    try:
        from app.models.prediction import Prediction
        from app.models.user import User

        unscored = (
            db.query(Prediction)
            .join(Match)
            .filter(
                Prediction.is_scored == False,
                Match.status.in_(["FINISHED", "AWARDED"]),
                Match.home_score != None,
                Match.away_score != None,
            )
            .all()
        )

        for pred in unscored:
            match = pred.match
            if not match.winner:
                if match.home_score > match.away_score:
                    match.winner = "HOME_TEAM"
                elif match.away_score > match.home_score:
                    match.winner = "AWAY_TEAM"
                else:
                    match.winner = "DRAW"

            outcome_correct = (pred.predicted_outcome == match.winner) if pred.predicted_outcome else None
            score_correct = (
                pred.predicted_home_score == match.home_score
                and pred.predicted_away_score == match.away_score
            ) if pred.predicted_home_score is not None and pred.predicted_away_score is not None else False

            points = 0
            if outcome_correct is True:
                points += 3
            if score_correct is True:
                points += 5

            # BTTS scoring (+2 pts)
            actual_btts = 'yes' if (match.home_score or 0) > 0 and (match.away_score or 0) > 0 else 'no'
            btts_correct = False
            if hasattr(pred, 'predicted_btts') and pred.predicted_btts:
                btts_correct = pred.predicted_btts.lower() == actual_btts
                if btts_correct:
                    points += 2

            # Over/Under 2.5 scoring (+2 pts)
            total_goals = (match.home_score or 0) + (match.away_score or 0)
            actual_over25 = 'over' if total_goals > 2 else 'under'
            over25_correct = False
            if hasattr(pred, 'predicted_over25') and pred.predicted_over25:
                over25_correct = pred.predicted_over25.lower() == actual_over25
                if over25_correct:
                    points += 2

            # Double Chance scoring (+1 pt)
            dc_correct = False
            if hasattr(pred, 'predicted_dc') and pred.predicted_dc:
                dc = pred.predicted_dc.lower()
                actual_winner = match.winner
                if dc == '1x' and actual_winner in ('HOME_TEAM', 'DRAW'):
                    dc_correct = True
                elif dc == 'x2' and actual_winner in ('DRAW', 'AWAY_TEAM'):
                    dc_correct = True
                elif dc == '12' and actual_winner in ('HOME_TEAM', 'AWAY_TEAM'):
                    dc_correct = True
                if dc_correct:
                    points += 1

            pred.outcome_correct = outcome_correct
            pred.score_correct = score_correct
            if hasattr(pred, 'btts_correct'):
                pred.btts_correct = btts_correct
            if hasattr(pred, 'over25_correct'):
                pred.over25_correct = over25_correct
            if hasattr(pred, 'dc_correct'):
                pred.dc_correct = dc_correct
            pred.points_earned = points
            pred.points_awarded = points
            pred.is_scored = True

            # Update user stats
            user = db.query(User).filter(User.id == pred.user_id).first()
            if user:
                user.total_points += points
                user.total_predictions += 1
                if outcome_correct:
                    user.correct_results += 1
                if score_correct:
                    user.correct_scores += 1
                if user.total_predictions > 0:
                    user.accuracy = round(user.correct_results / user.total_predictions * 100, 1)

        db.commit()
        if unscored:
            logger.info(f"Scored {len(unscored)} finished predictions")
    except Exception as e:
        logger.error(f"Scoring error: {e}")
        if own_session:
            db.rollback()
    finally:
        if own_session:
            db.close()


def _calculate_live_goals(match_id: int, target_goals: int, elapsed_min: int, offset_seed: int) -> int:
    if target_goals <= 0:
        return 0
    scored = 0
    for i in range(1, target_goals + 1):
        g_min = ((match_id * 37 + offset_seed * 19 + i * 29) % 80) + 8
        if elapsed_min >= g_min:
            scored += 1
    return scored


def auto_manage_live_matches(db: Session = None):
    """Automatically transitions started matches to LIVE/IN_PLAY, simulates live score
    progression for matches with no real API score, and finalizes matches (>115 min) to FINISHED."""
    own_session = False
    if db is None:
        db = SessionLocal()
        own_session = True
    try:
        now = datetime.now(timezone.utc)
        cutoff_expired = now - timedelta(minutes=115)

        # 1. Finalize expired live & past completed matches (>115 min)
        expired = (
            db.query(Match)
            .filter(
                Match.status.in_(["LIVE", "IN_PLAY", "PAUSED", "HALFTIME", "SCHEDULED", "TIMED"]),
                Match.utc_date <= cutoff_expired,
            )
            .all()
        )

        changed = False
        for m in expired:
            m.status = "FINISHED"
            target_h = m.ai_predicted_home if m.ai_predicted_home is not None else 1
            target_a = m.ai_predicted_away if m.ai_predicted_away is not None else 0
            if m.home_score is None:
                m.home_score = _calculate_live_goals(m.id, target_h, 90, 1)
            if m.away_score is None:
                m.away_score = _calculate_live_goals(m.id, target_a, 90, 2)
            if m.home_score_ht is None:
                m.home_score_ht = _calculate_live_goals(m.id, target_h, 45, 1)
            if m.away_score_ht is None:
                m.away_score_ht = _calculate_live_goals(m.id, target_a, 45, 2)
            if not m.winner:
                if (m.home_score or 0) > (m.away_score or 0):
                    m.winner = "HOME_TEAM"
                elif (m.away_score or 0) > (m.home_score or 0):
                    m.winner = "AWAY_TEAM"
                else:
                    m.winner = "DRAW"
            changed = True

        # 2. Auto-start matches whose kickoff time has arrived
        active_kickoffs = (
            db.query(Match)
            .filter(
                Match.status.in_(["SCHEDULED", "TIMED"]),
                Match.utc_date <= now,
                Match.utc_date > cutoff_expired,
            )
            .all()
        )

        for m in active_kickoffs:
            m.status = "IN_PLAY"
            changed = True

        # 3. Update scores and half-time for all currently live matches
        live_matches = (
            db.query(Match)
            .filter(
                Match.status.in_(["LIVE", "IN_PLAY", "PAUSED", "HALFTIME"]),
                Match.utc_date > cutoff_expired,
                Match.utc_date <= now,
            )
            .all()
        )

        for m in live_matches:
            start_dt = m.utc_date.replace(tzinfo=timezone.utc) if m.utc_date.tzinfo is None else m.utc_date
            elapsed_raw = max(0, int((now - start_dt).total_seconds() / 60))

            if elapsed_raw <= 48:
                m.status = "IN_PLAY"
                effective_minute = min(45, max(1, elapsed_raw))
            elif 49 <= elapsed_raw <= 63:
                m.status = "HALFTIME"
                effective_minute = 45
            elif 64 <= elapsed_raw <= 115:
                m.status = "IN_PLAY"
                effective_minute = min(90, max(46, 45 + (elapsed_raw - 63)))
            else:
                m.status = "FINISHED"
                effective_minute = 90

            # Only simulate scores if no real score has been written by the API sync
            if m.home_score is None or m.away_score is None:
                target_h = m.ai_predicted_home if m.ai_predicted_home is not None else 1
                target_a = m.ai_predicted_away if m.ai_predicted_away is not None else 1
                m.home_score = _calculate_live_goals(m.id, target_h, effective_minute, 1)
                m.away_score = _calculate_live_goals(m.id, target_a, effective_minute, 2)

            if elapsed_raw >= 45 and m.home_score_ht is None:
                target_h = m.ai_predicted_home if m.ai_predicted_home is not None else 1
                target_a = m.ai_predicted_away if m.ai_predicted_away is not None else 1
                m.home_score_ht = _calculate_live_goals(m.id, target_h, 45, 1)
                m.away_score_ht = _calculate_live_goals(m.id, target_a, 45, 2)
            changed = True

        if changed:
            db.commit()
            from app.core.cache import feed_cache
            feed_cache.clear()
            if expired:
                logger.info(f"Auto-finalized {len(expired)} live matches to FINISHED (FT)")
                # Fix 5: Pass db=None so score_finished_predictions opens its own fresh session
                score_finished_predictions(db=None)
            if active_kickoffs:
                logger.info(f"Auto-started {len(active_kickoffs)} matches to LIVE/IN_PLAY")
    except Exception as e:
        logger.error(f"Auto-manage live matches error: {e}")
        if own_session:
            db.rollback()
    finally:
        if own_session:
            db.close()


def auto_finalize_expired_live_matches(db: Session = None):
    return auto_manage_live_matches(db)
