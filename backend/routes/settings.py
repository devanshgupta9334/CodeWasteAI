from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..database.models import UserSettings
from ..models.schemas import SettingsModel

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("", response_model=SettingsModel)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return SettingsModel(
        theme=settings.theme or "dark",
        default_language=settings.default_language or "python",
        min_duplicate_lines=settings.min_duplicate_lines or 3,
        detect_unused_vars=settings.detect_unused_vars if settings.detect_unused_vars is not None else True,
        detect_unused_imports=settings.detect_unused_imports if settings.detect_unused_imports is not None else True,
        detect_dead_code=settings.detect_dead_code if settings.detect_dead_code is not None else True,
        detect_duplicate_code=settings.detect_duplicate_code if settings.detect_duplicate_code is not None else True,
        detect_simplification=settings.detect_simplification if settings.detect_simplification is not None else True,
        detect_inefficient_loops=settings.detect_inefficient_loops if settings.detect_inefficient_loops is not None else True,
        auto_optimize=settings.auto_optimize if settings.auto_optimize is not None else True,
        ai_api_key=settings.ai_api_key or "",
        ai_model=settings.ai_model or "default"
    )

@router.post("", response_model=SettingsModel)
def update_settings(req: SettingsModel, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    if not settings:
        settings = UserSettings(id=1)
        db.add(settings)

    settings.theme = req.theme
    settings.default_language = req.default_language
    settings.min_duplicate_lines = req.min_duplicate_lines
    settings.detect_unused_vars = req.detect_unused_vars
    settings.detect_unused_imports = req.detect_unused_imports
    settings.detect_dead_code = req.detect_dead_code
    settings.detect_duplicate_code = req.detect_duplicate_code
    settings.detect_simplification = req.detect_simplification
    settings.detect_inefficient_loops = req.detect_inefficient_loops
    settings.auto_optimize = req.auto_optimize
    settings.ai_api_key = req.ai_api_key
    settings.ai_model = req.ai_model

    db.commit()
    db.refresh(settings)
    return req
