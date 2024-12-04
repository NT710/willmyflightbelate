// src/services/flightService.js
import { useState } from 'react';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 900, // Keep buffer below 1000 daily limit
  timeWindow: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  requests: [],
  weatherCache: new Map() // Cache for weather data
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if we're within rate limits
  const checkRateLimit = () => {
    const now = Date.now();
    // Remove old requests outside time window
    RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
      time => now - time < RATE_LIMIT.timeWindow
    );
    
    if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
      throw new Error('Daily API limit reached. Please try again tomorrow.');
    }
    
    RATE_LIMIT.requests.push(now);
    return true;
  };

  // Get flight data with rate limiting
  const getFlightData = async (flightNumber) => {
    try {
      checkRateLimit();
      
      const credentials = btoa(
        `${process.env.REACT_APP_OPENSKY_USERNAME}:${process.env.REACT_APP_OPENSKY_PASSWORD}`
      );
      const now = Math.floor(Date.now() / 1000);

      const response = await fetch(
        `https://opensky-network.org/api/flights/all?begin=${now - 7200}&end=${now}`,
        {
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      return data.find(f => 
        f.callsign?.replace(/\s+/g, '').includes(flightNumber.replace(/\s+/g, ''))
      );

    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  };

  // Get weather data with caching
  const getWeatherData = async (airport) => {
    // Check cache first
    const cached = RATE_LIMIT.weatherCache.get(airport);
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 minute cache
      return cached.data;
    }

    try {
      const airportData = await getAirportCoordinates(airport);
      const response = await fetch(
        `https://api.weather.gov/points/${airportData.latitude},${airportData.longitude}/forecast`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      const weatherData = {
        conditions: data.properties.periods[0].shortForecast,
        temperature: data.properties.periods[0].temperature,
        windSpeed: data.properties.periods[0].windSpeed
      };

      // Cache the result
      RATE_LIMIT.weatherCache.set(airport, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  // Main prediction function with rate limiting
  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const flightData = await getFlightData(flightNumber);
      if (!flightData) {
        throw new Error('Flight not found. Please check the flight number.');
      }

      const [departureWeather, arrivalWeather] = await Promise.all([
        getWeatherData(flightData.estDepartureAirport),
        getWeatherData(flightData.estArrivalAirport)
      ]);

      // Rest of your prediction calculation logic...
      const prediction = calculatePrediction(flightData, {
        departure: departureWeather,
        arrival: arrivalWeather
      });

      return {
        prediction: {
          probability: prediction.probability,
          delay: prediction.delay
        },
        details: {
          planeState: {
            currentLocation: flightData.estDepartureAirport,
            status: getFlightStatus(flightData),
            flightTime: calculateRemainingTime(flightData)
          },
          weather: {
            current: departureWeather.conditions,
            destination: arrivalWeather.conditions,
            impact: calculateWeatherImpact(departureWeather, arrivalWeather)
          },
          apiCalls: {
            remaining: RATE_LIMIT.maxRequests - RATE_LIMIT.requests.length
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
    error,
    getRemainingCalls: () => RATE_LIMIT.maxRequests - RATE_LIMIT.requests.length
  };
};
