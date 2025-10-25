import os
import asyncio
from typing import Optional
from fish_audio_sdk import WebSocketSession, TTSRequest


class FishAudioService:
    def __init__(self, api_key: str = "b34cff9e6fed4b8cb414b3ed4356014d"):
        self.api_key = api_key
        self.voice_model_id = "36d5e6340a0e4023b89aa9a8a013c217"
        self.audio_cache_dir = "audio_cache"
        
        # Ensure audio cache directory exists
        os.makedirs(self.audio_cache_dir, exist_ok=True)

    def _add_emotion_tags(self, text: str) -> str:
        """Add Fish Audio emotion tags to Tom's responses."""
        # Add excited emotion tags for Tom's energetic personality
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
        """Generate audio for Tom's response and return the file path."""
        try:
            # Add emotion tags to the text
            emotional_text = self._add_emotion_tags(text)
            
            # Create WebSocket session
            ws_session = WebSocketSession(self.api_key)
            
            # Create TTS request
            request = TTSRequest(
                text="",  # Empty for streaming
                reference_id=self.voice_model_id,
                format="mp3"
            )
            
            # Generate audio file path
            audio_filename = f"{message_id}.mp3"
            audio_path = os.path.join(self.audio_cache_dir, audio_filename)
            
            # Generate audio in a separate thread to avoid blocking
            def generate_sync():
                with ws_session:
                    with open(audio_path, "wb") as f:
                        for audio_chunk in ws_session.tts(
                            request,
                            [emotional_text],  # Single text for now
                            backend="s1"
                        ):
                            f.write(audio_chunk)
                return audio_path
            
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            audio_path = await loop.run_in_executor(None, generate_sync)
            
            return audio_path
            
        except Exception as e:
            print(f"Fish Audio error: {e}")
            return None

    def get_audio_url(self, message_id: str) -> str:
        """Get the URL for an audio file."""
        return f"/audio/{message_id}.mp3"

    def cleanup_old_audio(self, max_age_hours: int = 24):
        """Clean up old audio files to save space."""
        import time
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for filename in os.listdir(self.audio_cache_dir):
            if filename.endswith('.mp3'):
                file_path = os.path.join(self.audio_cache_dir, filename)
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > max_age_seconds:
                    os.remove(file_path)
                    print(f"Cleaned up old audio file: {filename}")
