const Chat = require('../models/chatModel');

// Create a new chat
exports.createChat = async (req, res) => {
    try {
        const chat = await Chat.create(req.body);
        res.status(201).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get chat by booking ID
exports.getChatByBookingId = async (req, res) => {
    try {
        const chat = await Chat.findOne({ bookingId: req.params.bookingId });
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        res.status(200).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add a message to a chat
exports.addMessageToChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        chat.messages.push(req.body);
        await chat.save();
        res.status(200).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};