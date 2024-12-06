import React, { useState, useEffect } from 'react';
import { Plane, ArrowRight, Clock, Sun, Cloud, AlertCircle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFlightService } from '../services/flightService';
import { TermsModal } from './TermsModal';

const FlightDelayPredictor = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { getPrediction, loading, error, clearError } = useFlightService();

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDetails(false);
    setPrediction(null);
    
    const result = await getPrediction(flightNumber);
    if (result) {
      setPrediction(result);
      setTimeout(() => setShowDetails(true), 500);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setFlightNumber('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </div>
            <button
              onClick={clearError}
              className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <RefreshCcw className="h-3 w-3" />
              Try again
            </button>
          </Alert>
        )}

        {!prediction ? (
          <div className="text-center">
            <h1 className="text-4xl mb-12 font-light">Will my flight be late?</h1>
            <form onSubmit={handleSubmit} className="relative" role="search" aria-label="Flight search">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full h-20 text-3xl text-center tracking-wide rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all font-light"
                placeholder="BA 178"
                maxLength="6"
                disabled={loading}
                aria-label="Flight number input"
              />
              <button
                type="submit"
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
                style={{ width: `${100 - prediction.prediction.probability}%` }}
              />
              <div className="relative text-white">
                <div className="text-5xl font-light">{prediction.prediction.delay}'</div>
                <div className="text-blue-100">predicted delay</div>
              </div>
              <div className="relative text-right text-white">
                <div className="text-3xl font-light">{prediction.prediction.probability}%</div>
                <div className="text-blue-100">confidence</div>
              </div>
            </div>

            <div className={`transition-all duration-500 ${showDetails ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium text-gray-600">Current Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-500">{prediction.details.planeState.status}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <div>{prediction.details.planeState.currentLocation}</div>
                  <div>{prediction.details.planeState.flightTime} remaining</div>
                </div>
              </div>

              <div className="p-6 border-b">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Cloud className="h-5 w-5" />
                      <span>Weather Impact</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current</span>
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{prediction.details.weather.current}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Destination</span>
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{prediction.details.weather.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full p-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Check Another Flight
            </button>
          </div>
        )}

        <TermsModal />
      </div>
    </div>
  );
};

export default FlightDelayPredictor;
