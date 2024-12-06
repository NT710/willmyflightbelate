import { useState } from 'react';

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get flight data with GitHub Actions secrets
  const getFlightData = async (flightNumber) => {
    // Check if window._env_ exists and has credentials
    if (!window._env_) {
      console.error('Environment configuration not loaded');
      throw new Error('Application configuration not loaded. Please refresh the page.');
    }

    const username = window._env_.OPENSKY_USERNAME;
    const password = window._env_.OPENSKY_PASSWORD;

    if (!username || !password) {
      console.error('Missing OpenSky credentials');
      throw new Error('OpenSky credentials not configured. Please check GitHub secrets.');
    }

    const now = Math.floor(Date.now() / 1000);
    const past = now - 7200; // Look back 2 hours

    try {
      console.log('Making API request with credentials:', !!username, !!password);
      
      const response = await fetch(
        `https://opensky-network.org/api/flights/all?begin=${past}&end=${now}`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`${username}:${password}`)}`
          }
        }
      );

      if (response.status === 401) {
        console.error('Authentication failed with OpenSky API');
        throw new Error('Invalid OpenSky credentials. Please check the configured secrets.');
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

  // Rest of the service implementation remains the same...
  // (Previous weather and prediction functions)

  return {
    getPrediction,
    loading,
    error
  };
};

export default useFlightService;
