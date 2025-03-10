#!/usr/bin/env python3
import urllib.request
import socket
import sys
import subprocess

def check_basic_connectivity():
    """Check if the local system can make network connections at all"""
    print("Testing basic network connectivity...")
    try:
        # Try to connect to Google's DNS
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        print("Basic internet connectivity: SUCCESS")
        return True
    except OSError as e:
        print(f"Basic internet connectivity: FAILED - {e}")
        return False

def check_localhost_port(port=8000):
    """Check if localhost port is open and listening"""
    print(f"Checking if port {port} is open on localhost...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)  # 2 Second timeout
        result = sock.connect_ex(('localhost', port))
        if result == 0:
            print(f"Port {port} is OPEN")
            return True
        else:
            print(f"Port {port} is CLOSED (error code: {result})")
            return False
    except socket.error as e:
        print(f"Socket error: {e}")
        return False
    finally:
        sock.close()

def check_wsl_localhost():
    """Check if there are issues with WSL localhost connectivity"""
    print("Checking for WSL-specific localhost issues...")
    try:
        # Try to get the WSL IP address
        result = subprocess.run(['hostname', '-I'], capture_output=True, text=True)
        ip = result.stdout.strip()
        print(f"WSL IP address: {ip}")
        
        # Check if we can connect to this IP instead of localhost
        if ip:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                first_ip = ip.split()[0]  # Get first IP if multiple
                print(f"Trying to connect to {first_ip}:8000...")
                result = sock.connect_ex((first_ip, 8000))
                if result == 0:
                    print(f"Connection to {first_ip}:8000 SUCCEEDED")
                    return True
                else:
                    print(f"Connection to {first_ip}:8000 FAILED (error code: {result})")
            except socket.error as e:
                print(f"Socket error when connecting to WSL IP: {e}")
            finally:
                sock.close()
    except Exception as e:
        print(f"Error checking WSL localhost: {e}")
    return False

def try_ping_localhost():
    """Try to ping localhost to check connectivity"""
    print("Trying to ping localhost...")
    try:
        result = subprocess.run(['ping', '-c', '1', 'localhost'], capture_output=True, text=True)
        print(result.stdout)
        if result.returncode == 0:
            print("Ping to localhost SUCCEEDED")
            return True
        else:
            print("Ping to localhost FAILED")
            return False
    except Exception as e:
        print(f"Error pinging localhost: {e}")
        return False

if __name__ == "__main__":
    check_basic_connectivity()
    check_localhost_port()
    try_ping_localhost()
    check_wsl_localhost()
    
    print("\nNetwork connectivity diagnosis complete.")