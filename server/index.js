const express = require('express');
const dotenv = require('dotenv');
const cacheService = require('./services/cacheService'); // Ensure this path is correct
const routes = require('./routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
