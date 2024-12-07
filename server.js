require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Test MongoDB connection
app.get('/db-test', async (req, res) => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    await client.db('admin').command({ ping: 1 });
    await client.close();
    res.json({ status: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ status: 'Database connection failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
