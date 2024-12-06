import { useState } from 'react';

// Cache and rate limit configuration
const CACHE = {
  weather: new Map(),
  weatherTTL: 30 * 60 * 1000, // 30 minutes
  flights: new Map(),
  flightsTTL: 5 * 60 * 1000,  // 5 minutes
};

const AIRPORTS = {
  'JFK': { latitude: 40.6413, longitude: -73.7781 },
  'LAX': { latitude: 33.9416, longitude: -118.4085 },
  'ORD': { latitude: 41.9742, longitude: -87.9073 },
  // Add more as needed
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCredentials = () => {
    // Check for environment variables
    const username = process.env.REACT_APP_OPENSKY_USERNAME;
    const password = process.env.REACT_APP_OPENSKY_PASSWORD;

    if (!username || !password) {
      throw new Error('OpenSky credentials not found. Please set REACT_APP_OPENSKY_USERNAME and REACT_APP_OPENSKY_PASSWORD environment variables.');
    }

    return btoa(`${username}:${password}`);
  };

  const fetchWithCredentials = async (url) => {
    try {
      const credentials = getCredentials();
      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.status === 401) {
        throw new Error('Invalid OpenSky credentials');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('credentials not found')) {
        console.error('API Configuration Error:', error.message);
        throw new Error('API credentials not configured. Please check your environment variables.');
      }
      throw error;
    }
  };

  const getFlightData = async (flightNumber) => {
    // Check cache first
    const cached = CACHE.flights.get(flightNumber);
    if (cached && Date.now() - cached.timestamp < CACHE.flightsTTL) {
      return cached.data;
    }

    const now = Math.floor(Date.now() / 1000);
    const url = `https://opensky-network.org/api/flights/all?begin=${now - 7200}&end=${now}`;
    
    const data = await fetchWithCredentials(url);
    const flight = data.find(f => 
      f.callsign?.trim().replace(/\s+/g, '').includes(flightNumber.trim().replace(/\s+/g, ''))
    );

    if (!flight) {
      throw new Error('Flight not found. Please check the flight number.');
    }

    // Cache the result
    CACHE.flights.set(flightNumber, {
      data: flight,
      timestamp: Date.now()
    });

    return flight;
  };

  const getWeatherData = async (airport) => {
    // Check cache first
    const cached = CACHE.weather.get(airport);
    if (cached && Date.now() - cached.timestamp < CACHE.weatherTTL) {
      return cached.data;
    }

    const coords = AIRPORTS[airport];
    if (!coords) {
      throw new Error(`Airport ${airport} not found in database`);
    }

    const response = await fetch(
      `https://api.weather.gov/points/${coords.latitude},${coords.longitude}/forecast`
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
    CACHE.weather.set(airport, {
      data: weatherData,
      timestamp: Date.now()
    });

    return weatherData;
  };

  const calculateDelay = (flight, weather) => {
    let probability = 0;
    let estimatedDelay = 0;

    // Basic weather impact
    if (weather.conditions.toLowerCase().includes('rain')) {
      probability += 20;
      estimatedDelay += 15;
    }
    if (weather.conditions.toLowerCase().includes('snow')) {
      probability += 40;
      estimatedDelay += 30;
    }
    if (weather.conditions.toLowerCase().includes('storm')) {
      probability += 60;
      estimatedDelay += 45;
    }

    // Time of day impact (simplified)
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 9) probability += 15;  // Morning rush
    if (hour >= 16 && hour <= 19) probability += 15; // Evening rush

    return {
      probability: Math.min(probability, 100),
      delay: Math.round(estimatedDelay)
    };
  };

  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);

    try {
      const flightData = await getFlightData(flightNumber);
      
      const [departureWeather, arrivalWeather] = await Promise.all([
        getWeatherData(flightData.estDepartureAirport),
        getWeatherData(flightData.estArrivalAirport)
      ]);

      const delayPrediction = calculateDelay(flightData, {
        departure: departureWeather,
        arrival: arrivalWeather
      });

      return {
        prediction: {
          probability: delayPrediction.probability,
          delay: delayPrediction.delay
        },
        details: {
          planeState: {
            currentLocation: flightData.estDepartureAirport,
            status: flightData.status || 'Scheduled',
            flightTime: `${Math.round((flightData.lastSeen - flightData.firstSeen) / 60)}m`,
          },
          weather: {
            current: departureWeather.conditions,
            destination: arrivalWeather.conditions,
            impact: delayPrediction.probability > 50 ? 'high' : 
                   delayPrediction.probability > 25 ? 'medium' : 'low'
          }
        }
      };

    } catch (err) {
      setError(err.message);
      throw err;
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

export default useFlightService;
