export type Severity = "High" | "Medium" | "Low";

export type IssueCategory =
  | "all"
  | "unused_variables"
  | "duplicate_code"
  | "unnecessary_imports"
  | "dead_code"
  | "simplification"
  | "performance";

export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  category: IssueCategory;
  line_number: number;
  end_line_number?: number;
  original_code: string;
  explanation: string;
  suggested_code: string;
  optimization_benefit: string;
}

export interface AnalysisResult {
  id: string;
  title: string;
  language: string;
  code_quality_score: number;
  total_issues: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
  duplicate_blocks_count: number;
  unused_vars_count: number;
  unused_imports_count: number;
  original_loc: number;
  optimized_loc: number;
  potential_reduction_pct: number;
  original_code: string;
  optimized_code?: string;
  issues: Issue[];
  created_at: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  language: string;
  code_quality_score: number;
  total_issues: number;
  high_severity: number;
  medium_severity: number;
  low_severity: number;
  duplicate_blocks_count: number;
  unused_vars_count: number;
  unused_imports_count: number;
  original_loc: number;
  optimized_loc: number;
  potential_reduction_pct: number;
  created_at: string;
}

export interface UserSettings {
  theme: string;
  default_language: string;
  min_duplicate_lines: number;
  detect_unused_vars: boolean;
  detect_unused_imports: boolean;
  detect_dead_code: boolean;
  detect_duplicate_code: boolean;
  detect_simplification: boolean;
  detect_inefficient_loops: boolean;
  auto_optimize: boolean;
  ai_api_key?: string;
  ai_model?: string;
}

export type NavigationPage =
  | "dashboard"
  | "analyzer"
  | "results"
  | "comparison"
  | "reports"
  | "history"
  | "settings";
