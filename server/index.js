require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const routes = require('./routes');
const createLimiter = require('./utils/rateLimiter');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(createLimiter());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const db = client.db('flightdelays');
    app.locals.db = db;
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize MongoDB connection before starting server
connectToMongoDB().then(() => {
  // Routes
  app.use('/api', routes);

  // Enhanced error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.details : undefined
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  });

  // Start server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// For testing purposes
module.exports = app;
