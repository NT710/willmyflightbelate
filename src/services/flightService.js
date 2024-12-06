// src/services/flightService.js
import { useState } from 'react';

// Using a proxy URL to avoid CORS issues
const PROXY_BASE_URL = 'https://proxy.willmyflightbelate.com/api';

// Fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Use secure endpoint based on environment
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return PROXY_BASE_URL;
  }
  return API_BASE_URL;
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFlightData = async (flightNumber) => {
    try {
      const response = await fetch(`${getApiUrl()}/flights?flightNumber=${flightNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers here
        },
        credentials: 'include', // Include credentials if needed
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check API credentials.');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`Failed to fetch flight data: ${response.statusText}`);
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
      const data = await getFlightData(flightNumber);

      // For demo/development, return mock data if API fails
      if (process.env.NODE_ENV === 'development' && !data) {
        return {
          prediction: {
            probability: 75,
            delay: 35,
          },
          details: {
            planeState: {
              currentLocation: 'ORD',
              status: 'On Time',
              flightTime: '2h 15m',
            },
            weather: {
              current: 'Clear',
              destination: 'Rain',
              impact: 'medium'
            }
          }
        };
      }

      return {
        prediction: {
          probability: data.probability || 0,
          delay: data.estimatedDelay || 0,
        },
        details: {
          planeState: {
            currentLocation: data.currentLocation || 'Unknown',
            status: data.status || 'Unknown',
            flightTime: data.flightTime || 'N/A',
          },
          weather: {
            current: data.weather?.current || 'Unknown',
            destination: data.weather?.destination || 'Unknown',
            impact: data.weather?.impact || 'low'
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
