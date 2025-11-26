const express = require('express');
const router = express.Router();
const { previewTranslation, getStats } = require('../controllers/translationController');
const { rateLimitTranslationPreview } = require('../middleware/rateLimiter');

// Preview translation (with rate limiting)
router.post('/preview', rateLimitTranslationPreview, previewTranslation);

// Get translation stats
router.get('/stats', getStats);

module.exports = router;
