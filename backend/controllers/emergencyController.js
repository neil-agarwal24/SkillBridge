const Emergency = require('../models/Emergency');
const User = require('../models/User');
const { matchEmergencyResponders } = require('../utils/emergencyMatcher');

// Mock emergency storage for demo mode
let mockEmergencies = [];

/**
 * Create a new emergency broadcast
 * POST /api/emergencies
 */
exports.createEmergency = async (req, res) => {
  try {
    const { type, severity, description, location } = req.body;
    const requesterId = req.user?._id || req.body.requesterId; // Support mock mode

    console.log('Creating emergency - requesterId:', requesterId, 'type:', typeof requesterId);

    // Validation
    if (!type || !severity || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, severity, description'
      });
    }

    if (severity < 1 || severity > 5) {
      return res.status(400).json({
        success: false,
        error: 'Severity must be between 1 and 5'
      });
    }

    // Validate requesterId
    if (!requesterId) {
      return res.status(400).json({
        success: false,
        error: 'Requester ID is required'
      });
    }

    // Get requester info (try mock mode first for simple IDs)
    let requester;
    
    // Check if requesterId looks like a mock ID (simple string/number)
    if (requesterId && String(requesterId).length < 10) {
      // Try mock users first
      const userController = require('./userController');
      const mockUsers = userController.getAllMockUsers();
      requester = mockUsers.find(u => u._id == requesterId); // Use == for type coercion
      console.log('Checked mock users, found:', requester ? requester.name : 'not found');
    }
    
    // If not found in mock, try database
    if (!requester) {
      try {
        console.log('Trying database lookup for:', requesterId);
        requester = await User.findById(requesterId);
        console.log('Database lookup result:', requester ? requester.name : 'not found');
      } catch (dbError) {
        console.log('Database query error:', dbError.message);
      }
    }
    
    if (!requester) {
      console.log('Requester not found - requesterId:', requesterId);
      return res.status(404).json({
        success: false,
        error: 'Requester not found'
      });
    }

    console.log('Using requester:', requester.name);

    // Create emergency object
    const emergencyData = {
      _id: Date.now().toString(),
      type,
      severity,
      description,
      location: location || {
        type: 'Point',
        coordinates: requester.location?.coordinates || [0, 0],
        addressFuzzy: requester.location?.address || 'Unknown location'
      },
      requester: requester,
      requesterId: requesterId,
      status: 'pending',
      responders: [],
      createdAt: new Date(),
      elapsedTime: '0m'
    };

    // Use AI to match potential responders
    const matches = await matchEmergencyResponders(emergencyData, requester);
    emergencyData.matchedUsers = matches.map(m => m.userId);
    emergencyData.requiredSkills = matches[0]?.requiredSkills || [];

    // Store in mock storage (for demo mode without MongoDB)
    mockEmergencies.push(emergencyData);
    const emergency = emergencyData;

    res.status(201).json({
      success: true,
      emergency: emergency,
      matches: matches,
      message: `Emergency broadcast sent to ${matches.length} nearby neighbors`
    });

  } catch (error) {
    console.error('Create emergency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create emergency broadcast',
      message: error.message
    });
  }
};

/**
 * Get emergency details
 * GET /api/emergencies/:id
 */
exports.getEmergency = async (req, res) => {
  try {
    const { id } = req.params;

    // Try mock storage first
    let emergency = mockEmergencies.find(e => e._id === id);
    
    // If not in mock storage, try database
    if (!emergency) {
      try {
        emergency = await Emergency.findById(id)
          .populate('requester', 'name profilePicture')
          .populate('responders.user', 'name profilePicture skills')
          .populate('matchedUsers', 'name profilePicture skills');
      } catch (dbError) {
        // Database query failed, emergency not found
      }
    }

    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    res.json({
      success: true,
      emergency
    });

  } catch (error) {
    console.error('Get emergency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency',
      message: error.message
    });
  }
};

/**
 * Respond to an emergency
 * PATCH /api/emergencies/:id/respond
 */
exports.respondToEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.body.userId; // Support mock mode

    // Try mock storage first
    let emergency = mockEmergencies.find(e => e._id === id);
    
    if (!emergency) {
      // Try database
      try {
        emergency = await Emergency.findById(id)
          .populate('requester', 'name profilePicture');
      } catch (dbError) {
        return res.status(404).json({
          success: false,
          error: 'Emergency not found'
        });
      }
    }

    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    // Check if already resolved/closed
    if (emergency.status === 'resolved' || emergency.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Emergency is already resolved'
      });
    }

    // Add responder (mock mode)
    if (mockEmergencies.find(e => e._id === id)) {
      // Get responder info
      const { getAllMockUsers } = require('./userController');
      const mockUsers = getAllMockUsers();
      const responder = mockUsers.find(u => u._id === userId);
      
      // Check if already responding
      if (emergency.responders.find(r => r.userId === userId)) {
        return res.status(400).json({
          success: false,
          error: 'You are already responding to this emergency'
        });
      }
      
      emergency.responders.push({
        userId: userId,
        user: responder,
        respondedAt: new Date(),
        status: 'responding'
      });
      
      if (emergency.status === 'pending') {
        emergency.status = 'active';
      }
    } else {
      // Database mode
      const added = emergency.addResponder(userId);
      if (!added) {
        return res.status(400).json({
          success: false,
          error: 'You are already responding to this emergency'
        });
      }
      await emergency.save();
      await emergency.populate('responders.user', 'name profilePicture skills');
    }

    res.json({
      success: true,
      emergency,
      message: 'You are now responding to this emergency'
    });

  } catch (error) {
    console.error('Respond to emergency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to respond to emergency',
      message: error.message
    });
  }
};

