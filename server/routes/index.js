const express = require('express');
const router = express.Router();
const WeatherService = require('../services/weatherService');
const CacheService = require('../services/cacheService');
const { createWeatherstackLimiter } = require('../utils/rateLimiter');

const weatherService = new WeatherService();
const cacheService = new CacheService();
const weatherstackLimiter = createWeatherstackLimiter();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get flight prediction
router.get('/predictions/:flight', weatherstackLimiter, async (req, res) => {
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
    // In production, you'd look up the route based on flight number
    const weatherData = await weatherService.getFlightWeather('JFK', 'LAX');

    const prediction = {
      flight: flightNumber,
      probability: 75,
      delay: 30,
      weather: weatherData,
      source: 'api'
    };

    // Cache the prediction for 5 minutes
    await cacheService.set(cacheKey, prediction, 300);
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
router.get('/weather/:airport', weatherstackLimiter, async (req, res) => {
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
    await cacheService.set(cacheKey, weatherData, 300); // Cache for 5 minutes
    
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

// Get airport details
router.get('/airports/:code', async (req, res) => {
  try {
    const airportCode = req.params.code.toUpperCase();
    const cacheKey = `airport:${airportCode}`;
    
    // Try cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        source: 'cache'
      });
    }
    
    const db = req.app.locals.db;
    const airport = await db.collection('airports')
      .findOne({ iata_code: airportCode });
    
    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' });
    }
    
    // Cache airport data for 1 hour since it rarely changes
    await cacheService.set(cacheKey, airport, 3600);
    
    res.json({
      ...airport,
      source: 'api'
    });
  } catch (error) {
    console.error('Airport fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to get airport data',
      message: error.message 
    });
  }
});

// Get historical delays for a route
router.get('/history/:departure/:arrival', async (req, res) => {
  try {
    const departure = req.params.departure.toUpperCase();
    const arrival = req.params.arrival.toUpperCase();
    const cacheKey = `history:${departure}-${arrival}`;
    
    // Try cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({
        ...cachedData,
        source: 'cache'
      });
    }
    
    const db = req.app.locals.db;
    const history = await db.collection('historical_delays')
      .find({ 
        route: `${departure}-${arrival}`,
        year: new Date().getFullYear()
      })
      .toArray();
    
    // Cache historical data for 1 hour
    await cacheService.set(cacheKey, history, 3600);
    
    res.json({
      data: history,
      source: 'api'
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to get historical data',
      message: error.message 
    });
  }
});

module.exports = router;
