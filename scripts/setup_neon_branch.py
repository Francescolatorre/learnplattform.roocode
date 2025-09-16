#!/usr/bin/env python3
"""
Script to create Neon database branches for test environments.
Usage: python setup_neon_branch.py --branch-name feature-xyz --parent main
"""
import argparse
import os
import subprocess
import sys
from typing import Optional


def run_command(command: list, capture_output: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(
            command,
            capture_output=capture_output,
            text=True,
            check=True
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command {' '.join(command)}: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout}")
        if e.stderr:
            print(f"stderr: {e.stderr}")
        sys.exit(1)


def check_neon_cli() -> bool:
    """Check if Neon CLI is installed and configured."""
    try:
        run_command(["neonctl", "--version"])
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Neon CLI not found. Please install it first:")
        print("npm install -g neonctl")
        print("Then authenticate: neonctl auth")
        return False


def create_database_branch(branch_name: str, parent_branch: str = "main") -> Optional[str]:
    """Create a new Neon database branch."""
    if not check_neon_cli():
        return None

    try:
        # Create the branch
        print(f"Creating Neon database branch: {branch_name}")
        result = run_command([
            "neonctl", "branches", "create",
            "--name", branch_name,
            "--parent", parent_branch
        ])

        print(f"Branch created successfully: {branch_name}")

        # Get the connection string for the new branch
        print("Retrieving connection string...")
        conn_result = run_command([
            "neonctl", "connection-string",
            "--branch", branch_name
        ])

        connection_string = conn_result.stdout.strip()
        print(f"Connection string: {connection_string}")

        return connection_string

    except Exception as e:
        print(f"Error creating database branch: {e}")
        return None


def setup_environment_file(branch_name: str, connection_string: str) -> None:
    """Create environment file for the branch."""
    env_file = f".env.{branch_name}"

    with open(env_file, 'w') as f:
        f.write(f"# Environment for branch: {branch_name}\n")
        f.write(f"DATABASE_URL={connection_string}\n")
        f.write(f"NEON_BRANCH_NAME={branch_name}\n")
        f.write("DEBUG=true\n")
        f.write("ALLOWED_HOSTS=localhost,127.0.0.1,*.vercel.app\n")
        f.write("CORS_ALLOWED_ORIGINS=http://localhost:3000,https://*.vercel.app\n")

    print(f"Environment file created: {env_file}")


def main():
    parser = argparse.ArgumentParser(description="Create Neon database branch for testing")
    parser.add_argument("--branch-name", required=True, help="Name of the database branch")
    parser.add_argument("--parent", default="main", help="Parent branch (default: main)")
    parser.add_argument("--env-file", action="store_true", help="Create environment file")

    args = parser.parse_args()

    # Create the database branch
    connection_string = create_database_branch(args.branch_name, args.parent)

    if connection_string and args.env_file:
        setup_environment_file(args.branch_name, connection_string)

    if connection_string:
        print("\nNext steps:")
        print(f"1. Set DATABASE_URL in your Vercel environment to: {connection_string}")
        print(f"2. Deploy your application with the new branch")
        print(f"3. Run migrations: python manage.py migrate")


if __name__ == "__main__":
    main()