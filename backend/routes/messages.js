const express = require('express');
const router = express.Router();
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
router.post('/send', sendMessage);
router.put('/read/:conversationId', markAsRead);
router.post('/ai-suggest', aiSuggestMessage);
router.delete('/:id', deleteMessage);

module.exports = router;
