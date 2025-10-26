import os
import asyncio
import subprocess
import tempfile
from typing import Optional
from fish_audio_sdk import WebSocketSession, TTSRequest, Session, ASRRequest

class FishAudioClient:
    def __init__(self, api_key: str = "b34cff9e6fed4b8cb414b3ed4356014d"):
        self.api_key = api_key
        self.voice_model_id = "36d5e6340a0e4023b89aa9a8a013c217"
        self.audio_cache_dir = "audio_cache"
        self.session = Session(api_key)
        os.makedirs(self.audio_cache_dir, exist_ok=True)

    async def generate_audio(self, text: str, message_id: str) -> Optional[str]:
        try:
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
                            [text], # Use the original text directly
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


    async def transcribe_audio(self, audio_data: bytes, language: str = "en") -> str:
        try:
            # Validate audio data size (max 100MB)
            if len(audio_data) > 100 * 1024 * 1024:  # 100MB
                print("Audio file too large (max 100MB)")
                return ""
            
            # Validate audio data is not empty
            if len(audio_data) == 0:
                print("Empty audio data")
                return ""

            # Convert WebM to WAV if needed (Fish Audio works better with WAV)
            processed_audio = await self.convert_webm_to_wav(audio_data)

            loop = asyncio.get_event_loop()

            def transcribe_sync():
                try:
                    response = self.session.asr(ASRRequest(
                        audio=processed_audio,
                        language=language,
                        ignore_timestamps=True
                    ))
                    return response.text
                except Exception as e:
                    print(f"Fish Audio ASR sync error: {e}")
                    return ""

            text = await loop.run_in_executor(None, transcribe_sync)
            return text.strip() if text else ""
        except Exception as e:
            print(f"Fish Audio ASR error: {e}")
            return ""

    def get_audio_url(self, message_id: str) -> str:
        return f"/audio/{message_id}.mp3"

    async def convert_webm_to_wav(self, webm_data: bytes) -> bytes:
        """Convert WebM audio data to WAV format for Fish Audio compatibility"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as webm_file:
                webm_file.write(webm_data)
                webm_path = webm_file.name
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as wav_file:
                wav_path = wav_file.name
            
            # Use ffmpeg to convert WebM to WAV
            cmd = [
                'ffmpeg', '-i', webm_path, 
                '-acodec', 'pcm_s16le',  # 16-bit PCM
                '-ar', '16000',          # 16kHz sample rate
                '-ac', '1',              # Mono
                '-y',                    # Overwrite output file
                wav_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"FFmpeg conversion error: {result.stderr}")
                return webm_data  # Return original if conversion fails
            
            with open(wav_path, 'rb') as f:
                wav_data = f.read()
            
            # Clean up temp files
            os.unlink(webm_path)
            os.unlink(wav_path)
            
            return wav_data
            
        except Exception as e:
            print(f"Audio conversion error: {e}")
            return webm_data  # Return original if conversion fails

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