const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
const { errorHandler, notFound } = require('./middleware/error');
const { rateLimitAI } = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Route files
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// AI request logging middleware
app.use((req, res, next) => {
  if (req.path.includes('/ai-') || req.path.includes('userId=')) {
    console.log(`[AI Request] ${req.method} ${req.path} from ${req.ip}`);
  }
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neighbornet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.warn('⚠️  Server will continue without database');
  });

// Initialize Socket.io handlers
require('./socket')(io);

// Make io accessible to routes
app.set('io', io);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NeighborNet API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// AI monitoring endpoint (optional - for debugging)
app.get('/api/ai/stats', (req, res) => {
  const { getCacheStats } = require('./utils/gemini');
  const { getRateLimitStats } = require('./middleware/rateLimiter');
  
  res.status(200).json({
    success: true,
    cache: getCacheStats(),
    rateLimit: getRateLimitStats()
  });
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`✓ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`✓ Socket.io ready for connections`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
