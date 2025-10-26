'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MicVAD, utils } from '@ricky0123/vad-web';

interface ContinuousRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    disabled?: boolean;
}

// Helper function to convert Float32Array to a WAV Blob
const audioBufferToWav = (buffer: Float32Array, sampleRate: number): Blob => {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * bytesPerSample;
    const waveHeaderSize = 44;

    const wavBuffer = new ArrayBuffer(waveHeaderSize + dataSize);
    const view = new DataView(wavBuffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // Bits per sample

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < buffer.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, buffer[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
};


type RecorderState = 'AWAITING_PERMISSION' | 'INITIALIZING' | 'MUTED' | 'LISTENING' | 'SPEAKING' | 'ERROR';

export default function ContinuousRecorder({ onRecordingComplete, disabled }: ContinuousRecorderProps) {
    const [recorderState, setRecorderState] = useState<RecorderState>('AWAITING_PERMISSION');
    const vadRef = useRef<MicVAD | null>(null);

    const handleEnableMicrophone = useCallback(async () => {
        setRecorderState('INITIALIZING');
        try {
            const assetPath = new URL('/vad/', window.location.origin).href;
            const vad = await MicVAD.new({
                baseAssetPath: assetPath,
                onnxWASMBasePath: assetPath,
                onSpeechStart: () => {
                    setRecorderState('SPEAKING');
                },
                onSpeechEnd: (audio: Float32Array) => {
                    setRecorderState('LISTENING');
                    if (audio.length > 500) { // Threshold to avoid sending noise
                        const audioBlob = audioBufferToWav(audio, 16000); // Silero VAD sample rate is 16000
                        onRecordingComplete(audioBlob);
                    }
                },
            });

            vadRef.current = vad;
            vad.start();
            setRecorderState('LISTENING');
        } catch (error) {
            console.error('Error initializing VAD:', error);
            setRecorderState('ERROR');
        }
    }, [onRecordingComplete]);

    const toggleMute = () => {
        if (recorderState === 'LISTENING' || recorderState === 'SPEAKING') {
            vadRef.current?.pause();
            setRecorderState('MUTED');
        } else if (recorderState === 'MUTED') {
            vadRef.current?.start();
            setRecorderState('LISTENING');
        }
    };

    useEffect(() => {
        return () => {
            vadRef.current?.destroy();
        };
    }, []);

    const getStatusInfo = (): { text: string; color: string } => {
        switch (recorderState) {
            case 'AWAITING_PERMISSION': return { text: 'Enable Mic', color: 'bg-blue-500' };
            case 'INITIALIZING': return { text: 'Initializing...', color: 'bg-yellow-500' };
            case 'MUTED': return { text: 'Muted', color: 'bg-gray-500' };
            case 'LISTENING': return { text: 'Listening...', color: 'bg-tom-orange' };
            case 'SPEAKING': return { text: 'Speaking...', color: 'bg-green-500 animate-pulse' };
            case 'ERROR': return { text: 'Error', color: 'bg-red-500' };
            default: return { text: 'Status', color: 'bg-gray-500' };
        }
    };

    const { text: statusText, color: statusColor } = getStatusInfo();

    const handleButtonClick = () => {
        if (recorderState === 'AWAITING_PERMISSION' || recorderState === 'ERROR') {
            handleEnableMicrophone();
        } else {
            toggleMute();
        }
    };

    return (
        <button
            onClick={handleButtonClick}
            disabled={disabled}
            className={`p-4 rounded-full transition-all duration-200 ${statusColor} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            title={statusText}
        >
            {recorderState === 'MUTED' || recorderState === 'AWAITING_PERMISSION' || recorderState === 'ERROR' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            ) : (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 3V4a1 1 0 10-2 0v3a1 1 0 102 0zM5 8a5 5 0 1010 0v-1a1 1 0 10-2 0v1a3 3 0 11-6 0v-1a1 1 0 10-2 0v1z" clipRule="evenodd" /></svg>
            )}
        </button>
    );
}
