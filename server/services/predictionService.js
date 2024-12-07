// server/services/predictionService.js
const HistoricalPatternService = require('./historicalPatternService');

class PredictionService {
  constructor(db, weatherService, flightService) {
    this.db = db;
    this.weatherService = weatherService;
    this.flightService = flightService;
    this.historicalPatternService = new HistoricalPatternService(db);
    this.WEIGHTS = {
      weatherImpact: 0.35,
      historicalPattern: 0.30,
      timeOfDay: 0.20,
      airportCongestion: 0.15
    };
  }

  async getPrediction(flightNumber) {
    try {
      // Check cache first
      const cachedPrediction = await this.getCachedPrediction(flightNumber);
      if (cachedPrediction) {
        return cachedPrediction;
      }

      // Get flight details
      const flightData = await this.flightService.getFlightData(flightNumber);
      
      // Get weather for departure and arrival airports
      const [departureWeather, arrivalWeather] = await Promise.all([
        this.weatherService.getAirportWeather(
          flightData.departure.airport,
          flightData.departure.scheduled
        ),
        this.weatherService.getAirportWeather(
          flightData.arrival.airport,
          flightData.arrival.scheduled
        )
      ]);

      // Get historical analysis
      const historicalAnalysis = await this.historicalPatternService.analyzePatterns({
        departureAirport: flightData.departure.airport,
        arrivalAirport: flightData.arrival.airport,
        scheduledTime: flightData.departure.scheduled,
        airline: flightData.airline.code
      });

      // Calculate prediction
      const prediction = await this.calculatePrediction({
        flight: flightData,
        departureWeather,
        arrivalWeather,
        historicalAnalysis
      });

      // Cache the prediction
      await this.cachePrediction(flightNumber, prediction);

      return prediction;
    } catch (error) {
      console.error('Prediction calculation error:', error);
      throw new Error('Unable to calculate prediction');
    }
  }

  async getCachedPrediction(flightNumber) {
    const cached = await this.db.collection('cache').findOne({
      key: `prediction:${flightNumber}`,
      expires_at: { $gt: new Date() }
    });
    return cached ? cached.data : null;
  }

  async cachePrediction(flightNumber, prediction) {
    await this.db.collection('cache').updateOne(
      { key: `prediction:${flightNumber}` },
      {
        $set: {
          data: prediction,
          expires_at: new Date(Date.now() + 300000) // 5 minute cache
        }
      },
      { upsert: true }
    );
  }

  calculatePrediction(data) {
    const {
      flight,
      departureWeather,
      arrivalWeather,
      historicalAnalysis
    } = data;

    // Weather impact calculation
    const weatherScore = this.calculateWeatherImpact(
      departureWeather,
      arrivalWeather
    );

    // Time of day impact
    const scheduledTime = new Date(flight.departure.scheduled);
    const timeScore = this.calculateTimeImpact(scheduledTime.getHours());

    // Historical pattern impact
    const historicalScore = historicalAnalysis.scores.routeReliability;

    // Airport congestion
    const congestionScore = this.calculateCongestionImpact(
      flight.departure.airport
    );

    // Calculate final probability
    const probability = Math.round(
      (weatherScore * this.WEIGHTS.weatherImpact) +
      (historicalScore * this.WEIGHTS.historicalPattern) +
      (timeScore * this.WEIGHTS.timeOfDay) +
      (congestionScore * this.WEIGHTS.airportCongestion) * 100
    );

    // Calculate confidence
    const confidence = historicalAnalysis.confidence;

    // Estimate delay duration
    const estimatedDelay = this.estimateDelayDuration(probability);

    return {
      probability,
      confidence,
      estimatedDelay,
      factors: {
        weather: {
          score: weatherScore,
          departure: departureWeather.condition,
          arrival: arrivalWeather.condition
        },
        historical: {
          score: historicalScore,
          pattern: historicalAnalysis.patterns
        },
        timeOfDay: {
          score: timeScore,
          hour: scheduledTime.getHours()
        },
        congestion: {
          score: congestionScore
        }
      },
      updatedAt: new Date()
    };
  }

  calculateWeatherImpact(departureWeather, arrivalWeather) {
    const getWeatherScore = (condition) => {
      const scores = {
        'Clear': 0,
        'Cloudy': 0.2,
        'Rain': 0.5,
        'Snow': 0.8,
        'Thunderstorm': 0.9,
        'Fog': 0.7
      };
      return scores[condition] || 0.5;
    };

    return (
      getWeatherScore(departureWeather.condition) * 0.4 +
      getWeatherScore(arrivalWeather.condition) * 0.6
    );
  }

  calculateTimeImpact(hour) {
    const peakHours = {
      morning: { start: 7, end: 9 },
      evening: { start: 16, end: 19 }
    };
    
    if ((hour >= peakHours.morning.start && hour <= peakHours.morning.end) ||
        (hour >= peakHours.evening.start && hour <= peakHours.evening.end)) {
      return 0.8;
    }
    return 0.2;
  }

  calculateCongestionImpact(airport) {
    // In a real implementation, this would fetch real-time airport congestion data
    // For now, return a default middle value
    return 0.5;
  }

  estimateDelayDuration(probability) {
    if (probability < 30) return 0;
    if (probability < 50) return 15;
    if (probability < 70) return 30;
    if (probability < 85) return 45;
    return 60;
  }
}

module.exports = PredictionService;
