import sys
from pathlib import Path

# Ensure backend and backend/apps are loaded
_backend = Path(__file__).resolve().parent / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
if str(_backend / "apps") not in sys.path:
    sys.path.insert(0, str(_backend / "apps"))

from backend.api.main import app, lifespan

__all__ = ["app", "lifespan"]

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

