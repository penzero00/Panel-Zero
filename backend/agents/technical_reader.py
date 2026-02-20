import os
from typing import Dict, List, Any, Optional
from docx import Document
from docx.shared import Pt
from .llm_executor import BytezExecutor

class TechnicalReaderAgent(BytezExecutor):
    """
    Panelist Agent: Focuses on methodology, code quality, and technical correctness (via Bytez AI),
    AND performs Zero-Tolerance Format Checking (via python-docx).
    """
    def __init__(self, docx_path: Optional[str] = None, rubric: Optional[Dict[str, Any]] = None):
        super().__init__()
        
        # 1. Structural/Formatting Setup
        self.docx_path = docx_path
        if docx_path and os.path.exists(docx_path):
            self.doc = Document(docx_path)
        else:
            self.doc = None
            
        self.rubric = rubric or {}
        self.errors: List[Dict[str, Any]] = []

        # 2. AI Executor Setup
        self.agent_model = "Qwen/Qwen2.5-Coder-32B-Instruct" 
        self.system_prompt = (
            "You are the Technical Reader on a thesis defense panel. "
            "Your job is to strictly evaluate the methodology, technical architecture, "
            "and logical flow of the system described in the abstract/thesis. "
            "Provide a critical score out of 100, followed by a brief technical critique."
        )

    def check_margins(self) -> Dict[str, Any]:
        """Check page margins against rubric"""
        if not self.doc:
            return {"success": True, "error": "No docx file provided for margin checking."}
            
        requirements = {
            "left": self.rubric.get("margin_left_inches", 1.5),
            "right": self.rubric.get("margin_right_inches", 1.0),
            "top": self.rubric.get("margin_top_inches", 1.0),
            "bottom": self.rubric.get("margin_bottom_inches", 1.0),
        }

        if not self.doc.sections:
            return {"success": False, "error": "No sections found in document."}

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
        if not self.doc:
            return {"success": True, "error": "No docx file provided for font checking."}
            
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
            "violations": violations[:5],  # Return first 5 violations to prevent overload
        }

    async def evaluate_ai_content(self, document_content: str) -> str:
        """
        Evaluates the provided document content using the Bytez AI Model.
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Please evaluate the following thesis extract:\n\n{document_content}"}
        ]
        
        # Call Bytez using the inherited method
        response = await self.chat_completion(messages=messages, model=self.agent_model)
        return response

    async def run_analysis(self, document_content: str = "") -> Dict[str, Any]:
        """
        Run full technical analysis combining exact formatting checks and AI critique.
        """
        # 1. Structural Checks (Pure Python via python-docx)
        margin_check = self.check_margins()
        font_check = self.check_font_properties()

        all_violations = margin_check.get("violations", []) + font_check.get("violations", [])
        major_errors = len([v for v in all_violations if v.get("severity") == "major"])
        minor_errors = len([v for v in all_violations if v.get("severity") == "minor"])
        
        # 2. AI Content Review (Bytez LLM)
        ai_feedback = "No document content provided for AI evaluation."
        if document_content.strip():
            ai_feedback = await self.evaluate_ai_content(document_content)

        return {
            "agent": "technical_reader",
            "formatting": {
                "success": margin_check.get("success", True) and font_check.get("success", True),
                "major_errors": major_errors,
                "minor_errors": minor_errors,
                "violations": all_violations,
                "summary": f"Found {major_errors} major and {minor_errors} minor formatting issues",
            },
            "ai_critique": ai_feedback
        }