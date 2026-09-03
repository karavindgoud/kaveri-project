import sys
from pathlib import Path

# Ensure backend and backend/apps are loaded
_backend = Path(__file__).resolve().parent.parent / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
if str(_backend / "apps") not in sys.path:
    sys.path.insert(0, str(_backend / "apps"))

from backend.api.main import app, lifespan

__all__ = ["app", "lifespan"]
