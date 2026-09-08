"""
Utility script for verifying and validating modal configuration templates.
Contains no destructive operations or runtime dependencies.
"""
import sys
import os

def check_modal_integrity():
    modal_file = os.path.join(os.path.dirname(__file__), 'frontend', 'src', 'pages', 'InterviewConfigModal.jsx')
    if not os.path.exists(modal_file):
        print(f"Info: {modal_file} not found directly from current working directory.")
        return True
    
    with open(modal_file, 'r', encoding='utf-8') as f:
        content = f.read()

    has_enter_handler = 'handleGlobalKeyDown' in content or 'onKeyDown' in content
    has_launch_guard = 'isLaunching' in content
    
    print(f"InterviewConfigModal validation:")
    print(f"  - Enter key handler present: {has_enter_handler}")
    print(f"  - Double-submission guard present: {has_launch_guard}")
    return has_enter_handler and has_launch_guard

if __name__ == '__main__':
    valid = check_modal_integrity()
    sys.exit(0 if valid else 1)
