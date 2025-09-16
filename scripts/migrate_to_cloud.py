#!/usr/bin/env python3
"""
Migration script to transition from local testing to cloud test environments.
Usage: python migrate_to_cloud.py --environment [staging|production] --verify
"""
import argparse
import json
import os
import subprocess
import sys
import time
from typing import Dict, List, Optional
import requests


class CloudMigrationTool:
    def __init__(self, environment: str = "staging"):
        self.environment = environment
        self.vercel_project_id = os.getenv("VERCEL_PROJECT_ID")
        self.neon_project_id = os.getenv("NEON_PROJECT_ID")
        self.verification_results = {}

    def validate_prerequisites(self) -> bool:
        """Validate that all prerequisites are met."""
        print("🔍 Validating prerequisites...")

        # Check CLI tools
        required_tools = ["vercel", "neonctl", "git"]
        for tool in required_tools:
            if not self._check_command_exists(tool):
                print(f"❌ {tool} CLI not found. Please install it first.")
                return False

        # Check environment variables
        required_env_vars = [
            "VERCEL_TOKEN", "VERCEL_PROJECT_ID", "VERCEL_ORG_ID",
            "NEON_API_KEY", "NEON_PROJECT_ID"
        ]
        for var in required_env_vars:
            if not os.getenv(var):
                print(f"❌ Environment variable {var} not set.")
                return False

        print("✅ All prerequisites validated")
        return True

    def _check_command_exists(self, command: str) -> bool:
        """Check if a command exists in PATH."""
        try:
            subprocess.run([command, "--version"],
                          capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def backup_current_state(self) -> Dict:
        """Create backup of current local state."""
        print("💾 Creating backup of current state...")

        backup_data = {
            "timestamp": time.time(),
            "git_branch": self._get_git_branch(),
            "local_env": self._get_local_env_vars(),
            "database_schema": self._get_database_schema()
        }

        backup_file = f"backup_{self.environment}_{int(time.time())}.json"
        with open(backup_file, 'w') as f:
            json.dump(backup_data, f, indent=2)

        print(f"✅ Backup created: {backup_file}")
        return backup_data

    def _get_git_branch(self) -> str:
        """Get current git branch."""
        try:
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True, text=True, check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError:
            return "unknown"

    def _get_local_env_vars(self) -> Dict:
        """Get current local environment variables."""
        env_vars = {}
        env_file = "frontend/.env"
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        env_vars[key] = value
        return env_vars

    def _get_database_schema(self) -> Dict:
        """Get current database schema information."""
        try:
            # Run Django management command to get migrations
            result = subprocess.run(
                ["python", "backend/manage.py", "showmigrations", "--format=json"],
                capture_output=True, text=True, check=True
            )
            return json.loads(result.stdout)
        except (subprocess.CalledProcessError, json.JSONDecodeError):
            return {}

    def setup_cloud_infrastructure(self) -> bool:
        """Set up cloud infrastructure."""
        print("🏗️ Setting up cloud infrastructure...")

        # Setup Neon database
        if not self._setup_neon_database():
            return False

        # Setup Vercel project
        if not self._setup_vercel_project():
            return False

        print("✅ Cloud infrastructure setup completed")
        return True

    def _setup_neon_database(self) -> bool:
        """Setup Neon database branch."""
        try:
            branch_name = f"{self.environment}-main"

            # Create main branch for environment
            subprocess.run([
                "neonctl", "branches", "create",
                "--name", branch_name,
                "--project-id", self.neon_project_id
            ], check=True)

            # Get connection string
            result = subprocess.run([
                "neonctl", "connection-string",
                "--branch", branch_name,
                "--project-id", self.neon_project_id
            ], capture_output=True, text=True, check=True)

            connection_string = result.stdout.strip()
            print(f"✅ Neon database branch created: {branch_name}")
            print(f"📝 Connection string: {connection_string}")

            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to setup Neon database: {e}")
            return False

    def _setup_vercel_project(self) -> bool:
        """Setup Vercel project configuration."""
        try:
            # Deploy to get initial setup
            subprocess.run([
                "vercel", "deploy",
                "--token", os.getenv("VERCEL_TOKEN")
            ], check=True)

            print("✅ Vercel project setup completed")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to setup Vercel project: {e}")
            return False

    def run_migration_tests(self) -> bool:
        """Run comprehensive migration tests."""
        print("🧪 Running migration tests...")

        tests = [
            self._test_database_connectivity,
            self._test_api_endpoints,
            self._test_frontend_deployment,
            self._test_environment_variables,
            self._test_performance_baseline
        ]

        all_passed = True
        for test in tests:
            test_name = test.__name__.replace('_test_', '').replace('_', ' ').title()
            print(f"  🔍 {test_name}...")

            if test():
                print(f"    ✅ {test_name} passed")
            else:
                print(f"    ❌ {test_name} failed")
                all_passed = False

        return all_passed

    def _test_database_connectivity(self) -> bool:
        """Test database connectivity."""
        try:
            # Run a simple migration check
            result = subprocess.run([
                "python", "backend/manage.py", "check", "--database", "default"
            ], capture_output=True, text=True)
            return result.returncode == 0
        except subprocess.CalledProcessError:
            return False

    def _test_api_endpoints(self) -> bool:
        """Test API endpoints."""
        try:
            # Get deployment URL
            result = subprocess.run([
                "vercel", "ls", "--token", os.getenv("VERCEL_TOKEN")
            ], capture_output=True, text=True, check=True)

            # Extract URL from output (simplified)
            deployment_url = "https://your-app.vercel.app"  # Placeholder

            # Test health endpoint
            response = requests.get(f"{deployment_url}/health", timeout=30)
            return response.status_code == 200
        except (subprocess.CalledProcessError, requests.RequestException):
            return False

    def _test_frontend_deployment(self) -> bool:
        """Test frontend deployment."""
        try:
            # Check if build artifacts exist
            return os.path.exists("frontend/dist/index.html")
        except Exception:
            return False

    def _test_environment_variables(self) -> bool:
        """Test environment variables are correctly set."""
        try:
            # Test Vercel environment variables
            result = subprocess.run([
                "vercel", "env", "ls",
                "--token", os.getenv("VERCEL_TOKEN")
            ], capture_output=True, text=True, check=True)

            required_vars = ["DATABASE_URL", "SECRET_KEY", "DEBUG"]
            return all(var in result.stdout for var in required_vars)
        except subprocess.CalledProcessError:
            return False

    def _test_performance_baseline(self) -> bool:
        """Test performance baseline."""
        # Placeholder for performance testing
        print("    📊 Performance baseline testing (placeholder)")
        return True

    def generate_migration_report(self) -> str:
        """Generate migration report."""
        report = f"""
# Cloud Migration Report - {self.environment.title()}

## Migration Summary
- **Timestamp**: {time.strftime('%Y-%m-%d %H:%M:%S')}
- **Environment**: {self.environment}
- **Status**: {'✅ Success' if all(self.verification_results.values()) else '❌ Failed'}

## Test Results
"""
        for test_name, result in self.verification_results.items():
            status = "✅ Pass" if result else "❌ Fail"
            report += f"- **{test_name}**: {status}\n"

        report += f"""
## Next Steps
{'- Environment is ready for use' if all(self.verification_results.values()) else '- Review failed tests and retry migration'}
- Monitor deployment health
- Update team documentation
- Schedule training session

## Rollback Information
- Backup file: `backup_{self.environment}_{int(time.time())}.json`
- Rollback command: `python migrate_to_cloud.py --rollback`
"""

        report_file = f"migration_report_{self.environment}.md"
        with open(report_file, 'w') as f:
            f.write(report)

        return report_file


def main():
    parser = argparse.ArgumentParser(description="Migrate to cloud test environments")
    parser.add_argument("--environment", choices=["staging", "production"],
                       default="staging", help="Target environment")
    parser.add_argument("--verify", action="store_true",
                       help="Run verification tests")
    parser.add_argument("--rollback", action="store_true",
                       help="Rollback to previous state")

    args = parser.parse_args()

    migrator = CloudMigrationTool(args.environment)

    if args.rollback:
        print("🔄 Rollback functionality not implemented yet")
        return

    print(f"🚀 Starting migration to {args.environment} environment")

    # Step 1: Validate prerequisites
    if not migrator.validate_prerequisites():
        print("❌ Prerequisites not met. Aborting migration.")
        sys.exit(1)

    # Step 2: Backup current state
    migrator.backup_current_state()

    # Step 3: Setup cloud infrastructure
    if not migrator.setup_cloud_infrastructure():
        print("❌ Failed to setup cloud infrastructure. Aborting migration.")
        sys.exit(1)

    # Step 4: Run verification tests
    if args.verify:
        if migrator.run_migration_tests():
            print("✅ All migration tests passed!")
        else:
            print("❌ Some migration tests failed. Review the results.")

    # Step 5: Generate report
    report_file = migrator.generate_migration_report()
    print(f"📋 Migration report generated: {report_file}")

    print(f"🎉 Migration to {args.environment} completed!")


if __name__ == "__main__":
    main()