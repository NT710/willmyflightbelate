import { useState } from 'react';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const weatherCache = new Map();

const AIRPORTS = {
  'JFK': { latitude: 40.6413, longitude: -73.7781 },
  'LAX': { latitude: 33.9416, longitude: -118.4085 },
  'ORD': { latitude: 41.9742, longitude: -87.9073 },
  'DFW': { latitude: 32.8998, longitude: -97.0403 },
  'DEN': { latitude: 39.8561, longitude: -104.6737 },
  'ATL': { latitude: 33.6367, longitude: -84.4281 },
  'SFO': { latitude: 37.7749, longitude: -122.4194 },
  'SEA': { latitude: 47.4502, longitude: -122.3088 },
  'MIA': { latitude: 25.7959, longitude: -80.2870 },
  'BOS': { latitude: 42.3656, longitude: -71.0096 }
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFlightData = async (flightNumber) => {
    const now = Math.floor(Date.now() / 1000);
    const username = process.env.REACT_APP_OPENSKY_USERNAME;
    const password = process.env.REACT_APP_OPENSKY_PASSWORD;

    if (!username || !password) {
      throw new Error('OpenSky credentials not configured');
    }

    try {
      const response = await fetch(
        `https://opensky-network.org/api/flights/all?begin=${now - 7200}&end=${now}`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`${username}:${password}`)}`
          }
        }
      );

      if (response.status === 401) {
        throw new Error('Invalid OpenSky credentials');
      }

      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      const flight = data.find(f => 
        f.callsign?.replace(/\s+/g, '').includes(flightNumber.replace(/\s+/g, ''))
      );

      if (!flight) {
        throw new Error('Flight not found. Please check the flight number.');
      }

      // Add coordinates for departure and arrival airports
      flight.estDepartureAirportCoords = AIRPORTS[flight.estDepartureAirport] || 
        { latitude: 0, longitude: 0 };
      flight.estArrivalAirportCoords = AIRPORTS[flight.estArrivalAirport] || 
        { latitude: 0, longitude: 0 };

      return flight;
    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  };

  const getWeatherData = async (coordinates) => {
    const cacheKey = `${coordinates.latitude},${coordinates.longitude}`;
    const cached = weatherCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `https://api.weather.gov/points/${coordinates.latitude},${coordinates.longitude}/forecast`
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

      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  };

  const calculatePrediction = (flight, weather) => {
    let probability = 50; // Base probability
    let delay = 0;

    // Weather impact
    if (weather.arrival.conditions.toLowerCase().includes('rain')) {
      probability += 15;
      delay += 20;
    }
    if (weather.arrival.conditions.toLowerCase().includes('snow')) {
      probability += 30;
      delay += 45;
    }
    if (weather.arrival.conditions.toLowerCase().includes('storm')) {
      probability += 40;
      delay += 60;
    }

    // Wind impact
    const windSpeed = parseInt(weather.arrival.windSpeed);
    if (windSpeed > 15) {
      probability += 10;
      delay += 15;
    }
    if (windSpeed > 25) {
      probability += 20;
      delay += 30;
    }

    // Time of day impact
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 9) probability += 10; // Morning rush
    if (hour >= 16 && hour <= 19) probability += 10; // Evening rush

    // Previous flight delay impact
    if (flight.firstSeen && flight.lastSeen) {
      const actualFlightTime = flight.lastSeen - flight.firstSeen;
      const expectedFlightTime = 7200; // 2 hours as baseline
      if (actualFlightTime > expectedFlightTime) {
        const previousDelay = Math.floor((actualFlightTime - expectedFlightTime) / 60);
        probability += Math.min(previousDelay / 2, 20);
        delay += Math.min(previousDelay * 0.7, 30);
      }
    }

    return {
      probability: Math.min(Math.round(probability), 95),
      delay: Math.round(delay)
    };
  };

  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);

    try {
      const flight = await getFlightData(flightNumber);
      
      const [departureWeather, arrivalWeather] = await Promise.all([
        getWeatherData(flight.estDepartureAirportCoords),
        getWeatherData(flight.estArrivalAirportCoords)
      ]);

      const prediction = calculatePrediction(flight, {
        departure: departureWeather,
        arrival: arrivalWeather
      });

      return {
        prediction,
        details: {
          planeState: {
            currentLocation: flight.estDepartureAirport,
            status: flight.estArrivalAirport ? 'Scheduled' : 'Unknown',
            flightTime: flight.firstSeen && flight.lastSeen ? 
              `${Math.round((flight.lastSeen - flight.firstSeen) / 60)}m` : 'N/A'
          },
          weather: {
            current: departureWeather.conditions,
            destination: arrivalWeather.conditions
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
