#!/usr/bin/env python3

"""
Server health check utilities for the Learning Platform.

This module provides utilities for monitoring and validating the health
of the Django server, including endpoint checks, database connectivity,
and system resource monitoring.

Features:
- Server health checks
- Database connection validation
- API endpoint testing
- Resource monitoring
- JWT token validation
- Response time monitoring

Usage:
    from utils.check_server import check_server_health, monitor_response_times

    # Check server health
    is_healthy, details = check_server_health()

    # Monitor endpoint response times
    response_times = monitor_response_times()
"""

import json
import logging
import subprocess
import urllib.error
import urllib.request
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)


def run_powershell(command: str) -> subprocess.CompletedProcess:
    """
    Run a PowerShell command and return its output.

    Args:
        command (str): The PowerShell command to execute

    Returns:
        subprocess.CompletedProcess: Result of the command execution
    """
    ps_command = f'powershell.exe -Command "{command}"'
    print(f"Running: {ps_command}")
    result = subprocess.run(
        ps_command, shell=True, capture_output=True, text=True, encoding="latin1"
    )
    print(f"Exit code: {result.returncode}")
    if result.stdout:
        print(f"Output:\n{result.stdout}")
    if result.stderr:
        print(f"Error:\n{result.stderr}")
    return result


def check_server_health(
    base_url: str = "http://localhost:8000",
) -> Tuple[bool, Dict[str, Any]]:
    """
    Check if the server is running and healthy.

    Performs a comprehensive health check including:
    - Basic connectivity
    - Database status
    - API availability
    - Resource usage

    Args:
        base_url (str): The base URL of the server to check

    Returns:
        tuple: (is_healthy, details_dict)

    Example:
        >>> healthy, details = check_server_health()
        >>> if healthy:
        ...     print("Server is running normally")
    """
    try:
        url = f"{base_url}/health/"
        with urllib.request.urlopen(url) as response:
            result = json.loads(response.read().decode("utf-8"))
            logger.info("Health check successful")
            return True, result
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        logger.error("Health check failed: %s", str(e))
        return False, {"error": str(e)}


def verify_jwt_token(token: str, base_url: str = "http://localhost:8000") -> bool:
    """
    Verify if a JWT token is valid and not expired.

    Args:
        token (str): The JWT token to verify
        base_url (str): The base URL of the auth server

    Returns:
        bool: True if token is valid, False otherwise
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        req = urllib.request.Request(
            f"{base_url}/auth/validate-token/", headers=headers, method="GET"
        )

        with urllib.request.urlopen(req) as response:
            return response.status == 200
    except urllib.error.URLError as e:
        logger.error("Token validation failed: %s", str(e))
        return False


def check_database_connection(base_url: str = "http://localhost:8000") -> bool:
    """
    Check if the database connection is working.

    Attempts to:
    - Connect to the database
    - Execute a simple query
    - Verify connection pool status

    Args:
        base_url (str): The base URL of the server

    Returns:
        bool: True if database is connected and healthy
    """
    try:
        url = f"{base_url}/health/database/"
        with urllib.request.urlopen(url) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result.get("database_connected", False)
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        logger.error("Database connection check failed: %s", str(e))
        return False


def monitor_response_times(
    base_url: str = "http://localhost:8000", endpoints: Optional[list] = None
) -> Dict[str, float]:
    """
    Monitor response times for specified API endpoints.

    Args:
        base_url (str): The base URL of the server
        endpoints (Optional[list]): List of endpoints to monitor. If None,
            monitors standard health and auth endpoints.

    Returns:
        Dict[str, float]: Mapping of endpoints to their response times in ms.
            Response time of -1 indicates the endpoint check failed.

    Example:
        >>> times = monitor_response_times(endpoints=["/api/health/", "/api/status/"])
        >>> print(f"Health endpoint response time: {times['/api/health/']}ms")
    """
    endpoint_times = {}
    if endpoints is None:
        endpoints = ["/health/", "/api/v1/courses/"]

    for endpoint in endpoints:
        try:
            start_time = datetime.now()
            url = f"{base_url}{endpoint}"
            with urllib.request.urlopen(url):
                end_time = datetime.now()
                duration = (end_time - start_time).total_seconds() * 1000
                endpoint_times[endpoint] = duration
        except urllib.error.URLError as e:
            logger.error("Response time check failed for %s: %s", endpoint, str(e))
            endpoint_times[endpoint] = -1

    return endpoint_times


def run_comprehensive_check(base_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Run a comprehensive server health check.

    Performs all available health checks and returns detailed results
    including server status, database connection, and response times.

    Args:
        base_url: The base URL of the server

    Returns:
        dict: Comprehensive health check results with keys:
            - timestamp: ISO format timestamp
            - server_health: Basic health check results
            - database_connection: Database connectivity status
            - response_times: Endpoint response time measurements
            - all_healthy: Overall health status boolean

    Example:
        >>> results = run_comprehensive_check()
        >>> print("Overall health:", "OK" if results["all_healthy"] else "Issues found")
    """
    check_results = {
        "timestamp": datetime.now().isoformat(),
        "server_health": None,
        "database_connection": None,
        "response_times": None,
        "all_healthy": False,
    }

    # Check server health
    healthy, health_details = check_server_health(base_url)
    check_results["server_health"] = {"healthy": healthy, "details": health_details}

    # Check database
    check_results["database_connection"] = check_database_connection(base_url)

    # Monitor response times
    check_results["response_times"] = monitor_response_times(base_url)

    # Determine overall health
    check_results["all_healthy"] = all(
        [
            check_results["server_health"]["healthy"],
            check_results["database_connection"],
            all(t >= 0 for t in check_results["response_times"].values()),
        ]
    )

    return check_results


def main():
    """Run basic connectivity tests"""
    # Simple check for WSL network connectivity
    run_powershell("Test-NetConnection -ComputerName localhost -Port 8000")

    # Try to directly access the health endpoint
    run_powershell(
        "(Invoke-WebRequest -Uri 'http://localhost:8000/health/' -Method GET -UseBasicParsing).StatusCode"
    )

    # Try curl from Windows
    run_powershell("curl http://localhost:8000/health/ --silent -i")

    # Check different login endpoints (just to see if they exist)
    endpoints = [
        "http://localhost:8000/auth/login/",
        "http://localhost:8000/api/token/",
        "http://localhost:8000/token/",
    ]

    for endpoint in endpoints:
        print(f"\nChecking if {endpoint} exists...")
        run_powershell(
            f"(Invoke-WebRequest -Uri '{endpoint}' -Method GET -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode"
        )


if __name__ == "__main__":
    main()
    check_results = run_comprehensive_check()
    print(json.dumps(check_results, indent=2))
