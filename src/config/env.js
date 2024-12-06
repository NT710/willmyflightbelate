// src/config/env.js
const env = {
  development: {
    API_URL: 'http://localhost:3001/api',
    USE_MOCK_DATA: true,
  },
  production: {
    API_URL: 'https://proxy.willmyflightbelate.com/api',
    USE_MOCK_DATA: false,
  },
  test: {
    API_URL: 'http://localhost:3001/api',
    USE_MOCK_DATA: true,
  }
};

const getEnvironmentConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  return env[environment];
};

export default getEnvironmentConfig();
