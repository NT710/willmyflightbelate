import { useState } from 'react';

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get flight data with GitHub Actions secrets
  const getFlightData = async (flightNumber) => {
    // Access secrets from window._env_ which is populated by GitHub Actions
    const username = window._env_?.OPENSKY_USERNAME;
    const password = window._env_?.OPENSKY_PASSWORD;

    if (!username || !password) {
      throw new Error('OpenSky credentials not configured in GitHub secrets');
    }

    const now = Math.floor(Date.now() / 1000);
    const past = now - 7200; // Look back 2 hours

    try {
      const response = await fetch(
        `https://opensky-network.org/api/flights/all?begin=${past}&end=${now}`,
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
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Clean and format flight number for comparison
      const cleanFlightNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
      
      const flight = data.find(f => {
        const callsign = (f.callsign || '').replace(/\s+/g, '').toUpperCase();
        return callsign.includes(cleanFlightNumber);
      });

      if (!flight) {
        throw new Error('Flight not found. Please check the flight number.');
      }

      return flight;
    } catch (error) {
      console.error('Flight data fetch error:', error);
      throw error;
    }
  };

  // Simplified weather data fetching with error handling
  const getWeatherData = async (coordinates) => {
    try {
      const response = await fetch(
        `https://api.weather.gov/points/${coordinates.latitude},${coordinates.longitude}/forecast`
      );

      if (!response.ok) {
        throw new Error(`Weather API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.properties.periods[0];
    } catch (error) {
      console.error('Weather data fetch error:', error);
      throw error;
    }
  };

  // Main prediction function with proper error handling
  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);

    try {
      if (!flightNumber) {
        throw new Error('Please enter a flight number');
      }

      // Add debugging log
      console.log('Fetching data for flight:', flightNumber);
      console.log('Using credentials:', !!window._env_?.OPENSKY_USERNAME, !!window._env_?.OPENSKY_PASSWORD);

      const flightData = await getFlightData(flightNumber);
      
      // For demo purposes, using JFK coordinates
      const weather = await getWeatherData({
        latitude: 40.6413,
        longitude: -73.7781
      });

      return {
        probability: 75,
        delay: 35,
        planeState: {
          currentLocation: flightData.estDepartureAirport || 'Unknown',
          status: 'On Time',
          flightTime: '2h 15m'
        },
        weather: {
          current: weather.shortForecast,
          destination: 'Unknown',
          impact: 'medium'
        }
      };

    } catch (err) {
      setError(err.message);
      console.error('Full error details:', err);
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

export default useFlightService;
