import json
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..database.models import AnalysisRecord, UserSettings
from ..models.schemas import AnalysisRequest, AnalysisResponse, Issue
from ..analyzers.factory import get_analyzer

router = APIRouter(prefix="/api", tags=["analysis"])

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_code(req: AnalysisRequest, db: Session = Depends(get_db)):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty. Please paste or upload valid source code.")

    # Fetch user settings to respect enabled features
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    options = req.options or {}
    if settings:
        options.setdefault("min_duplicate_lines", settings.min_duplicate_lines)
        options.setdefault("detect_unused_vars", settings.detect_unused_vars)
        options.setdefault("detect_unused_imports", settings.detect_unused_imports)
        options.setdefault("detect_dead_code", settings.detect_dead_code)
        options.setdefault("detect_duplicate_code", settings.detect_duplicate_code)
        options.setdefault("detect_simplification", settings.detect_simplification)
        options.setdefault("detect_inefficient_loops", settings.detect_inefficient_loops)

    analyzer = get_analyzer(req.code, req.language, options)
    raw_issues, optimized_code = analyzer.analyze()

    # Filter issues based on preferences if specified
    filtered_issues: list[Issue] = []
    for issue in raw_issues:
        if issue.category == "unused_variables" and not options.get("detect_unused_vars", True):
            continue
        if issue.category == "unnecessary_imports" and not options.get("detect_unused_imports", True):
            continue
        if issue.category == "dead_code" and not options.get("detect_dead_code", True):
            continue
        if issue.category == "duplicate_code" and not options.get("detect_duplicate_code", True):
            continue
        if issue.category == "simplification" and not options.get("detect_simplification", True):
            continue
        if issue.category == "performance" and not options.get("detect_inefficient_loops", True):
            continue
        filtered_issues.append(issue)

    score = analyzer.calculate_score(filtered_issues)
    reduction_pct = analyzer.calculate_reduction(req.code, optimized_code)

    high_count = sum(1 for i in filtered_issues if i.severity == "High")
    med_count = sum(1 for i in filtered_issues if i.severity == "Medium")
    low_count = sum(1 for i in filtered_issues if i.severity == "Low")
    dup_count = sum(1 for i in filtered_issues if i.category == "duplicate_code")
    unused_vars_count = sum(1 for i in filtered_issues if i.category == "unused_variables")
    unused_imports_count = sum(1 for i in filtered_issues if i.category == "unnecessary_imports")

    orig_loc = len(req.code.splitlines())
    opt_loc = len(optimized_code.splitlines()) if optimized_code else orig_loc

    record_id = str(uuid.uuid4())
    title = req.filename if req.filename and req.filename != "snippet" else f"{req.language.capitalize()} Analysis #{record_id[:6]}"

    record = AnalysisRecord(
        id=record_id,
        title=title,
        language=req.language.lower(),
        source_code=req.code,
        optimized_code=optimized_code,
        code_quality_score=score,
        total_issues=len(filtered_issues),
        high_severity=high_count,
        medium_severity=med_count,
        low_severity=low_count,
        duplicate_blocks_count=dup_count,
        unused_vars_count=unused_vars_count,
        unused_imports_count=unused_imports_count,
        original_loc=orig_loc,
        optimized_loc=opt_loc,
        potential_reduction_pct=reduction_pct,
        issues_json=json.dumps([i.model_dump() for i in filtered_issues]),
        created_at=datetime.datetime.utcnow()
    )

    db.add(record)
    db.commit()

    return AnalysisResponse(
        id=record_id,
        title=title,
        language=req.language.lower(),
        code_quality_score=score,
        total_issues=len(filtered_issues),
        high_severity=high_count,
        medium_severity=med_count,
        low_severity=low_count,
        duplicate_blocks_count=dup_count,
        unused_vars_count=unused_vars_count,
        unused_imports_count=unused_imports_count,
        original_loc=orig_loc,
        optimized_loc=opt_loc,
        potential_reduction_pct=reduction_pct,
        original_code=req.code,
        optimized_code=optimized_code,
        issues=filtered_issues,
        created_at=record.created_at.isoformat()
    )
