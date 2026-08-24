import httpx
import asyncio
from typing import Optional, Dict, Any, List
from app.core.config import settings

API_FOOTBALL_BASE_URL = getattr(settings, "API_FOOTBALL_BASE_URL", "https://v3.football.api-sports.io")
API_FOOTBALL_KEY = getattr(settings, "API_FOOTBALL_KEY", "")

async def fetch_fixture_lineups(fixture_id: int) -> Optional[Dict[str, Any]]:
    """Fetch official match lineups from API-Football (v3.football.api-sports.io)."""
    if not API_FOOTBALL_KEY:
        return None

    headers = {
        "x-apisports-key": API_FOOTBALL_KEY,
    }
    
    url = f"{API_FOOTBALL_BASE_URL}/fixtures/lineups"
    params = {"fixture": fixture_id}
    
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            data = resp.json()
            response_list = data.get("response", [])
            if not response_list or len(response_list) < 2:
                return None

            home_raw = response_list[0]
            away_raw = response_list[1]

            def parse_team_lineup(raw: Dict[str, Any], is_home: bool) -> Dict[str, Any]:
                team_name = raw.get("team", {}).get("name", "Team")
                formation = raw.get("formation", "4-2-3-1")
                starting_xi = []
                for p in raw.get("startXI", []):
                    player_info = p.get("player", {})
                    starting_xi.append({
                        "name": player_info.get("name"),
                        "number": player_info.get("number", 0),
                        "pos": player_info.get("pos", "MF"),
                        "grid": player_info.get("grid"),
                        "rating": 7.0,
                    })
                
                bench = []
                for p in raw.get("substitutes", []):
                    player_info = p.get("player", {})
                    bench.append({
                        "name": player_info.get("name"),
                        "number": player_info.get("number", 0),
                        "pos": player_info.get("pos", "MF"),
                        "rating": 6.8,
                    })

                return {
                    "team": team_name,
                    "formation": formation,
                    "is_home": is_home,
                    "starting_xi": starting_xi,
                    "bench": bench,
                    "coach": raw.get("coach", {}).get("name"),
                }

            return {
                "home": parse_team_lineup(home_raw, True),
                "away": parse_team_lineup(away_raw, False),
            }
        except Exception as e:
            print(f"Error fetching official lineups from API-Football: {e}")
            return None
