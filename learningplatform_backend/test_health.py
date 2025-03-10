#!/usr/bin/env python3
import urllib.request
import urllib.error
import json

def check_health():
    try:
        with urllib.request.urlopen('http://localhost:8000/health/') as response:
            result = json.loads(response.read().decode('utf-8'))
            print("Server health check successful!")
            print(f"Status: {result.get('status', 'N/A')}")
            print(f"Message: {result.get('message', 'N/A')}")
            return True
    except urllib.error.HTTPError as e:
        print(f"Health check failed with status code: {e.code}")
        print(e.read().decode('utf-8'))
        return False
    except urllib.error.URLError as e:
        print(f"Health check failed to connect: {e.reason}")
        return False

def try_login(username, password):
    data = json.dumps({"username": username, "password": password}).encode('utf-8')
    
    # Try multiple possible login endpoints
    endpoints = [
        'http://localhost:8000/auth/login/',
        'http://localhost:8000/api/token/',
        'http://localhost:8000/api/auth/login/',
        'http://localhost:8000/api/login/',
        'http://localhost:8000/token/'
    ]
    
    for endpoint in endpoints:
        print(f"\nTrying login at: {endpoint}")
        req = urllib.request.Request(
            endpoint,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                print("Login successful!")
                print(f"Response data: {result}")
                return True
        except urllib.error.HTTPError as e:
            print(f"Login failed with status code: {e.code}")
            try:
                error_content = e.read().decode('utf-8')
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