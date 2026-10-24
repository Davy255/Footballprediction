"""
Tests for Coach AI Supporter Chatbot API
Verifies endpoint routes (/api/chat, /api/chat/, /api/chat/message),
payload compatibility, smart reply generation, and error resilience.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import unittest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.models.match import League, Team, Match
from app.api.chat import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    chat_with_supporter,
    get_chat_suggestions,
    generate_smart_reply,
)
from main import app


class TestChatbotEngine(unittest.TestCase):
    def setUp(self):
        # Use StaticPool and check_same_thread: False so TestClient worker threads share memory DB
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Seed sample league & teams
        self.league = League(id=2021, name="Premier League", code="PL", country="England")
        self.home_team = Team(id=65, name="Manchester City FC", short_name="Man City")
        self.away_team = Team(id=66, name="Manchester United FC", short_name="Man United")
        self.db.add_all([self.league, self.home_team, self.away_team])
        self.db.commit()

        # Override get_db dependency for TestClient
        def override_get_db():
            session = self.Session()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_smart_reply_scoring_rules(self):
        """Test asking about points or scoring returns detailed scoring table."""
        res = generate_smart_reply("how do i earn points and what are the rules?", self.db)
        self.assertIn("Scoring System", res["reply"])
        self.assertIn("Exact Score", res["reply"])
        self.assertIn("+5 Points", res["reply"])
        self.assertTrue(len(res["suggestions"]) > 0)

    def test_smart_reply_live_matches(self):
        """Test asking for live matches retrieves active games."""
        live_match = Match(
            id=101,
            league_id=2021,
            home_team_id=65,
            away_team_id=66,
            home_score=1,
            away_score=0,
            status="IN_PLAY",
            utc_date=datetime.now(timezone.utc),
        )
        self.db.add(live_match)
        self.db.commit()

        res = generate_smart_reply("what matches are live right now?", self.db)
        self.assertIn("Live Matches Tracking", res["reply"])
        self.assertIn("Manchester City FC", res["reply"])

    def test_smart_reply_top_picks(self):
        """Test asking for top picks or recommendations."""
        res = generate_smart_reply("give me today's top picks and value bets", self.db)
        self.assertIn("Top AI Match Predictions", res["reply"])

    def test_direct_payload_compatibility(self):
        """Test chat_with_supporter handles single message string payload."""
        req = ChatRequest(message="Hello Coach AI!")
        res = chat_with_supporter(req, self.db)
        self.assertIsInstance(res, ChatResponse)
        self.assertTrue(len(res.reply) > 10)
        self.assertTrue(len(res.suggestions) > 0)

    def test_messages_array_payload_compatibility(self):
        """Test chat_with_supporter handles messages list payload (frontend legacy)."""
        req = ChatRequest(
            messages=[
                ChatMessage(role="user", content="How does scoring work?"),
            ]
        )
        res = chat_with_supporter(req, self.db)
        self.assertIsInstance(res, ChatResponse)
        self.assertIn("Scoring System", res.reply)

    def test_empty_query_safe_fallback(self):
        """Test empty or whitespace input returns friendly greeting without crashing."""
        req = ChatRequest(message="   ")
        res = chat_with_supporter(req, self.db)
        self.assertIn("Coach AI", res.reply)

    def test_suggestions_endpoint(self):
        """Test chat suggestions endpoint returns default suggestions."""
        res = get_chat_suggestions()
        self.assertTrue(len(res.suggestions) >= 3)

    def test_http_endpoint_post_root(self):
        """Test POST /api/chat/ returns 200 with valid reply."""
        response = self.client.post("/api/chat/", json={"message": "how does scoring work?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reply", data)
        self.assertIn("Scoring System", data["reply"])
        self.assertIn("suggestions", data)

    def test_http_endpoint_post_no_slash(self):
        """Test POST /api/chat returns 200 without redirect."""
        response = self.client.post("/api/chat", json={"message": "hello"})
        self.assertEqual(response.status_code, 200)

    def test_http_endpoint_post_message_alias(self):
        """Test POST /api/chat/message returns 200."""
        response = self.client.post("/api/chat/message", json={"message": "top picks"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("reply", data)

    def test_http_endpoint_legacy_messages_format(self):
        """Test POST /api/chat/ with {messages: [{role: 'user', content: 'scoring'}]}."""
        response = self.client.post(
            "/api/chat/",
            json={"messages": [{"role": "user", "content": "how to earn points"}]},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("Scoring System", data["reply"])


if __name__ == "__main__":
    unittest.main()
