import re
from typing import List, Tuple, Dict
from .base import BaseAnalyzer
from .universal_duplicate_analyzer import UniversalDuplicateAnalyzer
from ..models.schemas import Issue

class JavaAnalyzer(BaseAnalyzer):
    """
    Static analyzer for Java codebases.
    Detects unused imports, unused variable declarations, unreachable code,
    inefficient string concatenation in loops, redundant conditions, and duplicate blocks.
    """
    def analyze(self) -> Tuple[List[Issue], str]:
        issues: List[Issue] = []

        # 1. Unused Imports
        import_pattern = re.compile(r'^\s*import\s+(?:static\s+)?([a-zA-Z0-9_.]+(?:\.([a-zA-Z0-9_*]+)));')
        imported_symbols: Dict[str, Tuple[int, str]] = {}

        for lineno, line in enumerate(self.lines, start=1):
            m = import_pattern.match(line)
            if m:
                full_import = m.group(1)
                last_token = m.group(2)
                if last_token and last_token != "*":
                    imported_symbols[last_token] = (lineno, full_import)

        # Check references in rest of file
        for sym, (lineno, full_import) in imported_symbols.items():
            matches = list(re.finditer(rf'\b{re.escape(sym)}\b', self.code))
            if len(matches) <= 1:
                issues.append(
                    self.create_issue(
                        title=f"Unused Import: '{full_import}'",
                        severity="Low",
                        category="unnecessary_imports",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation=f"Import '{full_import}' on line {lineno} is never referenced in this class.",
                        suggested_code="// Remove this unused import",
                        optimization_benefit="Cleans up compilation classpath and removes obsolete references."
                    )
                )

        # 2. Dead / Unreachable code after return or throw
        for lineno, line in enumerate(self.lines, start=1):
            stripped = line.strip()
            if re.match(r'^(return(?:\s+[^;]+)?;|throw\s+new\s+[^;]+;)', stripped):
                sub_idx = lineno
                while sub_idx < len(self.lines):
                    next_line = self.lines[sub_idx].strip()
                    sub_idx += 1
                    if not next_line or next_line.startswith("//") or next_line.startswith("/*"):
                        continue
                    if next_line.startswith("}") or next_line.startswith("case ") or next_line.startswith("default:"):
                        break
                    issues.append(
                        self.create_issue(
                            title="Unreachable Statement",
                            severity="High",
                            category="dead_code",
                            line_number=sub_idx,
                            original_code=self.get_line_snippet(sub_idx),
                            explanation=f"Statement on line {sub_idx} is unreachable because it follows a terminating statement on line {lineno}.",
                            suggested_code="// Delete unreachable statement",
                            optimization_benefit="Java compiler will reject unreachable code as a compile error (JLS §14.21)."
                        )
                    )
                    break

        # 3. Unused local variables
        var_pattern = re.compile(r'^\s*(?:int|double|float|long|boolean|String|char|var|[A-Z][a-zA-Z0-9_<>]*)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=')
        for lineno, line in enumerate(self.lines, start=1):
            m = var_pattern.search(line)
            if m:
                var_name = m.group(1)
                occurrences = list(re.finditer(rf'\b{re.escape(var_name)}\b', self.code))
                if len(occurrences) <= 1:
                    issues.append(
                        self.create_issue(
                            title=f"Unused Variable: '{var_name}'",
                            severity="Medium",
                            category="unused_variables",
                            line_number=lineno,
                            original_code=self.get_line_snippet(lineno),
                            explanation=f"Variable '{var_name}' is declared on line {lineno} but never referenced.",
                            suggested_code=f"// Remove variable '{var_name}'",
                            optimization_benefit="Reduces JVM stack frame allocation and clarifies class logic."
                        )
                    )

        # 4. String concatenation inside loops
        in_loop = False
        loop_start = 0
        for lineno, line in enumerate(self.lines, start=1):
            if re.search(r'\b(for|while)\s*\(', line):
                in_loop = True
                loop_start = lineno
            if in_loop and re.search(r'\b[a-zA-Z0-9_]+\s*\+=\s*', line):
                issues.append(
                    self.create_issue(
                        title="Inefficient String Concatenation in Loop",
                        severity="Medium",
                        category="performance",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation="Using '+=' for string concatenation inside a loop instantiates a new StringBuilder and String object on every iteration, leading to O(N^2) memory churn.",
                        suggested_code="StringBuilder sb = new StringBuilder();\n// inside loop: sb.append(...);",
                        optimization_benefit="Decreases execution time from quadratic O(N^2) to linear O(N) and prevents excessive GC pressure."
                    )
                )
                in_loop = False
            if in_loop and "}" in line:
                in_loop = False

        # 5. Redundant Boolean Comparisons
        for lineno, line in enumerate(self.lines, start=1):
            if re.search(r'==\s*true\b', line):
                issues.append(
                    self.create_issue(
                        title="Redundant Boolean Comparison (== true)",
                        severity="Low",
                        category="simplification",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation="Comparing boolean values directly to 'true' is redundant.",
                        suggested_code=re.sub(r'==\s*true\b', '', line).strip(),
                        optimization_benefit="Cleaner and more idiomatic Java code."
                    )
                )

        # 6. Universal Duplicate Code Detection
        duplicate_detector = UniversalDuplicateAnalyzer(self.code, self.language, min_lines=3)
        issues.extend(duplicate_detector.detect_duplicates())

        # 7. Optimizer
        from .optimizer import CodeOptimizer
        optimizer = CodeOptimizer(self.code, self.language, issues)
        optimized_code = optimizer.generate_optimized_code()

        return issues, optimized_code
