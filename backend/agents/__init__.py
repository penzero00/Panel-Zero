"""
AI Agent Definitions
Implements role-based agent routing per AGENTS.md: Smart LLM Routing
"""

from enum import Enum
from typing import Optional


class AgentRole(str, Enum):
    """Available agent roles"""
    TECHNICAL_READER = "tech"
    LANGUAGE_CRITIC = "grammar"
    STATISTICIAN = "stats"
    SUBJECT_SPECIALIST = "subject"
    CHAIRMAN = "chairman"


class AgentConfig:
    """Configuration for each agent"""
    
    AGENTS = {
        AgentRole.TECHNICAL_READER: {
            "name": "Technical Reader",
            "description": "Strict format, margins, and font checking",
            "model": None,  # Use default Azure model
            "use_llm": True,
        },
        AgentRole.LANGUAGE_CRITIC: {
            "name": "Language Critic",
            "description": "Tense consistency and syntax checking",
            "model": None,  # Use default Azure model
            "use_llm": True,
        },
        AgentRole.STATISTICIAN: {
            "name": "Statistician",
            "description": "Data logic and table format verification",
            "model": None,  # Use default Azure model
            "use_llm": True,
        },
        AgentRole.SUBJECT_SPECIALIST: {
            "name": "Subject Specialist",
            "description": "Content coherence and logic checking",
            "model": None,  # Use default Azure model
            "use_llm": True,
        },
        AgentRole.CHAIRMAN: {
            "name": "Chairman",
            "description": "Consolidated report synthesis",
            "model": None,  # Use default Azure model
            "use_llm": True,
        },
    }

    @staticmethod
    def get_agent_config(role: AgentRole) -> dict:
        """Get configuration for a specific agent role"""
        return AgentConfig.AGENTS.get(role, {})

    @staticmethod
    def should_use_llm(role: AgentRole) -> bool:
        """Determine if agent should use LLM or pure Python"""
        config = AgentConfig.get_agent_config(role)
        return config.get("use_llm", False)

    @staticmethod
    def get_model_for_role(role: AgentRole) -> str:
        """Get the appropriate model for the role"""
        config = AgentConfig.get_agent_config(role)
        return config.get("model", "python")
