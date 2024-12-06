import { useState } from 'react';

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFlightData = async (flightNumber) => {
    try {
      console.log('Requesting flight data for:', flightNumber);
      
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flightNumber })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch flight data');
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  };

  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      const flightData = await getFlightData(flightNumber);
      
      if (!flightData) {
        throw new Error('No flight data available');
      }

      return {
        prediction: {
          probability: flightData.probability || 75,
          delay: flightData.delay || 35,
        },
        details: {
          planeState: {
            currentLocation: flightData.currentLocation || 'ORD',
            status: flightData.status || 'On Time',
            flightTime: flightData.flightTime || '2h 15m'
          },
          weather: {
            current: flightData.weather?.current || 'Clear',
            destination: flightData.weather?.destination || 'Clear'
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