/**
 * Update responder status
 * PATCH /api/emergencies/:id/status
 */
exports.updateResponderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'responding', 'arrived', 'helping'
    const userId = req.user?._id || req.body.userId;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    // Find responder
    const responder = emergency.responders.find(
      r => r.user.toString() === userId.toString()
    );

    if (!responder) {
      return res.status(400).json({
        success: false,
        error: 'You are not responding to this emergency'
      });
    }

    responder.status = status;
    await emergency.save();

    res.json({
      success: true,
      emergency,
      message: `Status updated to ${status}`
    });

  } catch (error) {
    console.error('Update responder status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      message: error.message
    });
  }
};

/**
 * Resolve an emergency
 * PATCH /api/emergencies/:id/resolve
 */
exports.resolveEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.body.userId;

    // Try mock storage first
    let emergency = mockEmergencies.find(e => e._id === id);
    
    if (!emergency) {
      try {
        emergency = await Emergency.findById(id)
          .populate('requester', 'name')
          .populate('responders.user', 'name profilePicture');
      } catch (dbError) {
        return res.status(404).json({
          success: false,
          error: 'Emergency not found'
        });
      }
    }

    if (!emergency) {
      return res.status(404).json({
        success: false,
        error: 'Emergency not found'
      });
    }

    // Only requester or responders can resolve
    const isRequester = emergency.requesterId === userId || emergency.requester._id?.toString() === userId.toString();
    const isResponder = emergency.responders.some(
      r => r.userId === userId || r.user?._id?.toString() === userId.toString()
    );

    if (!isRequester && !isResponder) {
      return res.status(403).json({
        success: false,
        error: 'Only the requester or responders can resolve this emergency'
      });
    }

    // Mark as resolved
    if (mockEmergencies.find(e => e._id === id)) {
      emergency.status = 'resolved';
      emergency.resolvedAt = new Date();
      const elapsed = emergency.resolvedAt - emergency.createdAt;
      emergency.responseTime = Math.round(elapsed / 1000 / 60); // minutes
    } else {
      emergency.resolve();
      await emergency.save();
    }

    res.json({
      success: true,
      emergency,
      message: 'Emergency marked as resolved'
    });

  } catch (error) {
    console.error('Resolve emergency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve emergency',
      message: error.message
    });
  }
};

/**
 * Get active emergencies
 * GET /api/emergencies/active
 */
exports.getActiveEmergencies = async (req, res) => {
  try {
    // Get from mock storage
    const mockActive = mockEmergencies.filter(e => 
      e.status === 'pending' || e.status === 'active'
    );
    
    let emergencies = mockActive;
    
    // Also try database
    try {
      const dbEmergencies = await Emergency.getActive()
        .populate('requester', 'name profilePicture')
        .populate('responders.user', 'name profilePicture')
        .limit(50);
      emergencies = [...mockActive, ...dbEmergencies];
    } catch (dbError) {
      // Database failed, use mock only
    }

    res.json({
      success: true,
      emergencies,
      count: emergencies.length
    });

  } catch (error) {
    console.error('Get active emergencies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active emergencies',
      message: error.message
    });
  }
};

/**
 * Get user's emergency history (as requester or responder)
 * GET /api/emergencies/history
 */
exports.getEmergencyHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;
    
    let asRequester = [];
    let asResponder = [];

    // Check if using mock mode (simple string ID)
    const isMockMode = typeof userId === 'string' && userId.length < 10;
    
    if (isMockMode) {
      // Get from mock storage
      asRequester = mockEmergencies.filter(e => e.requesterId === userId);
      asResponder = mockEmergencies.filter(e => 
        e.responders && e.responders.some(r => r.user === userId || r.user._id === userId)
      );
    } else {
      // Try database
      try {
        asRequester = await Emergency.find({ requester: userId })
          .populate('responders.user', 'name profilePicture')
          .sort({ createdAt: -1 })
          .limit(20);

        asResponder = await Emergency.find({ 'responders.user': userId })
          .populate('requester', 'name profilePicture')
          .sort({ createdAt: -1 })
          .limit(20);
      } catch (dbError) {
        console.error('Database query failed, using empty results:', dbError);
      }
    }

    res.json({
      success: true,
      asRequester,
      asResponder,
      totalRequested: asRequester.length,
      totalResponded: asResponder.length
    });

  } catch (error) {
    console.error('Get emergency history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency history',
      message: error.message
    });
  }
};

/**
 * Report an emergency as false alarm or abuse
 * PATCH /api/emergencies/:id/report
 */
exports.reportEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?._id || req.body.userId;

    // Try mock storage first
    let emergency = mockEmergencies.find(e => e._id === id);
    
    if (emergency) {
      // Mock emergency - update in memory
      if (!emergency.reportedBy) emergency.reportedBy = [];
      if (!emergency.reportedBy.includes(userId)) {
        emergency.reportedBy.push(userId);
        emergency.reported = true;
        emergency.reportReason = reason || 'No reason provided';
      }
    } else {
      // Try database
      try {
        emergency = await Emergency.findById(id);
        if (!emergency) {
          return res.status(404).json({
            success: false,
            error: 'Emergency not found'
          });
        }

        // Add to reported list
        if (!emergency.reportedBy.includes(userId)) {
          emergency.reportedBy.push(userId);
          emergency.reported = true;
          emergency.reportReason = reason || 'No reason provided';
          await emergency.save();
        }
      } catch (dbError) {
        return res.status(404).json({
          success: false,
          error: 'Emergency not found'
        });
      }
    }

    res.json({
      success: true,
      message: 'Emergency reported. Moderators will review.'
    });

  } catch (error) {
    console.error('Report emergency error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to report emergency',
      message: error.message
    });
  }
};
