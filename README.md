# ⚡ CodeWaste Detector — AI-Powered Code Optimization Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-0.47-1e1e1e.svg)](https://microsoft.github.io/monaco-editor/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)

**CodeWaste Detector** is a developer tool and static analysis platform designed to identify unnecessary, redundant, and inefficient code in software repositories. It uses **multi-pass Abstract Syntax Tree (AST)** inspection and **token-sequence duplicate matching** to produce actionable findings, measurable quality scores, and automatically refactored code.

---

## 🌟 Key Features

1. **Rule-Based Static Analysis Engine (No External AI API Required)**
   - **Python AST Visitor**: Scopes variable definitions, loads, function definitions, parameters, and terminating statements without executing arbitrary code.
   - **Universal Duplicate Detection**: Sliding window token/line normalization that detects repeated code blocks across Python, JavaScript, TypeScript, Java, and C++.
   - **Multi-Language Analysis**: Supports Python, JavaScript, TypeScript, Java, C++, and C.

2. **Detections Modules**
   - **Unused Variables & Parameters**: Flags identifiers allocated or defined but never read in the scope.
   - **Unnecessary Imports**: Identifies unused modules, packages, or headers.
   - **Unreachable Dead Code**: Detects orphaned statements placed after `return`, `throw`, `raise`, `break`, or `continue`.
   - **Duplicate Code Blocks**: Locates identical logic, displays line ranges, and calculates refactoring benefits.
   - **Code Simplification**: Catches redundant boolean comparisons (`== True`, `=== false`), redundant `pass` statements, and constant branches.
   - **Performance Anti-Patterns**: Detects O(N²) string concatenation in loops (`+=`), `range(len())` index iteration, and `std::endl` stream flushes.

3. **Interactive Developer Experience**
   - **Monaco Code Editor**: Professional VS Code-powered editor with syntax highlighting, line numbers, and minimap.
   - **Sample Code Library**: 1-click test cases for Python, JavaScript, Java, and C++.
   - **Side-by-Side Before/After Comparison**: Unified Monaco DiffEditor highlighting removed (red) vs optimized (green) statements with 1-click **Copy** and **Download**.
   - **Visual Analytics with Recharts**: Pie charts for issue distribution, severity breakdowns, and LOC reduction metrics.
   - **ReportLab PDF Export**: Generates professional PDF audit reports ready for distribution.
   - **Persistent SQLite History**: Records every analysis with code metrics, quality scores, and timestamps.
   - **Customizable Settings**: Configurable duplicate line thresholds, detection toggles, and language defaults.

---

## 🏗️ Project Architecture

