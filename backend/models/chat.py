from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Message(BaseModel):
    id: str
    content: str
    username: str
    timestamp: int
    is_ai: bool
    audio_url: Optional[str] = None
    is_voice: Optional[bool] = False

class User(BaseModel):
    id: str
    username: str
    room_id: str

class Room(BaseModel):
    id: str
    users: List[User] = []
    messages: List[Message] = []
    created_at: datetime = datetime.now()

class JoinRoomRequest(BaseModel):
    room_id: str
    username: str

class SendMessageRequest(BaseModel):
    content: str
    username: str
    room_id: str

class AIResponse(BaseModel):
    content: str
    should_respond: bool