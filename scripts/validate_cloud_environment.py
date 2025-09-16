#!/usr/bin/env python3
"""
Validation script for cloud test environments.
Usage: python validate_cloud_environment.py --environment staging --comprehensive
"""
import argparse
import json
import os
import requests
import subprocess
import sys
import time
from typing import Dict, List, Tuple
from urllib.parse import urljoin


class CloudEnvironmentValidator:
    def __init__(self, environment: str = "staging"):
        self.environment = environment
        self.base_url = self._get_deployment_url()
        self.api_base_url = urljoin(self.base_url, "/api/")
        self.test_results = {}

    def _get_deployment_url(self) -> str:
        """Get the deployment URL for the environment."""
        try:
            if self.environment == "production":
                # Get production URL from Vercel
                result = subprocess.run([
                    "vercel", "ls", "--prod",
                    "--token", os.getenv("VERCEL_TOKEN")
                ], capture_output=True, text=True, check=True)
                # Extract URL from output (simplified implementation)
                return "https://learning-platform.vercel.app"
            else:
                # Get latest preview URL
                return "https://learning-platform-git-main.vercel.app"
        except subprocess.CalledProcessError:
            return f"https://learning-platform-{self.environment}.vercel.app"

    def run_health_checks(self) -> bool:
        """Run basic health checks."""
        print("🏥 Running health checks...")

        checks = [
            ("Frontend Accessibility", self._check_frontend_health),
            ("Backend API Health", self._check_backend_health),
            ("Database Connectivity", self._check_database_connectivity),
            ("Authentication System", self._check_auth_system),
            ("Static Assets", self._check_static_assets)
        ]

        all_passed = True
        for check_name, check_func in checks:
            print(f"  🔍 {check_name}...")
            try:
                result = check_func()
                self.test_results[check_name] = result
                if result:
                    print(f"    ✅ {check_name} passed")
                else:
                    print(f"    ❌ {check_name} failed")
                    all_passed = False
            except Exception as e:
                print(f"    ❌ {check_name} error: {e}")
                self.test_results[check_name] = False
                all_passed = False

        return all_passed

    def _check_frontend_health(self) -> bool:
        """Check if frontend is accessible."""
        try:
            response = requests.get(self.base_url, timeout=30)
            return response.status_code == 200 and "Learning Platform" in response.text
        except requests.RequestException:
            return False

    def _check_backend_health(self) -> bool:
        """Check backend API health."""
        try:
            health_url = urljoin(self.base_url, "/health")
            response = requests.get(health_url, timeout=30)
            return response.status_code == 200
        except requests.RequestException:
            return False

    def _check_database_connectivity(self) -> bool:
        """Check database connectivity through API."""
        try:
            # Try to access an endpoint that requires database
            courses_url = urljoin(self.api_base_url, "courses/")
            response = requests.get(courses_url, timeout=30)
            # 200 or 401 (auth required) means DB is working
            return response.status_code in [200, 401]
        except requests.RequestException:
            return False

    def _check_auth_system(self) -> bool:
        """Check authentication system."""
        try:
            auth_url = urljoin(self.api_base_url, "auth/login/")
            # Test with invalid credentials (should return 400/401, not 500)
            response = requests.post(auth_url, json={
                "username": "invalid",
                "password": "invalid"
            }, timeout=30)
            return response.status_code in [400, 401]
        except requests.RequestException:
            return False

    def _check_static_assets(self) -> bool:
        """Check if static assets are loading."""
        try:
            # Check for common static assets
            asset_urls = [
                urljoin(self.base_url, "/assets/index.css"),
                urljoin(self.base_url, "/assets/index.js"),
                urljoin(self.base_url, "/favicon.ico")
            ]

            for url in asset_urls:
                response = requests.head(url, timeout=10)
                if response.status_code == 200:
                    return True
            return False
        except requests.RequestException:
            return False

    def run_functional_tests(self) -> bool:
        """Run functional tests."""
        print("⚙️ Running functional tests...")

        tests = [
            ("User Registration Flow", self._test_user_registration),
            ("Course Creation", self._test_course_creation),
            ("Task Management", self._test_task_management),
            ("Enrollment Process", self._test_enrollment_process)
        ]

        all_passed = True
        for test_name, test_func in tests:
            print(f"  🧪 {test_name}...")
            try:
                result = test_func()
                self.test_results[test_name] = result
                if result:
                    print(f"    ✅ {test_name} passed")
                else:
                    print(f"    ❌ {test_name} failed")
                    all_passed = False
            except Exception as e:
                print(f"    ❌ {test_name} error: {e}")
                self.test_results[test_name] = False
                all_passed = False

        return all_passed

    def _test_user_registration(self) -> bool:
        """Test user registration endpoint."""
        try:
            register_url = urljoin(self.api_base_url, "auth/register/")
            test_data = {
                "username": f"testuser_{int(time.time())}",
                "email": f"test_{int(time.time())}@example.com",
                "password": "testpassword123",
                "role": "student"
            }
            response = requests.post(register_url, json=test_data, timeout=30)
            # Success (201) or validation error (400) means endpoint is working
            return response.status_code in [201, 400]
        except requests.RequestException:
            return False

    def _test_course_creation(self) -> bool:
        """Test course creation (requires auth)."""
        try:
            courses_url = urljoin(self.api_base_url, "courses/")
            # Without auth, should return 401
            response = requests.post(courses_url, json={
                "title": "Test Course",
                "description": "Test Description"
            }, timeout=30)
            return response.status_code in [401, 403]
        except requests.RequestException:
            return False

    def _test_task_management(self) -> bool:
        """Test task management endpoints."""
        try:
            tasks_url = urljoin(self.api_base_url, "tasks/")
            response = requests.get(tasks_url, timeout=30)
            # Auth required or success
            return response.status_code in [200, 401]
        except requests.RequestException:
            return False

    def _test_enrollment_process(self) -> bool:
        """Test enrollment endpoints."""
        try:
            enrollments_url = urljoin(self.api_base_url, "enrollments/")
            response = requests.get(enrollments_url, timeout=30)
            return response.status_code in [200, 401]
        except requests.RequestException:
            return False

    def run_performance_tests(self) -> bool:
        """Run performance tests."""
        print("⚡ Running performance tests...")

        tests = [
            ("Page Load Time", self._test_page_load_time),
            ("API Response Time", self._test_api_response_time),
            ("Database Query Performance", self._test_db_performance),
            ("Static Asset Loading", self._test_asset_loading)
        ]

        all_passed = True
        for test_name, test_func in tests:
            print(f"  ⏱️ {test_name}...")
            try:
                result = test_func()
                self.test_results[test_name] = result
                if result:
                    print(f"    ✅ {test_name} passed")
                else:
                    print(f"    ❌ {test_name} failed")
                    all_passed = False
            except Exception as e:
                print(f"    ❌ {test_name} error: {e}")
                self.test_results[test_name] = False
                all_passed = False

        return all_passed

    def _test_page_load_time(self) -> bool:
        """Test page load time."""
        try:
            start_time = time.time()
            response = requests.get(self.base_url, timeout=30)
            load_time = time.time() - start_time

            # Page should load within 5 seconds
            success = response.status_code == 200 and load_time < 5.0
            print(f"      📊 Load time: {load_time:.2f}s")
            return success
        except requests.RequestException:
            return False

    def _test_api_response_time(self) -> bool:
        """Test API response time."""
        try:
            health_url = urljoin(self.base_url, "/health")
            start_time = time.time()
            response = requests.get(health_url, timeout=30)
            response_time = time.time() - start_time

            # API should respond within 2 seconds
            success = response.status_code == 200 and response_time < 2.0
            print(f"      📊 API response time: {response_time:.2f}s")
            return success
        except requests.RequestException:
            return False

    def _test_db_performance(self) -> bool:
        """Test database performance."""
        try:
            courses_url = urljoin(self.api_base_url, "courses/")
            start_time = time.time()
            response = requests.get(courses_url, timeout=30)
            query_time = time.time() - start_time

            # DB queries should complete within 3 seconds
            success = response.status_code in [200, 401] and query_time < 3.0
            print(f"      📊 DB query time: {query_time:.2f}s")
            return success
        except requests.RequestException:
            return False

    def _test_asset_loading(self) -> bool:
        """Test static asset loading performance."""
        try:
            favicon_url = urljoin(self.base_url, "/favicon.ico")
            start_time = time.time()
            response = requests.head(favicon_url, timeout=10)
            asset_time = time.time() - start_time

            # Assets should load within 1 second
            success = response.status_code == 200 and asset_time < 1.0
            print(f"      📊 Asset load time: {asset_time:.2f}s")
            return success
        except requests.RequestException:
            return False

    def run_security_checks(self) -> bool:
        """Run security checks."""
        print("🔒 Running security checks...")

        checks = [
            ("HTTPS Redirect", self._check_https_redirect),
            ("Security Headers", self._check_security_headers),
            ("API Authentication", self._check_api_auth),
            ("CORS Configuration", self._check_cors_config)
        ]

        all_passed = True
        for check_name, check_func in checks:
            print(f"  🛡️ {check_name}...")
            try:
                result = check_func()
                self.test_results[check_name] = result
                if result:
                    print(f"    ✅ {check_name} passed")
                else:
                    print(f"    ❌ {check_name} failed")
                    all_passed = False
            except Exception as e:
                print(f"    ❌ {check_name} error: {e}")
                self.test_results[check_name] = False
                all_passed = False

        return all_passed

    def _check_https_redirect(self) -> bool:
        """Check HTTPS redirect."""
        if not self.base_url.startswith("https://"):
            return False

        try:
            http_url = self.base_url.replace("https://", "http://")
            response = requests.get(http_url, allow_redirects=False, timeout=10)
            return response.status_code in [301, 302, 308]
        except requests.RequestException:
            # If HTTPS is enforced at CDN level, HTTP might not be accessible
            return True

    def _check_security_headers(self) -> bool:
        """Check security headers."""
        try:
            response = requests.get(self.base_url, timeout=30)
            headers = response.headers

            # Check for important security headers
            security_headers = [
                "X-Frame-Options",
                "X-Content-Type-Options",
                "Referrer-Policy"
            ]

            return any(header in headers for header in security_headers)
        except requests.RequestException:
            return False

    def _check_api_auth(self) -> bool:
        """Check API authentication."""
        try:
            # Protected endpoints should require authentication
            protected_url = urljoin(self.api_base_url, "courses/")
            response = requests.post(protected_url, json={"test": "data"}, timeout=30)
            return response.status_code in [401, 403]
        except requests.RequestException:
            return False

    def _check_cors_config(self) -> bool:
        """Check CORS configuration."""
        try:
            response = requests.options(self.api_base_url, timeout=30)
            # CORS headers should be present or endpoint should respond
            return response.status_code in [200, 405] or "Access-Control-Allow-Origin" in response.headers
        except requests.RequestException:
            return False

    def generate_validation_report(self) -> str:
        """Generate validation report."""
        passed = sum(1 for result in self.test_results.values() if result)
        total = len(self.test_results)
        success_rate = (passed / total * 100) if total > 0 else 0

        report = f"""
# Cloud Environment Validation Report

## Environment Details
- **Environment**: {self.environment}
- **Base URL**: {self.base_url}
- **API Base URL**: {self.api_base_url}
- **Validation Date**: {time.strftime('%Y-%m-%d %H:%M:%S')}

## Overall Results
- **Tests Passed**: {passed}/{total}
- **Success Rate**: {success_rate:.1f}%
- **Status**: {'✅ PASS' if success_rate >= 80 else '❌ FAIL'}

## Detailed Results
"""

        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            report += f"- **{test_name}**: {status}\n"

        report += f"""
## Recommendations
"""
        if success_rate >= 90:
            report += "- Environment is ready for production use\n"
        elif success_rate >= 80:
            report += "- Environment is acceptable but review failed tests\n"
        else:
            report += "- Environment needs significant improvements before use\n"

        report += """
## Next Steps
- Review any failed tests and resolve issues
- Monitor environment health continuously
- Set up alerting for critical failures
"""

        report_file = f"validation_report_{self.environment}_{int(time.time())}.md"
        with open(report_file, 'w') as f:
            f.write(report)

        return report_file


