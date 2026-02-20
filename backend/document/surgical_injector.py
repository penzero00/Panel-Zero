"""
Surgical DOCX Injection Module
Implements non-destructive XML-based editing for DOCX files
Following AGENTS.md: Golden Rules for Document Processing
"""

import os
import shutil
from pathlib import Path
from docx import Document
from docx.enum.text import WD_COLOR_INDEX
from typing import Optional, List, Dict, Any

class SurgicalInjector:
    """
    Handles non-destructive DOCX editing via XML manipulation.
    CRITICAL: Always copy the original file before processing.
    CRITICAL: Apply highlights directly to run objects to preserve styles.
    """

    def __init__(self, docx_path: str):
        """
        Initialize with DOCX file path.
        Automatically creates a working copy so the original downloaded from Supabase is safe.
        """
        self.original_path = docx_path
        
        # Create a safe working copy path (e.g., /tmp/file_working.docx)
        path_obj = Path(docx_path)
        self.working_path = str(path_obj.with_name(f"{path_obj.stem}_working{path_obj.suffix}"))
        
        # Create the working copy
        shutil.copy2(self.original_path, self.working_path)
        print(f"Working copy created at: {self.working_path}")
        
        # Open the working copy for manipulation
        self.doc = Document(self.working_path)

    def inject_yellow_highlight(self, paragraph_index: int, run_index: int, text_match: str = "") -> bool:
        """
        Inject yellow highlight on specific run within a paragraph.
        """
        try:
            if paragraph_index >= len(self.doc.paragraphs):
                return False

            para = self.doc.paragraphs[paragraph_index]
            
            if run_index >= len(para.runs):
                return False

            run = para.runs[run_index]

            # Verify text match for safety (optional but recommended)
            if text_match and text_match not in run.text:
                print(f"Text mismatch: Expected '{text_match}', found '{run.text}'")
                return False

            # Apply highlight without altering other styles
            run.font.highlight_color = WD_COLOR_INDEX.YELLOW
            return True

        except Exception as e:
            print(f"Error injecting highlight: {e}")
            return False

    def save_processed_file(self, output_path: str) -> bool:
        """
        Save the processed document to the final output path.
        Cleans up the temporary working file afterward.
        """
        try:
            self.doc.save(output_path)
            print(f"Processed document saved to: {output_path}")
            
            # Clean up the temporary working file
            if os.path.exists(self.working_path):
                os.remove(self.working_path)
                
            return True
        except Exception as e:
            print(f"Error saving processed file: {e}")
            return False

def process_docx_with_highlights(
    input_path: str,
    output_path: str,
    highlights: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Main function called by the Celery Worker to process a DOCX file.
    """
    try:
        injector = SurgicalInjector(input_path)

        # Apply highlights based on AI output
        successful_highlights = 0
        for highlight in highlights:
            # AI will provide these coordinates
            if injector.inject_yellow_highlight(
                paragraph_index=highlight.get("paragraph_index", 0),
                run_index=highlight.get("run_index", 0),
                text_match=highlight.get("text_match", ""),
            ):
                successful_highlights += 1

        # Save processed file (e.g., thesis_REVIEWED.docx)
        if injector.save_processed_file(output_path):
            return {
                "success": True,
                "output_path": output_path,
                "highlights_applied": successful_highlights,
                "message": f"Successfully processed {successful_highlights} highlights",
            }
        else:
            return {"success": False, "error": "Failed to save processed file"}

    except Exception as e:
        return {"success": False, "error": str(e)}