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
        const chat = await Chat.findById(req.params.id); // Find chat by ID
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        
        // Push the new message to the messages array
        chat.messages.push(req.body); // Add the message from the request body
        await chat.save(); // Save the updated chat
        
        res.status(200).json(chat); // Return the updated chat
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};