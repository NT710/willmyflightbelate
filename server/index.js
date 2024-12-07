require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const createLimiter = require('./utils/rateLimiter');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(createLimiter());
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
