"""
Technical Reader Agent (Pure Python)
Zero-Tolerance Format Checking per AGENTS.md: Golden Rules
"""

from typing import Dict, List, Any
from docx import Document
from docx.shared import Pt


class TechnicalReaderAgent:
    """
    Pure Python agent for format checking.
    Does not use LLM - relies on exact measurements.
    """

    def __init__(self, docx_path: str, rubric: Dict[str, Any]):
        self.docx_path = docx_path
        self.doc = Document(docx_path)
        self.rubric = rubric
        self.errors: List[Dict[str, Any]] = []

    def check_margins(self) -> Dict[str, Any]:
        """Check page margins against rubric"""
        requirements = {
            "left": self.rubric.get("margin_left_inches", 1.5),
            "right": self.rubric.get("margin_right_inches", 1.0),
            "top": self.rubric.get("margin_top_inches", 1.0),
            "bottom": self.rubric.get("margin_bottom_inches", 1.0),
        }

        if not self.doc.sections:
            return {"success": False, "error": "No sections found"}

        actual = {}
        section = self.doc.sections[0]
        actual["left"] = section.left_margin.inches
        actual["right"] = section.right_margin.inches
        actual["top"] = section.top_margin.inches
        actual["bottom"] = section.bottom_margin.inches

        violations = []
        for margin_type, required in requirements.items():
            if abs(actual[margin_type] - required) > 0.05:  # 0.05 inch tolerance
                violations.append({
                    "type": "margin",
                    "margin": margin_type,
                    "required": required,
                    "actual": round(actual[margin_type], 2),
                    "severity": "major",
                })

        return {
            "success": len(violations) == 0,
            "violations": violations,
            "actual": actual,
        }

    def check_font_properties(self) -> Dict[str, Any]:
        """Check font family and size"""
        requirements = {
            "font_family": self.rubric.get("font_family", "Times New Roman"),
            "font_size": self.rubric.get("font_size", 12),
        }

        violations = []

        for para in self.doc.paragraphs:
            for run in para.runs:
                if run.font.name and run.font.name != requirements["font_family"]:
                    violations.append({
                        "type": "font_family",
                        "required": requirements["font_family"],
                        "actual": run.font.name,
                        "severity": "major",
                    })
                    break  # Report once per paragraph

                if run.font.size:
                    actual_size = run.font.size.pt
                    if actual_size != requirements["font_size"]:
                        violations.append({
                            "type": "font_size",
                            "required": requirements["font_size"],
                            "actual": actual_size,
                            "severity": "minor",
                        })
                        break

        return {
            "success": len(violations) == 0,
            "violations": violations[:5],  # Return first 5 violations
        }

    def run_analysis(self) -> Dict[str, Any]:
        """Run full technical analysis"""
        margin_check = self.check_margins()
        font_check = self.check_font_properties()

        all_violations = margin_check.get("violations", []) + font_check.get("violations", [])

        major_errors = len([v for v in all_violations if v.get("severity") == "major"])
        minor_errors = len([v for v in all_violations if v.get("severity") == "minor"])

        return {
            "agent": "technical_reader",
            "success": margin_check.get("success") and font_check.get("success"),
            "major_errors": major_errors,
            "minor_errors": minor_errors,
            "violations": all_violations,
            "summary": f"Found {major_errors} major and {minor_errors} minor formatting issues",
        }
