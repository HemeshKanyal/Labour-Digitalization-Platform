import { useState, useEffect } from 'react';
import api from '../lib/api';
import { MessageCircle, Search } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

interface Conversation {
    user: {
        _id: string;
        name: string;
        role: string;
    };
    lastMessage: {
        text: string;
        createdAt: string;
    };
}

interface ChatListProps {
    theme: 'light' | 'dark';
    initialChatUser?: { _id: string; name: string } | null;
    onClearInitialChat?: () => void;
}

export function ChatList({ theme, initialChatUser, onClearInitialChat }: ChatListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<Conversation['user'] | null>(null);
    const isDark = theme === 'dark';

    // Get current user from local storage to pass to ChatWindow
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get('/messages/conversations');
                setConversations(response.data);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
        // Optional: Poll for new conversations or updates
        // Optional: Poll for new conversations or updates
    }, []);

    useEffect(() => {
        if (initialChatUser) {
            setActiveChat(initialChatUser as any);
            onClearInitialChat?.();
        }
    }, [initialChatUser, onClearInitialChat]);

    if (!currentUser) return null;

    return (
        <div className="h-full">
            <div className="grid md:grid-cols-3 gap-6 h-full">
                {/* Conversations List */}
                <div className={`md:col-span-1 border rounded-xl overflow-hidden flex flex-col h-[600px] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-200'
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.user._id}
                                    onClick={() => setActiveChat(conv.user)}
                                    className={`p-4 border-b cursor-pointer transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                                        } ${activeChat?._id === conv.user._id ? (isDark ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {conv.user.name}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {conv.lastMessage.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Chat Placeholder or Window (for wider screens embedding) */}
                {/* For this implementation, we'll popup the ChatWindow as a fixed overlay or use this space if integrated differently.
            Based on the design, let's keep ChatWindow as a global popup but maybe we can embed it here for the "Messages" tab view.
            Let's stick to the reusable ChatWindow popup for consistency first, or better yet, embed it here for the full page view.
        */}
                <div className={`md:col-span-2 rounded-xl border flex items-center justify-center h-[600px] ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    {activeChat ? (
                        // We'll render a modified version of ChatWindow that fits here, 
                        // OR we can just use the ChatWindow component but style it to fill this container.
                        // For simplicity now, let's just use the popup for "consistency" across dashboard, 
                        // BUT actually for a full "Messages" tab, an embedded view is better.
                        // Let's re-use ChatWindow logic but maybe adapt styles.
                        // For now, let's just show the popup when clicked.
                        <ChatWindow
                            currentUserId={currentUser._id || currentUser.id || currentUser.userId}
                            recipientId={activeChat._id}
                            recipientName={activeChat.name}
                            onClose={() => setActiveChat(null)}
                            theme={theme as any}
                            variant="embedded"
                        />
                    ) : (
                        <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-semibold">Select a conversation</p>
                            <p>Choose a contact to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Popup ChatWindow removed in favor of embedded view */}
        </div>
    );
}
