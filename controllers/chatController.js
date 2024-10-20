// controllers/chatController.js
const Chat = require('../models/chatModel');
const mongoose = require('mongoose');

// Initialize a chat
// exports.initializeChat = async (req, res) => {
//     try {
//         // Check if chat already exists for this booking
//         const existingChat = await Chat.findOne({ 
//             bookingId: req.body.bookingId 
//         });

//         if (existingChat) {
//             return res.status(200).json(existingChat);
//         }

//         // Create new chat
//         const chat = await Chat.create({
//             bookingId: req.body.bookingId,
//             customerId: req.body.customerId,
//             vendorId: req.body.vendorId
//         });

//         res.status(201).json(chat);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

exports.initializeChat = async (req, res) => {
    try {
        // Check if chat already exists for this booking
        const existingChat = await Chat.findOne({ 
            bookingId: req.body.bookingId 
        }).populate({
            path: 'messages.sender',
            select: 'name profileImage'
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // Create new chat
        const chat = await Chat.create({
            bookingId: req.body.bookingId,
            customerId: req.body.customerId,
            vendorId: req.body.vendorId
        });

        const populatedChat = await Chat.findById(chat._id).populate({
            path: 'messages.sender',
            select: 'name profileImage'
        });

        res.status(201).json(populatedChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all chats for a vendor
exports.getVendorChats = async (req, res) => {
    try {
        const chats = await Chat.find({ 
            vendorId: req.params.vendorId,
            status: 'active'
        })
        .sort({ lastMessage: -1 })
        .populate('customerId', 'name profileImage') // Adjust fields as needed
        .populate('bookingId', 'serviceDetails date') // Adjust fields as needed
        .exec();

        res.status(200).json(chats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all chats for a customer
exports.getCustomerChats = async (req, res) => {
    try {
        const chats = await Chat.find({ 
            customerId: req.params.customerId,
            status: 'active'
        })
        .sort({ lastMessage: -1 })
        .populate('vendorId', 'name profileImage') // Adjust fields as needed
        .populate('bookingId', 'serviceDetails date') // Adjust fields as needed
        .exec();

        res.status(200).json(chats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add message to chat
// exports.addMessageToChat = async (req, res) => {
//     try {
//         const chat = await Chat.findById(req.params.id);
//         if (!chat) return res.status(404).json({ message: 'Chat not found' });
        
//         const newMessage = {
//             sender: req.body.sender,
//             message: req.body.message,
//             imageUrl: req.body.imageUrl || null,
//             location: req.body.location || null,
//         };

//         chat.messages.push(newMessage);
//         chat.lastMessage = Date.now(); // Update last message timestamp
//         await chat.save();
        
//         res.status(200).json(chat);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

exports.addMessageToChat = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Chat not found' });
        }
        
        const newMessage = {
            sender: req.body.sender,
            message: req.body.message,
            imageUrl: req.body.imageUrl || null,
            location: req.body.location || null,
        };

        chat.messages.push(newMessage);
        chat.lastMessage = Date.now();
        await chat.save({ session });

        // Get the populated message for response
        const populatedChat = await Chat.findById(chat._id)
            .populate({
                path: 'messages.sender',
                select: 'name profileImage'
            })
            .session(session);

        const populatedMessage = populatedChat.messages[populatedChat.messages.length - 1];

        await session.commitTransaction();
        
        // Send back the populated message
        res.status(200).json({
            message: populatedMessage,
            chatId: chat._id
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};
