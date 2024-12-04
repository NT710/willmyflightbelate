import React, { useState } from 'react';
import { Clock, ArrowRight, Cloud, Sun, Wind, TrendingUp, TrendingDown, Check, AlertCircle, Plane, Settings } from 'lucide-react';
import { useFlightService } from '../services/flightService';
import APITest from './APITest';
import TermsModal from './TermsModal';

const FlightDelayPredictor = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApiTest, setShowApiTest] = useState(false);
  const { getPrediction, loading, error } = useFlightService();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDetails(false);
    
    const result = await getPrediction(flightNumber);
    if (result) {
      setPrediction(result);
      setTimeout(() => setShowDetails(true), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* API Test Toggle Button */}
        <button
          onClick={() => setShowApiTest(!showApiTest)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          aria-label="Toggle API Test"
        >
          <Settings className="h-6 w-6" />
        </button>

        {/* API Test Panel */}
        {showApiTest && (
          <div className="mb-8">
            <APITest />
          </div>
        )}

        {!prediction ? (
          <div className="text-center">
            <header>
              <h1 className="text-4xl mb-3 font-light">Will my flight be late?</h1>
              <p className="text-lg text-gray-600 mb-12">Add your flight number to find out</p>
            </header>
            <form onSubmit={handleSubmit} className="relative" role="search">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full h-20 text-3xl text-center tracking-wide rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all font-light"
                placeholder="UA 123"
                maxLength="7"
                aria-label="Flight number input"
              />
              <button
                disabled={loading || !flightNumber}
                className={`absolute right-3 top-3 bottom-3 px-6 rounded-xl 
                  ${loading ? 'bg-gray-200' : 'bg-blue-500 hover:bg-blue-600'} 
                  text-white transition-all`}
              >
                {loading ? (
                  <Clock className="h-6 w-6 animate-spin" />
                ) : (
                  <ArrowRight className="h-6 w-6" />
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 text-red-500">{error}</div>
            )}
          </div>
        ) : (
          // ... rest of your existing prediction view code ...
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* ... existing prediction content ... */}
          </div>
        )}
        <TermsModal />
      </div>
    </div>
  );
};

export default FlightDelayPredictor;
