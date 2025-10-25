import httpx
from typing import List, Dict, Any
from config.ai_prompt import AI_SYSTEM_PROMPT
from models.chat import Message


class JanitorAIClient:
    def __init__(self):
        self.api_url = "https://janitorai.com/hackathon/completions"
        self.api_key = "calhacks2047"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def call_janitor_ai(self, messages: List[Dict[str, str]], last_user_message: str) -> str | None:
        """Call JanitorAI API with decision control logic."""
        try:
            decision_prompt = f"""
{AI_SYSTEM_PROMPT}

Tom should only reply when:
- Someone directly mentions his name ("Tom", "Talking Tom") OR
- Someone asks him a question OR
- The message is addressed to everyone (e.g., "guys", "everyone", "hey all").

If users are chatting among themselves and not addressing him,
Tom stays silent but keeps track of what's being said for context.

Tom should remember group dynamics and reference prior user messages naturally
(e.g., recall jokes, topics, or names from earlier). Never interrupt.

Recent user message: "{last_user_message}"
If Tom should not respond, reply with "__NO_RESPONSE__" exactly.
"""

            response = await self.client.post(
                self.api_url,
                headers={
                    "Authorization": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "messages": [
                        {"role": "system", "content": decision_prompt},
                        *messages,
                    ],
                },
            )

            if not response.is_success:
                raise Exception(f"AI API error: {response.status_code}")

            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()

            # Skip AI reply if model says "__NO_RESPONSE__"
            if content == "__NO_RESPONSE__":
                return None

            return content

        except Exception as error:
            print(f"AI API error: {error}")
            return "Sorry, I'm having trouble responding right now! Meow! 😿"

    def build_conversation_context(self, room_messages: List[Message], max_messages: int = 50) -> List[Dict[str, str]]:
        """Build conversation context from room messages."""
        recent_messages = room_messages[-max_messages:]
        return [
            {
                "role": "assistant" if msg.is_ai else "user",
                "content": msg.content if msg.is_ai else f"[{msg.username}]: {msg.content}",
            }
            for msg in recent_messages
        ]

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
