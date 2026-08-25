import unittest
import time
from app.core.cache import BoundedTTLCache
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token


class TestFootballPredictCore(unittest.TestCase):
    def test_bounded_ttl_cache_capacity(self):
        """Test that BoundedTTLCache strictly caps entries and evicts oldest."""
        cache = BoundedTTLCache(max_size=3, default_ttl=60.0)
        cache.set("a", 1)
        cache.set("b", 2)
        cache.set("c", 3)
        self.assertEqual(cache.size(), 3)
        self.assertEqual(cache.get("a"), 1)

        # Adding 4th item should evict oldest un-accessed
        cache.set("d", 4)
        self.assertEqual(cache.size(), 3)
        self.assertIsNone(cache.get("b"))
        self.assertEqual(cache.get("d"), 4)

    def test_bounded_ttl_cache_expiration(self):
        """Test that expired entries return None."""
        cache = BoundedTTLCache(max_size=5, default_ttl=0.1)
        cache.set("temp", "value", ttl=0.05)
        self.assertEqual(cache.get("temp"), "value")
        time.sleep(0.08)
        self.assertIsNone(cache.get("temp"))

    def test_password_hashing(self):
        """Test bcrypt password hashing and verification."""
        password = "SecurePassword123!"
        hashed = get_password_hash(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_jwt_token_encoding(self):
        """Test JWT token generation and decoding."""
        user_id = "42"
        token = create_access_token({"sub": user_id})
        payload = decode_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload.get("sub"), user_id)

    def test_odds_normalization_logic(self):
        """Test mathematical margin normalization."""
        # Decimal odds: 2.00, 3.50, 4.00
        h_odds, d_odds, a_odds = 2.00, 3.50, 4.00
        raw_h = 1 / h_odds  # 0.50
        raw_d = 1 / d_odds  # 0.2857
        raw_a = 1 / a_odds  # 0.25
        total_overround = raw_h + raw_d + raw_a  # 1.0357

        norm_h = (raw_h / total_overround) * 100
        norm_d = (raw_d / total_overround) * 100
        norm_a = (raw_a / total_overround) * 100

        self.assertAlmostEqual(norm_h + norm_d + norm_a, 100.0, places=1)


if __name__ == "__main__":
    unittest.main()
