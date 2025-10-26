import { Message } from '@/types/chat';
import { useState } from 'react';

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (username: string) => {
        return username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (message.is_ai) {
        return (
            <div className="flex items-start space-x-3 bounce-in">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 tom-gradient rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-medium wiggle">
                        🐱
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">{message.username}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-tom-sm">{formatTime(message.timestamp)}</span>
                        {message.is_voice && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-tom-sm">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                                Voice
                            </span>
                        )}
                    </div>
                    <div className="tom-message p-4 max-w-xs lg:max-w-md">
                        <p className="text-white font-medium leading-relaxed">
                            {message.content}
                        </p>
                        {message.audio_url && (
                            <div className="mt-3">
                                <audio
                                    controls
                                    autoPlay
                                    onPlay={() => setIsPlaying(true)}
                                    onEnded={() => setIsPlaying(false)}
                                    onPause={() => setIsPlaying(false)}
                                    className="w-full max-w-xs"
                                    src={message.audio_url.startsWith('http')
                                        ? message.audio_url
                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${message.audio_url}`}
                                >
                                    Your browser does not support audio playback.
                                </audio>
                                {isPlaying && (
                                    <div className="flex items-center gap-2 mt-2 text-tom-orange">
                                        <div className="w-2 h-2 bg-tom-orange rounded-full animate-pulse" />
                                        <span className="text-sm">Tom is speaking...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start space-x-3 slide-in">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 sky-gradient rounded-full flex items-center justify-center text-white text-lg font-bold shadow-medium">
                    {getInitials(message.username)}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-bold text-gray-900">{message.username}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-tom-sm">{formatTime(message.timestamp)}</span>
                    {message.is_voice && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-tom-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                            Voice
                        </span>
                    )}
                </div>
                <div className="user-message p-4 max-w-xs lg:max-w-md">
                    <p className="text-white font-medium leading-relaxed">{message.content}</p>
                    {message.is_voice && (
                        <div className="mt-2 text-xs text-blue-200 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                            Voice message
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
