import os
import asyncio
from typing import Optional, AsyncGenerator
from fish_audio_sdk import WebSocketSession, TTSRequest, Session, ASRRequest, AsyncWebSocketSession

class FishAudioService:
    def __init__(self, api_key: str = "b34cff9e6fed4b8cb414b3ed4356014d"):
        self.api_key = api_key
        self.voice_model_id = "36d5e6340a0e4023b89aa9a8a013c217"
        self.audio_cache_dir = "audio_cache"
        self.session = Session(api_key)
        os.makedirs(self.audio_cache_dir, exist_ok=True)

    def _add_emotion_tags(self, text: str) -> str:
        if any(word in text.lower() for word in ["meow", "purr", "hehe", "fish", "fun", "play"]):
            return f"(excited) {text}"
        elif "?" in text:
            return f"(curious) {text}"
        elif any(word in text.lower() for word in ["love", "happy", "amazing", "wonderful"]):
            return f"(happy) {text}"
        elif any(word in text.lower() for word in ["sorry", "trouble", "problem"]):
            return f"(sad) {text}"
        else:
            return f"(playful) {text}"

    async def generate_audio(self, text: str, message_id: str) -> Optional[str]:
        try:
            emotional_text = self._add_emotion_tags(text)
            ws_session = WebSocketSession(self.api_key)
            
            request = TTSRequest(
                text="",
                reference_id=self.voice_model_id,
                format="mp3"
            )
            
            audio_filename = f"{message_id}.mp3"
            audio_path = os.path.join(self.audio_cache_dir, audio_filename)
            
            def generate_sync():
                with ws_session:
                    with open(audio_path, "wb") as f:
                        for audio_chunk in ws_session.tts(
                            request,
                            [emotional_text],
                            backend="s1"
                        ):
                            f.write(audio_chunk)
                return audio_path
            
            loop = asyncio.get_event_loop()
            audio_path = await loop.run_in_executor(None, generate_sync)
            return audio_path
            
        except Exception as e:
            print(f"Fish Audio error: {e}")
            return None

    async def generate_streaming_audio(self, text_stream: AsyncGenerator[str, None], message_id: str) -> Optional[str]:
        """Generate audio from streaming text using Fish Audio WebSocket SDK"""
        try:
            ws_session = AsyncWebSocketSession(self.api_key)
            audio_filename = f"{message_id}.mp3"
            audio_path = os.path.join(self.audio_cache_dir, audio_filename)
            
            request = TTSRequest(
                text="",
                reference_id=self.voice_model_id,
                format="mp3"
            )
            
            async with ws_session:
                buffer = bytearray()
                async for audio_chunk in ws_session.tts(request, text_stream, backend="s1"):
                    buffer.extend(audio_chunk)
                
                with open(audio_path, "wb") as f:
                    f.write(buffer)
                
                return audio_path
                
        except Exception as e:
            print(f"Fish Audio streaming error: {e}")
            return None

    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> str:
        try:
            loop = asyncio.get_event_loop()

            def transcribe_sync():
                response = self.session.asr(ASRRequest(
                    audio=audio_data,
                    language=language,
                    ignore_timestamps=True
                ))
                return response.text

            text = await loop.run_in_executor(None, transcribe_sync)
            return text
        except Exception as e:
            print(f"Fish Audio ASR error: {e}")
            return ""

    def get_audio_url(self, message_id: str) -> str:
        return f"/audio/{message_id}.mp3"

    def cleanup_old_audio(self, max_age_hours: int = 24):
        import time
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for filename in os.listdir(self.audio_cache_dir):
            if filename.endswith('.mp3'):
                file_path = os.path.join(self.audio_cache_dir, filename)
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > max_age_seconds:
                    os.remove(file_path)