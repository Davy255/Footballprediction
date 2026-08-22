"""
AI Supporter Chatbot API
Provides intelligent football predictions analysis, platform support, live match tracking, and tactical guidance.
"""
import os
import json
import logging
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import chat_rate_limiter
from app.models.match import Match, League, Team

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant" or "system"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []


def get_live_matches_summary(db: Session) -> str:
    live = (
        db.query(Match)
        .options(joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league))
        .filter(Match.status.in_(["LIVE", "IN_PLAY", "PAUSED", "HALFTIME"]))
        .order_by(Match.utc_date.asc())
        .limit(10)
        .all()
    )
    if not live:
        return "There are currently no live matches in play."
    lines = []
    for m in live:
        ht = m.home_team.name if m.home_team else "Home"
        at = m.away_team.name if m.away_team else "Away"
        hs = m.home_score if m.home_score is not None else 0
        as_ = m.away_score if m.away_score is not None else 0
        lg = m.league.name if m.league else "League"
        lines.append(f"• **{ht} {hs} - {as_} {at}** ({m.status}) — *{lg}*")
    return "\n".join(lines)


def get_top_picks_summary(db: Session) -> str:
    now = datetime.now(timezone.utc)
    future = now + timedelta(days=3)
    upcoming = (
        db.query(Match)
        .options(joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league))
        .filter(
            Match.status.in_(["SCHEDULED", "TIMED"]),
            Match.utc_date >= now,
            Match.utc_date <= future,
            Match.ai_confidence != None,
        )
        .order_by(Match.ai_confidence.desc())
        .limit(5)
        .all()
    )
    if not upcoming:
        return "No upcoming matches with calculated confidence metrics found for the next few days."
    lines = []
    for m in upcoming:
        ht = m.home_team.name if m.home_team else "Home"
        at = m.away_team.name if m.away_team else "Away"
        prob = int((m.ai_confidence or 0) * 100)
        fav = ht if (m.ai_home_prob or 0) >= (m.ai_away_prob or 0) else at
        pick_type = "Home Win" if (m.ai_home_prob or 0) >= (m.ai_away_prob or 0) else "Away Win"
        odds = m.odds_home if pick_type == "Home Win" else m.odds_away
        odds_str = f" @ {odds}" if odds else ""
        date_str = m.utc_date.strftime("%d %b %H:%M UTC") if m.utc_date else ""
        lines.append(
            f"• **{ht} vs {at}** ({date_str})\n"
            f"  👉 **Pick:** {fav} ({pick_type}{odds_str}) — **{prob}% Confidence**\n"
            f"  🎯 *Predicted Score:* {m.ai_predicted_home or 1} - {m.ai_predicted_away or 0}"
        )
    return "\n\n".join(lines)


def search_team_matches(query: str, db: Session) -> Optional[str]:
    # Look for team matches matching words in query
    terms = [w.strip() for w in query.lower().split() if len(w.strip()) > 3]
    if not terms:
        return None

    matches = (
        db.query(Match)
        .options(joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league))
        .join(Match.home_team)
        .filter(Match.utc_date != None)
        .order_by(Match.utc_date.desc())
        .limit(100)
        .all()
    )

    found = []
    for m in matches:
        ht_name = (m.home_team.name if m.home_team else "").lower()
        at_name = (m.away_team.name if m.away_team else "").lower()
        if any(t in ht_name or t in at_name for t in terms):
            found.append(m)
            if len(found) >= 3:
                break

    if not found:
        return None

    lines = []
    for m in found:
        ht = m.home_team.name if m.home_team else "Home"
        at = m.away_team.name if m.away_team else "Away"
        dt = m.utc_date.strftime("%d %b %Y %H:%M UTC") if m.utc_date else ""
        if m.status in ["FINISHED", "AWARDED"]:
            score = f"{m.home_score} - {m.away_score}"
            lines.append(f"• **{ht} {score} {at}** (FT, {dt})")
        elif m.status in ["IN_PLAY", "LIVE", "HALFTIME"]:
            score = f"{m.home_score or 0} - {m.away_score or 0}"
            lines.append(f"• **{ht} {score} {at}** (🔴 {m.status}, {dt})")
        else:
            prob = int((m.ai_confidence or 0) * 100)
            lines.append(
                f"• **{ht} vs {at}** ({dt}, {m.league.name if m.league else ''})\n"
                f"  📊 Prediction: {m.ai_predicted_home or 1} - {m.ai_predicted_away or 0} ({prob}% Conf.)"
            )
    return "\n".join(lines)


