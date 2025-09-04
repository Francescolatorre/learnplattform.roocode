#!/usr/bin/env python3
"""
Log analysis and monitoring utilities for the Learning Platform.

This module provides utilities for analyzing Django log files, monitoring server status,
and diagnosing connectivity issues. It includes functionality for:
- Locating and analyzing Django log files
- Checking network connectivity to the backend
- Monitoring log file changes in real-time
- Checking Django server process status

Usage:
    from utils.check_logs import check_backend_log_files, check_network_connectivity

    # Check for and analyze log files
    log_files = check_backend_log_files()

    # Verify network connectivity
    is_connected = check_network_connectivity()
"""

import os
import subprocess
import time


# Colors for terminal output
class Colors:
    """ANSI color codes for terminal output formatting."""

    HEADER = "\033[95m"
    BLUE = "\033[94m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def print_header(message):
    """
    Print a formatted header message to the terminal.

    Args:
        message (str): The message to display as a header
    """
    print(f"\n{Colors.HEADER}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{message.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{'=' * 70}{Colors.ENDC}\n")


def run_command(command):
    """
    Run a shell command and return its output.

    Args:
        command (str): The shell command to execute

    Returns:
        str: The command output if successful, None if the command fails
    """
    try:
        result = subprocess.run(
            command, shell=True, check=True, text=True, capture_output=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"{Colors.RED}Command failed with error:{Colors.ENDC}")
        print(f"{Colors.RED}{e.stderr}{Colors.ENDC}")
        return None


