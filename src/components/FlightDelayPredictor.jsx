import React, { useState } from 'react';
import { Clock, ArrowRight, Cloud, Sun, Wind } from 'lucide-react';

const FlightDelayPredictor = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const getPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowDetails(false);
    
    // Simulate API call - this will be replaced with real API calls later
    setTimeout(() => {
      setPrediction({
        probability: 65,
        delay: 25,
        planeState: {
          currentLocation: 'ORD',
          status: 'On Time',
          flightTime: '1h 45m',
        },
        weather: {
          current: 'Clear',
          destination: 'Rain',
          impact: 'medium'
        },
        pattern: {
          lastWeek: [10, 35, 15, 0, 20, 25, 5],
          todayRank: 2,
          trend: 'improving'
        },
        gates: {
          scheduled: 'B12',
          alternatives: ['B14', 'C2']
        }
      });
      setLoading(false);
      setTimeout(() => setShowDetails(true), 500);
    }, 1500);
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
            <form onSubmit={getPrediction} className="relative" role="search" aria-label="Flight search">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full h-20 text-3xl text-center tracking-wide rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all font-light"
                placeholder="UA 123"
                maxLength="6"
                aria-label="Flight number input"
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

            <div className={`transition-all duration-500 ${showDetails ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium text-gray-600">Current Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-500">{prediction.planeState.status}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <div>{prediction.planeState.currentLocation}</div>
                  <div>{prediction.planeState.flightTime} remaining</div>
                </div>
              </div>

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

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-600">Expected Gate</div>
                    <div className="text-2xl mt-1">{prediction.gates.scheduled}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Alternatives</div>
                    <div className="text-sm mt-1">
                      {prediction.gates.alternatives.join(', ')}
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
