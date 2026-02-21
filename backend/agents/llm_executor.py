import asyncio
from core.config import settings
from typing import List, Dict, Optional, Any
from openai import AzureOpenAI

class LLMExecutor:
    def __init__(self):
        """Initialize Azure OpenAI client"""
        self.azure_client = None
        self.azure_model = settings.AZURE_OPENAI_MODEL
        
        if settings.AZURE_OPENAI_ENDPOINT and settings.AZURE_OPENAI_API_KEY:
            self.azure_client = AzureOpenAI(
                api_key=settings.AZURE_OPENAI_API_KEY,
                api_version="2025-03-01-preview",
                azure_endpoint=settings.AZURE_OPENAI_ENDPOINT_BASE
            )
        
        # Default model preference
        self.default_model = self.azure_model
    
    def build_comprehensive_preferences(self, agent_profile: Optional[Dict[str, Any]] = None) -> str:
        """
        Build a comprehensive preference summary from the agent profile.
        Includes ALL enabled preferences across all domains, not just agent-specific ones.
        This ensures cross-functional analysis when preferences are selected.
        """
        if not agent_profile:
            return ""
        
        preferences = []
        
        # Font preferences
        if agent_profile.get("enable_font_check", True):
            font_family = agent_profile.get("font_family", "Times New Roman")
            font_size = agent_profile.get("font_size", 12)
            font_style = agent_profile.get("font_style", "normal")
            preferences.append(f"Font: {font_family}, {font_size}pt, {font_style}")
        
        # Margin preferences
        if agent_profile.get("enable_margin_check", True):
            margin_left = agent_profile.get("margin_left_inches", 1.5)
            margin_right = agent_profile.get("margin_right_inches", 1.0)
            margin_top = agent_profile.get("margin_top_inches", 1.0)
            margin_bottom = agent_profile.get("margin_bottom_inches", 1.0)
            preferences.append(f"Margins: Left {margin_left}in, Right {margin_right}in, Top {margin_top}in, Bottom {margin_bottom}in")
        
        # Paragraph preferences
        if agent_profile.get("enable_paragraph_check", True):
            line_spacing = agent_profile.get("line_spacing", 2.0)
            alignment = agent_profile.get("paragraph_alignment", "justify")
            indent = agent_profile.get("first_line_indent", 0.5)
            preferences.append(f"Paragraph: {line_spacing} line spacing, {alignment} alignment, {indent}in first-line indent")
        
        # Image preferences
        if agent_profile.get("enable_image_check", True):
            image_format = agent_profile.get("image_format", "embedded")
            image_dpi = agent_profile.get("image_min_dpi", 300)
            image_width = agent_profile.get("image_max_width_inches", 6.0)
            preferences.append(f"Images: {image_format} format, minimum {image_dpi}dpi, max width {image_width}in")
        
        # Grammar preferences
        if agent_profile.get("enable_grammar_check", True):
            grammar_checks = []
            if agent_profile.get("check_passive_voice", True):
                grammar_checks.append("check for passive voice overuse")
            if agent_profile.get("check_tense_consistency", True):
                grammar_checks.append("verify tense consistency")
            if agent_profile.get("check_subject_verb_agreement", True):
                grammar_checks.append("check subject-verb agreement")
            if agent_profile.get("check_sentence_fragments", True):
                grammar_checks.append("identify sentence fragments")
            
            if grammar_checks:
                citation_style = agent_profile.get("preferred_citation_style", "APA 7th")
                preferences.append(f"Grammar & Style: {', '.join(grammar_checks)}, use {citation_style} citation style")
        
        # Spacing preferences
        if agent_profile.get("enable_spacing_check", True):
            spacing_checks = []
            if agent_profile.get("add_space_after_period", True):
                spacing_checks.append("verify spacing after periods")
            if agent_profile.get("add_space_after_comma", True):
                spacing_checks.append("verify spacing after commas")
            if agent_profile.get("check_double_spaces", True):
                spacing_checks.append("detect double spaces")
            
            if spacing_checks:
                preferences.append(f"Spacing & Punctuation: {', '.join(spacing_checks)}")
        
        # Build final preference string
        if preferences:
            preference_text = "PROFILE PREFERENCES:\n" + "\n".join(f"  - {p}" for p in preferences)
            return preference_text
        
        return ""

    def _get_azure_response(self, messages: List[Dict[str, str]], model: str) -> str:
        """Get response from Azure OpenAI API"""
        try:
            if not self.azure_client:
                error_msg = "Error: Azure OpenAI credentials not configured"
                print(f"[AZURE ERROR] {error_msg}")
                return error_msg
            
            print(f"[AZURE] Calling {model} with {len(messages)} messages")
            response = self.azure_client.chat.completions.create(
                model=model,
                messages=messages,
                max_completion_tokens=2000,
            )
            result = response.choices[0].message.content or ""
            print(f"[AZURE] Response received: {len(result)} chars")
            return result
        except Exception as e:
            error_msg = f"Azure OpenAI Error: {str(e)}"
            print(f"[AZURE ERROR] {error_msg}")
            import traceback
            traceback.print_exc()
            return error_msg

    async def chat_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None) -> str:
        """Execute LLM chat completion asynchronously via Azure OpenAI"""
        selected_model = model or self.default_model
        response = await asyncio.to_thread(
            self._get_azure_response, messages, selected_model
        )
        return response
