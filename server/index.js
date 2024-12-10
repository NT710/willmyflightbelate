const express = require('express');
const path = require('path');
const routes = require('./routes'); // Your backend API routes

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api', routes);

// Catch-all route to serve the React app for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
