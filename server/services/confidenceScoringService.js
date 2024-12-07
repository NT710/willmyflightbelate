// server/services/confidenceScoringService.js
class ConfidenceScoringService {
  constructor(db) {
    this.db = db;
    this.MINIMUM_DATA_POINTS = {
      route: 50,      // Minimum route history entries
      airline: 100,   // Minimum airline history entries
      weather: 24,    // Minimum hours of weather data
      seasonal: 90    // Minimum days of seasonal data
    };
  }

  async calculateConfidence(data) {
    const {
      historicalData,
      weatherData,
      flightData,
      predictionFactors
    } = data;

    try {
      // Calculate individual confidence scores
      const dataQualityScore = this.assessDataQuality(historicalData);
      const predictionStabilityScore = this.assessPredictionStability(predictionFactors);
      const weatherConfidenceScore = this.assessWeatherConfidence(weatherData);
      const seasonalConfidenceScore = this.assessSeasonalConfidence(historicalData);
      
      // Calculate metadata about the confidence calculation
      const confidenceMetadata = this.generateConfidenceMetadata({
        dataQuality: dataQualityScore,
        predictionStability: predictionStabilityScore,
        weatherConfidence: weatherConfidenceScore,
        seasonalConfidence: seasonalConfidenceScore
      });

      // Calculate final weighted confidence score
      const finalConfidence = this.calculateFinalConfidence({
        dataQuality: dataQualityScore,
        predictionStability: predictionStabilityScore,
        weatherConfidence: weatherConfidenceScore,
        seasonalConfidence: seasonalConfidenceScore
      });

      return {
        confidence: Math.round(finalConfidence),
        metadata: confidenceMetadata,
        factors: {
          dataQuality: dataQualityScore,
          predictionStability: predictionStabilityScore,
          weatherConfidence: weatherConfidenceScore,
          seasonalConfidence: seasonalConfidenceScore
        }
      };
    } catch (error) {
      console.error('Confidence calculation error:', error);
      // Return a conservative confidence score if calculation fails
      return {
        confidence: 50,
        metadata: {
          warning: 'Confidence calculation error, returning conservative estimate',
          error: error.message
        }
      };
    }
  }

  assessDataQuality(historicalData) {
    const {
      routeDataPoints,
      airlineDataPoints,
      seasonalDataPoints,
      dataAge
    } = historicalData;

    // Calculate completeness scores
    const routeCompleteness = Math.min(routeDataPoints / this.MINIMUM_DATA_POINTS.route, 1);
    const airlineCompleteness = Math.min(airlineDataPoints / this.MINIMUM_DATA_POINTS.airline, 1);
    const seasonalCompleteness = Math.min(seasonalDataPoints / this.MINIMUM_DATA_POINTS.seasonal, 1);

    // Calculate freshness score (data age impact)
    const dataAgeInDays = (Date.now() - dataAge) / (24 * 60 * 60 * 1000);
    const freshnessScore = Math.max(0, 1 - (dataAgeInDays / 90));

    // Weight and combine scores
    return (
      (routeCompleteness * 0.4) +
      (airlineCompleteness * 0.3) +
      (seasonalCompleteness * 0.2) +
      (freshnessScore * 0.1)
    ) * 100;
  }

  assessPredictionStability(factors) {
    const {
      weatherImpact,
      historicalPattern,
      timeOfDay,
      congestion
    } = factors;

    // Check for extreme values that might indicate instability
    const extremeValues = [weatherImpact, historicalPattern, timeOfDay, congestion]
      .filter(value => value > 0.9 || value < 0.1).length;

    // More extreme values = less stable prediction
    const stabilityPenalty = extremeValues * 0.1;

    // Calculate variance between factors
    const values = [weatherImpact, historicalPattern, timeOfDay, congestion];
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

    // Higher variance = lower stability
    const variancePenalty = Math.min(variance * 2, 0.3);

    return Math.max(0, (1 - stabilityPenalty - variancePenalty)) * 100;
  }

  assessWeatherConfidence(weatherData) {
    const {
      forecastAge,
      weatherStability,
      weatherStations,
      weatherTrend
    } = weatherData;

    // Calculate forecast freshness impact
    const forecastFreshness = Math.max(0, 1 - (forecastAge / 3600)); // Age in seconds

    // Weather stability impact (0-1)
    const stabilityScore = weatherStability;

    // Weather station coverage
    const coverageScore = Math.min(weatherStations / 3, 1);

    // Weather trend predictability
    const trendScore = weatherTrend === 'stable' ? 1 :
                      weatherTrend === 'changing' ? 0.7 :
                      0.4;

    return (
      (forecastFreshness * 0.4) +
      (stabilityScore * 0.3) +
      (coverageScore * 0.2) +
      (trendScore * 0.1)
    ) * 100;
  }

  assessSeasonalConfidence(historicalData) {
    const {
      seasonalPatterns,
      seasonalVariability,
      yearOverYearStability
    } = historicalData;

    // Seasonal pattern strength
    const patternStrength = seasonalPatterns ? 
      seasonalPatterns.reduce((acc, val) => acc + val.correlation, 0) / seasonalPatterns.length : 0.5;

    // Seasonal variability impact (lower variability = higher confidence)
    const variabilityScore = 1 - (seasonalVariability || 0.5);

    // Year-over-year stability
    const stabilityScore = yearOverYearStability || 0.5;

    return (
      (patternStrength * 0.4) +
      (variabilityScore * 0.3) +
      (stabilityScore * 0.3)
    ) * 100;
  }

  calculateFinalConfidence(scores) {
    const weights = {
      dataQuality: 0.35,
      predictionStability: 0.25,
      weatherConfidence: 0.25,
      seasonalConfidence: 0.15
    };

    return Object.entries(weights).reduce((total, [factor, weight]) => {
      return total + (scores[factor] * weight);
    }, 0);
  }

  generateConfidenceMetadata(scores) {
    const metadata = {
      timestamp: new Date(),
      warnings: [],
      strengths: []
    };

    // Add warnings for low scores
    Object.entries(scores).forEach(([factor, score]) => {
      if (score < 60) {
        metadata.warnings.push(`Low ${factor} score: ${Math.round(score)}%`);
      } else if (score > 80) {
        metadata.strengths.push(`Strong ${factor}: ${Math.round(score)}%`);
      }
    });

    return metadata;
  }
}

module.exports = ConfidenceScoringService;
