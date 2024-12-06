import React, { useState } from 'react';
import { Clock, ArrowRight, Cloud, Sun } from 'lucide-react';
import { useFlightService } from '../services/flightService';
import TermsModal from './TermsModal';

const FlightDelayPredictor = () => {
  const [prediction, setPrediction] = useState(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { getPrediction, loading, error } = useFlightService();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDetails(false);
    
    try {
      const result = await getPrediction(flightNumber);
      if (result) {
        setPrediction(result);
        setTimeout(() => setShowDetails(true), 500);
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        
        {!prediction ? (
          <div className="text-center">
            <h1 className="text-4xl mb-12 font-light">Will my flight be late?</h1>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full h-20 text-3xl text-center tracking-wide rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all font-light"
                placeholder="UA 123"
                maxLength="6"
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
            <TermsModal />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Main Prediction Band */}
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

            {/* Magic Expanding Details */}
            <div className={`transition-all duration-500 ${showDetails ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {/* Current Plane Status */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium text-gray-600">Current Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-500">{prediction.planeState.status}</span>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div 
                    className="absolute h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: '75%' }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <div>{prediction.planeState.currentLocation}</div>
                  <div>{prediction.planeState.flightTime} remaining</div>
                </div>
              </div>

              {/* Weather Impact */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Cloud className="h-5 w-5" />
                      <span>Weather Impact</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current</span>
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{prediction.weather.current}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Destination</span>
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{prediction.weather.destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setPrediction(null)}
                className="w-full p-4 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Check Another Flight
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightDelayPredictor;
