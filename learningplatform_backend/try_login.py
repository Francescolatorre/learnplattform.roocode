#!/usr/bin/env python3
import json
import subprocess
import sys


def run_powershell(command):
    """Run a PowerShell command and return the result"""
    ps_command = f'powershell.exe -Command "{command}"'
    print(f"Running: {ps_command}")
    result = subprocess.run(ps_command, shell=True, capture_output=True, text=True, encoding='latin1')
    print(f"Exit code: {result.returncode}")
    if result.stdout:
        print(f"Output:\n{result.stdout}")
    if result.stderr:
        print(f"Error:\n{result.stderr}")
    return result

def try_login(username, password):
    """Try to login with the given credentials"""
    print(f"\nAttempting login with {username}:{password}...")
    
    # Prepare the PowerShell command to attempt a login
    command = f"""
    try {{
        # Prepare the login data
        $body = @{{
            username = '{username}'
            password = '{password}'
        }} | ConvertTo-Json
        
        # Make the login request
        $response = Invoke-WebRequest -Uri 'http://localhost:8000/auth/login/' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
        
        # Show the response if successful
        "Status code: " + $response.StatusCode
        "Content: " + $response.Content
    }}
    catch {{
        # Show error details if the request fails
        "Error: " + $_.Exception.Message
        if ($_.Exception.Response) {{
            "Status code: " + $_.Exception.Response.StatusCode.value__
            
            # Try to get the response body for more details
            try {{
                $responseStream = $_.Exception.Response.GetResponseStream()
                $streamReader = New-Object System.IO.StreamReader($responseStream)
                $errorResponse = $streamReader.ReadToEnd()
                "Response body: " + $errorResponse
            }}
            catch {{
                "Could not read response body: " + $_.Exception.Message
            }}
        }}
    }}
    """
    
    # Use single quotes for the command to prevent issues with escaping
    command = command.replace('"', '`"')
    run_powershell(command)

if __name__ == "__main__":
    # Try with different credentials
    credentials = [
        ("admin", "adminpassword"),
        ("student", "student123"),
        ("instructor", "instructor123")
    ]
    
    for username, password in credentials:
        try_login(username, password)