const User = require('../models/User');
const { translateText, getTranslationStats, getLanguageName, MIN_MESSAGE_LENGTH } = require('../utils/translation');

/**
 * Preview translation for live typing
 * POST /api/translation/preview
 */
exports.previewTranslation = async (req, res) => {
  try {
    const { text, recipientId } = req.body;
    const isMongoConnected = require('mongoose').connection.readyState === 1;

    // Validate input
    if (!text || !recipientId) {
      return res.status(400).json({
        success: false,
        error: 'Text and recipientId are required'
      });
    }

    // Get recipient's preferred language (with mock fallback)
    let recipient = null;
    if (isMongoConnected) {
      recipient = await User.findById(recipientId).select('preferredLanguage name');
    } else {
      // Mock mode - get from mock users
      const { getAllMockUsers } = require('./userController');
      const mockUsers = getAllMockUsers();
      recipient = mockUsers.find(u => u._id === recipientId);
    }

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    const targetLang = recipient.preferredLanguage || 'en';

    // Skip translation for very short messages
    if (text.length < MIN_MESSAGE_LENGTH) {
      return res.json({
        success: true,
        translation: text,
        targetLanguage: targetLang,
        languageName: getLanguageName(targetLang),
        skipped: true,
        reason: 'Message too short'
      });
    }
    
    // Get sender's language (from authenticated user)
    const senderId = req.user?.id || req.body.senderId;
    let sourceLang = 'auto';
    
    if (senderId) {
      if (isMongoConnected) {
        const sender = await User.findById(senderId).select('preferredLanguage');
        if (sender) {
          sourceLang = sender.preferredLanguage || 'auto';
        }
      } else {
        // Mock mode - get from mock users
        const { getAllMockUsers } = require('./userController');
        const mockUsers = getAllMockUsers();
        const sender = mockUsers.find(u => u._id === senderId);
        if (sender) {
          sourceLang = sender.preferredLanguage || 'auto';
        }
      }
    }

    // Translate
    const result = await translateText(text, targetLang, sourceLang);

    // If translation actually failed (not just skipped), log and return error
    if (result.failed) {
      console.warn(`⚠ Translation failed for ${senderId} -> ${recipientId}: ${result.error}`);
      return res.status(503).json({
        success: false,
        error: 'Translation service unavailable',
        message: result.error,
        originalText: text
      });
    }

    res.json({
      success: true,
      translation: result.translatedText,
      targetLanguage: targetLang,
      languageName: getLanguageName(targetLang),
      recipientName: recipient.name,
      cached: result.cached || false,
      skipped: result.skipped || false
    });

  } catch (error) {
    console.error('Preview translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation preview failed',
      message: error.message
    });
  }
};

/**
 * Get translation statistics
 * GET /api/translation/stats
 */
exports.getStats = async (req, res) => {
  try {
    const stats = getTranslationStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get translation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get translation stats'
    });
  }
};
