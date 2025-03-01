"""
Test utilities for the learning platform.
"""
from typing import Any, Dict, List, Optional, Type, Union

from django.db import models
from django.urls import reverse
from rest_framework.test import APIClient


class APITestMixin:
    """Mixin providing utility methods for API testing."""

    @staticmethod
    def get_api_url(viewname: str, **kwargs) -> str:
        """
        Get the full API URL for a given viewname.
        
        Args:
            viewname: The name of the view
            **kwargs: URL parameters
            
        Returns:
            The complete URL
        """
        return reverse(viewname, kwargs=kwargs)

    @staticmethod
    def assert_response_data(
        response_data: Dict[str, Any],
        expected_data: Dict[str, Any],
        exclude_fields: Optional[List[str]] = None
    ) -> None:
        """
        Assert that response data matches expected data.
        
        Args:
            response_data: The actual response data
            expected_data: The expected data
            exclude_fields: Fields to exclude from comparison
        """
        exclude_fields = exclude_fields or []
        for key, value in expected_data.items():
            if key not in exclude_fields:
                assert key in response_data, f"Missing field: {key}"
                assert response_data[key] == value, f"Mismatched value for {key}"

class ModelTestMixin:
    """Mixin providing utility methods for model testing."""

    @staticmethod
    def assert_model_fields(
        model: Type[models.Model],
        expected_fields: List[str]
    ) -> None:
        """
        Assert that a model has the expected fields.
        
        Args:
            model: The model class to check
            expected_fields: List of field names that should exist
        """
        model_fields = [f.name for f in model._meta.get_fields()]
        for field in expected_fields:
            assert field in model_fields, f"Missing field: {field}"

    @staticmethod
    def assert_model_relations(
        model: Type[models.Model],
        expected_relations: Dict[str, Dict[str, Any]]
    ) -> None:
        """
        Assert that a model has the expected relations.
        
        Args:
            model: The model class to check
            expected_relations: Dictionary of relation names and their properties
        """
        for field_name, properties in expected_relations.items():
            field = model._meta.get_field(field_name)
            for prop_name, expected_value in properties.items():
                actual_value = getattr(field, prop_name)
                assert actual_value == expected_value, (
                    f"Field {field_name} has wrong {prop_name}. "
                    f"Expected {expected_value}, got {actual_value}"
                )

def create_test_upload_file(
    name: str = 'test.txt',
    content: bytes = b'test content',
    content_type: str = 'text/plain'
) -> 'SimpleUploadedFile':
    """
    Create a file for testing file uploads.
    
    Args:
        name: Name of the file
        content: File content as bytes
        content_type: MIME type of the file
        
    Returns:
        SimpleUploadedFile instance
    """
    from django.core.files.uploadedfile import SimpleUploadedFile
    return SimpleUploadedFile(name, content, content_type)

def get_test_image_file(
    name: str = 'test.png',
    ext: str = 'png',
    size: tuple = (100, 100),
    color: str = 'blue'
) -> 'SimpleUploadedFile':
    """
    Create an image file for testing.
    
    Args:
        name: Name of the image file
        ext: Image extension (format)
        size: Image dimensions
        color: Image color
        
    Returns:
        SimpleUploadedFile instance with the image
    """
    import io

    from PIL import Image
    image = Image.new('RGB', size, color)
    image_io = io.BytesIO()
    image.save(image_io, format=ext)
    image_file = create_test_upload_file(
        name=name,
        content=image_io.getvalue(),
        content_type=f'image/{ext}'
    )
    return image_file