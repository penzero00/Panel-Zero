"""
Subject Matter Expert Agent: Analyzes content quality and domain knowledge
"""
from typing import Dict, List, Any, Optional
from .llm_executor import LLMExecutor


class SubjectMatterExpertAgent(LLMExecutor):
    """
    Subject Matter Expert Agent: Evaluates domain knowledge, content accuracy, and relevance.
    Uses GPT-4o for comprehensive analysis.
    """
    
    def __init__(self, agent_profile: Optional[Dict[str, Any]] = None):
        super().__init__()
        
        self.agent_profile = agent_profile or {}
        
        # Use Azure default model
        self.agent_model = self.default_model
        
        # Build system prompt with profile preferences
        citation_style = self.agent_profile.get("preferred_citation_style", "APA 7th") if self.agent_profile else "APA 7th"
        
        base_system_prompt = (
            "You are a Subject Matter Expert on a thesis defense panel. "
            "Your job is to evaluate the technical content, domain knowledge accuracy, relevance of literature, "
            "and depth of understanding demonstrated in the thesis. "
            "IMPORTANT INSTRUCTION:\n"
            "1. Check ALL document formatting, fonts, margins, and styles against the PROFILE PREFERENCES below.\n"
            "2. ANY deviation from profile preferences MUST be flagged as a formatting issue.\n"
            "3. Find ALL content issues AND all formatting/preference violations.\n"
            "4. Report EVERY single issue found, no matter how many.\n\n"
            "Check for: factual accuracy, appropriate depth for the academic level, "
            "relevant and sufficient literature review, proper contextualization of the work, "
            "realistic and achievable objectives, "
            f"proper {citation_style} citation style and formatting, and ALL formatting compliance.\n\n"
            "Format your response as JSON with 'issues' array. Each issue must have: "
            "location (object with 'text' field containing the exact problematic text from document), "
            "type (string like 'content|accuracy|reference|formatting|font|margin|citation'), "
            "severity (must be 'major' or 'minor'), "
            "issue (string description of the problem), suggestion (string with recommended fix). "
            "Include the EXACT text snippet in location.text so it can be highlighted. "
            "Find and report ALL content and formatting issues without limits."
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

    async def analyze_subject_content(self, document_content: str) -> Dict[str, Any]:
        """
        Analyze subject matter and content quality.
        """
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Please review this thesis for domain knowledge and content quality:\n\n{document_content}"}
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
                "review": response,
                "parsed_as_text": True
            }

    async def run_analysis(self, document_content: str = "") -> Dict[str, Any]:
        """
        Run subject matter expert analysis.
        """
        ai_feedback = {"issues": [], "review": "No document content provided."}
        
        if document_content.strip():
            ai_feedback = await self.analyze_subject_content(document_content)
        
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
            "agent": "subject_matter_expert",
            "major_issues": major_issues,
            "minor_issues": minor_issues,
            "issues": ai_feedback.get("issues", []),
            "review": ai_feedback.get("review", ""),
            "total_issues": len(ai_feedback.get("issues", [])),
        }
