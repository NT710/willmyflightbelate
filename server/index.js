const express = require('express');
const path = require('path');
const routes = require('./routes'); // Import API routes

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api', routes);

// Catch-all to serve React app for other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
