export interface WeatherInfo {
  current: string;
  destination: string;
  impact: string;
}

export interface PlaneState {
  currentLocation: string;
  inboundDelay: number;
  status: string;
  flightTime: string;
}

export interface PredictionPattern {
  lastWeek: number[];
  todayRank: number;
  trend: string;
}

export interface GateInfo {
  scheduled: string;
  likelihood: number;
  alternatives: string[];
}

export interface PredictionData {
  probability: number;
  delay: number;
  planeState: PlaneState;
  weather: WeatherInfo;
  pattern: PredictionPattern;
  gates: GateInfo;
}
