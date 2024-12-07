// server/services/historicalPatternService.js
class HistoricalPatternService {
  constructor(db) {
    this.db = db;
  }

  async analyzePatterns(flightData) {
    const {
      departureAirport,
      arrivalAirport,
      scheduledTime,
      airline
    } = flightData;

    try {
      // Get multi-dimensional historical data
      const [
        routeHistory,
        airlineHistory,
        timeBasedHistory,
        seasonalPatterns
      ] = await Promise.all([
        this.getRouteHistory(departureAirport, arrivalAirport),
        this.getAirlineHistory(airline),
        this.getTimeBasedHistory(departureAirport, arrivalAirport, scheduledTime),
        this.getSeasonalPatterns(departureAirport, arrivalAirport, new Date(scheduledTime))
      ]);

      // Calculate pattern scores
      const scores = {
        routeReliability: this.calculateRouteScore(routeHistory),
        airlinePerformance: this.calculateAirlineScore(airlineHistory),
        timeBasedLikelihood: this.calculateTimeScore(timeBasedHistory),
        seasonalImpact: this.calculateSeasonalScore(seasonalPatterns)
      };

      // Calculate confidence based on data quality
      const confidence = this.calculateConfidence({
        routeDataPoints: routeHistory.totalFlights,
        airlineDataPoints: airlineHistory.totalFlights,
        timeDataPoints: timeBasedHistory.totalFlights,
        dataAge: Math.max(
          routeHistory.lastUpdated,
          airlineHistory.lastUpdated,
          timeBasedHistory.lastUpdated
        )
      });

      return {
        scores,
        confidence,
        patterns: {
          route: routeHistory.pattern,
          airline: airlineHistory.pattern,
          time: timeBasedHistory.pattern,
          seasonal: seasonalPatterns.pattern
        }
      };
    } catch (error) {
      console.error('Historical pattern analysis error:', error);
      throw new Error('Unable to analyze historical patterns');
    }
  }

  async getRouteHistory(departure, arrival) {
    const route = `${departure}-${arrival}`;
    const history = await this.db.collection('historical_delays').find({
      route,
      date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Last 90 days
    }).toArray();

    return this.processHistoricalData(history, 'route');
  }

  async getAirlineHistory(airline) {
    const history = await this.db.collection('historical_delays').find({
      airline,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).toArray();

    return this.processHistoricalData(history, 'airline');
  }

  async getTimeBasedHistory(departure, arrival, time) {
    const hour = new Date(time).getHours();
    const route = `${departure}-${arrival}`;
    
    const history = await this.db.collection('historical_delays').find({
      route,
      hour: { $gte: hour - 1, $lte: hour + 1 }, // Similar time window
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).toArray();

    return this.processHistoricalData(history, 'time');
  }

  async getSeasonalPatterns(departure, arrival, date) {
    const month = date.getMonth();
    const route = `${departure}-${arrival}`;
    
    const history = await this.db.collection('historical_delays').find({
      route,
      month: { $in: [month - 1, month, (month + 1) % 12] } // Adjacent months
    }).toArray();

    return this.processHistoricalData(history, 'seasonal');
  }

  processHistoricalData(history, type) {
    if (!history.length) {
      return {
        pattern: [],
        totalFlights: 0,
        lastUpdated: 0,
        reliability: 0
      };
    }

    const pattern = history.map(record => ({
      date: record.date,
      delay: record.delay,
      factor: this.getDelayFactor(record, type)
    }));

    return {
      pattern,
      totalFlights: history.length,
      lastUpdated: Math.max(...history.map(r => new Date(r.date).getTime())),
      reliability: this.calculateReliability(pattern)
    };
  }

  getDelayFactor(record, type) {
    switch(type) {
      case 'route':
        return record.congestion || 1;
      case 'airline':
        return record.equipment_issues || 1;
      case 'time':
        return record.peak_factor || 1;
      case 'seasonal':
        return record.weather_impact || 1;
      default:
        return 1;
    }
  }

  calculateReliability(pattern) {
    if (!pattern.length) return 0;
    
    const delays = pattern.filter(p => p.delay > 15).length;
    return 1 - (delays / pattern.length);
  }

  calculateRouteScore(routeHistory) {
    if (!routeHistory.totalFlights) return 0.5;
    return routeHistory.reliability;
  }

  calculateAirlineScore(airlineHistory) {
    if (!airlineHistory.totalFlights) return 0.5;
    return airlineHistory.reliability;
  }

  calculateTimeScore(timeHistory) {
    if (!timeHistory.totalFlights) return 0.5;
    return timeHistory.reliability;
  }

  calculateSeasonalScore(seasonalPatterns) {
    if (!seasonalPatterns.pattern.length) return 0.5;
    
    const recentPatterns = seasonalPatterns.pattern.slice(-30);
    const delayRate = recentPatterns.filter(p => p.delay > 15).length / recentPatterns.length;
    
    return 1 - delayRate;
  }

  calculateConfidence(data) {
    let confidence = 90;

    // Reduce confidence based on data points
    confidence *= Math.min(data.routeDataPoints / 100, 1);
    confidence *= Math.min(data.airlineDataPoints / 50, 1);
    confidence *= Math.min(data.timeDataPoints / 30, 1);

    // Reduce confidence based on data age (in days)
    const dataAgeInDays = (Date.now() - data.dataAge) / (24 * 60 * 60 * 1000);
    confidence *= Math.max(0.5, 1 - (dataAgeInDays / 90));

    return Math.round(confidence);
  }
}

module.exports = HistoricalPatternService;
