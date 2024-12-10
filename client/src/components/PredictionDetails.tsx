// PredictionDetails.tsx
import React from 'react';
import type { FC } from 'react';
import './PredictionDetails.css'; // Assuming CSS for styling is present

type PredictionDetailsProps = {
  flight: string;
  probability: number;
  delay: number;
  factors: Record<string, any>;
};

const PredictionDetails: FC<PredictionDetailsProps> = ({ flight, probability, delay, factors }) => {
  return (
    <div className="prediction-details">
      <div className="details-header">
        <h2>Flight Prediction Details</h2>
        <p>Flight Number: <span>{flight}</span></p>
      </div>
      <div className="details-main">
        <div className="prediction-stats">
          <p><strong>Probability of Delay:</strong> {probability}%</p>
          <p><strong>Estimated Delay:</strong> {delay} minutes</p>
        </div>
        <div className="factors-section">
          <h3>Influencing Factors</h3>
          <ul>
            {Object.entries(factors).map(([key, value]) => (
              <li key={key} className="factor-item">
                <strong>{key}</strong>: {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetails;
