"""codebase-engine - extract · build · cluster · analyze · report."""


def __getattr__(name):
    # Lazy imports so the CLI works before heavy deps are in place.
    _map = {
        "extract": ("codebase_engine.extract", "extract"),
        "collect_files": ("codebase_engine.extract", "collect_files"),
        "build_from_json": ("codebase_engine.build", "build_from_json"),
        "cluster": ("codebase_engine.cluster", "cluster"),
        "score_all": ("codebase_engine.cluster", "score_all"),
        "cohesion_score": ("codebase_engine.cluster", "cohesion_score"),
        "god_nodes": ("codebase_engine.analyze", "god_nodes"),
        "surprising_connections": ("codebase_engine.analyze", "surprising_connections"),
        "suggest_questions": ("codebase_engine.analyze", "suggest_questions"),
        "generate": ("codebase_engine.report", "generate"),
        "to_json": ("codebase_engine.export", "to_json"),
        "to_html": ("codebase_engine.export", "to_html"),
        "to_svg": ("codebase_engine.export", "to_svg"),
        "to_canvas": ("codebase_engine.export", "to_canvas"),
    }
    if name in _map:
        import importlib
        mod_name, attr = _map[name]
        mod = importlib.import_module(mod_name)
        return getattr(mod, attr)
    raise AttributeError(f"module 'codebase_engine' has no attribute {name!r}")
