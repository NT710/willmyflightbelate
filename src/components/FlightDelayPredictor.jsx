import React, { useState } from 'react';
import { Clock, ArrowRight, Cloud, Sun, Wind, TrendingUp, TrendingDown, Check, AlertCircle, Plane } from 'lucide-react';
import { useFlightService } from '../services/flightService';
import TermsModal from './components/TermsModal';

const FlightDelayPredictor = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
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
                <div className="text-blue-100">probability</div>
              </div>
            </div>

            <div className={`transition-all duration-500 ${showDetails ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {/* Status Section */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium text-gray-600">Current Status</div>
                  <div className="flex items-center gap-2">
                    <div className={prediction.details.planeState.colorClass}>
                      {prediction.details.planeState.icon === 'plane' ? <Plane className="h-6 w-6" /> :
                       prediction.details.planeState.icon === 'trending-up' ? <TrendingUp className="h-6 w-6" /> :
                       prediction.details.planeState.icon === 'trending-down' ? <TrendingDown className="h-6 w-6" /> :
                       <Check className="h-6 w-6" />}
                    </div>
                    <span className="text-sm text-gray-500">{prediction.details.planeState.state}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{prediction.details.planeState.message}</p>
              </div>

              {/* Weather Section */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-gray-600 mb-2">Current Weather</div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">{prediction.details.weather.departure.conditions}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600 mb-2">Destination</div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-blue-500" />
                      <span className="text-sm">{prediction.details.weather.arrival.conditions}</span>
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
          </div>
        )}
        <TermsModal />
      </div>
    </div>
  );
};

export default FlightDelayPredictor;
