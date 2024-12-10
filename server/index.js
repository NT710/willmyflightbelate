const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging
console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Directory contents:', fs.readdirSync(__dirname));

// API Routes first
app.use('/api', routes);

// Static file serving
const publicPath = path.join(__dirname, 'public');
console.log('Public path:', publicPath);
if (fs.existsSync(publicPath)) {
    console.log('Public directory contents:', fs.readdirSync(publicPath));
    // Serve static files
    app.use(express.static(publicPath));
} else {
    console.log('Public directory not found!');
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Serve React app - this needs to be after API routes
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    console.log('Trying to serve index.html from:', indexPath);
    
    if (fs.existsSync(indexPath)) {
        console.log('index.html found, serving...');
        res.sendFile(indexPath);
    } else {
        console.log('index.html not found at:', indexPath);
        res.status(404).json({
            error: 'Frontend not found',
            path: indexPath,
            exists: false,
            currentDir: __dirname,
            publicExists: fs.existsSync(publicPath),
            publicContents: fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : []
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV);
});
