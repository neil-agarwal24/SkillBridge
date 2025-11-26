const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

module.exports = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins their personal room
    socket.on('join', async (userId) => {
      try {
        socket.userId = userId;
        socket.join(userId);
        connectedUsers.set(userId, socket.id);

        // Update user online status
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: Date.now()
        });

        // Broadcast to others that user is online
        socket.broadcast.emit('user_online', { userId });

        console.log(`User ${userId} joined`);
      } catch (err) {
        console.error('Error joining:', err);
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content, conversationId, translatedContent, originalLanguage, targetLanguage } = data;

        // Get or create conversation
        let conversation;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
        } else {
          conversation = await Conversation.findOrCreate(senderId, receiverId);
        }

        // Create message with translation data
        const messageData = {
          conversation: conversation._id,
          sender: senderId,
          receiver: receiverId,
          content, // Original text
          originalLanguage: originalLanguage || 'en',
          messageType: 'text'
        };

        // Store translation if provided
        if (translatedContent && targetLanguage && translatedContent !== content) {
          messageData.translations = new Map([[targetLanguage, translatedContent]]);
        }

        const message = await Message.create(messageData);

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = Date.now();
        
        const unreadCount = conversation.unreadCount.get(receiverId) || 0;
        conversation.unreadCount.set(receiverId, unreadCount + 1);
        
        await conversation.save();

        // Populate message
        await message.populate('sender', 'name avatar');
        await message.populate('receiver', 'name avatar');

        // Emit to sender with original content (and translation for consistency)
        const senderPayload = message.toObject();
        if (senderPayload.translations && senderPayload.translations instanceof Map) {
          senderPayload.translatedText = senderPayload.translations.get(targetLanguage) || null;
          // Convert Map to object for JSON serialization
          const translationsObj = {};
          senderPayload.translations.forEach((value, key) => {
            translationsObj[key] = value;
          });
          senderPayload.translations = translationsObj;
        }
        socket.emit('message_sent', {
          success: true,
          data: {
            ...senderPayload,
            content: message.content,
            originalLanguage: message.originalLanguage,
            targetLanguage: targetLanguage
          }
        });

        // Emit to receiver with translated content (if available)
        const receiverPayload = {
          ...message.toObject(),
          content: message.content,
          translatedText: translatedContent || message.content,
          originalLanguage: message.originalLanguage,
          targetLanguage: targetLanguage
        };

        io.to(receiverId).emit('new_message', {
          data: receiverPayload
        });

        console.log(`Message sent from ${senderId} to ${receiverId}${translatedContent ? ' (translated)' : ''}`);
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('message_error', {
          success: false,
          message: err.message
        });
      }
    });

    // User is typing
    socket.on('typing', (data) => {
      const { userId, receiverId } = data;
      io.to(receiverId).emit('user_typing', { userId });
    });

    // User stopped typing
    socket.on('stop_typing', (data) => {
      const { userId, receiverId } = data;
      io.to(receiverId).emit('user_stop_typing', { userId });
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { conversationId, userId } = data;

        await Message.updateMany(
          {
            conversation: conversationId,
            receiver: userId,
            isRead: false
          },
          {
            isRead: true,
            readAt: Date.now()
          }
        );

        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(userId, 0);
          await conversation.save();

          // Notify sender that messages were read
          const otherUserId = conversation.participants.find(
            p => p.toString() !== userId
          );
          io.to(otherUserId.toString()).emit('messages_read', {
            conversationId,
            readBy: userId
          });
        }
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    });

    // ==================== EMERGENCY EVENTS ====================
    
    // Emergency broadcast created - notify matched users
    socket.on('emergency:broadcast', (data) => {
      try {
        const { emergencyId, matches } = data;
        
        // Send priority notification to each matched user
        matches.forEach(match => {
          io.to(match.userId.toString()).emit('emergency:notification', {
            emergencyId,
            severity: data.severity,
            type: data.type,
            description: data.description,
            distance: match.distance,
            reasons: match.reasons,
            requester: data.requester
          });
        });

        console.log(`🚨 Emergency broadcast sent to ${matches.length} users`);
      } catch (err) {
        console.error('Error broadcasting emergency:', err);
      }
    });

    // User responds to emergency
    socket.on('emergency:respond', async (data) => {
      try {
        const { emergencyId, userId, userName } = data;
        
        // Join emergency room for updates
        socket.join(`emergency:${emergencyId}`);
        
        // Notify requester
        io.to(data.requesterId).emit('emergency:responder_joined', {
          emergencyId,
          responder: {
            userId,
            name: userName
          }
        });

        // Notify all responders
        io.to(`emergency:${emergencyId}`).emit('emergency:update', {
          emergencyId,
          message: `${userName} is responding`,
          responderCount: data.responderCount
        });

        console.log(`✓ ${userName} responding to emergency ${emergencyId}`);
      } catch (err) {
        console.error('Error responding to emergency:', err);
      }
    });

    // Update emergency status (arriving, helping, etc.)
    socket.on('emergency:status_update', (data) => {
      try {
        const { emergencyId, userId, status, message } = data;
        
        // Notify everyone in the emergency room
        io.to(`emergency:${emergencyId}`).emit('emergency:status_changed', {
          emergencyId,
          userId,
          status,
          message
        });

        console.log(`Emergency ${emergencyId} status: ${message}`);
      } catch (err) {
        console.error('Error updating emergency status:', err);
      }
    });

    // Emergency resolved
    socket.on('emergency:resolve', (data) => {
      try {
        const { emergencyId, resolvedBy } = data;
        
        // Notify all participants
        io.to(`emergency:${emergencyId}`).emit('emergency:resolved', {
          emergencyId,
          resolvedBy,
          message: 'Emergency has been resolved'
        });

        console.log(`✓ Emergency ${emergencyId} resolved`);
      } catch (err) {
        console.error('Error resolving emergency:', err);
      }
    });

    // ==================== DISCONNECT ====================
    
    socket.on('disconnect', async () => {
      try {
        const userId = socket.userId;
        if (userId) {
          connectedUsers.delete(userId);

          // Update user offline status
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: Date.now()
          });

          // Broadcast to others that user is offline
          socket.broadcast.emit('user_offline', { userId });

          console.log(`User ${userId} disconnected`);
        }
      } catch (err) {
        console.error('Error on disconnect:', err);
      }
    });
  });

  return io;
};
