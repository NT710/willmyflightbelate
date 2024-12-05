import { createRequire } from 'module';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testOpenSkyAPI() {
  try {
    const now = Math.floor(Date.now() / 1000);
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (!username || !password) {
      return {
        success: false,
        message: 'OpenSky credentials not found in environment variables'
      };
    }

    const response = await fetch(
      `https://opensky-network.org/api/flights/all?begin=${now - 3600}&end=${now}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
      }
    );

    if (response.status === 401) {
      return {
        success: false,
        message: 'OpenSky authentication failed. Check credentials.'
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        message: 'OpenSky rate limit exceeded. Try again later.'
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully connected to OpenSky API. Retrieved ${data.length} flights.`
    };

  } catch (error) {
    return {
      success: false,
      message: `OpenSky API error: ${error.message}`
    };
  }
}

async function testWeatherAPI() {
  try {
    // Testing with JFK airport coordinates
    const response = await fetch('https://api.weather.gov/points/40.6413,-73.7781');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();
    return {
      success: true,
      message: 'Successfully connected to Weather.gov API'
    };

  } catch (error) {
    return {
      success: false,
      message: `Weather API error: ${error.message}`
    };
  }
}

async function runTests() {
  console.log('Testing API connections...\n');

  // Test OpenSky API
  const openSkyResult = await testOpenSkyAPI();
  console.log('OpenSky API Test:');
  console.log('Status:', openSkyResult.success ? 'SUCCESS ✅' : 'FAILED ❌');
  console.log('Message:', openSkyResult.message);
  console.log();

  // Test Weather API
  const weatherResult = await testWeatherAPI();
  console.log('Weather.gov API Test:');
  console.log('Status:', weatherResult.success ? 'SUCCESS ✅' : 'FAILED ❌');
  console.log('Message:', weatherResult.message);
}

// Run the tests
runTests();
