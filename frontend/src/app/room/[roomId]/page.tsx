'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Message, User } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ContinuousRecorder from '@/components/ContinuousRecorder';

export default function RoomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const roomId = params.roomId as string;
    const username = searchParams.get('username') || '';

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string>('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!username) {
            setError('Username is required');
            return;
        }

        // Initialize socket connection
        const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000');
        setSocket(newSocket);

        // Connection events
        newSocket.on('connect', () => {
            setIsConnected(true);
            setError('');
            // Join room after connection
            newSocket.emit('joinRoom', { roomId, username });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Message events
        newSocket.on('newMessage', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });


        newSocket.on('userJoined', (user: User) => {
            setUsers(prev => {
                if (!prev.find(u => u.id === user.id)) {
                    return [...prev, user];
                }
                return prev;
            });
        });

        newSocket.on('userLeft', (userId: string) => {
            setUsers(prev => prev.filter(user => user.id !== userId));
        });

        newSocket.on('roomUsers', (roomUsers: User[]) => {
            setUsers(roomUsers);
        });

        newSocket.on('roomMessages', (roomMessages: Message[]) => {
            setMessages(roomMessages);
        });

        newSocket.on('error', (errorMessage: string) => {
            setError(errorMessage);
        });

        return () => {
            newSocket.close();
        };
    }, [roomId, username]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (content: string) => {
        if (socket && content.trim()) {
            socket.emit('sendMessage', {
                content: content.trim(),
                username,
                roomId
            });
        }
    };

    const handleVoiceRecording = async (audioBlob: Blob) => {
        if (!socket || !roomId || !username) {
            return;
        }

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            if (base64Audio) {
                socket.emit('sendVoiceMessage', {
                    roomId,
                    username,
                    audio: base64Audio
                });
            }
        };
        reader.readAsDataURL(audioBlob);
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        // You could add a toast notification here
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col" style={{ background: 'var(--chat-bg)' }}>
            {/* Header */}
            <div className="tom-gradient px-6 py-4 flex items-center justify-between shadow-medium">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="tom-button bg-white text-gray-700 px-4 py-2 rounded-tom-sm font-semibold hover:bg-gray-50"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl float">🐱</div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Room: {roomId}</h1>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} pulse-glow`}></div>
                                <span className="text-sm text-white font-medium">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="user-count">
                        {users.length} user{users.length !== 1 ? 's' : ''} online
                    </div>
                    <button
                        onClick={copyRoomCode}
                        className="tom-button bg-white text-gray-700 px-4 py-2 rounded-tom-sm font-semibold hover:bg-gray-50"
                    >
                        Copy Room Code
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div>
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    <ContinuousRecorder
                        onRecordingComplete={handleVoiceRecording}
                        disabled={!isConnected}
                    />
                    <div className="flex-1">
                        <ChatInput onSendMessage={sendMessage} disabled={!isConnected} />
                    </div>
                </div>
            </div>
        </div>
    );
}
