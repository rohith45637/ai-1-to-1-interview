import sys
import os

# Add api directory to sys.path so 'app' package is found
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# Also add backend directory as fallback
backend_dir = os.path.abspath(os.path.join(api_dir, '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
