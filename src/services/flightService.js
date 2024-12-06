import { useState } from 'react';

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFlightData = async (flightNumber) => {
    const username = process.env.REACT_APP_OPENSKY_USERNAME;
    const password = process.env.REACT_APP_OPENSKY_PASSWORD;

    if (!username || !password) {
      throw new Error('OpenSky credentials not configured');
    }

    const now = Math.floor(Date.now() / 1000);
    const past = now - 7200; // Look back 2 hours

    try {
      console.log('Making API request...');
      
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

  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);

    try {
      if (!flightNumber) {
        throw new Error('Please enter a flight number');
      }

      const flightData = await getFlightData(flightNumber);
      
      return {
        probability: 75,
        delay: 35,
        planeState: {
          currentLocation: flightData.estDepartureAirport || 'Unknown',
          status: 'On Time',
          flightTime: '2h 15m'
        },
        weather: {
          current: 'Clear',
          destination: 'Unknown',
          impact: 'medium'
        }
      };

    } catch (err) {
      setError(err.message);
      console.error('Prediction error:', err);
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
