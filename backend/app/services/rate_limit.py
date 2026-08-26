from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock


class RateLimitExceeded(RuntimeError):
    def __init__(self, retry_after: int) -> None:
        super().__init__("Rate limit exceeded")
        self.retry_after = max(1, retry_after)


class InMemoryRateLimiter:
    """Process-local sliding-window limiter suitable for a single free-tier instance."""

    def __init__(self) -> None:
        self._buckets: dict[tuple[str, str], deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, identity: str, scope: str, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        cutoff = now - window_seconds
        bucket_key = (scope, identity)
        with self._lock:
            bucket = self._buckets[bucket_key]
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if len(bucket) >= limit:
                retry_after = int(window_seconds - (now - bucket[0])) + 1
                raise RateLimitExceeded(retry_after)
            bucket.append(now)

    def clear(self) -> None:
        with self._lock:
            self._buckets.clear()

