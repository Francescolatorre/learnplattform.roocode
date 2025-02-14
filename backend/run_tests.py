import os
import sys
import pytest

def print_path():
    print("Current PYTHONPATH:")
    for path in sys.path:
        print(f"  {path}")
    print()

print("Current directory:", os.getcwd())
print_path()

# Run pytest with importlib mode
pytest.main(["-v", "--import-mode=importlib"])