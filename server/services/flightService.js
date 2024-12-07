const axios = require('axios');

class FlightService {
  constructor() {
    this.baseUrl = 'http://api.aviationstack.com/v1/';
  }

  async getFlightData(flightNumber) {
    try {
      const response = await axios.get(`${this.baseUrl}flights`, {
        params: {
          access_key: process.env.AVIATION_STACK_KEY,
          flight_iata: flightNumber
        }
      });
      return response.data;
    } catch (error) {
      console.error('Flight data fetch error:', error);
      throw error;
    }
  }
}

module.exports = FlightService;