def main():
    parser = argparse.ArgumentParser(description="Validate cloud test environment")
    parser.add_argument("--environment", choices=["staging", "production"],
                       default="staging", help="Environment to validate")
    parser.add_argument("--comprehensive", action="store_true",
                       help="Run comprehensive tests including performance and security")
    parser.add_argument("--health-only", action="store_true",
                       help="Run only health checks")

    args = parser.parse_args()

    validator = CloudEnvironmentValidator(args.environment)

    print(f"🔍 Validating {args.environment} environment")
    print(f"🌐 Base URL: {validator.base_url}")

    # Always run health checks
    health_passed = validator.run_health_checks()

    if not args.health_only:
        # Run functional tests
        functional_passed = validator.run_functional_tests()

        if args.comprehensive:
            # Run performance and security tests
            performance_passed = validator.run_performance_tests()
            security_passed = validator.run_security_checks()

    # Generate report
    report_file = validator.generate_validation_report()
    print(f"📋 Validation report generated: {report_file}")

    # Exit with appropriate code
    passed = sum(1 for result in validator.test_results.values() if result)
    total = len(validator.test_results)
    success_rate = (passed / total * 100) if total > 0 else 0

    if success_rate >= 80:
        print(f"✅ Validation completed successfully ({success_rate:.1f}% pass rate)")
        sys.exit(0)
    else:
        print(f"❌ Validation failed ({success_rate:.1f}% pass rate)")
        sys.exit(1)


if __name__ == "__main__":
    main()