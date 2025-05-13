#!/usr/bin/env python3
"""
Health endpoint test suite for the Learning Platform.

This module contains comprehensive tests for the health check endpoint
and basic API functionality, ensuring the system is properly configured
and operational.
"""

import json
import urllib.error
import urllib.request


def check_health():
    """
    Checks the health of the server by making a request to the health endpoint.

    Returns:
        bool: True if the health check is successful, False otherwise.
    """
    try:
        with urllib.request.urlopen("http://localhost:8000/health/") as response:
            result = json.loads(response.read().decode("utf-8"))
            print("Server health check successful!")
            print(f"Status: {result.get('status', 'N/A')}")
            print(f"Message: {result.get('message', 'N/A')}")
            return True
    except urllib.error.HTTPError as e:
        print(f"Health check failed with status code: {e.code}")
        print(e.read().decode("utf-8"))
        return False
    except urllib.error.URLError as e:
        print(f"Health check failed to connect: {e.reason}")
        return False


def try_login(username, password):
    """
    Attempts to log in to the server using the provided credentials.

    Args:
        username (str): The username to log in with.
        password (str): The password to log in with.

    Returns:
        bool: True if the login is successful, False otherwise.
    """
    data = json.dumps({"username": username, "password": password}).encode("utf-8")

    # Try multiple possible login endpoints
    endpoints = [
        "http://localhost:8000/auth/login/",
        "http://localhost:8000/api/token/",
        "http://localhost:8000/api/auth/login/",
        "http://localhost:8000/api/login/",
        "http://localhost:8000/token/",
    ]

    for endpoint in endpoints:
        print(f"\nTrying login at: {endpoint}")
        req = urllib.request.Request(
            endpoint,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode("utf-8"))
                print("Login successful!")
                print(f"Response data: {result}")
                return True
        except urllib.error.HTTPError as e:
            print(f"Login failed with status code: {e.code}")
            try:
                error_content = e.read().decode("utf-8")
                print(f"Error details: {error_content}")
            except:
                print("Could not decode error response")
        except urllib.error.URLError as e:
            print(f"Connection failed: {e.reason}")
        except Exception as e:
            print(f"Other error: {str(e)}")

    return False


if __name__ == "__main__":
    # First check server health
    health_ok = check_health()
    print(f"Health check passed: {health_ok}")

    # Now try login
    print("\nAttempting login...")
    login_ok = try_login("admin", "adminpassword")
    print(f"Login successful: {login_ok}")

    # Try with student credentials too
    if not login_ok:
        print("\nTrying with student credentials...")
        login_ok = try_login("student", "student123")
