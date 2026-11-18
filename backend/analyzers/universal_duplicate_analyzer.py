from typing import List, Dict, Tuple
from ..models.schemas import Issue
import uuid

class UniversalDuplicateAnalyzer:
    """
    Detects repeated blocks of code across any programming language using
    normalized token/line sequence matching and sliding hash windows.
    """
    def __init__(self, code: str, language: str, min_lines: int = 3):
        self.code = code
        self.language = language.lower()
        self.min_lines = min_lines
        self.lines = code.splitlines()

    def _normalize_line(self, line: str) -> str:
        stripped = line.strip()
        # ignore single-line comments in common languages
        for prefix in ("//", "#", "--", "/*"):
            if stripped.startswith(prefix):
                return ""
        # normalize whitespace inside statement
        return " ".join(stripped.split())

    def detect_duplicates(self) -> List[Issue]:
        issues: List[Issue] = []
        normalized = []
        orig_indices = []

        # Filter out empty and comment lines, mapping back to original 1-based line numbers
        for i, line in enumerate(self.lines, start=1):
            norm = self._normalize_line(line)
            # Skip single closing braces or common trivial lines
            if norm and norm not in ("{", "}", "(", ")", "pass", ";", "begin", "end"):
                normalized.append(norm)
                orig_indices.append(i)

        total_valid = len(normalized)
        if total_valid < self.min_lines * 2:
            return issues

        seen_blocks: Dict[str, Tuple[int, int]] = {}
        detected_ranges = set()

        # Try block lengths from 8 down to min_lines
        for window_size in range(min(12, total_valid // 2), self.min_lines - 1, -1):
            for i in range(total_valid - window_size + 1):
                block = normalized[i : i + window_size]
                block_key = "\n".join(block)
                start_line_1 = orig_indices[i]
                end_line_1 = orig_indices[i + window_size - 1]

                # Check if this range overlaps with already detected longer range
                if any(start_line_1 >= s and end_line_1 <= e for (s, e) in detected_ranges):
                    continue

                if block_key in seen_blocks:
                    prev_start, prev_end = seen_blocks[block_key]
                    # Ensure they do not overlap
                    if end_line_1 < prev_start or start_line_1 > prev_end:
                        detected_ranges.add((start_line_1, end_line_1))
                        detected_ranges.add((prev_start, prev_end))

                        orig_snippet = "\n".join(self.lines[start_line_1 - 1 : end_line_1])
                        prev_snippet = "\n".join(self.lines[prev_start - 1 : prev_end])

                        issue = Issue(
                            id=str(uuid.uuid4())[:8],
                            title=f"Duplicate Code Block ({end_line_1 - start_line_1 + 1} lines)",
                            severity="Medium",
                            category="duplicate_code",
                            line_number=start_line_1,
                            end_line_number=end_line_1,
                            original_code=orig_snippet,
                            explanation=(
                                f"This block of code (lines {start_line_1}–{end_line_1}) is identical to lines {prev_start}–{prev_end}.\n"
                                f"Duplicated code violates the DRY (Don't Repeat Yourself) principle, increases maintenance cost, and can lead to bugs when changes are not synced."
                            ),
                            suggested_code=(
                                f"// Refactor: Extract repeated logic into a shared helper function\n"
                                f"// Call that function in both locations (lines {prev_start} and {start_line_1})."
                            ),
                            optimization_benefit=f"Reduces ~{end_line_1 - start_line_1 + 1} lines of redundant code and ensures single source of truth for updates."
                        )
                        issues.append(issue)
                else:
                    seen_blocks[block_key] = (start_line_1, end_line_1)

        return issues
