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
        const { senderId, receiverId, content, conversationId } = data;

        // Get or create conversation
        let conversation;
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
        } else {
          conversation = await Conversation.findOrCreate(senderId, receiverId);
        }

        // Create message
        const message = await Message.create({
          conversation: conversation._id,
          sender: senderId,
          receiver: receiverId,
          content,
          messageType: 'text'
        });

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = Date.now();
        
        const unreadCount = conversation.unreadCount.get(receiverId) || 0;
        conversation.unreadCount.set(receiverId, unreadCount + 1);
        
        await conversation.save();

        // Populate message
        await message.populate('sender', 'name avatar');
        await message.populate('receiver', 'name avatar');

        // Emit to sender
        socket.emit('message_sent', {
          success: true,
          data: message
        });

        // Emit to receiver if online
        io.to(receiverId).emit('new_message', {
          data: message
        });

        console.log(`Message sent from ${senderId} to ${receiverId}`);
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

    // Disconnect
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
