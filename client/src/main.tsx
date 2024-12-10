import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import FlightDelayPredictor from './FlightDelayPredictor';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container missing in index.html');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <FlightDelayPredictor />
  </StrictMode>
);
