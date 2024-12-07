// server/services/predictionService.js
class PredictionService {
  constructor(db, weatherService, flightService) {
    this.db = db;
    this.weatherService = weatherService;
    this.flightService = flightService;
    this.WEIGHTS = {
      weatherImpact: 0.35,
      historicalPattern: 0.30,
      timeOfDay: 0.20,
      airportCongestion: 0.15
    };
  }

  async getPrediction(flightNumber) {
    try {
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

      // Get historical data from MongoDB
      const historicalData = await this.getHistoricalData(
        flightData.departure.airport,
        flightData.arrival.airport,
        new Date(flightData.departure.scheduled)
      );

      // Calculate prediction
      const prediction = await this.calculatePrediction({
        flight: flightData,
        departureWeather,
        arrivalWeather,
        historicalData
      });

      // Cache the prediction
      await this.cachePrediction(flightNumber, prediction);

      return prediction;
    } catch (error) {
      console.error('Prediction calculation error:', error);
      throw new Error('Unable to calculate prediction');
    }
  }

  async getHistoricalData(departureAirport, arrivalAirport, date) {
    const route = `${departureAirport}-${arrivalAirport}`;
    const month = date.getMonth() + 1;
    
    const historicalDelays = await this.db.collection('historical_delays').findOne({
      route,
      month,
      year: date.getFullYear()
    });

    return historicalDelays || { stats: { avgDelay: 0, frequency: 0 } };
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
      historicalData
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
    const historicalScore = this.calculateHistoricalImpact(historicalData);

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
    const confidence = this.calculateConfidence({
      weatherDataAge: departureWeather.dataAge,
      historicalDataPoints: historicalData.stats.totalFlights,
      congestionDataAge: 0.1 // Placeholder for real-time data
    });

    // Estimate delay duration
    const estimatedDelay = this.estimateDelayDuration(probability);

    return {
      probability,
      confidence,
      estimatedDelay,
      factors: {
        weather: weatherScore,
        historical: historicalScore,
        timeOfDay: timeScore,
        congestion: congestionScore
      },
      updatedAt: new Date()
    };
  }

  // Helper methods...
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

  calculateHistoricalImpact(historicalData) {
    return Math.min(
      (historicalData.stats.frequency * historicalData.stats.avgDelay) / 100,
      1
    );
  }

  calculateCongestionImpact(airport) {
    // Placeholder for real-time congestion data
    return 0.5;
  }

  calculateConfidence(data) {
    let confidence = 90;
    confidence -= (data.weatherDataAge > 1 ? 10 : 0);
    confidence -= (data.congestionDataAge > 0.5 ? 10 : 0);
    confidence *= (Math.min(data.historicalDataPoints / 100, 1));
    return Math.round(confidence);
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
