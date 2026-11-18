import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..database.models import AnalysisRecord
from ..models.schemas import HistoryItem, AnalysisResponse, Issue

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("", response_model=List[HistoryItem])
def list_history(db: Session = Depends(get_db)):
    records = db.query(AnalysisRecord).order_by(AnalysisRecord.created_at.desc()).all()
    return [
        HistoryItem(
            id=r.id,
            title=r.title or "Untitled Analysis",
            language=r.language,
            code_quality_score=r.code_quality_score,
            total_issues=r.total_issues,
            high_severity=r.high_severity,
            medium_severity=r.medium_severity,
            low_severity=r.low_severity,
            duplicate_blocks_count=r.duplicate_blocks_count,
            unused_vars_count=r.unused_vars_count,
            unused_imports_count=r.unused_imports_count,
            original_loc=r.original_loc,
            optimized_loc=r.optimized_loc,
            potential_reduction_pct=r.potential_reduction_pct,
            created_at=r.created_at.isoformat()
        )
        for r in records
    ]

@router.get("/{record_id}", response_model=AnalysisResponse)
def get_history_detail(record_id: str, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    issues_data = []
    if record.issues_json:
        try:
            issues_data = [Issue(**i) for i in json.loads(record.issues_json)]
        except Exception:
            issues_data = []

    return AnalysisResponse(
        id=record.id,
        title=record.title or "Untitled Analysis",
        language=record.language,
        code_quality_score=record.code_quality_score,
        total_issues=record.total_issues,
        high_severity=record.high_severity,
        medium_severity=record.medium_severity,
        low_severity=record.low_severity,
        duplicate_blocks_count=record.duplicate_blocks_count,
        unused_vars_count=record.unused_vars_count,
        unused_imports_count=record.unused_imports_count,
        original_loc=record.original_loc,
        optimized_loc=record.optimized_loc,
        potential_reduction_pct=record.potential_reduction_pct,
        original_code=record.source_code,
        optimized_code=record.optimized_code,
        issues=issues_data,
        created_at=record.created_at.isoformat()
    )

@router.delete("/{record_id}")
def delete_history_item(record_id: str, db: Session = Depends(get_db)):
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Analysis record not found.")
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Record {record_id} deleted"}

@router.delete("")
def clear_all_history(db: Session = Depends(get_db)):
    db.query(AnalysisRecord).delete()
    db.commit()
    return {"status": "success", "message": "All analysis history cleared."}
