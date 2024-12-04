import React from 'react';
import FlightDelayPredictor from './components/FlightDelayPredictor';
import APITest from './components/APITest';

function App() {
  return (
    <div>
      <APITest /> {/* Add this temporarily */}
      <FlightDelayPredictor />
    </div>
  );
}

export default App;
