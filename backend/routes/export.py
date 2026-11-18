import io
import json
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database.db import get_db
from ..database.models import AnalysisRecord
from ..models.schemas import ExportRequest

router = APIRouter(prefix="/api/export", tags=["export"])

@router.post("")
def export_report(req: ExportRequest, db: Session = Depends(get_db)):
    record = None
    if req.analysis_id:
        record = db.query(AnalysisRecord).filter(AnalysisRecord.id == req.analysis_id).first()

    data = req.data or {}
    if record:
        data = {
            "title": record.title or "CodeWaste Analysis Report",
            "language": record.language,
            "code_quality_score": record.code_quality_score,
            "total_issues": record.total_issues,
            "high_severity": record.high_severity,
            "medium_severity": record.medium_severity,
            "low_severity": record.low_severity,
            "duplicate_blocks_count": record.duplicate_blocks_count,
            "unused_vars_count": record.unused_vars_count,
            "unused_imports_count": record.unused_imports_count,
            "original_loc": record.original_loc,
            "optimized_loc": record.optimized_loc,
            "potential_reduction_pct": record.potential_reduction_pct,
            "issues": json.loads(record.issues_json or "[]"),
            "created_at": record.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    if not data:
        raise HTTPException(status_code=400, detail="No analysis data provided to export.")

    if req.format == "json":
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=codewaste_report_{data.get('title', 'export')}.json"}
        )

    if req.format == "markdown":
        md = f"# CodeWaste Detector - Optimization Report\n\n"
        md += f"**Title:** {data.get('title')}\n"
        md += f"**Language:** {data.get('language')}\n"
        md += f"**Quality Score:** {data.get('code_quality_score')} / 100\n"
        md += f"**Potential Code Reduction:** {data.get('potential_reduction_pct')}%\n"
        md += f"**Total Issues:** {data.get('total_issues')} (High: {data.get('high_severity')}, Med: {data.get('medium_severity')}, Low: {data.get('low_severity')})\n\n"
        md += "## Issues Breakdown\n\n"
        for i, iss in enumerate(data.get("issues", []), 1):
            md += f"### {i}. [{iss.get('severity')}] {iss.get('title')} (Line {iss.get('line_number')})\n"
            md += f"**Category:** {iss.get('category')}\n\n"
            md += f"**Explanation:** {iss.get('explanation')}\n\n"
            md += f"```\n{iss.get('original_code')}\n```\n\n"
            md += f"**Suggested Optimization:**\n```\n{iss.get('suggested_code')}\n```\n\n"
            md += f"**Benefit:** {iss.get('optimization_benefit')}\n\n---\n\n"

        return Response(
            content=md,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=codewaste_report.md"}
        )

    # PDF Export using ReportLab
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#6366f1"),
            spaceAfter=10
        )
        subtitle_style = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1e293b")
        )
        code_style = ParagraphStyle(
            'CodeStyle',
            parent=styles['Code'],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#0f172a"),
            backColor=colors.HexColor("#f1f5f9"),
            borderPadding=4
        )

        elements = []
        elements.append(Paragraph("CodeWaste Detector &bull; Optimization Report", title_style))
        elements.append(Paragraph(f"Generated for: <b>{data.get('title')}</b> | Language: <b>{data.get('language')}</b> | Score: <b>{data.get('code_quality_score')}/100</b>", subtitle_style))
        elements.append(Spacer(1, 10))

        # Overview Table
        summary_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Code Quality Score", f"{data.get('code_quality_score')}/100", "Total Issues", str(data.get('total_issues'))],
            ["High Severity", str(data.get('high_severity')), "Medium Severity", str(data.get('medium_severity'))],
            ["Low Severity", str(data.get('low_severity')), "Code Reduction", f"{data.get('potential_reduction_pct')}%"],
            ["Original LOC", str(data.get('original_loc')), "Optimized LOC", str(data.get('optimized_loc'))],
            ["Duplicate Blocks", str(data.get('duplicate_blocks_count')), "Unused Vars", str(data.get('unused_vars_count'))],
        ]

        t = Table(summary_data, colWidths=[130, 130, 130, 130])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e0e7ff")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#312e81")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 15))

        elements.append(Paragraph("Detected Issues & Optimization Recommendations", h2_style))
        issues_list = data.get("issues", [])
        if not issues_list:
            elements.append(Paragraph("No issues detected! Clean code detected.", body_style))
        else:
            for idx, iss in enumerate(issues_list[:25], 1):
                sev_color = "#ef4444" if iss.get("severity") == "High" else ("#f59e0b" if iss.get("severity") == "Medium" else "#3b82f6")
                iss_head = f"<b>#{idx}. [{iss.get('severity')}] {iss.get('title')} (Line {iss.get('line_number')})</b>"
                elements.append(Paragraph(iss_head, body_style))
                elements.append(Paragraph(f"<b>Category:</b> {iss.get('category')} | <b>Benefit:</b> {iss.get('optimization_benefit')}", body_style))
                elements.append(Paragraph(f"<b>Explanation:</b> {iss.get('explanation')}", body_style))
                if iss.get("original_code"):
                    snippet = iss.get("original_code")[:200]
                    elements.append(Preformatted(f"Original:\n{snippet}", code_style))
                elements.append(Spacer(1, 8))

        doc.build(elements)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=codewaste_report.pdf"}
        )

    except Exception as e:
        # Fallback to JSON or markdown if PDF rendering encounters unexpected error
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")
