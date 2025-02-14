import os
import sys
import json

def capture_pythonpath():
    """
    Capture and analyze the current PYTHONPATH configuration
    """
    # Capture system path
    system_path = sys.path.copy()
    
    # Capture environment PYTHONPATH
    env_pythonpath = os.environ.get('PYTHONPATH', '').split(os.pathsep) if os.environ.get('PYTHONPATH') else []
    
    # Analyze path details
    path_details = {
        'system_paths': system_path,
        'env_pythonpath': env_pythonpath,
        'current_working_directory': os.getcwd(),
        'path_analysis': {
            'total_paths': len(system_path),
            'unique_paths': len(set(system_path)),
            'duplicate_paths': len(system_path) - len(set(system_path))
        }
    }
    
    # Write detailed path information to a JSON file
    with open('pythonpath_diagnostic_output.json', 'w') as f:
        json.dump(path_details, f, indent=2)
    
    # Print paths for immediate visibility
    print("PYTHONPATH Diagnostic Output:")
    print("=" * 40)
    print("System Paths:")
    for path in system_path:
        print(f"  - {path}")
    
    print("\nEnvironment PYTHONPATH:")
    for path in env_pythonpath:
        print(f"  - {path}")
    
    print("\nPath Analysis:")
    print(f"  Total Paths: {path_details['path_analysis']['total_paths']}")
    print(f"  Unique Paths: {path_details['path_analysis']['unique_paths']}")
    print(f"  Duplicate Paths: {path_details['path_analysis']['duplicate_paths']}")

if __name__ == '__main__':
    capture_pythonpath()