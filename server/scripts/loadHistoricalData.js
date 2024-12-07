// server/scripts/loadHistoricalData.js
const axios = require('axios');
const csv = require('csv-parse');
const { MongoClient } = require('mongodb');
const stream = require('stream');
const { promisify } = require('util');

class HistoricalDataLoader {
  constructor(mongoUri) {
    this.mongoUri = mongoUri;
    this.client = new MongoClient(mongoUri);
    this.btsUrl = 'https://transtats.bts.gov/PREZIP/On_Time_Reporting_Carrier_On_Time_Performance_1987_present_2023_12.zip';
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db('flightdelays');
    console.log('Connected to MongoDB');
  }

  async fetchAndProcessData() {
    try {
      console.log('Fetching BTS data...');
      const response = await axios({
        method: 'get',
        url: this.btsUrl,
        responseType: 'stream'
      });

      // Process the CSV stream
      const records = [];
      await new Promise((resolve, reject) => {
        response.data
          .pipe(csv({
            columns: true,
            skip_empty_lines: true
          }))
          .on('data', (data) => {
            const processed = this.processRecord(data);
            if (processed) records.push(processed);
          })
          .on('end', () => resolve())
          .on('error', reject);
      });

      console.log(`Processed ${records.length} records`);
      return this.saveToMongoDB(records);
    } catch (error) {
      console.error('Error fetching and processing data:', error);
      throw error;
    }
  }

  processRecord(record) {
    // Extract relevant fields and transform data
    try {
      return {
        route: `${record.ORIGIN}-${record.DEST}`,
        month: parseInt(record.MONTH),
        year: parseInt(record.YEAR),
        stats: {
          avgDelay: parseFloat(record.ARR_DELAY) || 0,
          frequency: this.calculateFrequency(record),
          totalFlights: parseInt(record.FLIGHTS) || 1,
          cancelled: parseInt(record.CANCELLED) || 0,
          diverted: parseInt(record.DIVERTED) || 0
        },
        delays: {
          carrier: parseFloat(record.CARRIER_DELAY) || 0,
          weather: parseFloat(record.WEATHER_DELAY) || 0,
          nas: parseFloat(record.NAS_DELAY) || 0,
          security: parseFloat(record.SECURITY_DELAY) || 0,
          lateAircraft: parseFloat(record.LATE_AIRCRAFT_DELAY) || 0
        },
        carriers: record.OP_CARRIER,
        last_updated: new Date()
      };
    } catch (error) {
      console.error('Error processing record:', error);
      return null;
    }
  }

  calculateFrequency(record) {
    const total = parseInt(record.FLIGHTS) || 1;
    const onTime = total - (parseInt(record.CANCELLED) || 0) - (parseInt(record.DIVERTED) || 0);
    return (onTime / total) * 100;
  }

  async saveToMongoDB(records) {
    try {
      // Create indexes if they don't exist
      await this.db.collection('historical_delays').createIndex(
        { route: 1, month: 1, year: 1 },
        { unique: true }
      );

      // Batch upsert operations
      const operations = records.map(record => ({
        updateOne: {
          filter: {
            route: record.route,
            month: record.month,
            year: record.year
          },
          update: { $set: record },
          upsert: true
        }
      }));

      // Execute in batches of 500
      const batchSize = 500;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        await this.db.collection('historical_delays').bulkWrite(batch);
        console.log(`Processed batch ${i / batchSize + 1} of ${Math.ceil(operations.length / batchSize)}`);
      }

      return {
        success: true,
        recordsProcessed: records.length
      };
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
      throw error;
    }
  }

  async close() {
    await this.client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Script execution
async function main() {
  const loader = new HistoricalDataLoader(process.env.MONGODB_URI);
  
  try {
    await loader.connect();
    await loader.fetchAndProcessData();
    console.log('Historical data loading completed successfully');
  } catch (error) {
    console.error('Historical data loading failed:', error);
  } finally {
    await loader.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = HistoricalDataLoader;
