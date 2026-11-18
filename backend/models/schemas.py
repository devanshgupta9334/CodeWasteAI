from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Issue(BaseModel):
    id: str
    title: str
    severity: str  # "High" | "Medium" | "Low"
    category: str  # "unused_variables" | "duplicate_code" | "unnecessary_imports" | "dead_code" | "simplification" | "performance"
    line_number: int
    end_line_number: Optional[int] = None
    original_code: str
    explanation: str
    suggested_code: str
    optimization_benefit: str

class AnalysisRequest(BaseModel):
    code: str
    language: str
    filename: Optional[str] = "snippet"
    options: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    id: str
    title: str
    language: str
    code_quality_score: float
    total_issues: int
    high_severity: int
    medium_severity: int
    low_severity: int
    duplicate_blocks_count: int
    unused_vars_count: int
    unused_imports_count: int
    original_loc: int
    optimized_loc: int
    potential_reduction_pct: float
    original_code: str
    optimized_code: Optional[str] = None
    issues: List[Issue] = []
    created_at: str

class HistoryItem(BaseModel):
    id: str
    title: str
    language: str
    code_quality_score: float
    total_issues: int
    high_severity: int
    medium_severity: int
    low_severity: int
    duplicate_blocks_count: int
    unused_vars_count: int
    unused_imports_count: int
    original_loc: int
    optimized_loc: int
    potential_reduction_pct: float
    created_at: str

class SettingsModel(BaseModel):
    theme: str = "dark"
    default_language: str = "python"
    min_duplicate_lines: int = 3
    detect_unused_vars: bool = True
    detect_unused_imports: bool = True
    detect_dead_code: bool = True
    detect_duplicate_code: bool = True
    detect_simplification: bool = True
    detect_inefficient_loops: bool = True
    auto_optimize: bool = True
    ai_api_key: Optional[str] = ""
    ai_model: Optional[str] = "default"

class ExportRequest(BaseModel):
    analysis_id: Optional[str] = None
    format: str = "pdf"  # "pdf" | "json" | "markdown"
    data: Optional[Dict[str, Any]] = None
