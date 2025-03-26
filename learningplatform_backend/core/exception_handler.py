from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF to provide consistent error responses.
    """
    # Call the default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Log the exception
        logger.error(
            f"Exception occurred in {context['view'].__class__.__name__}: {exc}",
            exc_info=True,
        )

        # Customize the response data
        response.data = {
            "error": {
                "type": exc.__class__.__name__,
                "detail": response.data.get("detail", "An error occurred."),
                "status_code": response.status_code,
            }
        }
    else:
        # Handle non-DRF exceptions
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        response = Response(
            {
                "error": {
                    "type": exc.__class__.__name__,
                    "detail": "An unexpected error occurred.",
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
