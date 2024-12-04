import React, { useState } from 'react';
import { useFlightService } from '../services/flightService';

const APITest = () => {
  const [testStatus, setTestStatus] = useState('');
  const { testConnection } = useFlightService();

  const runTest = async () => {
    setTestStatus('Testing...');
    try {
      const success = await testConnection();
      if (success) {
        setTestStatus('✅ Connection successful! API credentials are working.');
      } else {
        setTestStatus('❌ Connection failed. Please check your credentials.');
      }
    } catch (error) {
      setTestStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <button 
        onClick={runTest}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test API Connection
      </button>
      {testStatus && (
        <div className="mt-4 text-sm">
          Status: {testStatus}
        </div>
      )}
    </div>
  );
};

export default APITest;
