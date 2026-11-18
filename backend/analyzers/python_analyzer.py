import ast
from typing import List, Dict, Set, Tuple, Any
from .base import BaseAnalyzer
from .universal_duplicate_analyzer import UniversalDuplicateAnalyzer
from ..models.schemas import Issue

class VariableScopeVisitor(ast.NodeVisitor):
    """
    Collects defined and used variables per scope (FunctionDef, AsyncFunctionDef, Module, ClassDef).
    """
    def __init__(self):
        module_scope = {
            "type": "module",
            "name": "<module>",
            "defs": {},    # var_name -> (line, col)
            "uses": set(),  # set of var_names
            "params": {},  # param_name -> line
        }
        self.scope_stack: List[Dict[str, Any]] = [module_scope]
        self.all_scopes: List[Dict[str, Any]] = [module_scope]

    def current_scope(self):
        return self.scope_stack[-1]

    def visit_FunctionDef(self, node: ast.FunctionDef):
        # Register function name in parent scope
        self.current_scope()["defs"][node.name] = (node.lineno, node.col_offset)
        
        # New function scope
        new_scope = {
            "type": "function",
            "name": node.name,
            "defs": {},
            "uses": set(),
            "params": {},
        }
        for arg in node.args.args:
            if arg.arg not in ("self", "cls"):
                new_scope["params"][arg.arg] = arg.lineno
        self.scope_stack.append(new_scope)
        self.all_scopes.append(new_scope)
        self.generic_visit(node)
        self.scope_stack.pop()
        return

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self.current_scope()["defs"][node.name] = (node.lineno, node.col_offset)
        new_scope = {
            "type": "async_function",
            "name": node.name,
            "defs": {},
            "uses": set(),
            "params": {},
        }
        for arg in node.args.args:
            if arg.arg not in ("self", "cls"):
                new_scope["params"][arg.arg] = arg.lineno
        self.scope_stack.append(new_scope)
        self.all_scopes.append(new_scope)
        self.generic_visit(node)
        self.scope_stack.pop()
        return

    def visit_Name(self, node: ast.Name):
        scope = self.current_scope()
        if isinstance(node.ctx, ast.Store):
            # Assigned variable
            # Ignore special Python variables like _ or __all__
            if not node.id.startswith("_"):
                scope["defs"][node.id] = (node.lineno, node.col_offset)
        elif isinstance(node.ctx, ast.Load):
            scope["uses"].add(node.id)
            # Also propagate up to parent scopes if not found locally
            for s in reversed(self.scope_stack):
                s["uses"].add(node.id)

    def visit_Global(self, node: ast.Global):
        for name in node.names:
            self.current_scope()["uses"].add(name)

    def visit_Nonlocal(self, node: ast.Nonlocal):
        for name in node.names:
            self.current_scope()["uses"].add(name)


