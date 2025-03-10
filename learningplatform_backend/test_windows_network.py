#!/usr/bin/env python3
import subprocess
import json
import sys

def run_windows_command(command):
    """Run a command on the Windows host using PowerShell"""
    ps_command = f'powershell.exe -Command "{command}"'
    print(f"Running Windows command: {ps_command}")
    
    try:
        result = subprocess.run(ps_command, shell=True, capture_output=True, text=True)
        print(f"Exit code: {result.returncode}")
        
        if result.stdout:
            print(f"Output: {result.stdout}")
        
        if result.stderr:
            print(f"Error: {result.stderr}")
            
        return result
    except Exception as e:
        print(f"Error running Windows command: {str(e)}")
        return None

def test_health_windows():
    """Test the health endpoint using Windows PowerShell"""
    print("\nTesting health endpoint from Windows host...")
    command = """
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health/" -Method GET -UseBasicParsing
        "Status code: " + $response.StatusCode
        "Content: " + $response.Content
    } catch {
        "Error: " + $_.Exception.Message
    }
    """
    run_windows_command(command)
    
def test_login_windows(username, password):
    """Test login from Windows host"""
    print(f"\nTesting login with {username}/{password} from Windows host...")
    
    endpoints = [
        'http://localhost:8000/auth/login/',
        'http://localhost:8000/api/token/',
        'http://localhost:8000/token/'
    ]
    
    for endpoint in endpoints:
        print(f"\nTrying login at: {endpoint}")
        command = f"""
        try {{
            $body = ConvertTo-Json @{{
                username = "{username}"
                password = "{password}"
            }}
            $response = Invoke-WebRequest -Uri "{endpoint}" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
            "Status code: " + $response.StatusCode
            "Content: " + $response.Content
        }} catch {{
            "Error: " + $_.Exception.Message
            if ($_.Exception.Response) {{
                "Status code: " + $_.Exception.Response.StatusCode.value__
                try {{
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $reader.BaseStream.Position = 0
                    $reader.DiscardBufferedData()
                    $responseBody = $reader.ReadToEnd()
                    "Response body: " + $responseBody
                }} catch {{
                    "Could not read response body"
                }}
            }}
        }}
        """
        run_windows_command(command)

if __name__ == "__main__":
    test_health_windows()
    test_login_windows("admin", "adminpassword")
    test_login_windows("student", "student123")