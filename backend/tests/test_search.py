import unittest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.match import League, Team, Match
from app.api.matches import search_football_entities

class TestSearchEngine(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Seed test leagues
        self.pl = League(id=1, code="PL", name="Premier League", country="England", flag="🏴󠁧󠁢󠁥󠁮󠁧󠁿")
        self.pd = League(id=2, code="PD", name="Primera Division", country="Spain", flag="🇪🇸")
        self.cl = League(id=3, code="CL", name="UEFA Champions League", country="Europe", flag="🇪🇺")
        self.db.add_all([self.pl, self.pd, self.cl])
        self.db.flush()

        # Seed test teams
        self.arsenal = Team(id=1, external_id=57, name="Arsenal FC", short_name="Arsenal", tla="ARS", crest="https://crests/arsenal.png", elo_rating=1790.0)
        self.chelsea = Team(id=2, external_id=61, name="Chelsea FC", short_name="Chelsea", tla="CHE", crest="https://crests/chelsea.png", elo_rating=1630.0)
        self.man_utd = Team(id=3, external_id=66, name="Manchester United FC", short_name="Man United", tla="MUN", crest="https://crests/manutd.png", elo_rating=1620.0)
        self.barca = Team(id=4, external_id=81, name="FC Barcelona", short_name="Barcelona", tla="FCB", crest="https://crests/barca.png", elo_rating=1780.0)
        self.real = Team(id=5, external_id=86, name="Real Madrid CF", short_name="Real Madrid", tla="RMA", crest="https://crests/real.png", elo_rating=1830.0)
        self.db.add_all([self.arsenal, self.chelsea, self.man_utd, self.barca, self.real])
        self.db.flush()

        # Seed test matches
        now = datetime.now(timezone.utc)
        self.m1 = Match(
            id=101,
            league_id=self.pl.id,
            home_team_id=self.arsenal.id,
            away_team_id=self.chelsea.id,
            status="SCHEDULED",
            utc_date=now,
            ai_home_prob=52.0,
            ai_draw_prob=26.0,
            ai_away_prob=22.0,
            ai_predicted_home=2,
            ai_predicted_away=1,
            home_team=self.arsenal,
            away_team=self.chelsea,
            league=self.pl,
        )
        self.m2 = Match(
            id=102,
            league_id=self.pd.id,
            home_team_id=self.barca.id,
            away_team_id=self.real.id,
            status="SCHEDULED",
            utc_date=now,
            ai_home_prob=40.0,
            ai_draw_prob=28.0,
            ai_away_prob=32.0,
            ai_predicted_home=2,
            ai_predicted_away=2,
            home_team=self.barca,
            away_team=self.real,
            league=self.pd,
        )
        self.db.add_all([self.m1, self.m2])
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_team_case_insensitive_and_prefix(self):
        """Test case-insensitive and prefix search for teams."""
        # 1. Exact case
        res1 = search_football_entities(q="Arsenal", limit=15, db=self.db)
        self.assertTrue(any(t["name"] == "Arsenal FC" for t in res1["teams"]))

        # 2. Lowercase
        res2 = search_football_entities(q="arsenal", limit=15, db=self.db)
        self.assertTrue(any(t["name"] == "Arsenal FC" for t in res2["teams"]))

        # 3. Uppercase
        res3 = search_football_entities(q="ARSENAL", limit=15, db=self.db)
        self.assertTrue(any(t["name"] == "Arsenal FC" for t in res3["teams"]))

        # 4. Prefix
        res4 = search_football_entities(q="arse", limit=15, db=self.db)
        self.assertTrue(any(t["name"] == "Arsenal FC" for t in res4["teams"]))

    def test_team_alias_matching(self):
        """Test search with common football aliases (man utd, barca)."""
        # "man utd" should discover "Manchester United FC"
        res_utd = search_football_entities(q="man utd", limit=15, db=self.db)
        self.assertTrue(any("Manchester United" in t["name"] for t in res_utd["teams"]))

        # "barca" should discover "FC Barcelona"
        res_barca = search_football_entities(q="barca", limit=15, db=self.db)
        self.assertTrue(any("Barcelona" in t["name"] for t in res_barca["teams"]))

    def test_competition_search_and_alias(self):
        """Test search for leagues with partial names and aliases (premier, la liga, champions)."""
        # "premier" -> Premier League
        res_pl = search_football_entities(q="premier", limit=15, db=self.db)
        self.assertTrue(any("Premier League" in l["name"] for l in res_pl["leagues"]))

        # "la liga" -> Primera Division
        res_laliga = search_football_entities(q="la liga", limit=15, db=self.db)
        self.assertTrue(any("Primera Division" in l["name"] or l["code"] == "PD" for l in res_laliga["leagues"]))

        # "champions" -> UEFA Champions League
        res_cl = search_football_entities(q="champions", limit=15, db=self.db)
        self.assertTrue(any("Champions League" in l["name"] for l in res_cl["leagues"]))

    def test_multi_token_fixture_matching(self):
        """Test multi-word match searches like 'Arsenal Chelsea' or 'Barcelona Real Madrid'."""
        # "Arsenal Chelsea" should return match #101
        res_match1 = search_football_entities(q="Arsenal Chelsea", limit=15, db=self.db)
        self.assertTrue(len(res_match1["matches"]) > 0)
        self.assertEqual(res_match1["matches"][0].id, 101)

        # "Arsenal vs Chelsea" with "vs"
        res_match_vs = search_football_entities(q="Arsenal vs Chelsea", limit=15, db=self.db)
        self.assertTrue(len(res_match_vs["matches"]) > 0)
        self.assertEqual(res_match_vs["matches"][0].id, 101)

        # "Chelsea Arsenal" (reversed)
        res_match_rev = search_football_entities(q="Chelsea Arsenal", limit=15, db=self.db)
        self.assertTrue(len(res_match_rev["matches"]) > 0)
        self.assertEqual(res_match_rev["matches"][0].id, 101)

        # "Barcelona Real Madrid" should return match #102
        res_match2 = search_football_entities(q="Barcelona Real Madrid", limit=15, db=self.db)
        self.assertTrue(len(res_match2["matches"]) > 0)
        self.assertEqual(res_match2["matches"][0].id, 102)

    def test_edge_cases_and_unknown_queries(self):
        """Test whitespace padding and unknown queries."""
        # Leading/trailing whitespace
        res_ws = search_football_entities(q="   arsenal   ", limit=15, db=self.db)
        self.assertTrue(len(res_ws["teams"]) > 0)

        # Unknown query -> returns empty lists, no error
        res_unknown = search_football_entities(q="xyzabc123", limit=15, db=self.db)
        self.assertEqual(len(res_unknown["teams"]), 0)
        self.assertEqual(len(res_unknown["leagues"]), 0)
        self.assertEqual(len(res_unknown["matches"]), 0)

if __name__ == "__main__":
    unittest.main()
