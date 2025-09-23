"""
Utility package for the Learning Platform.

This package provides various utility modules that support the core functionality
of the learning platform. It includes tools for:

- Markdown processing and rendering (markdown_utils)
- Server health monitoring (check_server)
- Log analysis and monitoring (check_logs)

Usage:
    from utils.markdown_utils import convert_markdown_to_html
    from utils.check_server import check_server_health
    from utils.check_logs import check_backend_log_files
"""

from .check_logs import (check_backend_log_files, check_django_server_status,
                         check_network_connectivity, monitor_logs)
from .check_server import (check_database_connection, check_server_health,
                           monitor_response_times, run_comprehensive_check,
                           verify_jwt_token)
from .markdown_utils import (convert_markdown_to_html, extract_metadata,
                             process_code_blocks, validate_markdown_content)

__all__ = [
    # Markdown utils
    "convert_markdown_to_html",
    "process_code_blocks",
    "validate_markdown_content",
    "extract_metadata",
    # Server checks
    "check_server_health",
    "verify_jwt_token",
    "check_database_connection",
    "monitor_response_times",
    "run_comprehensive_check",
    # Log analysis
    "check_backend_log_files",
    "check_network_connectivity",
    "monitor_logs",
    "check_django_server_status",
]
