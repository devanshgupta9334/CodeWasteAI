import re
from typing import List, Tuple, Dict
from .base import BaseAnalyzer
from .universal_duplicate_analyzer import UniversalDuplicateAnalyzer
from ..models.schemas import Issue

class CppAnalyzer(BaseAnalyzer):
    """
    Static analyzer for C++ and C codebases.
    Detects unused headers, unused variables, unreachable statements,
    inefficient endl flushing, and duplicate blocks.
    """
    def analyze(self) -> Tuple[List[Issue], str]:
        issues: List[Issue] = []

        # 1. Unused Includes
        include_pattern = re.compile(r'^\s*#include\s+[<"]([a-zA-Z0-9_./]+)[>"]')
        included_headers: Dict[str, Tuple[int, str]] = {}

        # Known common identifiers associated with standard headers
        header_identifiers = {
            "vector": ["vector"],
            "string": ["string"],
            "iostream": ["cout", "cin", "cerr", "endl"],
            "cmath": ["sqrt", "pow", "abs", "sin", "cos", "tan", "floor", "ceil"],
            "algorithm": ["sort", "find", "max", "min", "reverse", "transform"],
            "map": ["map"],
            "set": ["set"],
            "stdio.h": ["printf", "scanf", "sprintf", "fopen", "fclose"],
            "stdlib.h": ["malloc", "free", "exit", "atoi", "rand"],
            "string.h": ["strlen", "strcpy", "strcmp", "strcat", "memcpy"],
        }

        for lineno, line in enumerate(self.lines, start=1):
            m = include_pattern.match(line)
            if m:
                header = m.group(1).lower()
                base_header = header.split("/")[-1]
                included_headers[base_header] = (lineno, m.group(0))

        # Check if known header identifiers are present in the code
        for header, (lineno, raw_stmt) in included_headers.items():
            if header in header_identifiers:
                expected_ids = header_identifiers[header]
                found = any(re.search(rf'\b{re.escape(ident)}\b', self.code) for ident in expected_ids)
                if not found:
                    issues.append(
                        self.create_issue(
                            title=f"Likely Unused Header: <{header}>",
                            severity="Low",
                            category="unnecessary_imports",
                            line_number=lineno,
                            original_code=self.get_line_snippet(lineno),
                            explanation=f"Header '{header}' is included on line {lineno}, but none of its standard functions or types were detected in the code.",
                            suggested_code="// Remove unused header",
                            optimization_benefit="Reduces preprocessor expansion time and keeps build compilation faster."
                        )
                    )

        # 2. Unreachable Dead Code
        for lineno, line in enumerate(self.lines, start=1):
            stripped = line.strip()
            if re.match(r'^(return(?:\s+[^;]+)?;|break;|continue;|goto\s+[^;]+;)', stripped):
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
                            explanation=f"Statement on line {sub_idx} follows a terminating control transfer on line {lineno} and can never be reached.",
                            suggested_code="// Delete unreachable statement",
                            optimization_benefit="Prevents dead code accumulation and compiler warning C4702/Wunreachable-code."
                        )
                    )
                    break

        # 3. Unused Local Variables
        var_pattern = re.compile(r'^\s*(?:int|double|float|long|bool|char|size_t|auto|[a-zA-Z0-9_:]+)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=')
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
                            explanation=f"Variable '{var_name}' is assigned on line {lineno} but never referenced.",
                            suggested_code=f"// Remove variable '{var_name}'",
                            optimization_benefit="Avoids compiler -Wunused-variable warning and frees stack space."
                        )
                    )

        # 4. Inefficient std::endl in loops
        in_loop = False
        for lineno, line in enumerate(self.lines, start=1):
            if re.search(r'\b(for|while)\s*\(', line):
                in_loop = True
            if in_loop and "std::endl" in line or (in_loop and "endl" in line and "using namespace std" in self.code):
                issues.append(
                    self.create_issue(
                        title="Inefficient 'endl' Stream Flush in Loop",
                        severity="Low",
                        category="performance",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation="'std::endl' explicitly flushes the output buffer on every write, causing substantial I/O overhead inside loops. Use '\\n' instead.",
                        suggested_code=line.replace("endl", "'\\n'").strip(),
                        optimization_benefit="Significant I/O speedup (up to 10x-50x on standard output in benchmark tests)."
                    )
                )
            if in_loop and "}" in line:
                in_loop = False

        # 5. Duplicate Code Blocks
        duplicate_detector = UniversalDuplicateAnalyzer(self.code, self.language, min_lines=3)
        issues.extend(duplicate_detector.detect_duplicates())

        # 6. Optimizer
        from .optimizer import CodeOptimizer
        optimizer = CodeOptimizer(self.code, self.language, issues)
        optimized_code = optimizer.generate_optimized_code()

        return issues, optimized_code
