"""
Configure Python's import system to include our project paths.
"""
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Add parent directory to Python path for imports from sibling packages
parent_dir = os.path.dirname(backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)