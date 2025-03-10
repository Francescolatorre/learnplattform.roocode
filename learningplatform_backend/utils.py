"""
Utility functions for the learning platform backend.
"""
import os
import sys
import socket
import requests
import logging

# Configure Python's root logger for basic console output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

def import_logs_setup():
    """Import the logs_setup module safely"""
    try:
        from logs_setup import django_logger, auth_logger, api_logger
        return django_logger, auth_logger, api_logger
    except ImportError:
        # If logs_setup isn't available, return default loggers
        django_logger = logging.getLogger('django')
        auth_logger = logging.getLogger('auth')
        api_logger = logging.getLogger('api')
        return django_logger, auth_logger, api_logger

def check_server_connectivity(host='localhost', port=8000, path='/health/'):
    """Check if the server is accessible"""
    # Create logger
    logger = logging.getLogger('utils')
    
    # Check socket connection
    logger.info(f"Testing socket connection to {host}:{port}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        if result == 0:
            logger.info(f"Socket connection successful to {host}:{port}")
            socket_ok = True
        else:
            logger.warning(f"Socket connection failed to {host}:{port} with error {result}")
            socket_ok = False
        sock.close()
    except Exception as e:
        logger.error(f"Socket error: {str(e)}")
        socket_ok = False
    
    # Check HTTP connection
    url = f"http://{host}:{port}{path}"
    logger.info(f"Testing HTTP connection to {url}...")
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            logger.info(f"HTTP connection successful to {url}")
            http_ok = True
        else:
            logger.warning(f"HTTP request failed with status code {response.status_code}")
            http_ok = False
    except requests.RequestException as e:
        logger.error(f"HTTP request error: {str(e)}")
        http_ok = False
    
    return socket_ok, http_ok

def get_wsl_ip():
    """Get the IP address of the WSL interface"""
    try:
        # Try to get the IP address of eth0
        import subprocess
        result = subprocess.run(
            ['ip', 'addr', 'show', 'eth0'], 
            capture_output=True, 
            text=True
        )
        
        # Parse the output to extract the IP address
        for line in result.stdout.splitlines():
            if 'inet ' in line:
                return line.split()[1].split('/')[0]
    except Exception as e:
        logging.error(f"Failed to get WSL IP: {str(e)}")
    
    return None

if __name__ == "__main__":
    # This will run when the script is executed directly
    print("Running connectivity checks...")
    
    # Check localhost
    print("\nChecking localhost connectivity:")
    socket_ok, http_ok = check_server_connectivity()
    
    # Check 127.0.0.1
    print("\nChecking 127.0.0.1 connectivity:")
    socket_ok2, http_ok2 = check_server_connectivity(host='127.0.0.1')
    
    # Check WSL IP if available
    wsl_ip = get_wsl_ip()
    if wsl_ip:
        print(f"\nChecking WSL IP ({wsl_ip}) connectivity:")
        socket_ok3, http_ok3 = check_server_connectivity(host=wsl_ip)
    
    # Print summary
    print("\nConnectivity Summary:")
    print(f"Socket connection to localhost: {'✓' if socket_ok else '✗'}")
    print(f"HTTP connection to localhost: {'✓' if http_ok else '✗'}")
    print(f"Socket connection to 127.0.0.1: {'✓' if socket_ok2 else '✗'}")
    print(f"HTTP connection to 127.0.0.1: {'✓' if http_ok2 else '✗'}")
    if wsl_ip:
        print(f"Socket connection to WSL IP ({wsl_ip}): {'✓' if socket_ok3 else '✗'}")
        print(f"HTTP connection to WSL IP ({wsl_ip}): {'✓' if http_ok3 else '✗'}")