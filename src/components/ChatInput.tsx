'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex justify-center w-full p-4">
            <div className="flex items-center space-x-4 w-[70%]">
                <div className="flex-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={disabled ? "Connecting to Tom..." : "Type a message to Tom..."}
                        disabled={disabled}
                        className="tom-input w-full px-4 py-4 text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                        maxLength={500}
                    />
                </div>
                <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className="tom-button tom-gradient text-white px-8 py-4 rounded-tom font-bold text-lg shadow-medium disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
            >
                Send
            </button>
            </div>
        </div>
    );
}
