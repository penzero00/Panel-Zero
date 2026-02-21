"""
Chairman Agent: Provides overall assessment and recommendation
"""
from typing import Dict, List, Any, Optional
from .llm_executor import LLMExecutor


class ChairmanAgent(LLMExecutor):
    """
    Chairman Agent: Provides overall assessment, integration of feedback, and recommendations.
    Uses GPT-4o for comprehensive synthesis.
    """
    
    def __init__(self, agent_profile: Optional[Dict[str, Any]] = None):
        super().__init__()
        
        self.agent_profile = agent_profile or {}
        
        # Use Azure default model
        self.agent_model = self.default_model
        
        # Build system prompt with profile preferences
        citation_style = self.agent_profile.get("preferred_citation_style", "APA 7th") if self.agent_profile else "APA 7th"
        paragraph_alignment = self.agent_profile.get("paragraph_alignment", "justify") if self.agent_profile else "justify"
        
        base_system_prompt = (
            "You are the Chairman of a thesis defense panel. "
            "Your job is to provide an overall assessment, synthesis of key issues, "
            "and a recommendation on the thesis quality and readiness for presentation. "
            "IMPORTANT INSTRUCTION:\n"
            "1. Check ALL document formatting, fonts, margins, and styles against the PROFILE PREFERENCES below.\n"
            "2. ANY deviation from profile preferences MUST be flagged as a formatting issue.\n"
            "3. Find ALL overall/structural issues AND all formatting/preference violations.\n"
            "4. Report EVERY single issue found, no matter how many.\n\n"
            "Consider: overall coherence, integration of chapters, clarity of contributions, "
            "alignment of objectives with results, overall academic merit, "
            f"proper formatting (paragraph alignment: {paragraph_alignment}), {citation_style} citation style, "
            "and ALL formatting compliance.\n\n"
            "Provide assessment as JSON with: overall_score (1-10), readiness_level (string), "
            "key_strengths (array of strings), issues (array with severity 'major' or 'minor'), "
            "recommendation (one of: accept, major_revisions, minor_revisions). "
            "Each issue must include: location (object with 'text' field), type (string), severity, "
            "issue (description), suggestion (fix). Find and report ALL issues without limits."
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

    async def provide_overall_assessment(self, document_content: str) -> Dict[str, Any]:
        """
        Provide overall assessment of the thesis.
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Please provide your overall assessment of this thesis:\n\n{document_content}"}
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
                "assessment": response,
                "parsed_as_text": True
            }

    async def run_analysis(self, document_content: str = "") -> Dict[str, Any]:
        """
        Run chairman overall assessment.
        """
        assessment = {"assessment": "No document content provided."}
        
        if document_content.strip():
            assessment = await self.provide_overall_assessment(document_content)
        
        return {
            "agent": "chairman",
            "overall_score": assessment.get("overall_score", 0),
            "readiness_level": assessment.get("readiness_level", "unknown"),
            "recommendation": assessment.get("recommendation", "unknown"),
            "key_strengths": assessment.get("key_strengths", []),
            "critical_issues": assessment.get("critical_issues", []),
            "assessment": assessment.get("assessment", ""),
        }
