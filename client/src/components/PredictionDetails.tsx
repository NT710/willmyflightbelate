import React, { FC } from 'react';

type PredictionDetailsProps = {
  flight: string;
  probability: number;
  delay: string;
  factors: string[];
};

const PredictionDetails: FC<PredictionDetailsProps> = ({ flight, probability, delay, factors }) => {
  return (
    <div className="prediction-details">
      <h2>Details for Flight {flight}</h2>
      <p>Probability of Delay: {probability}%</p>
      <p>Expected Delay: {delay}</p>
      <p>
        Contributing Factors:
        <ul>
          {factors.map((factor, index) => (
            <li key={index}>{factor}</li>
          ))}
        </ul>
      </p>
    </div>
  );
};

export default PredictionDetails;
