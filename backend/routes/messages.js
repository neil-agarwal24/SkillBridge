const express = require('express');
const router = express.Router();
const { rateLimitAI } = require('../middleware/rateLimiter');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  aiSuggestMessage,
  deleteMessage
} = require('../controllers/messageController');

router.get('/conversations/:userId', getConversations);
router.get('/conversation/:conversationId', getMessages);
router.post('/send', rateLimitAI(60, 60000), sendMessage); // 60 messages per minute
router.put('/read/:conversationId', markAsRead);
router.post('/ai-suggest', rateLimitAI(), aiSuggestMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
