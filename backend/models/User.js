const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  tagline: {
    type: String,
    maxlength: [100, 'Tagline cannot be more than 100 characters']
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    latitude: Number,
    longitude: Number
  },
  skillsOffered: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['Education', 'Home & Garden', 'Technology', 'Arts & Crafts', 'Health & Fitness', 'Professional', 'Other'],
      default: 'Other'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  skillsNeeded: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['Education', 'Home & Garden', 'Technology', 'Arts & Crafts', 'Health & Fitness', 'Professional', 'Other'],
      default: 'Other'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  itemsOffered: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['Tools', 'Books', 'Kitchen', 'Sports', 'Electronics', 'Furniture', 'Toys', 'Garden', 'Camping', 'Other'],
      default: 'Other'
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair'],
      default: 'Good'
    },
    available: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  itemsNeeded: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['Tools', 'Books', 'Kitchen', 'Sports', 'Electronics', 'Furniture', 'Toys', 'Garden', 'Camping', 'Other'],
      default: 'Other'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  availability: [{
    type: String,
    enum: ['Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings', 'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings', 'Flexible']
  }],
  userType: {
    type: String,
    enum: ['skill-heavy', 'high-need', 'balanced'],
    default: 'balanced'
  },
  isNew: {
    type: Boolean,
    default: true
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    default: 0
  },
  connectionsCount: {
    type: Number,
    default: 0
  },
  exchangesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for location-based queries
UserSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
UserSchema.index({ name: 'text', bio: 'text', tagline: 'text' });

module.exports = mongoose.model('User', UserSchema);
