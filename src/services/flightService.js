// src/services/flightService.js
import { useState } from 'react';

// Add your OpenSky credentials
const OPENSKY_CREDENTIALS = {
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD'
};

export const useFlightService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get flight data from OpenSky
  const getFlightData = async (flightNumber) => {
    const now = Math.floor(Date.now() / 1000);
    const past = now - 7200; // 2 hours ago

    try {
      // Create base64 encoded credentials
      const auth = btoa(`${OPENSKY_CREDENTIALS.username}:${OPENSKY_CREDENTIALS.password}`);
      
      const response = await fetch(
        `https://opensky-network.org/api/flights/all?begin=${past}&end=${now}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      
      // Find matching flight
      const flight = data.find(f => 
        f.callsign?.replace(/\s+/g, '').includes(flightNumber.replace(/\s+/g, ''))
      );

      if (!flight) {
        throw new Error('Flight not found');
      }

      return flight;
    } catch (error) {
      console.error('Error fetching flight data:', error);
      throw error;
    }
  };

  // Get weather data from weather.gov
  const getWeatherData = async (airport) => {
    try {
      // First, get airport coordinates
      const airportData = await getAirportCoordinates(airport);
      
      // Then get weather for those coordinates
      const response = await fetch(
        `https://api.weather.gov/points/${airportData.latitude},${airportData.longitude}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather point');
      }

      const pointData = await response.json();
      
      // Get forecast for the location
      const forecastResponse = await fetch(pointData.properties.forecast);
      
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast');
      }

      const forecastData = await forecastResponse.json();
      
      return {
        conditions: forecastData.properties.periods[0].shortForecast,
        temperature: forecastData.properties.periods[0].temperature,
        windSpeed: forecastData.properties.periods[0].windSpeed,
        windDirection: forecastData.properties.periods[0].windDirection
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  };

  // Simple airport coordinates lookup (you might want to use a more complete database)
  const getAirportCoordinates = async (airportCode) => {
    // This is a simplified example. In production, you'd want a proper airport database
    const airports = {
      'JFK': { latitude: 40.6413, longitude: -73.7781 },
      'LAX': { latitude: 33.9416, longitude: -118.4085 },
      'ORD': { latitude: 41.9742, longitude: -87.9073 },
      // Add more airports as needed
    };

    const airport = airports[airportCode];
    if (!airport) {
      throw new Error('Airport not found');
    }

    return airport;
  };

  // Main prediction function
  const getPrediction = async (flightNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get flight data
      const flightData = await getFlightData(flightNumber);
      
      // Get weather for both departure and arrival
      const [departureWeather, arrivalWeather] = await Promise.all([
        getWeatherData(flightData.estDepartureAirport),
        getWeatherData(flightData.estArrivalAirport)
      ]);

      // Calculate prediction
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
