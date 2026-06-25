"""Content type detection — pure builtins, no deps."""

from __future__ import annotations

from enum import Enum, auto


class ContentType(Enum):
    DICT = auto()
    LIST = auto()
    CODE = auto()
    LOG = auto()
    DIFF = auto()
    TEXT = auto()


_CODE_MARKERS = frozenset(
    {
        "def ",
        "class ",
        "import ",
        "from ",
        "function ",
        "const ",
        "let ",
        "var ",
        "public ",
        "private ",
        "async ",
        "await ",
        "return ",
        "if __name__",
        "#!/",
        "package ",
        "func ",
        "fn ",
        "impl ",
        "module ",
        "export ",
        "interface ",
        "struct ",
    }
)

_LOG_PATTERNS = frozenset(
    {
        "[INFO]",
        "[WARN]",
        "[ERROR]",
        "[DEBUG]",
        "[TRACE]",
        " INFO ",
        " WARN ",
        " ERROR ",
        " DEBUG ",
        " TRACE ",
        "INFO:",
        "WARN:",
        "ERROR:",
        "DEBUG:",
        "TRACE:",
        "WARNING:",
        "CRITICAL:",
        "PASSED",
        "FAILED",
        "ERRORS",
        "--- PASS:",
        "--- FAIL:",
        "test result: ",
        " passed",
        " failed",
        "✓",
        "✗",
        "✕",
    }
)


def _looks_like_diff(head: str) -> bool:
    if "@@" not in head:
        return False
    if head.startswith("diff --git") or "\ndiff --git" in head:
        return True
    has_minus = head.startswith("--- ") or "\n--- " in head
    has_plus = "\n+++ " in head
    return has_minus and has_plus


def detect(obj: object) -> ContentType:
    """Detect content type from a Python object. O(1) for non-str types."""
    if isinstance(obj, dict):
        return ContentType.DICT
    if isinstance(obj, (list, tuple)):
        return ContentType.LIST
    if not isinstance(obj, str):
        return ContentType.TEXT

    head = obj[:2048]

    if _looks_like_diff(head):
        return ContentType.DIFF

    if any(m in head for m in _LOG_PATTERNS):
        return ContentType.LOG

    lines = head.split("\n", 30)
    for line in lines:
        stripped = line.lstrip()
        if any(stripped.startswith(k) for k in _CODE_MARKERS):
            return ContentType.CODE

    return ContentType.TEXT
