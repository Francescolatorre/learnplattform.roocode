#!/usr/bin/env python3
import json
import sys
import urllib.parse
import urllib.request


def test_endpoint(url, method='GET', data=None, headers=None):
    """Test any endpoint and return the response"""
    if headers is None:
        headers = {}
    
    print(f"Testing endpoint: {url} with method: {method}")
    
    if data and isinstance(data, dict):
        data = json.dumps(data).encode('utf-8')
        if 'Content-Type' not in headers:
            headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method=method
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            print(f"Success! Status: {response.status}")
            return content
    except urllib.error.HTTPError as e:
        print(f"Failed with status code: {e.code}")
        content = e.read().decode('utf-8')
        print(f"Response content: {content}")
        return None
    except urllib.error.URLError as e:
        print(f"Connection failed: {e.reason}")
        return None

def test_login(username, password):
    """Try different login endpoints"""
    credentials = {"username": username, "password": password}
    
    # Try different possible endpoints
    endpoints = [
        'http://localhost:8000/auth/login/',
        'http://localhost:8000/api/token/',
        'http://localhost:8000/api/auth/login/',
        'http://localhost:8000/api/login/'
    ]
    
    for endpoint in endpoints:
        print(f"\nAttempting login at: {endpoint}")
        response = test_endpoint(endpoint, 'POST', credentials)
        if response:
            try:
                result = json.loads(response)
                print("Login successful!")
                print(f"Response data: {json.dumps(result, indent=2)[:200]}...")
                if 'access' in result:
                    print(f"Access token: {result.get('access', 'N/A')[:20]}...")
                if 'refresh' in result:
                    print(f"Refresh token: {result.get('refresh', 'N/A')[:20]}...")
                return True
            except json.JSONDecodeError:
                print("Received non-JSON response.")
    
    return False

def check_health():
    """Test the health endpoint"""
    print("\nChecking server health endpoint...")
    response = test_endpoint('http://localhost:8000/health/')
    if response:
        try:
            result = json.loads(response)
            print(f"Health check successful: {json.dumps(result, indent=2)}")
            return True
        except json.JSONDecodeError:
            print("Received non-JSON response from health endpoint.")
    return False

def check_api_root():
    """Test the API root to discover available endpoints"""
    print("\nChecking API root...")
    response = test_endpoint('http://localhost:8000/api/v1/')
    if response:
        try:
            result = json.loads(response)
            print(f"API root response: {json.dumps(result, indent=2)}")
            return True
        except json.JSONDecodeError:
            print("Received non-JSON response from API root.")
    return False

if __name__ == "__main__":
    username = "admin"
    password = "adminpassword"
    
    if len(sys.argv) > 2:
        username = sys.argv[1]
        password = sys.argv[2]
    
    print(f"Testing login with username: {username}, password: {password}")
    
    # First check health and API endpoints to confirm server is running
    check_health()
    check_api_root()
    
    # Try login
    test_login(username, password)