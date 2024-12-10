const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Debug current directory and files
const publicPath = path.join(__dirname, 'public');
console.log('Server starting...');
console.log('Current directory:', __dirname);
console.log('Public path:', publicPath);
if (fs.existsSync(publicPath)) {
    console.log('Files in public:', fs.readdirSync(publicPath));
} else {
    console.log('Public directory does not exist!');
}

// Serve static files from the React app
app.use(express.static(publicPath));

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    console.log('Requested path:', req.path);
    console.log('Trying to serve:', indexPath);
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ 
            error: 'Frontend not found',
            path: indexPath,
            exists: false,
            currentDir: __dirname
        });
    }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
