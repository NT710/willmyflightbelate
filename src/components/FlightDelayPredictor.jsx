import { useState } from 'react';

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        prediction: {
          probability: 75,
          delay: 35
        },
        details: {
          planeState: {
            currentLocation: 'ORD',
            status: 'On Time',
            flightTime: '2h 15m',
            colorClass: 'text-green-500',
            icon: 'plane',
            state: 'In Flight',
            message: 'Aircraft is operating normally'
          },
          weather: {
            departure: {
              conditions: 'Clear',
              temperature: 20,
              windSpeed: 5
            },
            arrival: {
              conditions: 'Rain',
              temperature: 15,
              windSpeed: 10
            }
          }
        }
      };
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
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
