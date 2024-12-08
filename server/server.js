// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const routes = require('./routes');
const airportRoutes = require('./routes/airports');
const createLimiter = require('./utils/rateLimiter');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(createLimiter());

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Will My Flight Be Late API' });
});

// Health check endpoint with enhanced details
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    version: process.env.npm_package_version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// MongoDB connection with enhanced error handling
async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add connection pool settings as per strategy doc
      maxPoolSize: 50,
      wtimeoutMS: 2500,
      monitorCommands: true
    });
    
    console.log('Connected to MongoDB');
    const db = client.db(process.env.MONGODB_DBNAME || 'flightdelays');
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log("Database connection verified");
    
    app.locals.db = db;
    
    // Setup connection monitoring
    client.on('connectionPoolCreated', (event) => console.log('Connection pool created'));
    client.on('connectionPoolClosed', (event) => console.log('Connection pool closed'));
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize MongoDB connection before starting server
connectToMongoDB().then(() => {
  // Routes from both implementations
  app.use('/api', routes);  // General routes
  app.use('/api', airportRoutes);  // Airport specific routes

  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
        path: req.path
      },
      timestamp: new Date().toISOString()
    });
  });

  // Enhanced error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Structured error response as per strategy doc
    res.status(err.status || 500).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.details : undefined,
        type: err.type || 'ServerError'
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.id // Useful for log correlation
    });
  });

  // Start server with enhanced logging
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database: ${process.env.MONGODB_DBNAME || 'flightdelays'}`);
    console.log('Server initialization complete');
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// For testing purposes
module.exports = app;
