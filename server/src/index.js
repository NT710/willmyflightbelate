require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Import and use route handlers
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/weather', require('./routes/weather'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || {}
    },
    timestamp: new Date(),
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
