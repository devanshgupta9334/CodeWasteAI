import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class AnalysisRecord(Base):
    __tablename__ = "analysis_history"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, default="Untitled Snippet")
    language = Column(String, nullable=False)
    source_code = Column(Text, nullable=False)
    optimized_code = Column(Text, nullable=True)
    code_quality_score = Column(Float, default=100.0)
    total_issues = Column(Integer, default=0)
    high_severity = Column(Integer, default=0)
    medium_severity = Column(Integer, default=0)
    low_severity = Column(Integer, default=0)
    duplicate_blocks_count = Column(Integer, default=0)
    unused_vars_count = Column(Integer, default=0)
    unused_imports_count = Column(Integer, default=0)
    original_loc = Column(Integer, default=0)
    optimized_loc = Column(Integer, default=0)
    potential_reduction_pct = Column(Float, default=0.0)
    issues_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, default=1)
    theme = Column(String, default="dark")
    default_language = Column(String, default="python")
    min_duplicate_lines = Column(Integer, default=3)
    detect_unused_vars = Column(Boolean, default=True)
    detect_unused_imports = Column(Boolean, default=True)
    detect_dead_code = Column(Boolean, default=True)
    detect_duplicate_code = Column(Boolean, default=True)
    detect_simplification = Column(Boolean, default=True)
    detect_inefficient_loops = Column(Boolean, default=True)
    auto_optimize = Column(Boolean, default=True)
    ai_api_key = Column(String, default="")
    ai_model = Column(String, default="default")
