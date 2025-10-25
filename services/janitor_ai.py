import httpx
import json
from typing import List, Dict
from config.ai_prompt import AI_SYSTEM_PROMPT
from models.chat import Message

class JanitorAIClient:
    def __init__(self):
        self.api_url = "https://janitorai.com/hackathon/completions"
        self.api_key = "calhacks2047"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def get_ai_response(self, messages: List[Dict[str, str]]) -> str:
        try:
            if not messages or not isinstance(messages, list):
                print("Invalid messages format")
                return "Sorry, I'm having trouble with the conversation format! Meow! 😿"

            async with self.client.stream(
                "POST",
                self.api_url,
                headers={"Authorization": self.api_key, "Content-Type": "application/json"},
                json={"messages": messages},
            ) as response:
                if not response.is_success:
                    error_text = await response.aread()
                    print(f"AI API error: {response.status_code} - {error_text}")
                    return "Sorry, I'm having trouble responding right now! Meow! 😿"

                full_response = ""
                buffer = ""
                
                async for chunk in response.aiter_text():
                    buffer += chunk
                    
                    while '\n\n' in buffer:
                        line, buffer = buffer.split('\n\n', 1)
                        line = line.strip()
                        
                        if not line:
                            continue
                            
                        if line.startswith('data: '):
                            try:
                                data = line[6:]
                                if data.strip() == '[DONE]':
                                    return full_response.strip()
                                    
                                event_data = json.loads(data)
                                
                                if 'choices' in event_data and event_data['choices']:
                                    choice = event_data['choices'][0]
                                    if 'delta' in choice and 'content' in choice['delta']:
                                        content = choice['delta']['content']
                                        if content:
                                            full_response += content
                                            
                            except json.JSONDecodeError as e:
                                print(f"JSON decode error: {e}")
                                continue
                
                return full_response.strip() if full_response else "Sorry, I couldn't understand the response! Meow! 😿"
            
        except Exception as error:
            print(f"AI API error: {error}")
            return "Sorry, I'm having trouble responding right now! Meow! 😿"

    def build_conversation_context(self, room_messages: List[Message], max_messages: int = 50) -> List[Dict[str, str]]:
        recent_messages = room_messages[-max_messages:]
        context = [{"role": "system", "content": AI_SYSTEM_PROMPT}]
        
        for msg in recent_messages:
            context.append({
                "role": "assistant" if msg.is_ai else "user",
                "content": msg.content if msg.is_ai else f"[{msg.username}]: {msg.content}",
            })
        
        return context

    async def close(self):
        await self.client.aclose()
