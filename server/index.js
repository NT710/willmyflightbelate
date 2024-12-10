const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Debug logging
console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Directory contents:', fs.readdirSync(__dirname));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Check if public directory exists
const publicPath = path.join(__dirname, 'public');
console.log('Looking for public directory at:', publicPath);
if (fs.existsSync(publicPath)) {
    console.log('Public directory contents:', fs.readdirSync(publicPath));
    // Serve static files
    app.use(express.static(publicPath));
    
    // Serve index.html for client-side routing
    app.get('*', (req, res) => {
        const indexPath = path.join(publicPath, 'index.html');
        console.log('Serving index.html from:', indexPath);
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            console.log('index.html not found at:', indexPath);
            res.status(404).send('Frontend not found');
        }
    });
} else {
    console.log('Public directory not found at:', publicPath);
}

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
