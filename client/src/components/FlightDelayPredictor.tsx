import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, Cloud, Sun, Wind, AlertCircle } from 'lucide-react';

// Using relative imports instead of @ alias
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

const PredictionDetails = ({ prediction }) => {
  return (
    <div className="space-y-6">
      {/* Weather Impact */}
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
        <div className="flex items-center justify-center">
          <div className="text-4xl font-light text-yellow-500">
            {prediction.pattern.todayRank}
            <span className="text-sm text-gray-400">/7</span>
          </div>
        </div>
      </div>

      {/* Weekly Pattern */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium text-gray-600">Last Week's Delays</div>
          <div className="text-sm text-green-500">Trend: {prediction.pattern.trend}</div>
        </div>
        <div className="flex items-end justify-between h-24 gap-1">
          {prediction.pattern.lastWeek.map((delay, i) => (
            <div 
              key={i}
              className="w-full bg-blue-100 rounded-t transition-all duration-1000"
              style={{ 
                height: `${(delay / 45) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>
      </div>

      {/* Gate Information */}
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
  );
};

const FlightDelayPredictor = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const validateFlightNumber = (input) => {
    const airlineCode = input.substring(0, 2);
    const flightNum = input.substring(2).trim();
    
    if (!/^[A-Z]{2}$/i.test(airlineCode)) {
      return "Please enter a valid airline code (e.g., UA, AA)";
    }
    if (!/^\d{1,4}$/.test(flightNum)) {
      return "Please enter a valid flight number (1-4 digits)";
    }
    return "";
  };

  const handleFlightNumberChange = (e) => {
    const input = e.target.value.toUpperCase();
    setFlightNumber(input);
    setValidationError(validateFlightNumber(input));
  };

  useEffect(() => {
    let interval;
    if (prediction) {
      interval = setInterval(() => {
        getPrediction(null, true);
        setLastUpdateTime(new Date().toLocaleTimeString());
      }, 300000); // 5 minutes
    }
    return () => clearInterval(interval);
  }, [prediction]);

  const getPrediction = async (e, isAutoRefresh = false) => {
    if (e) e.preventDefault();
    if (!isAutoRefresh) setLoading(true);
    setShowDetails(false);
    
    setTimeout(() => {
      setPrediction({
        probability: 75,
        delay: 35,
        planeState: {
          currentLocation: 'ORD',
          inboundDelay: 25,
          status: 'Landing',
          flightTime: '2h 15m',
        },
        weather: {
          current: 'Clear',
          destination: 'Rain',
          impact: 'medium'
        },
        pattern: {
          lastWeek: [15, 45, 20, 0, 30, 25, 10],
          todayRank: 3,
          trend: 'improving'
        },
        gates: {
          scheduled: 'A12',
          likelihood: 85,
          alternatives: ['A14', 'B2']
        }
      });
      setLoading(false);
      setLastUpdateTime(new Date().toLocaleTimeString());
      if (!isAutoRefresh) setTimeout(() => setShowDetails(true), 500);
    }, isAutoRefresh ? 500 : 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!prediction ? (
          <div className="text-center">
            <h1 className="text-4xl mb-6 font-light">Will my flight be late?</h1>
            <p className="text-lg text-gray-600 mb-8">Add your flight number to find out</p>
            
            <form onSubmit={getPrediction} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={flightNumber}
                  onChange={handleFlightNumberChange}
                  className="w-full h-20 text-3xl text-center tracking-wide rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-all font-light"
                  placeholder="UA 123"
                  maxLength="6"
                />
                <button
                  disabled={loading || !flightNumber || validationError}
                  className={`absolute right-3 top-3 bottom-3 px-6 rounded-xl 
                    ${loading || validationError ? 'bg-gray-200' : 'bg-blue-500 hover:bg-blue-600'} 
                    text-white transition-all`}
                >
                  {loading ? (
                    <Clock className="h-6 w-6 animate-spin" />
                  ) : (
                    <ArrowRight className="h-6 w-6" />
                  )}
                </button>
              </div>
              
              {validationError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Invalid Flight Number</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {lastUpdateTime && (
              <div className="text-xs text-gray-500 text-center pt-2">
                Last updated: {lastUpdateTime}
              </div>
            )}
            
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

            <div className={`transition-all duration-500 ${showDetails ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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

              <div className="p-6">
                <PredictionDetails prediction={prediction} />
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
