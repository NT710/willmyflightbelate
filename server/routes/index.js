const express = require('express');
const weatherService = require('../services/weatherService');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).send({ status: 'Healthy' });
});

router.get('/weather/:airportCode', async (req, res) => {
  try {
    const { airportCode } = req.params;
    const weatherData = await weatherService.getAirportWeather(airportCode);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).send({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;