class PythonAnalyzer(BaseAnalyzer):
    def analyze(self) -> Tuple[List[Issue], str]:
        issues: List[Issue] = []

        try:
            tree = ast.parse(self.code)
        except SyntaxError as e:
            # Report syntax error gracefully
            issues.append(
                self.create_issue(
                    title="Python Syntax Error",
                    severity="High",
                    category="dead_code",
                    line_number=e.lineno or 1,
                    original_code=self.get_line_snippet(e.lineno or 1),
                    explanation=f"Syntax error prevents parsing: {e.msg}",
                    suggested_code="# Fix the syntax error to enable full AST analysis",
                    optimization_benefit="Allows the code to compile and execute properly."
                )
            )
            return issues, self.code

        # 1. Unused Imports Detection
        imported_names: Dict[str, Tuple[int, str, str]] = {}  # alias_or_name -> (lineno, original_module, statement_type)
        all_loaded_names: Set[str] = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    name_to_check = alias.asname if alias.asname else alias.name
                    imported_names[name_to_check] = (node.lineno, alias.name, "import")
            elif isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    if alias.name == "*":
                        continue
                    name_to_check = alias.asname if alias.asname else alias.name
                    imported_names[name_to_check] = (node.lineno, f"{node.module}.{alias.name}" if node.module else alias.name, "from")
            elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                all_loaded_names.add(node.id)
            elif isinstance(node, ast.Attribute) and isinstance(node.value, ast.Name):
                all_loaded_names.add(node.value.id)

        for name, (lineno, mod, stype) in imported_names.items():
            # If the base module name or alias was never loaded anywhere
            base_name = name.split(".")[0]
            if base_name not in all_loaded_names and name not in all_loaded_names:
                orig_snippet = self.get_line_snippet(lineno)
                issues.append(
                    self.create_issue(
                        title=f"Unnecessary Import: '{name}'",
                        severity="Low",
                        category="unnecessary_imports",
                        line_number=lineno,
                        original_code=orig_snippet,
                        explanation=f"The module or symbol '{name}' is imported on line {lineno} but never referenced anywhere in the script.",
                        suggested_code="# Remove this import statement",
                        optimization_benefit="Reduces startup overhead, avoids namespace pollution, and cleans up dependencies."
                    )
                )

        # 2. Scope & Unused Variable / Parameter Analysis
        scope_visitor = VariableScopeVisitor()
        scope_visitor.visit(tree)

        for scope in scope_visitor.all_scopes:
            defs = scope["defs"]
            uses = scope["uses"]
            params = scope["params"]

            # Unused variables
            for var_name, (lineno, _) in defs.items():
                # Check if it's a top-level function definition
                is_function = any(isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name == var_name for n in tree.body)
                
                if var_name not in uses and not var_name.startswith("_"):
                    orig_snippet = self.get_line_snippet(lineno)
                    if is_function:
                        # Only flag internal helper functions (e.g., _unused_helper) or inner functions as dead code
                        if var_name.startswith("_") or scope["type"] != "module":
                            issues.append(
                                self.create_issue(
                                    title=f"Uncalled Helper Function: '{var_name}()'",
                                    severity="Low",
                                    category="dead_code",
                                    line_number=lineno,
                                    original_code=orig_snippet,
                                    explanation=f"Function '{var_name}' is declared on line {lineno} but never called in this script.",
                                    suggested_code=f"# Remove or invoke '{var_name}'",
                                    optimization_benefit="Eliminates unused callable routines and declutters code."
                                )
                            )
                    else:
                        issues.append(
                            self.create_issue(
                                title=f"Unused Variable: '{var_name}'",
                                severity="Medium",
                                category="unused_variables",
                                line_number=lineno,
                                original_code=orig_snippet,
                                explanation=f"Variable '{var_name}' is declared/assigned on line {lineno} but never read or used in this scope.",
                                suggested_code=f"# Remove '{var_name}' or replace with '_' if intentionally ignored",
                                optimization_benefit="Eliminates unnecessary memory allocation and clarifies code intent."
                            )
                        )

            # Unused parameters
            for param_name, plineno in params.items():
                if param_name not in uses and not param_name.startswith("_"):
                    orig_snippet = self.get_line_snippet(plineno)
                    issues.append(
                        self.create_issue(
                            title=f"Unused Function Parameter: '{param_name}'",
                            severity="Low",
                            category="unused_variables",
                            line_number=plineno,
                            original_code=orig_snippet,
                            explanation=f"Parameter '{param_name}' is accepted by function '{scope['name']}' on line {plineno} but is never used in the function body.",
                            suggested_code=f"# Remove parameter '{param_name}' if not required by an interface/signature",
                            optimization_benefit="Simplifies function calling contract and prevents developer confusion."
                        )
                    )

        # 3. Dead / Unreachable Code Detection
        for parent_node in ast.walk(tree):
            # Check statement lists: body, orelse, finalbody
            for field in ("body", "orelse", "finalbody"):
                stmts = getattr(parent_node, field, None)
                if isinstance(stmts, list) and len(stmts) > 1:
                    terminator_seen = False
                    terminator_node = None
                    for stmt in stmts:
                        if terminator_seen:
                            start_line = stmt.lineno
                            end_line = getattr(stmt, "end_lineno", stmt.lineno)
                            snippet = self.get_line_snippet(start_line, end_line)
                            term_type = terminator_node.__class__.__name__.lower()
                            issues.append(
                                self.create_issue(
                                    title="Unreachable Dead Code",
                                    severity="High",
                                    category="dead_code",
                                    line_number=start_line,
                                    end_line_number=end_line,
                                    original_code=snippet,
                                    explanation=f"This code will never execute because it follows a terminating '{term_type}' statement on line {terminator_node.lineno}.",
                                    suggested_code="# Delete unreachable code",
                                    optimization_benefit="Removes dead lines that confuse readers and clutter coverage reports."
                                )
                            )
                        elif isinstance(stmt, (ast.Return, ast.Raise, ast.Break, ast.Continue)):
                            terminator_seen = True
                            terminator_node = stmt

        # 4. Code Simplification & Redundancies
        for node in ast.walk(tree):
            # Check for `if x == True:` or `if x is True:` or `== False`
            if isinstance(node, ast.Compare):
                for comp, op in zip(node.comparators, node.ops):
                    if isinstance(comp, ast.Constant) and isinstance(comp.value, bool):
                        lineno = node.lineno
                        orig_snippet = self.get_line_snippet(lineno)
                        if isinstance(op, (ast.Eq, ast.Is)):
                            if comp.value is True:
                                issues.append(
                                    self.create_issue(
                                        title="Redundant Boolean Comparison (== True)",
                                        severity="Low",
                                        category="simplification",
                                        line_number=lineno,
                                        original_code=orig_snippet,
                                        explanation="Comparing directly with '== True' is redundant in Python. The variable can be tested directly for truthiness.",
                                        suggested_code="if condition:  # test directly",
                                        optimization_benefit="More idiomatic Python (PEP 8) and slightly faster bytecode evaluation."
                                    )
                                )
                            else:
                                issues.append(
                                    self.create_issue(
                                        title="Redundant Boolean Comparison (== False)",
                                        severity="Low",
                                        category="simplification",
                                        line_number=lineno,
                                        original_code=orig_snippet,
                                        explanation="Comparing directly with '== False' can be written cleanly as 'if not condition:'.",
                                        suggested_code="if not condition:",
                                        optimization_benefit="Improves readability and conforms to standard Python style."
                                    )
                                )

            # Check for `if True:` or `if False:`
            if isinstance(node, ast.If) and isinstance(node.test, ast.Constant) and isinstance(node.test.value, bool):
                lineno = node.lineno
                issues.append(
                    self.create_issue(
                        title=f"Static Condition 'if {node.test.value}:'",
                        severity="Medium",
                        category="simplification",
                        line_number=lineno,
                        original_code=self.get_line_snippet(lineno),
                        explanation=f"Condition 'if {node.test.value}' is constant and always evaluates to {node.test.value}. The branch or wrapper is redundant.",
                        suggested_code="# Inline or eliminate the constant branch",
                        optimization_benefit="Removes unnecessary branch evaluation and dead alternative branches."
                    )
                )

            # Check for useless `pass` in blocks containing other statements
            if hasattr(node, "body") and isinstance(node.body, list) and len(node.body) > 1:
                for stmt in node.body:
                    if isinstance(stmt, ast.Pass):
                        issues.append(
                            self.create_issue(
                                title="Redundant 'pass' Statement",
                                severity="Low",
                                category="simplification",
                                line_number=stmt.lineno,
                                original_code=self.get_line_snippet(stmt.lineno),
                                explanation="'pass' is only needed as a placeholder in empty blocks. Since this block contains other active statements, 'pass' is completely redundant.",
                                suggested_code="# Delete the redundant 'pass' statement",
                                optimization_benefit="Cleans up unnecessary lines of code."
                            )
                        )

            # 5. Inefficient Patterns & Performance
            # A) range(len(list)) pattern
            if isinstance(node, ast.For):
                if isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range":
                    if node.iter.args and isinstance(node.iter.args[0], ast.Call) and isinstance(node.iter.args[0].func, ast.Name) and node.iter.args[0].func.id == "len":
                        target_name = node.target.id if isinstance(node.target, ast.Name) else "index"
                        iterable_arg = node.iter.args[0].args[0]
                        iter_name = iterable_arg.id if isinstance(iterable_arg, ast.Name) else "items"
                        issues.append(
                            self.create_issue(
                                title=f"Inefficient Loop: 'range(len({iter_name}))'",
                                severity="Medium",
                                category="performance",
                                line_number=node.lineno,
                                original_code=self.get_line_snippet(node.lineno),
                                explanation=f"Iterating using 'range(len({iter_name}))' is considered an anti-pattern in Python. It forces manual index lookups instead of direct iteration.",
                                suggested_code=f"for item in {iter_name}:\n# or: for {target_name}, item in enumerate({iter_name}):",
                                optimization_benefit="Avoids index subscription overhead and makes loop bodies much more pythonic and readable."
                            )
                        )

            # B) Pointless .keys() iteration on dictionary
            if isinstance(node, ast.For) and isinstance(node.iter, ast.Call):
                if isinstance(node.iter.func, ast.Attribute) and node.iter.func.attr == "keys":
                    dict_name = node.iter.func.value.id if isinstance(node.iter.func.value, ast.Name) else "dict"
                    target_name = node.target.id if isinstance(node.target, ast.Name) else "key"
                    issues.append(
                        self.create_issue(
                            title="Redundant .keys() Call in Dictionary Iteration",
                            severity="Low",
                            category="performance",
                            line_number=node.lineno,
                            original_code=self.get_line_snippet(node.lineno),
                            explanation=f"Iterating directly over '{dict_name}' already iterates its keys. Calling '.keys()' creates an unnecessary method call and view.",
                            suggested_code=f"for {target_name} in {dict_name}:",
                            optimization_benefit="Saves function call overhead and produces cleaner code."
                        )
                    )

            # C) String concatenation in loop: s += ...
            if isinstance(node, (ast.For, ast.While)):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.AugAssign) and isinstance(sub.op, ast.Add) and isinstance(sub.target, ast.Name):
                        # Detect string concatenation in loop
                        issues.append(
                            self.create_issue(
                                title=f"Repeated String Concatenation in Loop ('{sub.target.id} += ...')",
                                severity="Medium",
                                category="performance",
                                line_number=sub.lineno,
                                original_code=self.get_line_snippet(sub.lineno),
                                explanation=f"Repeatedly appending strings with '+=' inside a loop causes O(N^2) memory reallocation because strings in Python are immutable.",
                                suggested_code=f"parts = []\n# inside loop: parts.append(...)\n{sub.target.id} = ''.join(parts)",
                                optimization_benefit="Reduces time complexity from quadratic O(N^2) to linear O(N)."
                            )
                        )
                        break

        # 6. Universal Duplicate Code Detection
        duplicate_detector = UniversalDuplicateAnalyzer(self.code, self.language, min_lines=3)
        duplicate_issues = duplicate_detector.detect_duplicates()
        issues.extend(duplicate_issues)

        # 7. Generate Safe Optimized Code
        from .optimizer import CodeOptimizer
        optimizer = CodeOptimizer(self.code, self.language, issues)
        optimized_code = optimizer.generate_optimized_code()

        return issues, optimized_code
