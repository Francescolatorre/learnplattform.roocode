#!/usr/bin/env python3
import subprocess
import sys

def run_powershell(command):
    """Run a basic PowerShell command"""
    ps_command = f'powershell.exe -Command "{command}"'
    print(f"Running: {ps_command}")
    result = subprocess.run(ps_command, shell=True, capture_output=True, text=True, encoding='latin1')
    print(f"Exit code: {result.returncode}")
    if result.stdout:
        print(f"Output:\n{result.stdout}")
    if result.stderr:
        print(f"Error:\n{result.stderr}")
    return result

def main():
    """Run basic connectivity tests"""
    # Simple check for WSL network connectivity
    run_powershell("Test-NetConnection -ComputerName localhost -Port 8000")
    
    # Try to directly access the health endpoint
    run_powershell("(Invoke-WebRequest -Uri 'http://localhost:8000/health/' -Method GET -UseBasicParsing).StatusCode")
    
    # Try curl from Windows
    run_powershell("curl http://localhost:8000/health/ --silent -i")
    
    # Check different login endpoints (just to see if they exist)
    endpoints = [
        'http://localhost:8000/auth/login/',
        'http://localhost:8000/api/token/',
        'http://localhost:8000/token/'
    ]
    
    for endpoint in endpoints:
        print(f"\nChecking if {endpoint} exists...")
        run_powershell(f"(Invoke-WebRequest -Uri '{endpoint}' -Method GET -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode")

if __name__ == "__main__":
    main()