```
/SustainableDevansh
  ├── backend/
  │   ├── analyzers/
  │   │   ├── base.py                       # Base analyzer class & score calculation
  │   │   ├── python_analyzer.py             # AST scope visitor, dead code, imports & loops
  │   │   ├── javascript_analyzer.py         # JS/TS lexical & block AST analyzer
  │   │   ├── java_analyzer.py               # Java compilation unit & string loop analyzer
  │   │   ├── cpp_analyzer.py                # C/C++ preprocessor & stream analyzer
  │   │   ├── universal_duplicate_analyzer.py# Sliding-window token sequence duplicate detector
  │   │   ├── optimizer.py                  # Safe automated code transformer
  │   │   └── factory.py                    # Language dispatcher
  │   ├── database/
  │   │   ├── models.py                     # SQLAlchemy models (AnalysisRecord, UserSettings)
  │   │   └── db.py                         # SQLite engine setup
  │   ├── routes/
  │   │   ├── analyze.py                    # POST /api/analyze
  │   │   ├── history.py                    # GET, DELETE /api/history
  │   │   ├── settings.py                   # GET, POST /api/settings
  │   │   └── export.py                     # POST /api/export (PDF & JSON)
  │   ├── models/
  │   │   └── schemas.py                    # Pydantic request/response schemas
  │   └── main.py                           # FastAPI application entrypoint & static mounting
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── Sidebar.tsx               # Navigation sidebar
  │   │   │   ├── Header.tsx                # Top navigation header
  │   │   │   ├── CodeComparison.tsx        # Side-by-side Monaco Diff view
  │   │   │   ├── IssueCard.tsx             # Interactive expandable issue card
  │   │   │   ├── CategoryBadge.tsx         # Category and severity pills
  │   │   │   └── QualityScoreGauge.tsx     # Circular SVG quality score gauge
  │   │   ├── pages/
  │   │   │   ├── DashboardPage.tsx         # Metrics overview & recent history
  │   │   │   ├── AnalyzerPage.tsx          # Monaco code editor & upload controls
  │   │   │   ├── ResultsPage.tsx           # Categorized findings & tabs
  │   │   │   ├── ReportsPage.tsx           # Recharts visual analytics & PDF export
  │   │   │   ├── HistoryPage.tsx           # Searchable SQLite run history
  │   │   │   └── SettingsPage.tsx          # Analysis rule toggles & preferences
  │   │   ├── services/
  │   │   │   └── api.ts                    # REST API client
  │   │   ├── utils/
  │   │   │   └── samples.ts                # Sample test cases for all languages
  │   │   ├── types/
  │   │   │   └── index.ts                  # TypeScript interface definitions
  │   │   ├── App.tsx                       # Root application layout & state machine
  │   │   ├── main.tsx                      # Vite React mount
  │   │   └── index.css                     # Tailwind CSS directives & scrollbar styles
  │   ├── package.json
  │   ├── vite.config.ts
  │   ├── tailwind.config.js
  │   └── tsconfig.json
  ├── reports/                              # Generated PDF & Markdown export samples
  ├── requirements.txt                      # Python dependencies
  ├── start.sh                              # Automated one-click execution script
  └── README.md                             # Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed

### 1. One-Click Launch (Recommended)
Run the automated launcher script:
```bash
./start.sh
```
This automatically prepares the virtual environment, builds the production frontend assets, and launches the unified server at **http://127.0.0.1:8000**.

---

### 2. Manual Development Mode (Frontend + Backend)

#### Terminal 1 — Backend:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2 — Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** in your browser. (API requests are automatically proxied to the backend).

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status, version, and active analyzer engines |
| `POST` | `/api/analyze` | Run static code analysis on submitted source code |
| `GET` | `/api/history` | List all past analysis runs stored in SQLite |
| `GET` | `/api/history/{id}` | Retrieve complete findings and code for a specific run |
| `DELETE` | `/api/history/{id}` | Delete a single history record |
| `DELETE` | `/api/history` | Clear all analysis records |
| `GET` | `/api/settings` | Get user preferences and detection rules |
| `POST` | `/api/settings` | Update user preferences |
| `POST` | `/api/export` | Download analysis report in PDF, Markdown, or JSON |

### Sample Analysis Request
```bash
curl -X POST http://127.0.0.1:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import math\nimport os\n\ndef calculate_total(a, b):\n    unused = 100\n    return a + b\n    print(\"unreachable\")",
    "language": "python",
    "filename": "demo.py"
  }'
```

---

## 🧪 Demonstration Test Cases

### Test Case 1: Standard Python Snippet
```python
import math
import os

def calculate_total(a, b):
    unused_variable = 100
    result = a + b
    return result
    print("This is unreachable")

def repeated_function():
    x = 10
    y = 20
    return x + y

def another_function():
    x = 10
    y = 20
    return x + y
```
**Detected Issues:**
- `math` — Unnecessary import (Line 1)
- `os` — Unnecessary import (Line 2)
- `unused_variable` — Unused variable declaration (Line 5)
- `print("This is unreachable")` — Unreachable dead code after return (Line 8)
- Lines 16–18 — Duplicate code block identical to lines 11–13 (3 lines)
- **Code Quality Score:** 71.0 / 100
- **Safe Code Reduction:** -27.8% LOC

---

## 🎓 Academic Presentation & Defense Walkthrough

1. **Dashboard Overview**: Show aggregated statistics (Total files analyzed, total issues detected, duplicate blocks, potential code reduction %).
2. **Code Analyzer**:
   - Click the **PYTHON** sample button to load the test case.
   - Click **Analyze Code** and watch the animated progress state.
3. **Analysis Findings**:
   - Point out the **Quality Score Gauge** (Grade C / 71%).
   - Browse the severity pills (**High: 1, Med: 2, Low: 2**).
   - Filter by tabs (**Unused Variables**, **Duplicate Code**, **Dead Code**, **Unused Imports**).
   - Expand an issue card to show the explanation, line number, original snippet, and suggested fix.
4. **Before & After Differential View**:
   - Switch to the **Before & After** tab.
   - Show the side-by-side Monaco editor where dead code and unused imports are eliminated.
   - Demonstrate 1-click **Copy Optimized Code** and **Download File**.
5. **Optimization Reports & Charts**:
   - Inspect the Recharts distribution pie chart and the LOC reduction comparison bar chart.
   - Click **Download PDF Report** to view the ReportLab-generated document.
6. **SQLite History**:
   - Navigate to **Analysis History** to show persistent storage and instant report re-opening.
7. **Settings**:
   - Demonstrate toggling detection modules and adjusting duplicate line thresholds.

# CodeWasteAI
