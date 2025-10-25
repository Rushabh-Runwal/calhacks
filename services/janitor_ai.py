import httpx
import json
from typing import List, Dict, AsyncGenerator
from config.ai_prompt import AI_SYSTEM_PROMPT
from models.chat import Message

class JanitorAIClient:
    def __init__(self):
        self.api_url = "https://janitorai.com/hackathon/completions"
        self.api_key = "calhacks2047"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def stream_ai_response(self, messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Stream AI response chunks from JanitorAI API"""
        try:
            async with self.client.stream(
                "POST",
                self.api_url,
                headers={
                    "Authorization": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "messages": messages,
                    "stream": True
                },
            ) as response:
                if not response.is_success:
                    raise Exception(f"AI API error: {response.status_code}")

                async for chunk in response.aiter_text():
                    for line in chunk.split('\n'):
                        if line.startswith('data: '):
                            try:
                                data = line[6:]
                                if data.strip() == '[DONE]':
                                    break
                                event_data = json.loads(data)
                                if 'content' in event_data:
                                    yield event_data['content']
                            except json.JSONDecodeError:
                                continue

        except Exception as error:
            print(f"AI API streaming error: {error}")
            yield "Sorry, I'm having trouble responding right now! Meow! 😿"

    def build_conversation_context(self, room_messages: List[Message], max_messages: int = 50) -> List[Dict[str, str]]:
        """Build conversation context from room messages"""
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

