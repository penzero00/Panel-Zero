"""
Statistics and Methodology Agent: Analyzes statistical validity and methodology
"""
from typing import Dict, List, Any, Optional
from .llm_executor import LLMExecutor


class StatisticsAgent(LLMExecutor):
    """
    Statistics and Methodology Agent: Analyzes statistical methods, data handling, and methodology rigor.
    Uses GPT-4o for deep logical analysis (per AGENTS.md).
    """
    
    def __init__(self, agent_profile: Optional[Dict[str, Any]] = None):
        super().__init__()
        
        self.agent_profile = agent_profile or {}
        
        # Use Azure default model
        self.agent_model = self.default_model
        
        # Build system prompt with profile preferences
        citation_style = self.agent_profile.get("preferred_citation_style", "APA 7th") if self.agent_profile else "APA 7th"
        image_dpi = self.agent_profile.get("image_min_dpi", 300) if self.agent_profile else 300
        image_format = self.agent_profile.get("image_format", "embedded") if self.agent_profile else "embedded"
        image_max_width = self.agent_profile.get("image_max_width_inches", 6.0) if self.agent_profile else 6.0
        
        base_system_prompt = (
            "You are a Statistics/Methodology Expert on a thesis defense panel. "
            "Your job is to evaluate the statistical rigor, methodology design, data analysis, and validity of conclusions. "
            "IMPORTANT INSTRUCTION:\n"
            "1. Check ALL document formatting, fonts, margins, and styles against the PROFILE PREFERENCES below.\n"
            "2. ANY deviation from profile preferences MUST be flagged as a formatting issue.\n"
            "3. Find ALL statistical/methodology issues AND all formatting/preference violations.\n"
            "4. Report EVERY single issue found, no matter how many.\n\n"
            "Check for: appropriate statistical tests, sample size justification, assumptions checking, "
            "p-hacking or statistical fishing, appropriate effect sizes, control for confounders, "
            "alignment between methods and conclusions, "
            f"images meeting {image_dpi} DPI minimum, using '{image_format}' format, not exceeding {image_max_width} inches width, "
            f"proper {citation_style} citation style, and ALL formatting compliance.\n\n"
            "Format your response as JSON with 'issues' array. Each issue must have: "
            "location (object with 'text' field containing the exact problematic text from document), "
            "type (string like 'statistics|methodology|calculations|formatting|font|margin|image'), "
            "severity (must be 'major' or 'minor'), "
            "issue (string description of the problem), suggestion (string with recommended fix). "
            "Include the EXACT text snippet in location.text so it can be highlighted. "
            "Find and report ALL statistical, methodology, and formatting issues without limits."
        )
        
        # Add comprehensive preferences from profile (including cross-domain preferences)
        comprehensive_prefs = self.build_comprehensive_preferences(self.agent_profile)
        if comprehensive_prefs:
            base_system_prompt += f"\n\n{comprehensive_prefs}\n\n"
            base_system_prompt += "===\nCRITICAL: The above PROFILE PREFERENCES are MANDATORY REQUIREMENTS.\n"
            base_system_prompt += "STRICTLY VERIFY that the entire document matches EVERY enabled preference.\n"
            base_system_prompt += "If ANY enabled preference is NOT met, flag it with severity=major.\n"
            base_system_prompt += "==="
        
        # Append custom instructions if provided in agent profile
        custom_instruction = self.agent_profile.get("custom_instruction", "").strip()
        if custom_instruction:
            self.system_prompt = f"{base_system_prompt}\n\nADDITIONAL INSTRUCTIONS FROM USER:\n{custom_instruction}\n\n"
            self.system_prompt += "REMINDER: Custom instructions SUPPLEMENT the critical preference checks above. Check both equally thoroughly."
        else:
            self.system_prompt = base_system_prompt

    async def analyze_methodology(self, document_content: str) -> Dict[str, Any]:
        """
        Analyze methodology and statistics in the document.
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Please analyze the methodology and statistics in this thesis:\n\n{document_content}"}
        ]
        
        response = await self.chat_completion(messages=messages, model=self.agent_model)
        
        # Try to parse as JSON
        try:
            import json
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response
            
            return json.loads(json_str)
        except:
            return {
                "issues": [],
                "analysis": response,
                "parsed_as_text": True
            }

    async def run_analysis(self, document_content: str = "") -> Dict[str, Any]:
        """
        Run statistics and methodology analysis.
        """
        ai_feedback = {"issues": [], "analysis": "No document content provided."}
        
        if document_content.strip():
            ai_feedback = await self.analyze_methodology(document_content)
        
        # Count issues by severity (handle both "major"/"minor" and "High"/"Medium"/"Low")
        issues = ai_feedback.get("issues", [])
        major_issues = len([
            i for i in issues 
            if str(i.get("severity", "")).lower() in ["major", "high", "critical"]
        ])
        minor_issues = len([
            i for i in issues 
            if str(i.get("severity", "")).lower() in ["minor", "medium", "low"]
        ])
        
        return {
            "agent": "statistics",
            "major_issues": major_issues,
            "minor_issues": minor_issues,
            "issues": ai_feedback.get("issues", []),
            "analysis": ai_feedback.get("analysis", ""),
            "total_issues": len(ai_feedback.get("issues", [])),
        }
