#!/usr/bin/env python3
import json
import urllib.error
import urllib.parse
import urllib.request


class ApiTest:
    """Base class for API testing with support for JWT authentication"""

    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None

    def login(self, username, password):
        """Authenticate and store the JWT token"""
        data = json.dumps({"username": username, "password": password}).encode("utf-8")

        try:
            req = urllib.request.Request(
                f"{self.base_url}/auth/login/",
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode("utf-8"))
                self.access_token = result.get("access")
                self.refresh_token = result.get("refresh")
                print(f"Successfully authenticated as {username}")
                return True
        except urllib.error.HTTPError as e:
            print(f"Login failed with status code: {e.code}")
            print(e.read().decode("utf-8"))
            return False

    def get(self, endpoint, auth=True):
        """Make a GET request to the specified endpoint"""
        headers = {}
        if auth and self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"

        try:
            req = urllib.request.Request(
                f"{self.base_url}{endpoint}", headers=headers, method="GET"
            )

            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            print(f"GET {endpoint} failed with status code: {e.code}")
            print(e.read().decode("utf-8"))
            return None

    def post(self, endpoint, data, auth=True):
        """Make a POST request to the specified endpoint"""
        headers = {"Content-Type": "application/json"}
        if auth and self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"

        try:
            req = urllib.request.Request(
                f"{self.base_url}{endpoint}",
                data=json.dumps(data).encode("utf-8"),
                headers=headers,
                method="POST",
            )

            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            print(f"POST {endpoint} failed with status code: {e.code}")
            print(e.read().decode("utf-8"))
            return None


def run_tests():
    """Run a series of API tests to validate backend functionality"""

    api = ApiTest()
    tests_passed = 0
    tests_failed = 0

    # Test 1: Health Check
    print("\n=== Test 1: Health Check ===")
    try:
        health_result = api.get("/health/", auth=False)
        if health_result and health_result.get("status") == "healthy":
            print("✅ Health check passed")
            tests_passed += 1
        else:
            print("❌ Health check failed")
            tests_failed += 1
    except Exception as e:
        print(f"❌ Health check failed with exception: {str(e)}")
        tests_failed += 1

    # Test 2: Authentication
    print("\n=== Test 2: Authentication ===")
    if api.login("admin", "adminpassword"):
        print("✅ Authentication test passed")
        tests_passed += 1
    else:
        print("❌ Authentication test failed")
        tests_failed += 1

    # Test 3: Token Validation
    print("\n=== Test 3: Token Validation ===")
    try:
        validate_result = api.get("/auth/validate-token/")
        if validate_result and validate_result.get("detail") == "Token is valid.":
            print("✅ Token validation test passed")
            tests_passed += 1
        else:
            print("❌ Token validation test failed")
            tests_failed += 1
    except Exception as e:
        print(f"❌ Token validation test failed with exception: {str(e)}")
        tests_failed += 1

    # Test 4: Fetch Courses
    print("\n=== Test 4: Fetch Courses ===")
    try:
        courses = api.get("/api/v1/courses/")
        if courses and isinstance(courses.get("results", []), list):
            print(
                f"✅ Successfully retrieved {len(courses.get('results', []))} courses"
            )
            tests_passed += 1
        else:
            print("❌ Failed to retrieve courses")
            tests_failed += 1
    except Exception as e:
        print(f"❌ Courses test failed with exception: {str(e)}")
        tests_failed += 1

    # Test 5: User Profile
    print("\n=== Test 5: User Profile ===")
    try:
        profile = api.get("/users/profile/")
        if profile and profile.get("username") == "admin":
            print("✅ Successfully retrieved user profile")
            tests_passed += 1
        else:
            print("❌ Failed to retrieve user profile")
            tests_failed += 1
    except Exception as e:
        print(f"❌ User profile test failed with exception: {str(e)}")
        tests_failed += 1

    # Summary
    print("\n=== Test Summary ===")
    print(f"Tests Passed: {tests_passed}")
    print(f"Tests Failed: {tests_failed}")
    print(f"Overall Result: {'PASSED' if tests_failed == 0 else 'FAILED'}")


if __name__ == "__main__":
    run_tests()
