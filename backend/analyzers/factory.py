from typing import Tuple, List, Dict, Any
from .base import BaseAnalyzer
from .python_analyzer import PythonAnalyzer
from .javascript_analyzer import JavaScriptAnalyzer
from .java_analyzer import JavaAnalyzer
from .cpp_analyzer import CppAnalyzer
from ..models.schemas import Issue

def get_analyzer(code: str, language: str, options: Dict[str, Any] = None) -> BaseAnalyzer:
    lang = language.lower().strip()
    if lang in ("python", "py"):
        return PythonAnalyzer(code, lang, options)
    elif lang in ("javascript", "js", "typescript", "ts", "jsx", "tsx"):
        return JavaScriptAnalyzer(code, lang, options)
    elif lang in ("java",):
        return JavaAnalyzer(code, lang, options)
    elif lang in ("cpp", "c++", "c", "cc", "cxx", "h", "hpp"):
        return CppAnalyzer(code, lang, options)
    else:
        # Fallback to JavaScript analyzer for generic C-like syntax
        return JavaScriptAnalyzer(code, lang, options)
