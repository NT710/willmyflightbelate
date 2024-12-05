import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert.jsx';

const APITest = () => {
  const [testStatus, setTestStatus] = useState({
    openSky: { status: 'pending', message: '' },
    weather: { status: 'pending', message: '' },
    loading: false
  });

  const testOpenSkyAPI = async () => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const response = await fetch(
        `https://opensky-network.org/api/flights/all?begin=${now - 3600}&end=${now}`,
        {
          headers: {
            'Authorization': `Basic ${btoa(`${process.env.REACT_APP_OPENSKY_USERNAME}:${process.env.REACT_APP_OPENSKY_PASSWORD}`)}`
          }
        }
      );

      if (response.status === 401) {
        return { status: 'error', message: 'Authentication failed. Check your OpenSky credentials.' };
      }
      
      if (response.status === 429) {
        return { status: 'error', message: 'Rate limit exceeded. Try again later.' };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { status: 'success', message: `Successfully fetched ${data.length} flights` };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message.includes('Failed to fetch') 
          ? 'Connection failed. Check your internet connection or API endpoint.'
          : error.message 
      };
    }
  };

  const testWeatherAPI = async () => {
    try {
      const response = await fetch(
        'https://api.weather.gov/points/40.6413,-73.7781'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { status: 'success', message: 'Successfully connected to Weather.gov API' };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message.includes('Failed to fetch')
          ? 'Connection failed. Check your internet connection or API endpoint.'
          : error.message 
      };
    }
  };

  const runTests = async () => {
    setTestStatus(prev => ({ ...prev, loading: true }));
    
    const [openSkyResult, weatherResult] = await Promise.all([
      testOpenSkyAPI(),
      testWeatherAPI()
    ]);

    setTestStatus({
      openSky: openSkyResult,
      weather: weatherResult,
      loading: false
    });
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    return null;
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">API Connection Test</h2>
        <button
          onClick={runTests}
          disabled={testStatus.loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          {testStatus.loading ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Run Tests
        </button>
      </div>

      <div className="space-y-4">
        <Alert className={`${testStatus.openSky.status === 'pending' ? 'bg-gray-50' : 
          testStatus.openSky.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(testStatus.openSky.status)}
            <AlertTitle>OpenSky Network API</AlertTitle>
          </div>
          <AlertDescription>
            {testStatus.openSky.message || 'Test not run yet'}
          </AlertDescription>
        </Alert>

        <Alert className={`${testStatus.weather.status === 'pending' ? 'bg-gray-50' : 
          testStatus.weather.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon(testStatus.weather.status)}
            <AlertTitle>Weather.gov API</AlertTitle>
          </div>
          <AlertDescription>
            {testStatus.weather.message || 'Test not run yet'}
          </AlertDescription>
        </Alert>
      </div>
      
      {(testStatus.openSky.status === 'error' || testStatus.weather.status === 'error') && (
        <Alert className="bg-yellow-50">
          <AlertTitle>Troubleshooting Tips</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>1. Check your OpenSky credentials in your environment variables</p>
            <p>2. Verify your internet connection</p>
            <p>3. Ensure you haven't exceeded API rate limits</p>
            <p>4. Check if the APIs are experiencing downtime</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default APITest;
