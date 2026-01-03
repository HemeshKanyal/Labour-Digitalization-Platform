const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;

        if (!receiverId || !text) {
            return res.status(400).json({ message: 'Please provide receiver and text' });
        }

        const message = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            text,
        });

        // Populate sender and receiver for immediate UI update if needed
        const fullMessage = await Message.findById(message._id)
            .populate('sender', 'name email')
            .populate('receiver', 'name email');

        res.status(201).json(fullMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id },
            ],
        })
            .sort({ createdAt: 1 })
            .populate('sender', '_id name email')
            .populate('receiver', '_id name email');

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all messages involving the user
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }],
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name role')
            .populate('receiver', 'name role');

        const conversationMap = new Map();

        messages.forEach(msg => {
            const isSender = msg.sender._id.toString() === userId;
            const otherUser = isSender ? msg.receiver : msg.sender;
            const otherUserId = otherUser._id.toString();

            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    user: otherUser,
                    lastMessage: msg,
                });
            }
        });

        const conversations = Array.from(conversationMap.values());

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
};
