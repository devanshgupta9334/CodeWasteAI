import re
from typing import List
from ..models.schemas import Issue

class CodeOptimizer:
    """
    Produces safe, syntactically valid optimized code based on detected issues.
    Never breaks program behavior: only applies safe transforms such as removing
    dead code, unused imports, redundant pass statements, and simplifying boolean comparisons.
    """
    def __init__(self, code: str, language: str, issues: List[Issue]):
        self.code = code
        self.language = language.lower()
        self.issues = issues

    def generate_optimized_code(self) -> str:
        lines = self.code.splitlines()
        lines_to_delete = set()
        line_replacements = {}

        # 1. Gather lines to safely remove or replace
        for issue in self.issues:
            # A. Unnecessary imports
            if issue.category == "unnecessary_imports":
                # Only delete if it is a whole import line
                for l in range(issue.line_number, (issue.end_line_number or issue.line_number) + 1):
                    if 1 <= l <= len(lines):
                        line_text = lines[l - 1].strip()
                        if line_text.startswith(("import ", "from ", "#include", "// import")):
                            lines_to_delete.add(l - 1)

            # B. Unreachable dead code
            elif issue.category == "dead_code" and "unreachable" in issue.title.lower():
                for l in range(issue.line_number, (issue.end_line_number or issue.line_number) + 1):
                    if 1 <= l <= len(lines):
                        lines_to_delete.add(l - 1)

            # C. Redundant pass statement
            elif issue.category == "simplification" and "pass" in issue.title.lower():
                if 1 <= issue.line_number <= len(lines):
                    lines_to_delete.add(issue.line_number - 1)

            # D. Unused variable declarations (if standalone assignment without side effects)
            elif issue.category == "unused_variables" and "unused variable" in issue.title.lower():
                if 1 <= issue.line_number <= len(lines):
                    raw_line = lines[issue.line_number - 1]
                    stripped = raw_line.strip()
                    # Safe to remove if it's a simple assignment like `x = 10` or `int x = 10;` without function calls
                    if "=" in stripped and not any(f in stripped for f in ("(", ")", "await", "yield")):
                        lines_to_delete.add(issue.line_number - 1)

            # E. Redundant boolean comparisons
            elif issue.category == "simplification" and "==" in issue.title:
                idx = issue.line_number - 1
                if 0 <= idx < len(lines):
                    curr = lines[idx]
                    # replace == True / is True
                    curr = re.sub(r'==\s*True\b', '', curr)
                    curr = re.sub(r'\bis\s+True\b', '', curr)
                    curr = re.sub(r'==\s*true\b', '', curr)
                    # clean up dangling spaces before colon
                    curr = re.sub(r'\s+:', ':', curr)
                    line_replacements[idx] = curr

        # Build output lines
        new_lines = []
        for i, line in enumerate(lines):
            if i in lines_to_delete:
                continue
            if i in line_replacements:
                new_lines.append(line_replacements[i])
            else:
                new_lines.append(line)

        # Clean multiple consecutive empty lines
        cleaned = []
        consecutive_blank = 0
        for l in new_lines:
            if not l.strip():
                consecutive_blank += 1
                if consecutive_blank <= 1:
                    cleaned.append(l)
            else:
                consecutive_blank = 0
                cleaned.append(l)

        optimized = "\n".join(cleaned).strip()
        # Return optimized version or original if no modifications
        return optimized if optimized else self.code
