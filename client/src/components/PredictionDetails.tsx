import React from 'react';
import { Cloud, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PredictionData } from '../types/prediction';

interface PredictionDetailsProps {
  prediction: PredictionData;
}

const PredictionDetails: React.FC<PredictionDetailsProps> = ({ prediction }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last Week's Delays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-24 gap-1">
            {prediction.pattern.lastWeek.map((delay, i) => (
              <div 
                key={i}
                className="w-full bg-blue-100 rounded-t transition-all duration-1000"
                style={{ height: `${(delay / 45) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionDetails;
