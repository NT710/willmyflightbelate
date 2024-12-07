// client/src/components/PredictionDetails.tsx
import React from 'react';
import { Plane, Cloud, Sun, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Types for better TypeScript support
interface Journey {
  airport: string;
  time: string;
  status: string;
  delay: number;
}

interface PredictionData {
  probability: number;
  delay: number;
  planeState: {
    currentLocation: string;
    status: string;
    flightTime: string;
    journeyToday: Journey[];
  };
  weather: {
    current: string;
    destination: string;
    impact: string;
  };
  gates: {
    scheduled: string;
    likelihood: number;
    alternatives: string[];
  };
}

interface PredictionDetailsProps {
  prediction: PredictionData;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ prediction }) => {
  // Helper function to get delay explanation
  const getDelayExplanation = (delay: number, confidence: number) => {
    if (delay === 0) {
      return "Looks like your lucky day! This flight's running as smooth as butter.";
    }
    if (delay <= 15) {
      return "Just a tiny hiccup - enough time to grab a coffee, but not enough to stress about.";
    }
    if (delay <= 30 && confidence > 70) {
      return "We're pretty confident about this delay. The plane's been playing hopscotch with time zones all day.";
    }
    if (delay <= 45) {
      return "Between the weather and this plane's earlier adventures today, we're looking at a bit of a wait. Maybe time to find that good book in your bag?";
    }
    return "This one's definitely running behind schedule. Might want to let your dinner plans know they'll need to scoot back a bit.";
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    if (status === 'On Time') return 'text-green-500';
    if (status === 'Delayed') return 'text-red-500';
    return 'text-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Current Flight Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-gray-600">Current Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className={`text-sm ${getStatusColor(prediction.planeState.status)}`}>
                {prediction.planeState.status}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <div>{prediction.planeState.currentLocation}</div>
            <div>{prediction.planeState.flightTime} remaining</div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Today's Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prediction.planeState.journeyToday.map((stop, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stop.airport}</span>
                    <span className={`text-sm ${getStatusColor(stop.status)}`}>
                      {stop.status}
                      {stop.delay > 0 && ` (+${stop.delay}min)`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{stop.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gate Information */}
      <Card>
        <CardHeader>
          <CardTitle>Gate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-gray-600">Expected Gate</div>
              <div className="text-2xl mt-1">{prediction.gates.scheduled}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Alternatives</div>
              <div className="text-sm mt-1">
                {prediction.gates.alternatives.join(', ')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Information */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-gray-500">Current</div>
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span>{prediction.weather.current}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-500">Destination</div>
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                <span>{prediction.weather.destination}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delay Explanation */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-gray-600">
            {getDelayExplanation(prediction.delay, prediction.probability)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionDetails;
