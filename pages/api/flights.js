export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { flightNumber } = req.body;
    
    if (!flightNumber) {
      return res.status(400).json({ error: 'Flight number is required' });
    }

    // Get credentials from environment variables
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (!username || !password) {
      console.error('Missing OpenSky credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Calculate time window
    const now = Math.floor(Date.now() / 1000);
    const twoHoursAgo = now - 7200; // 2 hours in seconds

    // Create base64 credentials
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    console.log('Fetching from OpenSky API...');
    
    const response = await fetch(
      `https://opensky-network.org/api/flights/all?begin=${twoHoursAgo}&end=${now}`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 401) {
      console.error('OpenSky authentication failed');
      return res.status(500).json({ error: 'Failed to authenticate with flight data provider' });
    }

    if (!response.ok) {
      console.error('OpenSky API error:', response.statusText);
      return res.status(500).json({ error: 'Failed to fetch flight data' });
    }

    const data = await response.json();
    
    // Find the specific flight
    const flight = data.find(f => 
      f.callsign?.replace(/\s+/g, '').includes(flightNumber.replace(/\s+/g, ''))
    );

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Transform flight data into prediction format
    const prediction = {
      probability: 75, // Example value
      delay: 35, // Example value
      currentLocation: flight.estDepartureAirport,
      status: 'On Time',
      flightTime: '2h 15m',
      weather: {
        current: 'Clear',
        destination: 'Clear'
      }
    };

    return res.status(200).json(prediction);

  } catch (error) {
    console.error('Flight API error:', error);
    return res.status(500).json({ error: 'Failed to process flight data' });
  }
}
