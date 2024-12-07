// server/controllers/predictionController.js
const PredictionService = require('../services/predictionService');
const WeatherService = require('../services/weatherService');
const FlightService = require('../services/flightService');

async function getPrediction(req, res) {
  try {
    const { flightNumber } = req.params;
    const predictionService = new PredictionService(
      req.app.locals.db,
      new WeatherService(),
      new FlightService()
    );
    
    const prediction = await predictionService.getPrediction(flightNumber);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
