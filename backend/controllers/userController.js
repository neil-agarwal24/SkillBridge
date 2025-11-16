const User = require('../models/User');
const { generateBatchMatchExplanations } = require('../utils/gemini');

// Mock data for when MongoDB is not connected
const baseMockUsers = [
  {
    _id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    bio: 'Piano teacher and gardening enthusiast. Love sharing my harvest!',
    location: { latitude: 45.5152, longitude: -122.6784, address: '123 Maple St' },
    skillsOffered: [
      { name: 'Piano Lessons', category: 'Education', description: 'Teaching for 10 years' },
      { name: 'Gardening Tips', category: 'Lifestyle', description: 'Organic gardening expert' }
    ],
    skillsNeeded: [{ name: 'Pet Sitting', category: 'Pet Care' }],
    itemsOffered: [
      { name: 'Fresh Tomatoes', category: 'Food', condition: 'New' },
      { name: 'Garden Tools', category: 'Tools', condition: 'Used' }
    ],
    itemsNeeded: [],
    userType: 'skill-heavy',
    isNew: false,
    joinedAt: new Date('2024-01-15'),
    points: 450,
    connectionsCount: 12,
    exchangesCount: 8
  },
  {
    _id: '2',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    bio: 'Handyman and DIY expert. Happy to help with home repairs!',
    location: { latitude: 45.5155, longitude: -122.6790, address: '456 Oak Ave' },
    skillsOffered: [
      { name: 'Home Repairs', category: 'Home Improvement', description: 'Plumbing, electrical, carpentry' },
      { name: 'Furniture Assembly', category: 'Home Improvement' }
    ],
    skillsNeeded: [{ name: 'Cooking Classes', category: 'Culinary' }],
    itemsOffered: [{ name: 'Power Drill', category: 'Tools', condition: 'Used' }],
    itemsNeeded: [{ name: 'Lawn Mower', category: 'Garden' }],
    userType: 'balanced',
    isNew: false,
    joinedAt: new Date('2024-02-20'),
    points: 380,
    connectionsCount: 10,
    exchangesCount: 6
  },
  {
    _id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@email.com',
    bio: 'New mom looking for support and community connections.',
    location: { latitude: 45.5160, longitude: -122.6800, address: '789 Pine Rd' },
    skillsOffered: [],
    skillsNeeded: [
      { name: 'Babysitting', category: 'Childcare' },
      { name: 'Meal Prep Help', category: 'Culinary' }
    ],
    itemsOffered: [],
    itemsNeeded: [
      { name: 'Baby Clothes', category: 'Clothing' },
      { name: 'Stroller', category: 'Baby Gear' }
    ],
    userType: 'high-need',
    isNew: true,
    joinedAt: new Date('2024-11-01'),
    points: 85,
    connectionsCount: 3,
    exchangesCount: 1
  },
  {
    _id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    bio: 'Software engineer who loves cooking and photography.',
    location: { latitude: 45.5140, longitude: -122.6750, address: '321 Elm St' },
    skillsOffered: [
      { name: 'Web Development', category: 'Technology', description: 'React, Node.js, Python' },
      { name: 'Photography', category: 'Arts', description: 'Portrait and event photography' }
    ],
    skillsNeeded: [{ name: 'Spanish Tutoring', category: 'Education' }],
    itemsOffered: [{ name: 'Old Laptop', category: 'Electronics', condition: 'Used' }],
    itemsNeeded: [],
    userType: 'skill-heavy',
    isNew: false,
    joinedAt: new Date('2024-03-10'),
    points: 520,
    connectionsCount: 15,
    exchangesCount: 10
  },
  {
    _id: '5',
    name: 'Aisha Patel',
    email: 'aisha.patel@email.com',
    bio: 'Yoga instructor and wellness coach. Lets build a healthier community!',
    location: { latitude: 45.5170, longitude: -122.6820, address: '654 Birch Ln' },
    skillsOffered: [
      { name: 'Yoga Classes', category: 'Fitness', description: 'All levels welcome' },
      { name: 'Meditation Coaching', category: 'Wellness' }
    ],
    skillsNeeded: [],
    itemsOffered: [{ name: 'Yoga Mats', category: 'Fitness', condition: 'Used' }],
    itemsNeeded: [{ name: 'Sound System', category: 'Electronics' }],
    userType: 'skill-heavy',
    isNew: false,
    joinedAt: new Date('2024-04-15'),
    points: 290,
    connectionsCount: 8,
    exchangesCount: 4
  },
  {
    _id: '6',
    name: 'Tom Anderson',
    email: 'tom.anderson@email.com',
    bio: 'Retired teacher, love helping kids with homework and tutoring.',
    location: { latitude: 45.5145, longitude: -122.6760, address: '987 Cedar Dr' },
    skillsOffered: [
      { name: 'Math Tutoring', category: 'Education', description: 'K-12' },
      { name: 'Reading Help', category: 'Education' }
    ],
    skillsNeeded: [{ name: 'Tech Support', category: 'Technology' }],
    itemsOffered: [{ name: 'Old Textbooks', category: 'Books', condition: 'Used' }],
    itemsNeeded: [],
    userType: 'balanced',
    isNew: false,
    joinedAt: new Date('2024-05-20'),
    points: 410,
    connectionsCount: 11,
    exchangesCount: 7
  },
  {
    _id: '7',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    bio: 'Seamstress and craft enthusiast. Can help with clothing repairs!',
    location: { latitude: 45.5135, longitude: -122.6770, address: '147 Willow Way' },
    skillsOffered: [
      { name: 'Sewing & Alterations', category: 'Lifestyle', description: 'Clothing repairs and custom work' },
      { name: 'Knitting Lessons', category: 'Arts' }
    ],
    skillsNeeded: [{ name: 'Car Maintenance', category: 'Automotive' }],
    itemsOffered: [{ name: 'Fabric Scraps', category: 'Craft Supplies', condition: 'New' }],
    itemsNeeded: [],
    userType: 'skill-heavy',
    isNew: true,
    joinedAt: new Date('2024-11-05'),
    points: 120,
    connectionsCount: 4,
    exchangesCount: 2
  },
  {
    _id: '8',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    bio: 'College student looking for study buddies and affordable furniture.',
    location: { latitude: 45.5130, longitude: -122.6795, address: '258 Spruce Ct' },
    skillsOffered: [{ name: 'Dog Walking', category: 'Pet Care' }],
    skillsNeeded: [
      { name: 'Resume Review', category: 'Career' },
      { name: 'Interview Prep', category: 'Career' }
    ],
    itemsOffered: [],
    itemsNeeded: [
      { name: 'Desk', category: 'Furniture' },
      { name: 'Desk Chair', category: 'Furniture' }
    ],
    userType: 'high-need',
    isNew: true,
    joinedAt: new Date('2024-11-10'),
    points: 65,
    connectionsCount: 2,
    exchangesCount: 1
  }
];

