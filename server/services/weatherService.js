const axios = require('axios');

class WeatherService {
  constructor() {
    this.baseUrl = 'http://api.weatherstack.com/';
  }

  async getAirportWeather(airport) {
    try {
      const response = await axios.get(`${this.baseUrl}current`, {
        params: {
          access_key: process.env.WEATHERSTACK_KEY,
          query: airport, // Weatherstack accepts IATA codes directly
          units: 'm'     // Metric units
        }
      });
      
      // Transform the response to our standard format
      const data = response.data;
      return {
        location: {
          name: data.location.name,
          country: data.location.country,
          lat: data.location.lat,
          lon: data.location.lon,
          localtime: data.location.localtime
        },
        current: {
          temperature: data.current.temperature,
          weather: data.current.weather_descriptions[0],
          wind_speed: data.current.wind_speed,
          wind_direction: data.current.wind_dir,
          precipitation: data.current.precip,
          humidity: data.current.humidity,
          visibility: data.current.visibility,
          is_day: data.current.is_day
        }
      };
    } catch (error) {
      console.error('Weather data fetch error:', error);
      throw error;
    }
  }

  async getFlightWeather(departure, arrival) {
    try {
      const [departureWeather, arrivalWeather] = await Promise.all([
        this.getAirportWeather(departure),
        this.getAirportWeather(arrival)
      ]);

      return {
        departure: departureWeather,
        arrival: arrivalWeather,
        risk_level: this.calculateWeatherRisk(departureWeather, arrivalWeather)
      };
    } catch (error) {
      console.error('Flight weather fetch error:', error);
      throw error;
    }
  }

  calculateWeatherRisk(departure, arrival) {
    // Simple weather risk calculation
    let risk = 0;

    // Check visibility
    if (departure.current.visibility < 5 || arrival.current.visibility < 5) risk += 2;
    
    // Check precipitation
    if (departure.current.precipitation > 0 || arrival.current.precipitation > 0) risk += 2;
    
    // Check wind speed (over 20 km/h starts to matter)
    if (departure.current.wind_speed > 20 || arrival.current.wind_speed > 20) risk += 1;

    // Return risk level
    if (risk >= 4) return 'high';
    if (risk >= 2) return 'medium';
    return 'low';
  }
}

module.exports = WeatherService;
