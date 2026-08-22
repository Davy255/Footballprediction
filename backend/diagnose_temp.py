from app.core.database import SessionLocal
from app.models.match import Match, League, Team
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import joinedload
from sqlalchemy import func

db = SessionLocal()
now = datetime.now(timezone.utc)
today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
today_end = today_start + timedelta(days=1)

print("=== NOW (UTC):", now.strftime("%Y-%m-%d %H:%M:%S"), "===")
print()

# Today's matches
todays = db.query(Match).options(
    joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league)
).filter(Match.utc_date >= today_start, Match.utc_date <= today_end).order_by(Match.utc_date).all()

print("=== TODAY MATCHES (" + str(len(todays)) + ") ===")
for m in todays:
    ht = m.home_team.name if m.home_team else "?"
    at = m.away_team.name if m.away_team else "?"
    lg = m.league.name if m.league else "?"
    print("  ID=" + str(m.id) + " ext=" + str(m.external_id) + " [" + m.status + "] " + str(m.utc_date) + " | " + ht + " vs " + at + " | " + lg + " | season=" + str(m.season))

print()

# Live matches
live = db.query(Match).options(
    joinedload(Match.home_team), joinedload(Match.away_team), joinedload(Match.league)
).filter(Match.status.in_(["LIVE","IN_PLAY","PAUSED","HALFTIME"])).order_by(Match.utc_date).all()

print("=== LIVE MATCHES (" + str(len(live)) + ") ===")
for m in live:
    ht = m.home_team.name if m.home_team else "?"
    at = m.away_team.name if m.away_team else "?"
    lg = m.league.name if m.league else "?"
    print("  ID=" + str(m.id) + " ext=" + str(m.external_id) + " [" + m.status + "] " + str(m.utc_date) + " | " + ht + " " + str(m.home_score) + "-" + str(m.away_score) + " " + at + " | " + lg + " | season=" + str(m.season))

print()

# Duplicate check
print("=== DUPLICATE SAME MATCHUP (same home+away pair, more than 1 row) ===")
dupes = db.query(
    Match.home_team_id, Match.away_team_id, func.count(Match.id).label("cnt")
).group_by(Match.home_team_id, Match.away_team_id).having(func.count(Match.id) > 5).limit(20).all()
for d in dupes:
    ht = db.query(Team).filter(Team.id == d.home_team_id).first()
    at = db.query(Team).filter(Team.id == d.away_team_id).first()
    print("  x" + str(d.cnt) + ": " + (ht.name if ht else str(d.home_team_id)) + " vs " + (at.name if at else str(d.away_team_id)))

# Same external_id appearing more than once
print()
print("=== DUPLICATE EXTERNAL_IDs ===")
ext_dupes = db.query(
    Match.external_id, func.count(Match.id).label("cnt")
).filter(Match.external_id != None).group_by(Match.external_id).having(func.count(Match.id) > 1).limit(20).all()
print("Duplicate external_ids:", len(ext_dupes))
for d in ext_dupes[:5]:
    print("  ext_id=" + str(d.external_id) + " appears " + str(d.cnt) + " times")

print()
null_ext = db.query(Match).filter(Match.external_id == None).count()
print("Matches with NULL external_id:", null_ext)
print()
print("=== STATUS DISTRIBUTION ===")
for status in ["SCHEDULED","TIMED","IN_PLAY","PAUSED","HALFTIME","LIVE","FINISHED","CANCELLED","POSTPONED"]:
    cnt = db.query(Match).filter(Match.status == status).count()
    if cnt > 0:
        print("  " + status + ": " + str(cnt))

db.close()
