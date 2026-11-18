# CodeWaste Detector - Optimization Report

**Title:** sample_python.py
**Language:** python
**Quality Score:** 71.0 / 100
**Potential Code Reduction:** 27.8%
**Total Issues:** 5 (High: 1, Med: 2, Low: 2)

## Issues Breakdown

### 1. [Low] Unnecessary Import: 'math' (Line 1)
**Category:** unnecessary_imports

**Explanation:** The module or symbol 'math' is imported on line 1 but never referenced anywhere in the script.

```
import math
```

**Suggested Optimization:**
```
# Remove this import statement
```

**Benefit:** Reduces startup overhead, avoids namespace pollution, and cleans up dependencies.

---

### 2. [Low] Unnecessary Import: 'os' (Line 2)
**Category:** unnecessary_imports

**Explanation:** The module or symbol 'os' is imported on line 2 but never referenced anywhere in the script.

```
import os
```

**Suggested Optimization:**
```
# Remove this import statement
```

**Benefit:** Reduces startup overhead, avoids namespace pollution, and cleans up dependencies.

---

### 3. [Medium] Unused Variable: 'unused_variable' (Line 5)
**Category:** unused_variables

**Explanation:** Variable 'unused_variable' is declared/assigned on line 5 but never read or used in this scope.

```
unused_variable = 100
```

**Suggested Optimization:**
```
# Remove 'unused_variable' or replace with '_' if intentionally ignored
```

**Benefit:** Eliminates unnecessary memory allocation and clarifies code intent.

---

### 4. [High] Unreachable Dead Code (Line 8)
**Category:** dead_code

**Explanation:** This code will never execute because it follows a terminating 'return' statement on line 7.

```
print("This is unreachable")
```

**Suggested Optimization:**
```
# Delete unreachable code
```

**Benefit:** Removes dead lines that confuse readers and clutter coverage reports.

---

### 5. [Medium] Duplicate Code Block (3 lines) (Line 16)
**Category:** duplicate_code

**Explanation:** This block of code (lines 16–18) is identical to lines 11–13.
Duplicated code violates the DRY (Don't Repeat Yourself) principle, increases maintenance cost, and can lead to bugs when changes are not synced.

```
    x = 10
    y = 20
    return x + y
```

**Suggested Optimization:**
```
// Refactor: Extract repeated logic into a shared helper function
// Call that function in both locations (lines 11 and 16).
```

**Benefit:** Reduces ~3 lines of redundant code and ensures single source of truth for updates.

---

