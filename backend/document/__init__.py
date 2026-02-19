"""Document processing package"""
from .surgical_injector import SurgicalInjector, process_docx_with_highlights
from .parser import ChapterExtractor

__all__ = ["SurgicalInjector", "process_docx_with_highlights", "ChapterExtractor"]
