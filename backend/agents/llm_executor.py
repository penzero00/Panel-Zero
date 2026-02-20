import asyncio
from bytez import Bytez
from core.config import settings
from typing import List, Dict, Optional

class BytezExecutor:
    def __init__(self):
        # Initialize the Bytez SDK with the API key from config
        self.api_key = settings.BYTEZ_API_KEY
        self.sdk = Bytez(self.api_key)
        
        # Default model if an agent doesn't specify one
        self.default_model = "google/gemini-2.5-pro" 

    def _run_sdk_sync(self, messages: List[Dict[str, str]], model: str) -> str:

        try:
            # Initialize the specific model via the SDK
            bytez_model = self.sdk.model(model)
            
            # Run the model with the provided conversation array
            results = bytez_model.run(messages)
            
            if results.error:
                error_msg = f"Bytez API Error: {results.error}"
                print(error_msg)
                return error_msg
                
            return results.output
            
        except Exception as e:
            error_msg = f"Exception communicating with Bytez SDK: {str(e)}"
            print(error_msg)
            return error_msg

    async def chat_completion(self, messages: List[Dict[str, str]], model: Optional[str] = None) -> str:

        selected_model = model or self.default_model
        
        # Offload the synchronous SDK execution to a separate background thread
        response = await asyncio.to_thread(self._run_sdk_sync, messages, selected_model)
        
        return response