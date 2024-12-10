import React from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <h1>Flight Delay Predictor</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

function Home() {
  return <h2>Welcome to the Flight Delay Predictor</h2>;
}

function About() {
  return <h2>About This Application</h2>;
}

export default App;
