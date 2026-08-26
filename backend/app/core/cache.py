"""
Thread-safe, Bounded In-Memory LRU Cache with TTL.
Strictly caps memory usage to prevent Render memory-limit incidents.
"""
import time
from collections import OrderedDict
from threading import Lock
from typing import Any, Optional, Tuple


class BoundedTTLCache:
    def __init__(self, max_size: int = 500, default_ttl: float = 180.0):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._store: OrderedDict[str, Tuple[float, float, Any]] = OrderedDict()  # key -> (created_at, ttl, value)
        self._lock = Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._store:
                return None
            created_at, ttl, value = self._store[key]
            if time.time() - created_at > ttl:
                del self._store[key]
                return None
            self._store.move_to_end(key)
            return value

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        with self._lock:
            actual_ttl = ttl if ttl is not None else self.default_ttl
            if key in self._store:
                self._store.move_to_end(key)
            self._store[key] = (time.time(), actual_ttl, value)
            while len(self._store) > self.max_size:
                self._store.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        with self._lock:
            return len(self._store)


# Global Bounded Cache Instances with high-performance production TTLs
feed_cache = BoundedTTLCache(max_size=100, default_ttl=180.0)        # 3 minutes for unified feed
league_cache = BoundedTTLCache(max_size=50, default_ttl=600.0)       # 10 minutes for leagues
standings_cache = BoundedTTLCache(max_size=50, default_ttl=600.0)    # 10 minutes for standings
prediction_mem_cache = BoundedTTLCache(max_size=1000, default_ttl=3600.0) # 1 hour for predictions
