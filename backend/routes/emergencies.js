const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// No auth required for mock mode - in production, add proper auth middleware

// Create emergency broadcast
router.post('/', emergencyController.createEmergency);

// Get active emergencies
router.get('/active', emergencyController.getActiveEmergencies);

// Get user's emergency history
router.get('/history', emergencyController.getEmergencyHistory);

// Get specific emergency
router.get('/:id', emergencyController.getEmergency);

// Respond to emergency
router.patch('/:id/respond', emergencyController.respondToEmergency);

// Update responder status
router.patch('/:id/status', emergencyController.updateResponderStatus);

// Resolve emergency
router.patch('/:id/resolve', emergencyController.resolveEmergency);

// Report emergency
router.patch('/:id/report', emergencyController.reportEmergency);

module.exports = router;
