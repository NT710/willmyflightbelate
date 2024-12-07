import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cloud, Sun, Wind, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PredictionDetails = ({ prediction }) => {
  // Transform week data for chart
  const weekData = prediction.pattern.lastWeek.map((delay, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    delay
  }));

  return (
    <div className="space-y-6">
      {/* Historical Pattern Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Delay Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="day" />
                <YAxis unit="min" />
                <Tooltip 
                  formatter={(value) => [`${value} minutes`, 'Delay']}
                  labelStyle={{ color: 'black' }}
                />
                <Bar dataKey="delay" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Impact Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Weather Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span>Current</span>
                </div>
                <span className="font-medium">{prediction.weather.current}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  <span>Destination</span>
                </div>
                <span className="font-medium">{prediction.weather.destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5 text-gray-500" />
                  <span>Impact Level</span>
                </div>
                <span className={`font-medium ${
                  prediction.weather.impact === 'high' ? 'text-red-500' :
                  prediction.weather.impact === 'medium' ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {prediction.weather.impact.charAt(0).toUpperCase() + prediction.weather.impact.slice(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Prediction Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Confidence Score</span>
                  <span className="font-medium">{prediction.probability}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${prediction.probability}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Based on historical patterns and current conditions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionDetails;
