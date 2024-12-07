// server/scripts/loadData.js
const axios = require('axios');
const csv = require('csv-parse');
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;

class DataLoader {
  constructor(mongoUri) {
    this.mongoUri = mongoUri;
    this.client = new MongoClient(mongoUri);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db('flightdelays');
    console.log('Connected to MongoDB');
  }

  async loadAirports() {
    console.log('Loading airports data...');
    
    try {
      // Download airports data
      const response = await axios.get('https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv');
      
      // Parse CSV
      const records = await new Promise((resolve, reject) => {
        csv.parse(response.data, {
          columns: true,
          skip_empty_lines: true
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      // Filter and transform data
      const airports = records
        .filter(record => 
          // Keep only large and medium airports
          record.type === 'large_airport' || record.type === 'medium_airport'
        )
        .map(record => ({
          iata_code: record.iata_code,
          name: record.name,
          city: record.municipality,
          country: record.iso_country,
          type: record.type,
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(record.longitude_deg),
              parseFloat(record.latitude_deg)
            ]
          },
          elevation_ft: parseInt(record.elevation_ft),
          timezone: record.timezone
        }))
        .filter(airport => airport.iata_code); // Only keep airports with IATA codes

      // Create indexes
      await this.db.collection('airports').createIndex({ iata_code: 1 }, { unique: true });
      await this.db.collection('airports').createIndex({ location: '2dsphere' });

      // Insert data
      const result = await this.db.collection('airports').bulkWrite(
        airports.map(airport => ({
          updateOne: {
            filter: { iata_code: airport.iata_code },
            update: { $set: airport },
            upsert: true
          }
        }))
      );

      console.log(`Processed ${airports.length} airports`);
      return result;
    } catch (error) {
      console.error('Error loading airports:', error);
      throw error;
    }
  }

  async loadHistoricalDelays() {
    console.log('Loading historical delay data...');
    
    try {
      // Get all airport pairs from your airports collection
      const airports = await this.db.collection('airports')
        .find({}, { projection: { iata_code: 1 } })
        .toArray();

      // Generate historical data for each route
      const historicalData = [];
      
      for (let i = 0; i < airports.length; i++) {
        for (let j = 0; j < airports.length; j++) {
          if (i === j) continue; // Skip same airport routes
          
          const departure = airports[i].iata_code;
          const arrival = airports[j].iata_code;
          
          // Generate 12 months of data for each route
          for (let month = 1; month <= 12; month++) {
            historicalData.push({
              route: `${departure}-${arrival}`,
              month,
              year: 2023,
              stats: {
                avgDelay: Math.floor(Math.random() * 45), // 0-45 minutes
                frequency: Math.random(), // 0-1 probability
                totalFlights: Math.floor(Math.random() * 1000) + 100
              },
              weather_impact: Math.random(), // 0-1 impact factor
              last_updated: new Date(),
              seasonal_factor: this.calculateSeasonalFactor(month),
              route_type: this.classifyRoute(departure, arrival)
            });
          }
        }
      }

      // Create indexes
      await this.db.collection('historical_delays').createIndex(
        { route: 1, month: 1, year: 1 },
        { unique: true }
      );

      // Insert data
      const result = await this.db.collection('historical_delays').bulkWrite(
        historicalData.map(record => ({
          updateOne: {
            filter: {
              route: record.route,
              month: record.month,
              year: record.year
            },
            update: { $set: record },
            upsert: true
          }
        }))
      );

      console.log(`Processed ${historicalData.length} historical records`);
      return result;
    } catch (error) {
      console.error('Error loading historical data:', error);
      throw error;
    }
  }

  calculateSeasonalFactor(month) {
    // Higher factors during typical high-traffic months
    const seasonalFactors = {
      1: 1.2,  // January (New Year)
      2: 1.0,
      3: 1.1,  // Spring Break
      4: 1.0,
      5: 1.1,  // Memorial Day
      6: 1.2,  // Summer
      7: 1.3,  // Peak Summer
      8: 1.2,  // Summer
      9: 1.0,
      10: 1.0,
      11: 1.2, // Thanksgiving
      12: 1.4  // Christmas
    };
    return seasonalFactors[month];
  }

  classifyRoute(departure, arrival) {
    // Simple classification - can be enhanced with actual airport data
    return {
      type: 'domestic', // or 'international'
      distance: 'medium', // 'short', 'medium', 'long'
      traffic: 'high' // 'low', 'medium', 'high'
    };
  }

  async close() {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Script execution
async function main() {
  const loader = new DataLoader(process.env.MONGODB_URI);
  
  try {
    await loader.connect();
    await loader.loadAirports();
    await loader.loadHistoricalDelays();
    console.log('Data loading completed successfully');
  } catch (error) {
    console.error('Data loading failed:', error);
  } finally {
    await loader.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = DataLoader;
