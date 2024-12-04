// src/services/flightService.js
import { useState } from 'react';

// Regional weather patterns by airport region
const REGIONAL_PATTERNS = {
  'NA': { // North America
    'SEA': { rain: 0.6, fog: 0.3 },    // Seattle
    'MIA': { thunderstorm: 0.4 },      // Miami
    'ORD': { snow: 0.4, wind: 0.5 },   // Chicago
    'LAX': { fog: 0.3 },               // Los Angeles
  },
  'EU': { // Europe
    'LHR': { fog: 0.5, rain: 0.4 },    // London
    'CDG': { rain: 0.3 },              // Paris
    'FRA': { snow: 0.3 },              // Frankfurt
  },
  'AS': { // Asia
    'HND': { typhoon: 0.2 },           // Tokyo
    'SIN': { thunderstorm: 0.5 },      // Singapore
    'BKK': { rain: 0.6 },              // Bangkok
  }
};

// Seasonal patterns by hemisphere
const SEASONAL_PATTERNS = {
  'NORTH': {
    'WINTER': { snow: 0.4, ice: 0.3 },
    'SPRING': { thunderstorm: 0.4, rain: 0.5 },
    'SUMMER': { thunderstorm: 0.6, heat: 0.4 },
    'FALL': { rain: 0.4, wind: 0.3 }
  },
  'SOUTH': {
    'WINTER': { rain: 0.5, wind: 0.4 },
    'SPRING': { rain: 0.3, wind: 0.2 },
    'SUMMER': { thunderstorm: 0.5, heat: 0.6 },
    'FALL': { rain: 0.4, fog: 0.3 }
  }
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current season based on hemisphere
  const getCurrentSeason = (airport) => {
    const month = new Date().getMonth();
    const isNorthern = REGIONAL_PATTERNS['NA'][airport] || 
                      REGIONAL_PATTERNS['EU'][airport] ||
                      airport.startsWith('K') || // US airports
                      airport.startsWith('E');   // European airports
    
    if (isNorthern) {
      if (month >= 2 && month <= 4) return 'SPRING';
      if (month >= 5 && month <= 7) return 'SUMMER';
      if (month >= 8 && month <= 10) return 'FALL';
      return 'WINTER';
    } else {
      if (month >= 2 && month <= 4) return 'FALL';
      if (month >= 5 && month <= 7) return 'WINTER';
      if (month >= 8 && month <= 10) return 'SPRING';
      return 'SUMMER';
    }
  };

  // Enhanced status messages with more detail
  const getDetailedStatus = (flightData) => {
    const baseStatus = {
      state: '',
      message: '',
      icon: '',
      colorClass: '',
      severity: 0
    };

    // Ground operations
    if (flightData.onGround) {
      if (!flightData.departed) {
        if (flightData.delay > 30) {
          return {
            ...baseStatus,
            state: 'Significantly Delayed',
            message: `Flight is delayed by ${flightData.delay} minutes at gate`,
            icon: 'clock',
            colorClass: 'text-red-500',
            severity: 3
          };
        } else if (flightData.delay > 0) {
          return {
            ...baseStatus,
            state: 'Slightly Delayed',
            message: `Short delay of ${flightData.delay} minutes`,
            icon: 'clock',
            colorClass: 'text-yellow-500',
            severity: 1
          };
        } else {
          return {
            ...baseStatus,
            state: 'On Time',
            message: 'Flight is on schedule',
            icon: 'check',
            colorClass: 'text-green-500',
            severity: 0
          };
        }
      } else {
        if (flightData.velocity > 0) {
          return {
            ...baseStatus,
            state: 'Taxiing',
            message: flightData.arrived ? 'Arriving at gate' : 'Departing to runway',
            icon: 'plane',
            colorClass: 'text-blue-500',
            severity: 0
          };
        }
      }
    }
    
    // In-flight operations
    if (flightData.altitude > 0) {
      if (flightData.verticalRate > 500) {
        return {
          ...baseStatus,
          state: 'Climbing',
          message: 'Ascending to cruise altitude',
          icon: 'trending-up',
          colorClass: 'text-blue-500',
          severity: 0
        };
      } else if (flightData.verticalRate < -500) {
        return {
          ...baseStatus,
          state: 'Descending',
          message: 'Preparing for landing',
          icon: 'trending-down',
          colorClass: 'text-blue-500',
          severity: 0
        };
      } else {
        return {
          ...baseStatus,
          state: 'Cruising',
          message: `At ${Math.round(flightData.altitude/100)*100} feet`,
          icon: 'plane',
          colorClass: 'text-green-500',
          severity: 0
        };
      }
    }

    return {
      ...baseStatus,
      state: 'Unknown',
      message: 'Flight status unavailable',
      icon: 'help-circle',
      colorClass: 'text-gray-500',
      severity: 0
    };
  };

  // Main prediction function with all enhancements
  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const flightData = await getFlightData(flightNumber);
      if (!flightData) {
        throw new Error('Flight not found. Please check the flight number.');
      }

      const departure = flightData.departure;
      const arrival = flightData.arrival;
      
      // Get regional patterns
      const departureRegion = getAirportRegion(departure);
      const arrivalRegion = getAirportRegion(arrival);
      
      // Get seasonal impacts
      const departureSeason = getCurrentSeason(departure);
      const arrivalSeason = getCurrentSeason(arrival);
      
      // Get detailed status
      const status = getDetailedStatus(flightData);

      // Calculate final prediction
      const prediction = calculateFinalPrediction({
        flightData,
        departureRegion,
        arrivalRegion,
        departureSeason,
        arrivalSeason,
        status
      });

      return {
        prediction,
        details: {
          planeState: {
            ...status,
            currentLocation: flightData.currentLocation,
            flightTime: calculateRemainingTime(flightData)
          },
          weather: {
            departure: await getWeatherData(departure),
            arrival: await getWeatherData(arrival),
            seasonal: {
              departure: SEASONAL_PATTERNS[departureRegion][departureSeason],
              arrival: SEASONAL_PATTERNS[arrivalRegion][arrivalSeason]
            }
          },
          pattern: {
            lastWeek: generateWeeklyPattern(flightData),
            todayRank: calculateDayRank(status.severity),
            trend: determineTrend(prediction.probability)
          }
        }
      };

    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getPrediction,
    loading,
    error
  };
};
