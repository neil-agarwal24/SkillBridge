const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Sample data matching your frontend
const users = [
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    bio: 'Math and science teacher with 10 years of experience. Love helping students discover their potential through personalized tutoring!',
    tagline: 'Math & Science Teacher',
    avatar: '/woman-with-smile.jpg',
    preferredLanguage: 'zh', // Chinese
    location: {
      address: '123 Oak Street',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      latitude: 45.5152,
      longitude: -122.6784
    },
    skillsOffered: [
      { name: 'Math', category: 'Education', description: 'Algebra, Geometry, Calculus tutoring' },
      { name: 'Science', category: 'Education', description: 'Biology, Chemistry, Physics lessons' },
      { name: 'SAT Prep', category: 'Education', description: 'Test preparation specialist' }
    ],
    skillsNeeded: [
      { name: 'Spanish', category: 'Education', description: 'Want to learn conversational Spanish' },
      { name: 'Art', category: 'Education', description: 'Basic drawing and painting' }
    ],
    itemsOffered: [
      { name: 'Textbooks', category: 'Books', condition: 'Good' },
      { name: 'Calculator', category: 'Electronics', condition: 'Like New' }
    ],
    itemsNeeded: [
      { name: 'Study Guides', category: 'Books', description: 'For SAT prep courses' }
    ],
    availability: ['Weekend Mornings', 'Weekend Afternoons'],
    userType: 'skill-heavy',
    isNew: true
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    bio: 'Software engineer and coding instructor. Passionate about teaching programming to students of all ages and skill levels!',
    tagline: 'Coding Instructor & Developer',
    avatar: '/smiling-man.png',
    preferredLanguage: 'en', // English
    location: {
      address: '456 Maple Ave',
      city: 'Portland',
      state: 'OR',
      zipCode: '97202',
      latitude: 45.5200,
      longitude: -122.6800
    },
    skillsOffered: [
      { name: 'Coding', category: 'Education', description: 'Python, JavaScript, Web Development' },
      { name: 'Computer Science', category: 'Education', description: 'CS fundamentals and algorithms' },
      { name: 'Web Development', category: 'Education', description: 'HTML, CSS, React tutorials' }
    ],
    skillsNeeded: [
      { name: 'French', category: 'Education', description: 'Want to learn French for travel' },
      { name: 'Music', category: 'Education', description: 'Guitar lessons' }
    ],
    itemsOffered: [
      { name: 'Laptop', category: 'Electronics', condition: 'Good' },
      { name: 'Programming Books', category: 'Books', condition: 'Good' },
      { name: 'Reference Books', category: 'Books', condition: 'Good' }
    ],
    availability: ['Weekday Mornings', 'Weekday Afternoons', 'Flexible'],
    userType: 'skill-heavy',
    isNew: false
  },
  {
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    bio: 'Bilingual teacher specializing in Spanish and English language instruction. Native speaker helping students become fluent!',
    tagline: 'Spanish & English Teacher',
    avatar: '/woman-happy.jpg',
    preferredLanguage: 'es', // Spanish
    location: {
      address: '789 Pine Rd',
      city: 'Portland',
      state: 'OR',
      zipCode: '97203',
      latitude: 45.5280,
      longitude: -122.6900
    },
    skillsOffered: [
      { name: 'Spanish', category: 'Education', description: 'Native speaker, all levels welcome' },
      { name: 'English', category: 'Education', description: 'ESL and grammar instruction' }
    ],
    skillsNeeded: [
      { name: 'Math', category: 'Education', description: 'Need help with algebra' },
      { name: 'Science', category: 'Education', description: 'Chemistry tutoring' },
      { name: 'SAT Prep', category: 'Education', description: 'Test preparation help' }
    ],
    itemsNeeded: [
      { name: 'Baby Furniture', category: 'Furniture' },
      { name: 'Tools', category: 'Tools' }
    ],
    itemsOffered: [
      { name: 'Kitchen Equipment', category: 'Kitchen', condition: 'Good' }
    ],
    availability: ['Weekend Afternoons'],
    userType: 'high-need',
    isNew: true
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    bio: 'Software engineer and maker. I build things with code and hardware. Always happy to help troubleshoot tech issues.',
    tagline: 'Tech enthusiast & maker',
    avatar: '/casual-man.png',
    preferredLanguage: 'fr', // French
    location: {
      address: '321 Cedar Ln',
      city: 'Portland',
      state: 'OR',
      zipCode: '97204',
      latitude: 45.5400,
      longitude: -122.6600
    },
    skillsOffered: [
      { name: 'Coding', category: 'Technology', description: 'Web development, Python, JavaScript' },
      { name: 'Tech Setup', category: 'Technology', description: 'Computer setup, network configuration' },
      { name: 'Electronics Repair', category: 'Technology', description: 'Fixing gadgets and devices' }
    ],
    skillsNeeded: [
      { name: 'Fitness Help', category: 'Health & Fitness', description: 'Getting back in shape' },
      { name: 'Car Repair', category: 'Other', description: 'Basic car maintenance' }
    ],
    itemsOffered: [
      { name: 'Arduino Kits', category: 'Electronics', condition: 'Like New' },
      { name: 'Programming Books', category: 'Books', condition: 'Good' },
      { name: 'Old Laptop', category: 'Electronics', condition: 'Fair' }
    ],
    availability: ['Weekday Evenings', 'Weekend Mornings'],
    userType: 'skill-heavy',
    isNew: false
  },
  {
    name: 'Lisa Park',
    email: 'lisa@example.com',
    bio: 'Local artist and community organizer. I believe art brings people together and strengthens neighborhoods.',
    tagline: 'Artist & community builder',
    avatar: '/woman-friendly.jpg',
    preferredLanguage: 'ko', // Korean
    location: {
      address: '654 Birch St',
      city: 'Portland',
      state: 'OR',
      zipCode: '97205',
      latitude: 45.5100,
      longitude: -122.6850
    },
    skillsOffered: [
      { name: 'Art Classes', category: 'Arts & Crafts', description: 'Painting and drawing instruction' },
      { name: 'Design Help', category: 'Arts & Crafts', description: 'Graphic design and branding' },
      { name: 'Event Planning', category: 'Other', description: 'Community event organization' }
    ],
    skillsNeeded: [
      { name: 'Bike Repair', category: 'Other', description: 'Tune-up needed' },
      { name: 'Tech Help', category: 'Technology', description: 'Website maintenance' }
    ],
    itemsOffered: [
      { name: 'Art Supplies', category: 'Other', condition: 'Good' },
      { name: 'Event Decorations', category: 'Other', condition: 'Like New' }
    ],
    itemsNeeded: [
      { name: 'Bike Tools', category: 'Tools' }
    ],
    availability: ['Weekend Afternoons', 'Weekday Evenings'],
    userType: 'balanced',
    isNew: false
  },
  {
    name: 'Robert Taylor',
    email: 'robert@example.com',
    bio: 'Retired CPA who loves mentoring young professionals. Still sharp with numbers and business strategy.',
    tagline: 'Retired accountant, loves mentoring',
    avatar: '/professional-man.png',
    preferredLanguage: 'ar', // Arabic
    location: {
      address: '987 Elm Dr',
      city: 'Portland',
      state: 'OR',
      zipCode: '97206',
      latitude: 45.5320,
      longitude: -122.6750
    },
    skillsOffered: [
      { name: 'Tax Help', category: 'Professional', description: 'Tax preparation and planning' },
      { name: 'Business Advice', category: 'Professional', description: 'Small business consulting' },
      { name: 'Mentoring', category: 'Professional', description: 'Career guidance and coaching' }
    ],
    skillsNeeded: [
      { name: 'Yard Work', category: 'Home & Garden', description: 'Lawn mowing and trimming' },
      { name: 'Tech Help', category: 'Technology', description: 'Smartphone and tablet setup' }
    ],
    itemsOffered: [
      { name: 'Business Books', category: 'Books', condition: 'Good' },
      { name: 'Office Furniture', category: 'Furniture', condition: 'Good' }
    ],
    availability: ['Weekday Afternoons', 'Flexible'],
    userType: 'skill-heavy',
    isNew: false
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    bio: 'Yoga instructor and wellness coach. Passionate about holistic health and mindfulness practices.',
    tagline: 'Wellness coach & yoga instructor',
    avatar: '/woman-smiling.jpg',
    location: {
      address: '111 Willow Way',
      city: 'Portland',
      state: 'OR',
      zipCode: '97207',
      latitude: 45.5180,
      longitude: -122.6820
    },
    skillsOffered: [
      { name: 'Yoga Classes', category: 'Health & Fitness', description: 'Beginner to advanced yoga' },
      { name: 'Meditation', category: 'Health & Fitness', description: 'Mindfulness and meditation coaching' },
      { name: 'Nutrition Advice', category: 'Health & Fitness', description: 'Healthy eating plans' }
    ],
    skillsNeeded: [
      { name: 'Web Design', category: 'Technology', description: 'Update my wellness website' },
      { name: 'Photography', category: 'Arts & Crafts', description: 'Professional headshots' }
    ],
    itemsOffered: [
      { name: 'Yoga Mats', category: 'Sports', condition: 'Good' },
      { name: 'Meditation Cushions', category: 'Other', condition: 'Like New' }
    ],
    availability: ['Weekday Mornings', 'Weekend Mornings'],
    userType: 'balanced',
    isNew: true
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    bio: 'Photographer and drone enthusiast. Love capturing the beauty of our neighborhood from new perspectives.',
    tagline: 'Photographer & creative director',
    avatar: '/man-professional.jpg',
    location: {
      address: '222 Spruce Ave',
      city: 'Portland',
      state: 'OR',
      zipCode: '97208',
      latitude: 45.5240,
      longitude: -122.6880
    },
    skillsOffered: [
      { name: 'Photography', category: 'Arts & Crafts', description: 'Event and portrait photography' },
      { name: 'Video Editing', category: 'Technology', description: 'Professional video production' },
      { name: 'Drone Services', category: 'Technology', description: 'Aerial photography and videography' }
    ],
    skillsNeeded: [
      { name: 'Marketing Help', category: 'Professional', description: 'Growing my photography business' }
    ],
    itemsOffered: [
      { name: 'Camera Equipment', category: 'Electronics', condition: 'Good' },
      { name: 'Lighting Gear', category: 'Electronics', condition: 'Like New' }
    ],
    availability: ['Flexible'],
    userType: 'skill-heavy',
    isNew: false
  }
];

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neighbornet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    console.log('✓ Cleared existing users');

    // Insert new data
    const createdUsers = await User.insertMany(users);
    console.log(`✓ Created ${createdUsers.length} users`);

    console.log('\n📊 Seed Summary:');
    console.log(`   Total Users: ${createdUsers.length}`);
    console.log(`   New Neighbors: ${createdUsers.filter(u => u.isNew).length}`);
    console.log(`   Skill-Heavy: ${createdUsers.filter(u => u.userType === 'skill-heavy').length}`);
    console.log(`   High-Need: ${createdUsers.filter(u => u.userType === 'high-need').length}`);
    console.log(`   Balanced: ${createdUsers.filter(u => u.userType === 'balanced').length}`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
