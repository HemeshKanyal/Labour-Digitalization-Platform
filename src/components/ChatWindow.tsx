import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Send, X, User as UserIcon } from 'lucide-react';

interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    receiver: {
        _id: string;
        name: string;
        email: string;
    };
    text: string;
    createdAt: string;
}

interface ChatWindowProps {
    currentUserId: string;
    recipientId: string;
    recipientName: string;
    onClose: () => void;
    theme: 'light' | 'dark' | 'colorful';
    variant?: 'popup' | 'embedded';
}

export function ChatWindow({ currentUserId, recipientId, recipientName, onClose, theme, variant = 'popup' }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isDark = theme === 'dark';
    const isColorful = theme === 'colorful';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${recipientId}`);
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [recipientId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await api.post('/messages', {
                receiverId: recipientId,
                text: newMessage,
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const containerClasses = variant === 'popup'
        ? `fixed bottom-4 right-4 w-96 h-[500px] shadow-2xl rounded-xl border z-50`
        : `w-full h-full flex flex-col`;

    return (
        <div className={`${containerClasses} flex flex-col overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' :
            isColorful ? 'bg-white/95 backdrop-blur-md border-purple-200' :
                'bg-white border-gray-200'
            }`}>
            {/* Header */}
            <div className={`p-3 flex items-center justify-between border-b z-10 ${isDark ? 'bg-[#202c33] border-gray-700' :
                isColorful ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' :
                    'bg-[#f0f2f5] border-gray-200'
                }`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : isColorful ? 'text-white' : 'text-gray-900'}`}>{recipientName}</h3>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' :
                        isColorful ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 text-gray-600'
                        }`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p>No messages yet.</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const senderId = msg.sender?._id || msg.sender;
                        // Strict check: Ensure both IDs exist and are strings/compatible before comparing
                        const isMe = Boolean(currentUserId && senderId && String(senderId) === String(currentUserId));

                        return (
                            <div
                                key={msg._id}
                                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`relative max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : isDark
                                            ? 'bg-gray-700 text-gray-100 rounded-tl-none'
                                            : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                        }`}
                                >
                                    {/* Tail pseudo-element simulated with absolute positioning if needed, or stick to rounded corners for now */}
                                    <p className="leading-relaxed break-words">{msg.text}</p>
                                    <div className={`flex items-center gap-2 mt-1 ${isMe ? 'justify-end text-blue-100' : 'justify-start text-gray-500'
                                        }`}>
                                        <span className="text-[10px] font-medium opacity-80">
                                            {isMe ? 'You' : msg.sender.name}
                                        </span>
                                        <span className="text-[10px]">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-2 px-4 border-t flex items-center gap-2 ${isDark ? 'bg-[#202c33] border-gray-700' : 'bg-[#f0f2f5] border-gray-200'
                }`}>
                <form onSubmit={handleSend} className="flex gap-2 w-full items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message"
                        className={`flex-1 px-4 py-2 rounded-lg border-none focus:outline-none text-sm ${isDark
                            ? 'bg-[#2a3942] text-white placeholder-gray-400'
                            : 'bg-white text-gray-900 placeholder-gray-500'
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-2 rounded-full transition-colors ${!newMessage.trim()
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
