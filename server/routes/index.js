const express = require('express');
const weatherService = require('../services/weatherService'); // Example API service

const router = express.Router();

// Example Health Check
router.get('/health', (req, res) => {
  res.status(200).send({ status: 'Healthy' });
});

// Example Weather API
router.get('/weather/:airportCode', async (req, res) => {
  try {
    const { airportCode } = req.params;
    const data = await weatherService.getWeather(airportCode);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
