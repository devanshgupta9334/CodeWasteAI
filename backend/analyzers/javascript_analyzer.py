import re
from typing import List, Tuple, Set, Dict
from .base import BaseAnalyzer
from .universal_duplicate_analyzer import UniversalDuplicateAnalyzer
from ..models.schemas import Issue

class JavaScriptAnalyzer(BaseAnalyzer):
    """
    Static analyzer for JavaScript and TypeScript codebases.
    Detects unused imports, unused variable declarations, unreachable code,
    redundant boolean checks, inefficient loop constructs, and duplicated blocks.
    """
    def analyze(self) -> Tuple[List[Issue], str]:
        issues: List[Issue] = []

        # 1. Unused Imports Detection
        # Match: import x from 'y'; or import { a, b } from 'y'; or const x = require('y');
        import_patterns = [
            (r'import\s+([A-Za-z0-9_]+)\s+from\s+[\'"][^\'"]+[\'"]', "default"),
            (r'import\s+\{([^}]+)\}\s+from\s+[\'"][^\'"]+[\'"]', "named"),
            (r'(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*require\([\'"][^\'"]+[\'"]\)', "require"),
        ]

        imported_symbols: Dict[str, int] = {}
        for lineno, line in enumerate(self.lines, start=1):
            stripped = line.strip()
            if stripped.startswith("//") or stripped.startswith("/*"):
                continue
            for pattern, ptype in import_patterns:
                m = re.search(pattern, stripped)
                if m:
                    if ptype in ("default", "require"):
                        imported_symbols[m.group(1)] = lineno
                    elif ptype == "named":
                        names = [n.strip().split(" as ")[-1].strip() for n in m.group(1).split(",")]
                        for name in names:
                            if name:
                                imported_symbols[name] = lineno

        # Check references in rest of file
        for sym, lineno in imported_symbols.items():
            # count occurrences of symbol as whole identifier
            matches = list(re.finditer(rf'\b{re.escape(sym)}\b', self.code))
            # If only occurs once (the import itself)
            if len(matches) <= 1:
                issues.append(
                    self.create_issue(
                        title=f"Unnecessary Import: '{sym}'",
                        severity="Low",
                        category="unnecessary_imports",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation=f"The imported module/symbol '{sym}' on line {lineno} is never referenced in this script.",
                        suggested_code=f"// Remove unused import '{sym}'",
                        optimization_benefit="Reduces bundle payload and clean up dependencies."
                    )
                )

        # 2. Unused Variable Declarations (const, let, var)
        var_pattern = re.compile(r'^\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=')
        for lineno, line in enumerate(self.lines, start=1):
            m = var_pattern.search(line)
            if m:
                var_name = m.group(1)
                if not var_name.startswith("_") and var_name not in imported_symbols:
                    occurrences = list(re.finditer(rf'\b{re.escape(var_name)}\b', self.code))
                    if len(occurrences) <= 1:
                        issues.append(
                            self.create_issue(
                                title=f"Unused Variable Declaration: '{var_name}'",
                                severity="Medium",
                                category="unused_variables",
                                line_number=lineno,
                                original_code=self.get_line_snippet(lineno),
                                explanation=f"Variable '{var_name}' is declared on line {lineno} but never read or referenced in the scope.",
                                suggested_code=f"// Delete declaration of '{var_name}'",
                                optimization_benefit="Avoids unused variable allocation and keeps scope clean."
                            )
                        )

        # 3. Dead / Unreachable Code Detection (after return, throw, break, continue)
        terminator_pattern = re.compile(r'^\s*(return(?:\s+[^;]+)?;|throw\s+[^;]+;|break;|continue;)')
        for lineno, line in enumerate(self.lines, start=1):
            if terminator_pattern.match(line.strip()):
                # Check subsequent lines until next closing brace or block boundary
                sub_line_idx = lineno  # 0-indexed is lineno
                while sub_line_idx < len(self.lines):
                    next_line = self.lines[sub_line_idx].strip()
                    sub_line_idx += 1
                    if not next_line or next_line.startswith("//"):
                        continue
                    if next_line.startswith("}") or next_line.startswith("case ") or next_line.startswith("default:"):
                        break
                    # If this is actual code
                    issues.append(
                        self.create_issue(
                            title="Unreachable Statement",
                            severity="High",
                            category="dead_code",
                            line_number=sub_line_idx,
                            original_code=self.get_line_snippet(sub_line_idx),
                            explanation=f"This statement on line {sub_line_idx} immediately follows a terminating return/throw on line {lineno} and will never be executed.",
                            suggested_code="// Delete unreachable statement",
                            optimization_benefit="Eliminates dead code and prevents misleading logic."
                        )
                    )
                    break

        # 4. Redundant boolean conditions
        for lineno, line in enumerate(self.lines, start=1):
            if re.search(r'===\s*true\b|==\s*true\b', line):
                issues.append(
                    self.create_issue(
                        title="Redundant Boolean Comparison (=== true)",
                        severity="Low",
                        category="simplification",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation="Explicitly checking '=== true' is unnecessary for boolean expressions in JavaScript/TypeScript.",
                        suggested_code=re.sub(r'===?\s*true\b', '', line).strip(),
                        optimization_benefit="Improves code conciseness and follows standard JS style."
                    )
                )
            elif re.search(r'===\s*false\b|==\s*false\b', line):
                issues.append(
                    self.create_issue(
                        title="Redundant Boolean Comparison (=== false)",
                        severity="Low",
                        category="simplification",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation="Can be simplified to '!condition' instead of comparing strictly to false.",
                        suggested_code="// Use !condition instead",
                        optimization_benefit="Cleaner and more readable boolean logic."
                    )
                )

        # 5. Inefficient Loops
        for lineno, line in enumerate(self.lines, start=1):
            if re.search(r'for\s*\(\s*(?:let|var)\s+i\s*=\s*0\s*;\s*i\s*<\s*([a-zA-Z0-9_$.]+)\.length\s*;\s*i\+\+\s*\)', line):
                m = re.search(r'([a-zA-Z0-9_$.]+)\.length', line)
                arr = m.group(1) if m else "array"
                issues.append(
                    self.create_issue(
                        title="Traditional Indexed For-Loop on Array",
                        severity="Low",
                        category="performance",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation=f"A traditional counter loop re-evaluates '{arr}.length' or requires manual index indexing. If index is not needed, 'for (const item of {arr})' or '{arr}.forEach()' is more idiomatic.",
                        suggested_code=f"for (const item of {arr}) {{\n  // use item directly\n}}",
                        optimization_benefit="Cleaner syntax, eliminates index off-by-one errors, and modern engine optimization."
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
