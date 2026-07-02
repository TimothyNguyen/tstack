import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Tuple


def check_ash_available() -> Tuple[bool, Optional[str]]:
    """Return (True, path) if ASH is on PATH, (False, None) otherwise."""
    path = shutil.which("ash")
    if path:
        return True, path
    return False, None


def run_ash_scan(
    directory_path: str,
    output_dir: Optional[str] = None,
    delta_scan: bool = False,
) -> Dict:
    """Run ASH scan on a directory. Requires ASH installed (use 'full' Docker target)."""
    available, ash_path = check_ash_available()
    if not available:
        return {
            "success": False,
            "error": (
                "ASH (Automated Security Helper) is not installed. "
                "Use the 'full' Docker target or install ASH separately."
            ),
        }

    out_dir = Path(output_dir) if output_dir else Path(directory_path) / ".security-reports" / "ash"
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = out_dir / f"{timestamp}.txt"

    cmd = [ash_path, "--source-dir", directory_path, "--output-dir", str(out_dir)]
    if delta_scan:
        cmd.append("--delta-scan")

    result = subprocess.run(cmd, capture_output=True, text=True)
    out_file.write_text(result.stdout + result.stderr, encoding="utf-8")

    return {
        "success": result.returncode == 0,
        "tool": "ash",
        "directory": directory_path,
        "output_file": str(out_file),
        "return_code": result.returncode,
    }
