const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  // Emergency details
  type: {
    type: String,
    enum: ['medical', 'safety', 'accessibility', 'disaster', 'other'],
    required: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Location (fuzzy for privacy)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    addressFuzzy: String, // "Near Main St & 5th Ave" instead of exact address
    approximateDistance: String // "Within 0.5 miles of downtown"
  },
  
  // People involved
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responders: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['responding', 'arrived', 'helping'],
      default: 'responding'
    }
  }],
  
  // Emergency lifecycle
  status: {
    type: String,
    enum: ['pending', 'active', 'resolved', 'closed', 'cancelled'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: Date,
  closedAt: Date,
  
  // AI matching metadata
  matchedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requiredSkills: [String], // Extracted by AI
  
  // Moderation
  reported: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportReason: String,
  
  // Chat reference
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
emergencySchema.index({ 'location.coordinates': '2dsphere' });

// Index for finding active emergencies
emergencySchema.index({ status: 1, createdAt: -1 });

// Index for user's emergency history
emergencySchema.index({ requester: 1, createdAt: -1 });
emergencySchema.index({ 'responders.user': 1, createdAt: -1 });

// Virtual for response time (in minutes)
emergencySchema.virtual('responseTime').get(function() {
  if (this.responders.length > 0 && this.createdAt) {
    const firstResponse = this.responders[0].respondedAt;
    return Math.round((firstResponse - this.createdAt) / 1000 / 60);
  }
  return null;
});

// Virtual for elapsed time
emergencySchema.virtual('elapsedTime').get(function() {
  const now = new Date();
  const elapsed = now - this.createdAt;
  const minutes = Math.floor(elapsed / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
});

// Method to check if emergency is stale (no response in 10 minutes)
emergencySchema.methods.isStale = function() {
  if (this.status !== 'pending') return false;
  const now = new Date();
  const elapsed = now - this.createdAt;
  return elapsed > 10 * 60 * 1000; // 10 minutes
};

// Method to add responder
emergencySchema.methods.addResponder = function(userId) {
  // Check if already responding
  const existing = this.responders.find(r => r.user.toString() === userId.toString());
  if (existing) return false;
  
  this.responders.push({
    user: userId,
    respondedAt: new Date(),
    status: 'responding'
  });
  
  // Update status from pending to active
  if (this.status === 'pending') {
    this.status = 'active';
  }
  
  return true;
};

// Method to resolve emergency
emergencySchema.methods.resolve = function() {
  this.status = 'resolved';
  this.resolvedAt = new Date();
};

// Method to close emergency
emergencySchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
};

// Static method to find nearby emergencies
emergencySchema.statics.findNearby = function(coordinates, maxDistance = 5000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // meters
      }
    },
    status: { $in: ['pending', 'active'] }
  });
};

// Static method to get active emergencies
emergencySchema.statics.getActive = function() {
  return this.find({
    status: { $in: ['pending', 'active'] },
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  }).sort({ createdAt: -1 });
};

// Don't return sensitive location data by default
emergencySchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Only include fuzzy location, not exact coordinates
    if (ret.location && ret.location.coordinates) {
      delete ret.location.coordinates;
    }
    return ret;
  }
});

const Emergency = mongoose.model('Emergency', emergencySchema);

module.exports = Emergency;
