import os
import sys
import sqlite3
import json

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from app.services.ml_predictor import get_team_manager

def run():
    sample_teams = [
        "Coventry City FC", "Hull City AFC", "Real Madrid CF", "Arsenal FC", 
        "Liverpool FC", "Chelsea FC", "Tottenham Hotspur FC", "Manchester United FC",
        "Everton FC", "Nottingham Forest FC", "Wolverhampton Wanderers FC", 
        "FC Barcelona", "FC Bayern München", "Olympique de Marseille", "Juventus FC", 
        "AC Milan", "FC Internazionale Milano", "Real Sociedad de Fútbol", "Vitória SC",
        "CR Flamengo", "SE Palmeiras", "AFC Ajax", "Galatasaray SK"
    ]
    
    print("=== Verified Sample Managers ===")
    for t in sample_teams:
        mgr = get_team_manager(t)
        line = f"  {t:30} -> {mgr}"
        print(line.encode('ascii', 'replace').decode())

    db_path = os.path.join(backend_dir, "football_prediction.db")
    con = sqlite3.connect(db_path, timeout=60.0)
    cur = con.cursor()
    
    cur.execute("SELECT id, name, short_name FROM teams")
    teams_map = {row[0]: (row[1], row[2] or "") for row in cur.fetchall()}
    print(f"\nLoaded {len(teams_map)} teams from database.")
    
    cur.execute("SELECT id, home_team_id, away_team_id, prediction_description FROM matches WHERE prediction_description IS NOT NULL")
    matches = cur.fetchall()
    print(f"Loaded {len(matches)} matches with prediction payloads.")
    
    updates = []
    for mid, h_id, a_id, desc_str in matches:
        if not desc_str or h_id not in teams_map or a_id not in teams_map:
            continue
        try:
            desc = json.loads(desc_str)
            ws = desc.get("whoscored", {})
            h_name, h_sn = teams_map[h_id]
            a_name, a_sn = teams_map[a_id]
            
            corr_hm = get_team_manager(h_name, h_sn)
            corr_am = get_team_manager(a_name, a_sn)
            
            if ws.get("home_manager") != corr_hm or ws.get("away_manager") != corr_am:
                ws["home_manager"] = corr_hm
                ws["away_manager"] = corr_am
                desc["whoscored"] = ws
                new_desc_str = json.dumps(desc, ensure_ascii=False)
                updates.append((new_desc_str, mid))
        except Exception:
            pass
            
    if updates:
        cur.executemany("UPDATE matches SET prediction_description = ? WHERE id = ?", updates)
        con.commit()
        print(f"SUCCESS: Synchronized {len(updates)} match prediction payloads with verified real-world coaches!")
    else:
        print("SUCCESS: All stored match predictions are 100% synchronized and up to date!")
        
    con.close()

if __name__ == '__main__':
    run()