// Store created users separately from base mock data
const createdMockUsers = [];

// Combined function to get all mock users
function getAllMockUsers() {
  return [...baseMockUsers, ...createdMockUsers];
}

// @desc    Get all users/neighbors with filters
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const { 
      skills, 
      items, 
      distance, 
      showNewNeighbors,
      lat,
      lng,
      search,
      userId // Current user's ID for AI matching
    } = req.query;

    // Check if MongoDB is connected
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let users;
    
    if (!isMongoConnected) {
      // Use mock data if MongoDB is not connected
      users = getAllMockUsers();
      
      // Apply filters to mock data
      if (showNewNeighbors === 'true') {
        users = users.filter(u => u.isNew);
      }
      
      if (skills) {
        const skillsArray = skills.split(',').map(s => s.toLowerCase());
        users = users.filter(u => 
          u.skillsOffered.some(skill => 
            skillsArray.some(s => skill.name.toLowerCase().includes(s))
          )
        );
      }
      
      if (items) {
        const itemsArray = items.split(',').map(i => i.toLowerCase());
        users = users.filter(u => 
          u.itemsOffered.some(item => 
            itemsArray.some(i => item.name.toLowerCase().includes(i))
          )
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(u => 
          u.name.toLowerCase().includes(searchLower) ||
          u.bio.toLowerCase().includes(searchLower)
        );
      }
    } else {
      // Use MongoDB if connected
      let query = {};

      // Filter by new neighbors
      if (showNewNeighbors === 'true') {
        query.isNew = true;
      }

      // Search by skills offered
      if (skills) {
        const skillsArray = skills.split(',');
        query['skillsOffered.name'] = { 
          $in: skillsArray.map(s => new RegExp(s, 'i')) 
        };
      }

      // Search by items offered
      if (items) {
        const itemsArray = items.split(',');
        query['itemsOffered.name'] = { 
          $in: itemsArray.map(i => new RegExp(i, 'i')) 
        };
      }

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      users = await User.find(query).select('-__v');
    }

    // Filter by distance if coordinates provided
    if (distance && lat && lng) {
      users = users.filter(user => {
        if (!user.location.latitude || !user.location.longitude) {
          return false;
        }
        const dist = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          user.location.latitude,
          user.location.longitude
        );
        return dist <= parseFloat(distance);
      });
    }

    // Add AI-powered match explanations if userId provided
    if (userId) {
      try {
        // Get current user profile
        let currentUser;
        if (!isMongoConnected) {
          currentUser = getAllMockUsers().find(u => u._id === userId);
        } else {
          currentUser = await User.findById(userId);
        }

        if (currentUser) {
          // Generate AI explanations for each neighbor
          users = await generateBatchMatchExplanations(currentUser, users);
        }
      } catch (aiError) {
        // Continue without AI explanations if there's an error
        console.error('AI explanation error:', aiError.message);
      }
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let user;
    if (!isMongoConnected) {
      user = getAllMockUsers().find(u => u._id === req.params.id);
    } else {
      user = await User.findById(req.params.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let user;
    if (!isMongoConnected) {
      user = { _id: Date.now().toString(), ...req.body, joinedAt: new Date() };
      createdMockUsers.push(user);
    } else {
      user = await User.create(req.body);
    }

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
exports.updateUser = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let user;
    if (!isMongoConnected) {
      // Check created users first, then base mock users
      const createdIndex = createdMockUsers.findIndex(u => u._id === req.params.id);
      if (createdIndex !== -1) {
        createdMockUsers[createdIndex] = { ...createdMockUsers[createdIndex], ...req.body };
        user = createdMockUsers[createdIndex];
      } else {
        const baseIndex = baseMockUsers.findIndex(u => u._id === req.params.id);
        if (baseIndex !== -1) {
          baseMockUsers[baseIndex] = { ...baseMockUsers[baseIndex], ...req.body };
          user = baseMockUsers[baseIndex];
        }
      }
    } else {
      user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    
    let user;
    if (!isMongoConnected) {
      const createdIndex = createdMockUsers.findIndex(u => u._id === req.params.id);
      if (createdIndex !== -1) {
        user = createdMockUsers.splice(createdIndex, 1)[0];
      } else {
        const baseIndex = baseMockUsers.findIndex(u => u._id === req.params.id);
        if (baseIndex !== -1) {
          user = baseMockUsers.splice(baseIndex, 1)[0];
        }
      }
    } else {
      user = await User.findByIdAndDelete(req.params.id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted',
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add skill to user
// @route   POST /api/users/:id/skills
// @access  Public
exports.addSkill = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { name, description, category, type } = req.body;
    
    let user;
    if (!isMongoConnected) {
      user = getAllMockUsers().find(u => u._id === req.params.id);
      
      if (user) {
        const skillData = { name, description, category };
        
        if (type === 'offered') {
          user.skillsOffered.push(skillData);
        } else if (type === 'needed') {
          user.skillsNeeded.push(skillData);
        }
      }
    } else {
      user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const skillData = { name, description, category };
      
      if (type === 'offered') {
        user.skillsOffered.push(skillData);
      } else if (type === 'needed') {
        user.skillsNeeded.push(skillData);
      }

      await user.save();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove skill from user
// @route   DELETE /api/users/:id/skills/:skillId
// @access  Public
exports.removeSkill = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { type } = req.query;
    
    let user;
    if (!isMongoConnected) {
      user = getAllMockUsers().find(u => u._id === req.params.id);
      
      if (user) {
        if (type === 'offered') {
          user.skillsOffered = user.skillsOffered.filter(
            skill => skill.name !== req.params.skillId
          );
        } else if (type === 'needed') {
          user.skillsNeeded = user.skillsNeeded.filter(
            skill => skill.name !== req.params.skillId
          );
        }
      }
    } else {
      user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (type === 'offered') {
        user.skillsOffered = user.skillsOffered.filter(
          skill => skill._id.toString() !== req.params.skillId
        );
      } else if (type === 'needed') {
        user.skillsNeeded = user.skillsNeeded.filter(
          skill => skill._id.toString() !== req.params.skillId
        );
      }

      await user.save();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to user
// @route   POST /api/users/:id/items
// @access  Public
exports.addItem = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { name, description, category, condition, type } = req.body;
    
    let user;
    if (!isMongoConnected) {
      user = getAllMockUsers().find(u => u._id === req.params.id);
      
      if (user) {
        const itemData = { name, description, category, condition };
        
        if (type === 'offered') {
          user.itemsOffered.push(itemData);
        } else if (type === 'needed') {
          user.itemsNeeded.push(itemData);
        }
      }
    } else {
      user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const itemData = { name, description, category, condition };
      
      if (type === 'offered') {
        user.itemsOffered.push(itemData);
      } else if (type === 'needed') {
        user.itemsNeeded.push(itemData);
      }

      await user.save();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from user
// @route   DELETE /api/users/:id/items/:itemId
// @access  Public
exports.removeItem = async (req, res, next) => {
  try {
    const isMongoConnected = require('mongoose').connection.readyState === 1;
    const { type } = req.query;
    
    let user;
    if (!isMongoConnected) {
      user = getAllMockUsers().find(u => u._id === req.params.id);
      
      if (user) {
        if (type === 'offered') {
          user.itemsOffered = user.itemsOffered.filter(
            item => item.name !== req.params.itemId
          );
        } else if (type === 'needed') {
          user.itemsNeeded = user.itemsNeeded.filter(
            item => item.name !== req.params.itemId
          );
        }
      }
    } else {
      user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (type === 'offered') {
        user.itemsOffered = user.itemsOffered.filter(
          item => item._id.toString() !== req.params.itemId
        );
      } else if (type === 'needed') {
        user.itemsNeeded = user.itemsNeeded.filter(
          item => item._id.toString() !== req.params.itemId
        );
      }

      await user.save();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    // Try to get from MongoDB first
    let users = await User.find()
      .select('name points connectionsCount exchangesCount avatar')
      .sort({ points: -1 })
      .limit(50);

    // If no users in DB, use mock data
    if (!users || users.length === 0) {
      users = baseMockUsers
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));
    } else {
      users = users.map((user, index) => ({
        ...user.toObject(),
        rank: index + 1
      }));
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard',
      error: error.message
    });
  }
};

// @desc    Award points to user
// @route   POST /api/users/:id/award-points
// @access  Public
exports.awardPoints = async (req, res, next) => {
  try {
    const { points, type } = req.body; // type: 'connection', 'exchange', 'message'
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.points = (user.points || 0) + points;
    
    if (type === 'connection') {
      user.connectionsCount = (user.connectionsCount || 0) + 1;
    } else if (type === 'exchange') {
      user.exchangesCount = (user.exchangesCount || 0) + 1;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error awarding points',
      error: error.message
    });
  }
};

// @desc    Toggle favorite user
// @route   POST /api/users/:id/favorite/:targetId
// @access  Public
exports.toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targetId = req.params.targetId;
    const isFavorited = user.favorites.includes(targetId);

    if (isFavorited) {
      user.favorites = user.favorites.filter(id => id.toString() !== targetId);
    } else {
      user.favorites.push(targetId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      favorited: !isFavorited
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to calculate distance between two coordinates (in miles)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Export helper function for other controllers
exports.getAllMockUsers = getAllMockUsers;

module.exports = exports;
