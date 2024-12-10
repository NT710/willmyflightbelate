import { FC } from 'react';

type PredictionDetailsProps = {
  flight: string;
  probability: number;
  delay: number;
  factors: Record<string, any>;
};

const PredictionDetails: FC<PredictionDetailsProps> = ({ flight, probability, delay, factors }) => {
  return (
    <div className="prediction-details">
      <h2>Details for Flight {flight}</h2>
      <p>Probability of delay: {probability}%</p>
      <p>Estimated delay: {delay} minutes</p>
      <h3>Factors</h3>
      <ul>
        {Object.entries(factors).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PredictionDetails;
