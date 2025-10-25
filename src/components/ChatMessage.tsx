import { Message } from '@/types/chat';

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
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

    if (message.isAI) {
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
                    </div>
                    <div className="tom-message p-4 max-w-xs lg:max-w-md">
                        <p className="text-white font-medium leading-relaxed">{message.content}</p>
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
                </div>
                <div className="user-message p-4 max-w-xs lg:max-w-md">
                    <p className="text-white font-medium leading-relaxed">{message.content}</p>
                </div>
            </div>
        </div>
    );
}
