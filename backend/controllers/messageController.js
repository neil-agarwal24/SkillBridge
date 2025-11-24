const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Mock data for when MongoDB is not connected
let mockConversations = [];
let mockMessages = [];

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations/:userId
// @access  Public
exports.getConversations = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let conversations;
    if (!isMongoConnected) {
      // Get user controller to access mock users
      const { getAllMockUsers } = require('./userController');
      
      // Return mock conversations with populated user data
      conversations = mockConversations
        .filter(c => 
          c.participants.some(p => p._id === req.params.userId || p === req.params.userId)
        )
        .map(c => {
          // Populate participant data from mock users
          const populatedParticipants = c.participants.map(participantId => {
            const userId = typeof participantId === 'string' ? participantId : participantId._id;
            const user = getAllMockUsers().find(u => u._id === userId);
            return user ? {
              _id: user._id,
              name: user.name,
              avatar: user.avatar,
              isOnline: false,
              lastSeen: new Date()
            } : null;
          }).filter(p => p !== null);
          
          // Populate last message if exists
          let populatedLastMessage = null;
          if (c.lastMessage) {
            const msg = mockMessages.find(m => m._id === c.lastMessage);
            if (msg) {
              populatedLastMessage = msg;
            }
          }
          
          return {
            ...c,
            participants: populatedParticipants,
            lastMessage: populatedLastMessage
          };
        });
    } else {
      conversations = await Conversation.find({
        participants: req.params.userId
      })
        .populate('participants', 'name avatar isOnline lastSeen')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversation/:conversationId
// @access  Public
exports.getMessages = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { limit = 50, skip = 0 } = req.query;

    let messages;
    if (!isMongoConnected) {
      messages = mockMessages
        .filter(m => m.conversation === req.params.conversationId && !m.isDeleted)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(parseInt(skip), parseInt(skip) + parseInt(limit))
        .reverse();
    } else {
      messages = await Message.find({
        conversation: req.params.conversationId,
        isDeleted: false
      })
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      
      messages = messages.reverse();
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Public
exports.sendMessage = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { senderId, receiverId, content, messageType } = req.body;

    let message;
    if (!isMongoConnected) {
      // Find or create mock conversation
      let conversation = mockConversations.find(c => 
        (c.participants.includes(senderId) && c.participants.includes(receiverId)) ||
        (c.participants.some(p => p._id === senderId || p === senderId) && 
         c.participants.some(p => p._id === receiverId || p === receiverId))
      );
      
      if (!conversation) {
        conversation = {
          _id: Date.now().toString(),
          participants: [senderId, receiverId],
          lastMessage: null,
          lastMessageAt: new Date(),
          unreadCount: new Map()
        };
        mockConversations.push(conversation);
      }
      
      // Create mock message
      message = {
        _id: Date.now().toString(),
        conversation: conversation._id,
        sender: { _id: senderId, name: 'You' },
        receiver: { _id: receiverId, name: 'Neighbor' },
        content,
        messageType: messageType || 'text',
        isRead: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockMessages.push(message);
      
      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
    } else {
      // Find or create conversation
      const conversation = await Conversation.findOrCreate(senderId, receiverId);

      // Create message
      message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        receiver: receiverId,
        content,
        messageType: messageType || 'text'
      });

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = Date.now();
      
      // Increment unread count for receiver
      const unreadCount = conversation.unreadCount.get(receiverId) || 0;
      conversation.unreadCount.set(receiverId, unreadCount + 1);
      
      await conversation.save();

      // Populate message for response
      await message.populate('sender', 'name avatar');
      await message.populate('receiver', 'name avatar');
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Public
exports.markAsRead = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { userId } = req.body;

    if (!isMongoConnected) {
      // Update mock messages
      mockMessages.forEach(msg => {
        if (msg.conversation === req.params.conversationId && 
            msg.receiver._id === userId && 
            !msg.isRead) {
          msg.isRead = true;
          msg.readAt = new Date();
        }
      });
      
      // Update mock conversation
      const conversation = mockConversations.find(c => c._id === req.params.conversationId);
      if (conversation && conversation.unreadCount) {
        conversation.unreadCount.set(userId, 0);
      }
    } else {
      // Update all unread messages in conversation
      await Message.updateMany(
        {
          conversation: req.params.conversationId,
          receiver: userId,
          isRead: false
        },
        {
          isRead: true,
          readAt: Date.now()
        }
      );

      // Reset unread count for user
      const conversation = await Conversation.findById(req.params.conversationId);
      if (conversation) {
        conversation.unreadCount.set(userId, 0);
        await conversation.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI suggested message
// @route   POST /api/messages/ai-suggest
// @access  Public
exports.aiSuggestMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId, context } = req.body;

    // Validate required fields
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'senderId and receiverId are required'
      });
    }

    // Get user controller to fetch profiles
    const { getAllMockUsers } = require('./userController');
    const User = require('../models/User');
    const { generateMessageSuggestions } = require('../utils/gemini');
    
    const isMongoConnected = require('mongoose').connection.readyState === 1;

    // Fetch sender and receiver profiles
    let sender, receiver;
    if (!isMongoConnected) {
      const mockUsers = getAllMockUsers();
      sender = mockUsers.find(u => u._id === senderId);
      receiver = mockUsers.find(u => u._id === receiverId);
    } else {
      sender = await User.findById(senderId);
      receiver = await User.findById(receiverId);
    }

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate AI suggestions
    const startTime = Date.now();
    const result = await generateMessageSuggestions(sender, receiver, context);
    const duration = Date.now() - startTime;

    // Log AI usage for monitoring
    console.log(`[AI Message] Generated ${result.suggestions.length} suggestions (${result.source}) in ${duration}ms`);

    res.status(200).json({
      success: true,
      data: {
        suggestions: result.suggestions,
        source: result.source,
        cached: result.cached || false
      }
    });
  } catch (err) {
    // Don't let AI errors break the main flow
    console.error('AI suggest error:', err.message);
    
    // Return basic fallback suggestions
    const fallbackSuggestions = [
      `Hi! I'd love to connect and see how we can help each other.`,
      `Hello! I noticed your profile and think we could collaborate.`,
      `Hey! Let's chat about ways we can support each other in the community.`
    ];
    
    res.status(200).json({
      success: true,
      data: {
        suggestions: fallbackSuggestions,
        source: 'fallback'
      }
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Public
exports.deleteMessage = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let message;
    if (!isMongoConnected) {
      message = mockMessages.find(m => m._id === req.params.id);
      
      if (message) {
        message.isDeleted = true;
        message.deletedAt = new Date();
      }
    } else {
      message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      message.isDeleted = true;
      message.deletedAt = Date.now();
      await message.save();
    }

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
