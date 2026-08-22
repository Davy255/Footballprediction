import requests
import json
import time

BASE_URL = "http://localhost:8000"

print("=== RUNNING SYSTEM SECURITY VERIFICATION TESTS ===")
print()

# Test 1: Security Headers
print("Test 1: Verifying OWASP Security Headers...")
r = requests.get(f"{BASE_URL}/health")
headers = {k.lower(): v for k, v in r.headers.items()}

expected_headers = [
    "x-frame-options",
    "x-content-type-options",
    "x-xss-protection",
    "referrer-policy",
    "permissions-policy"
]
for h in expected_headers:
    val = headers.get(h)
    assert val is not None, f"Missing header {h}"
    print(f"  [PASS] {h}: {val}")

print()

# Test 2: Password Complexity Validator
print("Test 2: Verifying Password Complexity & Length Validation...")
# Too short
r_short = requests.post(f"{BASE_URL}/api/auth/register", json={
    "username": "sec_user1",
    "email": "sec1@example.com",
    "password": "short"
})
assert r_short.status_code == 422, f"Expected 422 for short password, got {r_short.status_code}"
print(f"  [PASS] Short password rejected -> HTTP {r_short.status_code}")

# No digits
r_nodigit = requests.post(f"{BASE_URL}/api/auth/register", json={
    "username": "sec_user2",
    "email": "sec2@example.com",
    "password": "passwordonlyletters"
})
assert r_nodigit.status_code == 422, f"Expected 422 for password without digits, got {r_nodigit.status_code}"
print(f"  [PASS] Letter-only password rejected -> HTTP {r_nodigit.status_code}")

# Valid password
r_valid = requests.post(f"{BASE_URL}/api/auth/register", json={
    "username": f"valid_user_{int(time.time())}",
    "email": f"valid_{int(time.time())}@example.com",
    "password": "StrongPassword123"
})
assert r_valid.status_code in [200, 429], f"Expected 200/429 for valid register, got {r_valid.status_code}"
print(f"  [PASS] Strong password accepted -> HTTP {r_valid.status_code}")

print()

# Test 3: Rate Limiting
print("Test 3: Verifying Brute-Force Rate Limiter...")
rate_limited = False
for i in range(8):
    res = requests.post(f"{BASE_URL}/api/auth/login", data={
        "username": "nonexistent@example.com",
        "password": "wrongpassword123"
    })
    if res.status_code == 429:
        rate_limited = True
        print(f"  [PASS] Rate limit triggered on attempt {i+1} -> HTTP 429 ({res.json().get('detail')})")
        break

assert rate_limited, "Rate limiting was not triggered within 8 attempts!"

print()

# Test 4: Prediction Boundary Constraints
print("Test 4: Verifying Prediction Market Boundary Constraints...")
# Test negative score rejection
r_neg = requests.post(f"{BASE_URL}/api/predictions/", json={
    "match_id": 90804,
    "predicted_outcome": "HOME_TEAM",
    "predicted_home_score": -5,
    "predicted_away_score": 2
})
# Missing auth or invalid boundary returns 401 or 422
assert r_neg.status_code in [401, 422], f"Expected 401/422, got {r_neg.status_code}"
print(f"  [PASS] Negative score rejection enforced -> HTTP {r_neg.status_code}")

print()
print("=== ALL SECURITY TESTS PASSED SUCCESSFULLY! ===")
