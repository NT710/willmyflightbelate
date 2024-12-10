// FlightDelayPredictor.tsx
import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import PredictionDetails from './PredictionDetails';
import Alert from './alert';

const FlightDelayPredictor: FC = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchPrediction = async () => {
    try {
      const response = await fetch(`/api/predictions/${flightNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Flight Delay Predictor</h1>
      <input
        type="text"
        value={flightNumber}
        onChange={(e) => setFlightNumber(e.target.value)}
        placeholder="Enter flight number"
      />
      <button onClick={fetchPrediction}>Get Prediction</button>
      {error && <Alert message={error} type="error" />}
      {prediction && (
        <PredictionDetails
          flight={prediction.flight}
          probability={prediction.probability}
          delay={prediction.delay}
          factors={prediction.factors}
        />
      )}
    </div>
  );
};

export default FlightDelayPredictor;
