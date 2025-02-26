#!/usr/bin/env python
"""
Script to test if the Django server can start and if all endpoints work correctly.
"""
import os
import sys
import time
import subprocess
import requests
import json
import signal
from urllib.parse import urljoin

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = urljoin(BASE_URL, "/api/v1/")
SERVER_STARTUP_TIMEOUT = 10  # seconds

# Endpoints to test
ENDPOINTS = [
    {"url": "auth/login/", "method": "POST", "data": {"username": "admin", "password": "admin"}, "auth": False},
    {"url": "courses/", "method": "GET", "data": None, "auth": True},
    # Add more endpoints as needed
]

def is_server_running():
    """Check if the Django server is already running."""
    try:
        response = requests.get(BASE_URL, timeout=2)
        return True
    except requests.exceptions.ConnectionError:
        return False

def start_server():
    """Start the Django server."""
    print("Starting Django server...")
    server_process = subprocess.Popen(
        ["python", "manage.py", "runserver"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    # Wait for server to start
    start_time = time.time()
    while not is_server_running():
        if time.time() - start_time > SERVER_STARTUP_TIMEOUT:
            print("Server failed to start within timeout period.")
            server_process.terminate()
            sys.exit(1)
        time.sleep(0.5)
    
    print("Server started successfully.")
    return server_process

def test_endpoints():
    """Test all endpoints and return the results."""
    results = []
    auth_token = None
    
    for endpoint in ENDPOINTS:
        url = urljoin(API_BASE, endpoint["url"])
        method = endpoint["method"]
        data = endpoint["data"]
        requires_auth = endpoint["auth"]
        
        headers = {}
        if requires_auth and auth_token:
            headers["Authorization"] = f"Token {auth_token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=5)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=5)
            else:
                results.append({
                    "endpoint": endpoint["url"],
                    "status": "SKIPPED",
                    "reason": f"Unsupported method: {method}"
                })
                continue
            
            # Store auth token if this is a login endpoint
            if endpoint["url"] == "auth/login/" and response.status_code == 200:
                try:
                    auth_token = response.json().get("token")
                except json.JSONDecodeError:
                    pass
            
            results.append({
                "endpoint": endpoint["url"],
                "status": "SUCCESS" if response.status_code < 400 else "FAILED",
                "status_code": response.status_code,
                "response": response.text[:100] + "..." if len(response.text) > 100 else response.text
            })
        except Exception as e:
            results.append({
                "endpoint": endpoint["url"],
                "status": "ERROR",
                "reason": str(e)
            })
    
    return results

def main():
    """Main function to run the tests."""
    server_process = None
    
    try:
        # Check if server is already running
        if not is_server_running():
            server_process = start_server()
        else:
            print("Server is already running.")
        
        # Test endpoints
        print("\nTesting endpoints...")
        results = test_endpoints()
        
        # Print results
        print("\nTest Results:")
        print("=" * 80)
        for result in results:
            status_color = "\033[92m" if result["status"] == "SUCCESS" else "\033[91m"  # Green for success, red for failure
            print(f"{status_color}{result['status']}\033[0m - {result['endpoint']}")
            if "status_code" in result:
                print(f"  Status Code: {result['status_code']}")
            if "reason" in result:
                print(f"  Reason: {result['reason']}")
            if "response" in result:
                print(f"  Response: {result['response']}")
            print("-" * 80)
        
        # Summary
        success_count = sum(1 for r in results if r["status"] == "SUCCESS")
        print(f"\nSummary: {success_count}/{len(results)} endpoints successful")
        
    finally:
        # Clean up
        if server_process:
            print("\nStopping server...")
            server_process.terminate()
            server_process.wait()
            print("Server stopped.")

if __name__ == "__main__":
    main()
