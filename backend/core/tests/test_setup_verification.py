import pytest
from django.test import TestCase


@pytest.mark.unit
class TestSetupVerification(TestCase):
    """
    Test class to verify pytest configuration and test discovery.
    This serves as a validation of our test infrastructure setup.
    """
    
    def test_basic_assertion(self):
        """Verify that basic test assertions work."""
        self.assertTrue(True, "Basic assertion works")
    
    @pytest.mark.integration
    def test_multiple_markers(self):
        """Verify that multiple pytest markers can be used."""
        self.assertEqual(1 + 1, 2, "Multiple markers work")
    
    @pytest.mark.db
    def test_database_access(self):
        """Verify database access in tests."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.assertEqual(
            User.objects.count(),
            0,
            "Database access works and starts clean"
        )
    
    @pytest.mark.slow
    def test_slow_operation(self):
        """Verify slow test marking."""
        import time
        time.sleep(0.1)  # Simulate slow operation
        self.assertTrue(True, "Slow test marking works")
    
    def test_coverage_branch(self):
        """Verify branch coverage reporting."""
        value = 42
        
        if value > 0:
            result = "positive"
        else:
            result = "non-positive"
        
        self.assertEqual(result, "positive", "Branch coverage works")