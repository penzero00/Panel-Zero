from typing import Dict, Any, Optional
import google.generativeai as genai
from openai import OpenAI
from core import settings

class LLMAgentExecutor:
    """Routes LLM requests to appropriate model"""

    def __init__(self):
        self.gemini_flash = settings.GEMINI_FLASH_MODEL
        self.gemini_pro = settings.GEMINI_PRO_MODEL
        self.gpt4o = settings.OPENAI_MODEL

        # Initialize clients
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def analyze_grammar(self, text: str) -> Dict[str, Any]:
        """
        Route to Gemini 1.5 Flash for grammar checking
        Per AGENTS.md: Fast and cost-efficient for syntax
        """
        try:
            prompt = f"""You are a strict academic grammar critic. Analyze the following text for:
1. Tense consistency (especially past passive in Chapter 3)
2. Syntax errors
3. Subject-verb agreement

Text: {text[:2000]}  # Limit to 2000 chars

Return a JSON response with:
- "errors": list of {{type, location, suggestion}}
- "summary": brief summary
- "severity": "major" or "minor" for each error
"""
            model = genai.GenerativeModel(self.gemini_flash)
            response = model.generate_content(prompt)
            
            return {
                "agent": "language_critic",
                "model": self.gemini_flash,
                "response": response.text,
            }
        except Exception as e:
            return {
                "agent": "language_critic",
                "error": str(e),
            }

    async def analyze_statistics(self, text: str) -> Dict[str, Any]:
        """
        Route to Gemini 1.5 Pro for statistical analysis
        Per AGENTS.md: Deep logical checks
        """
        try:
            prompt = f"""You are a statistical methodology expert. Analyze the following methodological text:

Text: {text[:2000]}

Verify:
1. Data collection method aligns with claims
2. Statistical test appropriateness
3. Table formatting compliance

Return JSON with:
- "issues": list of {{type, description, severity}}
- "summary": key findings
"""
            model = genai.GenerativeModel(self.gemini_pro)
            response = model.generate_content(prompt)
            
            return {
                "agent": "statistician",
                "model": self.gemini_pro,
                "response": response.text,
            }
        except Exception as e:
            return {
                "agent": "statistician",
                "error": str(e),
            }

    async def analyze_subject_matter(self, text: str) -> Dict[str, Any]:
        """
        Route to GPT-4o for subject matter expertise
        Per AGENTS.md: Deep logical checks with RAG
        """
        try:
            response = self.openai_client.chat.completions.create(
                model=self.gpt4o,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert subject matter reviewer for academic thesis. Analyze for coherence and logical flow.",
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this excerpt for coherence and logical flow:\n\n{text[:2000]}",
                    },
                ],
                temperature=0.7,
                max_tokens=500,
            )
            
            return {
                "agent": "subject_specialist",
                "model": self.gpt4o,
                "response": response.choices[0].message.content,
            }
        except Exception as e:
            return {
                "agent": "subject_specialist",
                "error": str(e),
            }

    async def synthesize_report(self, previous_results: list) -> Dict[str, Any]:
        """
        Synthesize all agent reports into a consolidated analysis
        This is the Chairman agent
        """
        try:
            consolidated = "\n".join([str(r) for r in previous_results])
            
            response = self.openai_client.chat.completions.create(
                model=self.gpt4o,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Chairman synthesizing panel feedback. Create a concise, actionable report.",
                    },
                    {
                        "role": "user",
                        "content": f"Synthesize these findings:\n\n{consolidated}",
                    },
                ],
                temperature=0.5,
                max_tokens=1000,
            )
            
            return {
                "agent": "chairman",
                "model": self.gpt4o,
                "response": response.choices[0].message.content,
            }
        except Exception as e:
            return {
                "agent": "chairman",
                "error": str(e),
            }