def check_backend_log_files():
    """
    Check for and analyze Django log files in standard locations.

    This function:
    - Searches common locations for Django log files
    - Displays the last few lines of found log files
    - Creates a new debug log if none are found

    Returns:
        list: Paths to found log files
    """
    print_header("Checking Backend Log Files")

    # Check for common Django log locations
    log_locations = [
        "./logs",
        "./log",
        "./",
        "../logs",
        "../log",
        "../",
    ]

    log_files = []

    for location in log_locations:
        if not os.path.exists(location):
            continue

        # Look for log files in the directory
        for file in os.listdir(location):
            if file.endswith(".log"):
                log_path = os.path.join(location, file)
                log_files.append(log_path)
                print(f"{Colors.GREEN}Found log file: {log_path}{Colors.ENDC}")
                print(f"{Colors.BLUE}Last 5 lines of {file}:{Colors.ENDC}")

                # Show the last few lines of the log
                try:
                    with open(log_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        for line in lines[-5:]:
                            print(f"  {line.strip()}")
                except (IOError, UnicodeDecodeError) as e:
                    print(f"{Colors.RED}Error reading log file: {str(e)}{Colors.ENDC}")

    if not log_files:
        print(f"{Colors.YELLOW}No log files found in standard locations.{Colors.ENDC}")
        print("Creating a new debug log file...")

        # Create a new log directory if it doesn't exist
        if not os.path.exists("logs"):
            os.makedirs("logs")

        # Create a basic log file
        with open("logs/debug.log", "w", encoding="utf-8") as f:
            f.write(f"Log file created at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

        print(f"{Colors.GREEN}Created new log file: logs/debug.log{Colors.ENDC}")
        log_files.append("logs/debug.log")

    return log_files


def check_network_connectivity():
    """
    Check network connectivity to the Django backend.

    This function performs multiple connectivity tests:
    - Attempts to connect to localhost:8000
    - Checks if port 8000 is open
    - Tests basic ping to localhost
    - Examines WSL network configuration if relevant

    Returns:
        bool: True if backend is accessible, False otherwise
    """
    print_header("Checking Network Connectivity")

    # Check localhost connection
    print(f"{Colors.BLUE}Testing connection to localhost:8000...{Colors.ENDC}")
    curl_output = run_command("curl -s -I http://localhost:8000/health/")

    if curl_output:
        print(f"{Colors.GREEN}Successfully connected to backend!{Colors.ENDC}")
        print(curl_output)
    else:
        print(
            f"{Colors.RED}Failed to connect to backend at localhost:8000{Colors.ENDC}"
        )

        # Check if the port is open
        netstat_output = run_command("ss -tuln | grep 8000")
        if netstat_output:
            print(f"{Colors.GREEN}Port 8000 is open:{Colors.ENDC}")
            print(netstat_output)
        else:
            print(f"{Colors.RED}Port 8000 does not appear to be open.{Colors.ENDC}")

        # Check if we can ping localhost
        ping_output = run_command("ping -c 1 localhost")
        if ping_output:
            print(f"{Colors.GREEN}Can ping localhost:{Colors.ENDC}")
            print(ping_output.split("\n")[0])

        # Check WSL network configuration
        print(f"{Colors.BLUE}WSL network configuration:{Colors.ENDC}")
        ifconfig_output = run_command("ip addr show")
        if ifconfig_output:
            print(ifconfig_output)

    return curl_output is not None


def monitor_logs(log_file: str, duration: int = 30) -> None:
    """
    Monitor a log file for changes over a specified duration.

    Args:
        log_file (str): Path to the log file to monitor
        duration (int): Duration in seconds to monitor (default: 30)
    """
    end_time = time.time() + duration
    last_position = 0

    print(f"\nMonitoring {log_file} for {duration} seconds...")

    try:
        while time.time() < end_time:
            try:
                with open(log_file, "r", encoding="utf-8") as f:
                    f.seek(last_position)
                    new_lines = f.readlines()
                    if new_lines:
                        print("".join(new_lines), end="")
                    last_position = f.tell()
            except (IOError, UnicodeDecodeError) as e:
                print(f"{Colors.RED}Error reading log: {str(e)}{Colors.ENDC}")
                break

            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopped monitoring logs.")


def check_django_server_status():
    """
    Check if Django development server is running.

    This function:
    - Looks for Django server processes
    - Checks which process is using port 8000
    - Reports on the server's running status
    """
    print_header("Checking Django Server Status")

    # Check for Django processes
    print(f"{Colors.BLUE}Looking for Django processes...{Colors.ENDC}")
    django_processes = run_command("ps aux | grep -E '[p]ython.*manage.py runserver'")

    if django_processes:
        print(f"{Colors.GREEN}Django processes found:{Colors.ENDC}")
        print(django_processes)
    else:
        print(
            f"{Colors.YELLOW}No Django processes found running manage.py runserver.{Colors.ENDC}"
        )

    # Check which process is using port 8000
    print(f"{Colors.BLUE}Checking which process is using port 8000...{Colors.ENDC}")
    port_process = run_command(
        "sudo lsof -i :8000 || netstat -tuln | grep 8000 || ss -tuln | grep 8000"
    )

    if port_process:
        print(f"{Colors.GREEN}Process using port 8000:{Colors.ENDC}")
        print(port_process)
    else:
        print(
            f"{Colors.RED}No process appears to be listening on port 8000.{Colors.ENDC}"
        )


def main():
    print_header("Django Backend Diagnostics")

    # Check if backend server is running
    check_django_server_status()

    # Check network connectivity
    backend_accessible = check_network_connectivity()

    # Check for log files
    log_files = check_backend_log_files()

    if log_files and not backend_accessible:
        print(
            f"{Colors.YELLOW}\nWould you like to monitor the log file for new entries? (y/n){Colors.ENDC}"
        )
        choice = input()

        if choice.lower() == "y":
            log_to_monitor = log_files[0]  # Monitor the first log file found
            monitor_duration = 30  # Monitor for 30 seconds by default

            print(f"Monitoring {log_to_monitor}. Press Ctrl+C to stop...")
            monitor_logs(log_to_monitor, monitor_duration)

    print_header("Diagnostics Complete")

    if not backend_accessible:
        print(
            f"""
{Colors.YELLOW}Recommendations:{Colors.ENDC}
1. Make sure the Django server is running with: python manage.py runserver 0.0.0.0:8000
2. Check if there's a firewall blocking connections
3. Look at the Django logs for any error messages
4. Try accessing the server from a different client
"""
        )


if __name__ == "__main__":
    main()
