import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
_backend = _root / "backend"
_backend_api = _backend / "api"
_backend_apps = _backend / "apps"

if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
if str(_backend_apps) not in sys.path:
    sys.path.insert(0, str(_backend_apps))

if str(_backend_api) not in __path__:
    __path__.insert(0, str(_backend_api))
