import { useState } from 'react';

const CACHE = {
  weather: new Map(),
  flights: new Map(),
  cacheTime: 5 * 60 * 1000 // 5 minutes
};

const API_CONFIG = {
  baseUrl: 'https://opensky-network.org/api',
  credentials: {
    username: window._env_?.OPENSKY_USERNAME,
    password: window._env_?.OPENSKY_PASSWORD
  }
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    if (!API_CONFIG.credentials.username || !API_CONFIG.credentials.password) {
      throw new Error('API credentials not configured');
    }
    
    return {
      'Authorization': `Basic ${btoa(`${API_CONFIG.credentials.username}:${API_CONFIG.credentials.password}`)}`,
      'Content-Type': 'application/json'
    };
  };

  const handleApiError = (error, endpoint) => {
    console.error(`API Error (${endpoint}):`, error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return 'Network error: Please check your internet connection';
    }
    
    switch (error.status) {
      case 401:
        return 'Authentication failed: Please check API credentials';
      case 429:
        return 'Rate limit exceeded: Please try again in a few minutes';
      case 403:
        return 'Access denied: Please check API permissions';
      default:
        return `Error fetching flight data: ${error.message || 'Unknown error'}`;
    }
  };

  const getFlightData = async (flightNumber) => {
    const cachedData = CACHE.flights.get(flightNumber);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE.cacheTime) {
      return cachedData.data;
    }

    const now = Math.floor(Date.now() / 1000);
    const url = `${API_CONFIG.baseUrl}/flights/all?begin=${now - 7200}&end=${now}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const flight = data.find(f => 
        f.callsign?.trim().toUpperCase() === flightNumber.trim().toUpperCase()
      );

      if (!flight) {
        throw new Error('Flight not found');
      }

      CACHE.flights.set(flightNumber, {
        data: flight,
        timestamp: Date.now()
      });

      return flight;
    } catch (error) {
      throw new Error(handleApiError(error, 'flights'));
    }
  };

  const getWeatherData = async (coordinates) => {
    const cacheKey = `${coordinates.lat},${coordinates.lon}`;
    const cachedData = CACHE.weather.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE.cacheTime) {
      return cachedData.data;
    }

    try {
      const response = await fetch(
        `https://api.weather.gov/points/${coordinates.lat},${coordinates.lon}/forecast`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      CACHE.weather.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      throw new Error(handleApiError(error, 'weather'));
    }
  };

  const calculateProbability = (flightData, departureWeather, arrivalWeather) => {
    // Implement your probability calculation logic here
    return 75; // Placeholder
  };

  const calculateDelay = (flightData, departureWeather, arrivalWeather) => {
    // Implement your delay calculation logic here
    return 35; // Placeholder
  };

  const getFlightStatus = (flightData) => {
    // Implement flight status logic here
    return 'On Time'; // Placeholder
  };

  const calculateRemainingTime = (flightData) => {
    // Implement remaining time calculation here
    return '2h 15m'; // Placeholder
  };

  const calculateWeatherImpact = (departureWeather, arrivalWeather) => {
    // Implement weather impact calculation here
    return 'medium'; // Placeholder
  };

  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);

    try {
      const flightData = await getFlightData(flightNumber);
      
      const retryOperation = async (operation, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await operation();
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      const [departureWeather, arrivalWeather] = await Promise.all([
        retryOperation(() => getWeatherData({
          lat: flightData.estDepartureAirport.latitude,
          lon: flightData.estDepartureAirport.longitude
        })),
        retryOperation(() => getWeatherData({
          lat: flightData.estArrivalAirport.latitude,
          lon: flightData.estArrivalAirport.longitude
        }))
      ]);

      return {
        prediction: {
          probability: calculateProbability(flightData, departureWeather, arrivalWeather),
          delay: calculateDelay(flightData, departureWeather, arrivalWeather)
        },
        details: {
          planeState: {
            currentLocation: flightData.estDepartureAirport.code,
            status: getFlightStatus(flightData),
            flightTime: calculateRemainingTime(flightData)
          },
          weather: {
            current: departureWeather.properties.periods[0].shortForecast,
            destination: arrivalWeather.properties.periods[0].shortForecast,
            impact: calculateWeatherImpact(departureWeather, arrivalWeather)
          }
        }
      };
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getPrediction,
    loading,
    error,
    clearError: () => setError(null)
  };
};
