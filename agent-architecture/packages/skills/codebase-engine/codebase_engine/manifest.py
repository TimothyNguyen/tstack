# manifest.py — thin re-export shim so callers can do `from codebase_engine.manifest import ...`
# without knowing that the implementation lives in detect.py.
# detect.py owns manifest helpers because file-type detection and manifest
# read/write share the same corpus state; splitting them would require passing
# that state across a module boundary on every incremental run.
from codebase_engine.detect import save_manifest, load_manifest, detect_incremental

__all__ = ["save_manifest", "load_manifest", "detect_incremental"]
