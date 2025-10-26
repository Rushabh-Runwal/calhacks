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
         <div className="flex w-full p-0"> {/* was p-4 */}
      <div className="flex items-center gap-2 flex-1"> 
                <div className="flex-1">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={disabled ? "Connecting to Tom..." : "Type a message to Tom..."}
                        disabled={disabled}
                        className="tom-input w-full md:px-4 md:py-4 md:text-lg p-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        maxLength={500}
                    />
                </div>
                <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className="tom-button tom-gradient text-white md:px-8 md:py-4 py-2 px-3 rounded-tom md:font-bold font-semibold md:text-lg text-sm shadow-medium disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
            >
                Send
            </button>
            </div>
        </div>
    );
}
