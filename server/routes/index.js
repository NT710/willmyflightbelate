const express = require('express');
const router = express.Router();
const WeatherService = require('../services/weatherService');
const CacheService = require('../services/cacheService');

const weatherService = new WeatherService();
const cacheService = new CacheService();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get flight prediction
router.get('/predictions/:flight', async (req, res) => {
  try {
    const flightNumber = req.params.flight;
    const cacheKey = `prediction:${flightNumber}`;
    
    // Try to get cached prediction
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        source: 'cache'
      });
    }

    // For demo, we'll use hardcoded airports
    const weatherData = await weatherService.getFlightWeather('JFK', 'LAX');

    const prediction = {
      flight: flightNumber,
      probability: 75,
      delay: 30,
      weather: weatherData,
      source: 'api'
    };

    // Cache the prediction
    await cacheService.set(cacheKey, prediction);
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to get prediction',
      message: error.message 
    });
  }
});

// Get airport weather
router.get('/weather/:airport', async (req, res) => {
  try {
    const airport = req.params.airport;
    const cacheKey = `weather:${airport}`;
    
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        source: 'cache'
      });
    }

    const weatherData = await weatherService.getAirportWeather(airport);
    await cacheService.set(cacheKey, weatherData);
    
    res.json({
      ...weatherData,
      source: 'api'
    });
  } catch (error) {
    console.error('Weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to get weather data',
      message: error.message 
    });
  }
});

module.exports = router;
