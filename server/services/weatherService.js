const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHERSTACK_KEY;
    this.baseUrl = 'http://api.weatherstack.com/current';
  }

  async getAirportWeather(airportCode) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          access_key: this.apiKey,
          query: airportCode,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  }
}

module.exports = new WeatherService();
