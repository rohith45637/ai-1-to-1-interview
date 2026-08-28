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

# Vercel's Python runtime forwards the real, original request path
# (e.g. /api/health) straight into the ASGI scope for functions that
# export an ASGI `app` — no path rewriting/normalization is needed or
# supported. See: https://vercel.com/docs/frameworks/backend/fastapi
# ("Vercel natively supports ASGI apps - just export the app directly").
# The previous VercelPathNormalizer wrapper mutated scope["path"] based
# on an incorrect assumption about how Vercel forwards paths, which is
# why /api/health and friends were resolving to FastAPI's own 404
# handler ({"detail":"Not Found"}) instead of the real routes.
app = fastapi_app
handler = app
