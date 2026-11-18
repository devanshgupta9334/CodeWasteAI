import uuid
from typing import List, Dict, Any, Tuple
from ..models.schemas import Issue

class BaseAnalyzer:
    def __init__(self, code: str, language: str, options: Dict[str, Any] = None):
        self.code = code
        self.language = language.lower()
        self.options = options or {}
        self.lines = code.splitlines()
        self.total_loc = len([line for line in self.lines if line.strip() and not line.strip().startswith(("#", "//", "/*", "*"))])
        self.raw_loc = len(self.lines)

    def analyze(self) -> Tuple[List[Issue], str]:
        """
        Returns (issues, optimized_code)
        Must be implemented by subclasses.
        """
        raise NotImplementedError

    def get_line_snippet(self, start_line: int, end_line: int = None) -> str:
        """Helper to get exact slice of code lines (1-indexed)."""
        if not self.lines:
            return ""
        s = max(1, start_line) - 1
        e = (end_line if end_line else start_line)
        s = min(len(self.lines) - 1, s)
        e = min(len(self.lines), max(s + 1, e))
        return "\n".join(self.lines[s:e])

    def calculate_score(self, issues: List[Issue]) -> float:
        """
        Calculate a balanced quality score 0 - 100.
        Score drops based on severity and density of issues.
        """
        score = 100.0
        for issue in issues:
            if issue.severity == "High":
                score -= 12.0
            elif issue.severity == "Medium":
                score -= 6.0
            else:
                score -= 2.5

        if self.raw_loc > 0:
            # density factor
            issue_density = len(issues) / max(1, self.raw_loc)
            if issue_density > 0.5:
                score -= 10.0

        return max(5.0, min(100.0, round(score, 1)))

    def calculate_reduction(self, original_code: str, optimized_code: str) -> float:
        if not optimized_code:
            return 0.0
        orig_len = len(original_code.splitlines())
        opt_len = len(optimized_code.splitlines())
        if orig_len == 0 or opt_len >= orig_len:
            return 0.0
        reduction = ((orig_len - opt_len) / orig_len) * 100.0
        return round(reduction, 1)

    def create_issue(
        self,
        title: str,
        severity: str,
        category: str,
        line_number: int,
        original_code: str,
        explanation: str,
        suggested_code: str,
        optimization_benefit: str,
        end_line_number: int = None,
    ) -> Issue:
        return Issue(
            id=str(uuid.uuid4())[:8],
            title=title,
            severity=severity,
            category=category,
            line_number=line_number,
            end_line_number=end_line_number or line_number,
            original_code=original_code.strip(),
            explanation=explanation.strip(),
            suggested_code=suggested_code.strip(),
            optimization_benefit=optimization_benefit.strip()
        )