def generate_smart_reply(user_msg: str, db: Session) -> dict:
    msg = user_msg.lower().strip()

    # 1. Scoring & Rules
    if any(k in msg for k in ["how to play", "rules", "points", "scoring", "how do i earn", "point system"]):
        reply = (
            "### 🏆 Prediction Scoring System\n\n"
            "Here is how points are calculated for every match prediction:\n\n"
            "| Prediction Type | Correct Result | Points Awarded |\n"
            "| :--- | :--- | :--- |\n"
            "| **Exact Score** | Exact scoreline (e.g. 2-1) | **+5 Points** 🎯 |\n"
            "| **Match Outcome** | Correct 1X2 Winner/Draw | **+3 Points** ⚡ |\n"
            "| **BTTS** | Both Teams To Score (Yes/No) | **+2 Points** ⚽ |\n"
            "| **Over/Under 2.5** | Total goals >2.5 or <2.5 | **+2 Points** 📊 |\n"
            "| **Double Chance** | 1X, X2, or 12 coverage | **+1 Point** 🛡️ |\n\n"
            "💡 *Tip: Combining an exact score with correct sub-markets can yield up to **13 points** in a single match!*"
        )
        suggestions = ["Show today's top picks", "What matches are live?", "How to view leaderboard"]
        return {"reply": reply, "suggestions": suggestions}

    # 2. Live Matches
    if any(k in msg for k in ["live", "in play", "in-play", "ongoing", "happening now", "current score"]):
        summary = get_live_matches_summary(db)
        reply = (
            f"### 🔴 Live Matches Tracking\n\n{summary}\n\n"
            "Live scores auto-update every 5 seconds. Head to the **[Live View](/live)** to see real-time statistics and ongoing matches!"
        )
        suggestions = ["Show today's top picks", "Browse upcoming fixtures", "Explain scoring rules"]
        return {"reply": reply, "suggestions": suggestions}

    # 3. Top Picks / Predictions Advice
    if any(k in msg for k in ["top pick", "best pick", "recommend", "prediction", "what should i bet", "advice", "tips", "value"]):
        picks = get_top_picks_summary(db)
        reply = (
            f"### 🎯 Top AI Match Predictions & Value Picks\n\n{picks}\n\n"
            "💡 *All AI predictions are generated using Head-to-Head records, Elo strength ratings, expected goals, and form metrics.*"
        )
        suggestions = ["Show live matches", "How does scoring work?", "Look up Premier League matches"]
        return {"reply": reply, "suggestions": suggestions}

    # 4. Leaderboard / Rankings
    if any(k in msg for k in ["leaderboard", "rank", "top user", "leader", "ranking"]):
        reply = (
            "### 🥇 Leaderboard & Rankings\n\n"
            "You can track your global ranking, total points, and prediction accuracy on the **[Leaderboard](/leaderboard)** page.\n\n"
            "• Points are awarded automatically as soon as matches reach **Finished (FT)** status.\n"
            "• Ranks update in real-time based on cumulative points earned across all league matches."
        )
        suggestions = ["How does scoring work?", "Top picks today", "Browse fixtures"]
        return {"reply": reply, "suggestions": suggestions}

    # 5. Team or Match search
    team_results = search_team_matches(user_msg, db)
    if team_results:
        reply = (
            f"### ⚽ Match Lookup Results\n\n{team_results}\n\n"
            "You can view full match tactical analysis, lineup predictions, and head-to-head records on the **[Fixtures](/fixtures)** page."
        )
        suggestions = ["Show top picks today", "What matches are live?", "How to earn points"]
        return {"reply": reply, "suggestions": suggestions}

    # 6. Greetings & General Help
    if any(k in msg for k in ["hello", "hi", "hey", "help", "who are you", "what can you do"]):
        reply = (
            "👋 **Hello! I am your AI Football Predictor & Platform Supporter.**\n\n"
            "Here is what I can help you with:\n"
            "• 🎯 **Top AI Picks & Tips**: Find high-confidence value selections for upcoming games.\n"
            "• 🔴 **Live Match Tracking**: Get real-time scores and in-play updates.\n"
            "• 📊 **Tactical Analysis**: Check Elo ratings, form, and predicted scorelines for any team.\n"
            "• 🏆 **Platform Rules**: Explain how points, predictions, and leaderboards work.\n\n"
            "What would you like to explore today?"
        )
        suggestions = ["🎯 Show today's top picks", "🔴 What matches are live?", "🏆 How does scoring work?"]
        return {"reply": reply, "suggestions": suggestions}

    # Default fallback
    reply = (
        "I am here to support you with match predictions, live scores, and prediction platform guidance!\n\n"
        "You can ask me about:\n"
        "• Upcoming match predictions and highest confidence picks\n"
        "• Current live in-play games and scores\n"
        "• Specific team fixtures (e.g. *'Hull vs Manchester United'* or *'Real Madrid'*)\n"
        "• How prediction points and leaderboard scoring work"
    )
    suggestions = ["Top high-confidence picks", "What matches are live?", "How does scoring work?"]
    return {"reply": reply, "suggestions": suggestions}


@router.post("/", response_model=ChatResponse, dependencies=[Depends(chat_rate_limiter)])
def chat_with_supporter(payload: ChatRequest, db: Session = Depends(get_db)):
    """Receives user chat messages, parses intent with match context, and provides intelligent support."""
    try:
        res = generate_smart_reply(payload.message, db)
        return ChatResponse(reply=res["reply"], suggestions=res.get("suggestions", []))
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return ChatResponse(
            reply="I encountered a brief issue retrieving match details. Please feel free to ask about live matches, top predictions, or scoring rules!",
            suggestions=["Top picks today", "Live matches", "Scoring rules"],
        )
