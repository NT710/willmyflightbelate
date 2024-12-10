import React, { useState, useEffect } from 'react';
import { FC } from 'react';
import PredictionDetails from './PredictionDetails';

type FlightData = {
  flight: string;
  probability: number;
  delay: string;
  factors: string[];
};

const FlightDelayPredictor: FC = () => {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Example fetch logic for demonstration purposes
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/flight-predictor');
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }
        const data: FlightData = await response.json();
        setFlightData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading flight data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Flight Delay Predictor</h1>
      {flightData ? (
        <PredictionDetails
          flight={flightData.flight}
          probability={flightData.probability}
          delay={flightData.delay}
          factors={flightData.factors}
        />
      ) : (
        <p>No flight data available.</p>
      )}
    </div>
  );
};

export default FlightDelayPredictor;
