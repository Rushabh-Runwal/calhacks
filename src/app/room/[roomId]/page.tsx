'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Message, User } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

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
        const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
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
        newSocket.on('message', (message: Message) => {
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
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ← Back
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Room: {roomId}</h1>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-500">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                        {users.length} user{users.length !== 1 ? 's' : ''} online
                    </div>
                    <button
                        onClick={copyRoomCode}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
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
                    messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4">
                <ChatInput onSendMessage={sendMessage} disabled={!isConnected} />
            </div>
        </div>
    );
}
