require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    await client.db('admin').command({ ping: 1 });
    await client.close();
    res.json({ status: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ status: 'Database connection failed', error: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
