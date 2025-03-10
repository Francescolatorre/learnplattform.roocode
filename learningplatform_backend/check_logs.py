#!/usr/bin/env python3
import os
import time
import subprocess
import sys

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    """Print a formatted header message"""
    print(f"\n{Colors.HEADER}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{message.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{'=' * 70}{Colors.ENDC}\n")

def run_command(command):
    """Run a shell command and return the output"""
    try:
        result = subprocess.run(command, shell=True, check=True, 
                                text=True, capture_output=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"{Colors.RED}Command failed with error:{Colors.ENDC}")
        print(f"{Colors.RED}{e.stderr}{Colors.ENDC}")
        return None

def check_backend_log_files():
    """Check for Django log files"""
    print_header("Checking Backend Log Files")
    
    # Check for common Django log locations
    log_locations = [
        './logs',
        './log',
        './',
        '../logs',
        '../log',
        '../',
    ]
    
    log_files = []
    
    for location in log_locations:
        if not os.path.exists(location):
            continue
            
        # Look for log files in the directory
        for file in os.listdir(location):
            if file.endswith('.log'):
                log_path = os.path.join(location, file)
                log_files.append(log_path)
                print(f"{Colors.GREEN}Found log file: {log_path}{Colors.ENDC}")
                print(f"{Colors.BLUE}Last 5 lines of {file}:{Colors.ENDC}")
                
                # Show the last few lines of the log
                try:
                    with open(log_path, 'r') as f:
                        lines = f.readlines()
                        for line in lines[-5:]:
                            print(f"  {line.strip()}")
                except Exception as e:
                    print(f"{Colors.RED}Error reading log file: {str(e)}{Colors.ENDC}")
    
    if not log_files:
        print(f"{Colors.YELLOW}No log files found in standard locations.{Colors.ENDC}")
        print("Creating a new debug log file...")
        
        # Create a new log directory if it doesn't exist
        if not os.path.exists('logs'):
            os.makedirs('logs')
        
        # Create a basic log file
        with open('logs/debug.log', 'w') as f:
            f.write(f"Log file created at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        print(f"{Colors.GREEN}Created new log file: logs/debug.log{Colors.ENDC}")
        log_files.append('logs/debug.log')
    
    return log_files

def check_network_connectivity():
    """Check network connectivity to localhost"""
    print_header("Checking Network Connectivity")
    
    # Check localhost connection
    print(f"{Colors.BLUE}Testing connection to localhost:8000...{Colors.ENDC}")
    curl_output = run_command("curl -s -I http://localhost:8000/health/")
    
    if curl_output:
        print(f"{Colors.GREEN}Successfully connected to backend!{Colors.ENDC}")
        print(curl_output)
    else:
        print(f"{Colors.RED}Failed to connect to backend at localhost:8000{Colors.ENDC}")
        
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
            print(ping_output.split('\n')[0])
        
        # Check WSL network configuration
        print(f"{Colors.BLUE}WSL network configuration:{Colors.ENDC}")
        ifconfig_output = run_command("ip addr show")
        if ifconfig_output:
            print(ifconfig_output)
    
    return curl_output is not None

def monitor_logs(log_file, duration=30):
    """Monitor a log file for changes over a specified duration"""
    print_header(f"Monitoring {log_file} for {duration} seconds")
    
    start_time = time.time()
    last_size = os.path.getsize(log_file)
    
    try:
        while time.time() - start_time < duration:
            current_size = os.path.getsize(log_file)
            
            if current_size > last_size:
                # Log file has grown, read the new content
                with open(log_file, 'r') as f:
                    f.seek(last_size)
                    new_content = f.read()
                    
                    if new_content:
                        print(f"{Colors.GREEN}New log entries:{Colors.ENDC}")
                        for line in new_content.splitlines():
                            print(f"  {line}")
                
                last_size = current_size
            
            # Sleep for a short period
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print(f"{Colors.YELLOW}Monitoring stopped by user.{Colors.ENDC}")

def check_django_server_status():
    """Check if Django server is running and which process is binding to port 8000"""
    print_header("Checking Django Server Status")
    
    # Check for Django processes
    print(f"{Colors.BLUE}Looking for Django processes...{Colors.ENDC}")
    django_processes = run_command("ps aux | grep -E '[p]ython.*manage.py runserver'")
    
    if django_processes:
        print(f"{Colors.GREEN}Django processes found:{Colors.ENDC}")
        print(django_processes)
    else:
        print(f"{Colors.YELLOW}No Django processes found running manage.py runserver.{Colors.ENDC}")
    
    # Check which process is using port 8000
    print(f"{Colors.BLUE}Checking which process is using port 8000...{Colors.ENDC}")
    port_process = run_command("sudo lsof -i :8000 || netstat -tuln | grep 8000 || ss -tuln | grep 8000")
    
    if port_process:
        print(f"{Colors.GREEN}Process using port 8000:{Colors.ENDC}")
        print(port_process)
    else:
        print(f"{Colors.RED}No process appears to be listening on port 8000.{Colors.ENDC}")

def main():
    print_header("Django Backend Diagnostics")
    
    # Check if backend server is running
    check_django_server_status()
    
    # Check network connectivity
    backend_accessible = check_network_connectivity()
    
    # Check for log files
    log_files = check_backend_log_files()
    
    if log_files and not backend_accessible:
        print(f"{Colors.YELLOW}\nWould you like to monitor the log file for new entries? (y/n){Colors.ENDC}")
        choice = input()
        
        if choice.lower() == 'y':
            log_to_monitor = log_files[0]  # Monitor the first log file found
            monitor_duration = 30  # Monitor for 30 seconds by default
            
            print(f"Monitoring {log_to_monitor}. Press Ctrl+C to stop...")
            monitor_logs(log_to_monitor, monitor_duration)
    
    print_header("Diagnostics Complete")
    
    if not backend_accessible:
        print(f"""
{Colors.YELLOW}Recommendations:{Colors.ENDC}
1. Make sure the Django server is running with: python manage.py runserver 0.0.0.0:8000
2. Check if there's a firewall blocking connections
3. Look at the Django logs for any error messages
4. Try accessing the server from a different client
""")

if __name__ == "__main__":
    main()