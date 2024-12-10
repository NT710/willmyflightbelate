const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS for frontend
app.use(cors({
  origin: 'https://willmyflightbelate.onrender.com',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Root API endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Will My Flight Be Late API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
