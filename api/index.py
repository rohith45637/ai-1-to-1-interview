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

from app.main import app as fastapi_app

class VercelPathNormalizer:
    def __init__(self, asgi_app):
        self.asgi_app = asgi_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if "/index.py" in path:
                path = path.replace("/index.py", "")
            if not path.startswith("/api"):
                path = "/api" + (path if path.startswith("/") else "/" + path)
            if path in ("/api", "/api/"):
                path = "/api/health"
            scope["path"] = path
            if "raw_path" in scope:
                scope["raw_path"] = path.encode("utf-8")
        await self.asgi_app(scope, receive, send)

# Expose both app and handler wrapped for 100% resilient Vercel routing
app = VercelPathNormalizer(fastapi_app)
handler = app
