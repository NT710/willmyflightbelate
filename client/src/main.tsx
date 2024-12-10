// main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import FlightDelayPredictor from './FlightDelayPredictor';
import './index.css'; // Assuming global CSS is present

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container missing in index.html');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <FlightDelayPredictor />
  </React.StrictMode>
);
