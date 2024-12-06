import React, { useState } from 'react';
import { Clock, ArrowRight, Cloud, Sun } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const FlightDelayPredictor = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);

  const getPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowDetails(false);
    setError(null);
    
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flightNumber })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }

      const data = await response.json();
      setPrediction(data);
      setTimeout(() => setShowDetails(true), 500);
    } catch (err) {
      setError('Unable to fetch flight data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!prediction ? (
          <div className="text-center">
            <h1 className="text-4xl mb-12 font-light">Will my flight be late?</h1>
            <form onSubmit={getPrediction} className="relative">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full h-20 text-3xl text-center tracking-wide rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all font-light"
                placeholder="UA 123"
                maxLength="6"
                disabled={loading}
              />
              <button
                disabled={loading || !flightNumber}
                className={`absolute right-3 top-3 bottom-3 px-6 rounded-xl 
                  ${loading ? 'bg-gray-200' : 'bg-blue-500 hover:bg-blue-600'} 
                  text-white transition-all`}
                aria-label={loading ? "Loading prediction" : "Get prediction"}
              >
                {loading ? (
                  <Clock className="h-6 w-6 animate-spin" />
                ) : (
                  <ArrowRight className="h-6 w-6" />
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between px-8 overflow-hidden">
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transition-transform duration-1000 
                  ${showDetails ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ width: `${100 - prediction.probability}%` }}
              />
              <div className="relative text-white">
                <div className="text-5xl font-light">{prediction.delay}'</div>
                <div className="text-blue-100">predicted delay</div>
              </div>
              <div className="relative text-right text-white">
                <div className="text-3xl font-light">{prediction.probability}%</div>
                <div className="text-blue-100">confidence</div>
              </div>
            </div>

            {/* Weather Information */}
            <div className={`transition-all duration-500 ${showDetails ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 border-b">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Cloud className="h-5 w-5" />
                      <span>Current Weather</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>{prediction.weather?.current || 'Clear'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-2">Destination</div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-blue-500" />
                      <span>{prediction.weather?.destination || 'Clear'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPrediction(null)}
              className="w-full p-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Check Another Flight
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightDelayPredictor;
