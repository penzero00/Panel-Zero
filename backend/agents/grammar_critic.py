"""
Grammar Critic Agent: Analyzes language, grammar, syntax, and writing style
"""
import os
from typing import Dict, List, Any, Optional
from docx import Document
from .llm_executor import LLMExecutor


class GrammarCriticAgent(LLMExecutor):
    """
    Grammar Critic Agent: Analyzes grammar, syntax, and language quality.
    Uses bytez API for inference.
    """
    
    def __init__(self, agent_profile: Optional[Dict[str, Any]] = None):
        super().__init__()
        
        self.agent_profile = agent_profile or {}
        
        # Use Azure default model (gpt-5.2-chat)
        self.agent_model = self.default_model
        
        # Build system prompt with profile preferences
        citation_style = self.agent_profile.get("preferred_citation_style", "APA 7th") if self.agent_profile else "APA 7th"
        check_passive = self.agent_profile.get("check_passive_voice", True) if self.agent_profile else True
        check_tense = self.agent_profile.get("check_tense_consistency", True) if self.agent_profile else True
        check_svagr = self.agent_profile.get("check_subject_verb_agreement", True) if self.agent_profile else True
        check_fragments = self.agent_profile.get("check_sentence_fragments", True) if self.agent_profile else True
        check_space_period = self.agent_profile.get("add_space_after_period", True) if self.agent_profile else True
        check_space_comma = self.agent_profile.get("add_space_after_comma", True) if self.agent_profile else True
        check_double_space = self.agent_profile.get("check_double_spaces", True) if self.agent_profile else True
        
        checks = []
        if check_passive:
            checks.append("passive voice overuse")
        if check_tense:
            checks.append("tense consistency")
        if check_svagr:
            checks.append("subject-verb agreement")
        if check_fragments:
            checks.append("sentence fragments")
        if check_space_period:
            checks.append("proper spacing after periods")
        if check_space_comma:
            checks.append("proper spacing after commas")
        if check_double_space:
            checks.append("double space errors")
        
        base_system_prompt = (
            "You are a Grammar Critic on a thesis defense panel. "
            "Your job is to evaluate the writing quality, grammar, syntax, and consistency of the thesis. "
            f"Check for: {', '.join(checks)}, clarity issues, and repetitive phrasing. "
            f"Use {citation_style} citation style.\n\n"
            "IMPORTANT INSTRUCTION:\n"
            "1. You MUST check ALL document formatting, fonts, margins, and styles against the specified PROFILE PREFERENCES below.\n"
            "2. ANY deviation from the profile preferences MUST be flagged as an issue (violation of formatting requirements).\n"
            "3. If a preference has enable_*=true but the document does NOT match it, flag it as a MAJOR issue.\n"
            "4. Find ALL grammar, spelling, syntax, style errors, AND all formatting/preference violations.\n"
            "5. You MUST respond ONLY with a valid JSON object (no markdown, no code blocks, just raw JSON).\n\n"
            "The JSON must have this structure:\n"
            "{\n"
            '  "issues": [\n'
            '    {\n'
            '      "type": "grammar|spelling|style|clarity|font|margin|paragraph|image|spacing_violation",\n'
            '      "location": {"text": "exact text from document or description"},\n'
            '      "severity": "major|minor",\n'
            '      "issue": "description of the problem",\n'
            '      "suggestion": "recommended fix"\n'
            '    }\n'
            '  ]\n'
            "}\n\n"
            "MANDATORY: Find and report ALL instances of grammar/spelling/style errors AND format violations.\n"
            "CRITICAL: Do NOT limit your checking. Report every single issue found, no matter how many."
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

    async def check_grammar_and_style(self, document_content: str) -> Dict[str, Any]:
        """
        Check document for grammar, syntax, and style issues.
        """
        print(f"[GRAMMAR_CRITIC] Document content length: {len(document_content)} chars")
        print(f"[GRAMMAR_CRITIC] First 200 chars: {document_content[:200]}...")
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Please review this for grammar and writing quality:\n\n{document_content}"}
        ]
        
        print(f"[GRAMMAR_CRITIC] Sending {len(messages)} messages to Azure OpenAI")
        print(f"[GRAMMAR_CRITIC] System prompt length: {len(self.system_prompt)}")
        
        response = await self.chat_completion(messages=messages, model=self.agent_model)
        print(f"[GRAMMAR_CRITIC] Raw response length: {len(response)} chars")
        print(f"[GRAMMAR_CRITIC] Raw response: {response[:500]}...")
        
        # Try to parse as JSON
        try:
            import json
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
                print(f"[GRAMMAR_CRITIC] Extracted JSON from markdown code block")
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
                print(f"[GRAMMAR_CRITIC] Extracted JSON from generic code block")
            else:
                json_str = response
                print(f"[GRAMMAR_CRITIC] Treating entire response as JSON")
            
            print(f"[GRAMMAR_CRITIC] JSON string to parse: {json_str[:300]}...")
            result = json.loads(json_str)
            issues = result.get('issues', [])
            print(f"[GRAMMAR_CRITIC] Successfully parsed JSON with {len(issues)} issues")
            if issues:
                print(f"[GRAMMAR_CRITIC] First issue: {issues[0]}")
            return result
        except json.JSONDecodeError as e:
            print(f"[GRAMMAR_CRITIC] JSON parse failed: {e}")
            print(f"[GRAMMAR_CRITIC] Response was not valid JSON: {response[:200]}...")
            return {
                "issues": [],
                "feedback": response,
                "parsed_as_text": True
            }
        except Exception as e:
            print(f"[GRAMMAR_CRITIC] Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "issues": [],
                "feedback": response,
                "error": str(e)
            }

    async def run_analysis(self, document_content: str = "") -> Dict[str, Any]:
        """
        Run grammar and style analysis.
        """
        ai_feedback = {"issues": [], "feedback": "No document content provided."}
        
        if document_content.strip():
            ai_feedback = await self.check_grammar_and_style(document_content)
        
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
            "agent": "grammar_critic",
            "major_issues": major_issues,
            "minor_issues": minor_issues,
            "issues": issues,
            "feedback": ai_feedback.get("feedback", ""),
            "total_issues": len(issues),
        }
