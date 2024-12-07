// scripts/airportDataProcessor.js
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function processAirports() {
  console.log('Starting airport data processing...');
  let client;
  
  try {
    console.log('Downloading airport data from ourairports.com...');
    const response = await fetch('https://ourairports.com/data/airports.csv');
    const data = await response.text();
    
    console.log('Parsing CSV data...');
    const rows = data.split('\n').map(row => row.split(','));
    const headers = rows[0];
    
    const iataIndex = headers.findIndex(h => h === '"iata_code"');
    const nameIndex = headers.findIndex(h => h === '"name"');
    const latIndex = headers.findIndex(h => h === '"latitude_deg"');
    const lonIndex = headers.findIndex(h => h === '"longitude_deg"');
    const typeIndex = headers.findIndex(h => h === '"type"');
    
    console.log('Filtering and processing airports...');
    const airports = rows.slice(1)
      .filter(row => {
        const iata = row[iataIndex]?.replace(/"/g, '');
        const type = row[typeIndex]?.replace(/"/g, '');
        return iata && iata.length === 3 && 
               (type.includes('large_airport') || type.includes('medium_airport'));
      })
      .map(row => ({
        iata: row[iataIndex].replace(/"/g, ''),
        name: row[nameIndex].replace(/"/g, ''),
        location: {
          type: "Point",
          coordinates: [
            parseFloat(row[lonIndex]),
            parseFloat(row[latIndex])
          ]
        }
      }));

    console.log(`Found ${airports.length} valid airports to process`);

    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DBNAME);
    
    console.log('Creating indexes...');
    await db.collection('airports').createIndex({ iata: 1 }, { unique: true });
    await db.collection('airports').createIndex({ location: "2dsphere" });
    
    console.log('Upserting airport data...');
    const operations = airports.map(airport => ({
      updateOne: {
        filter: { iata: airport.iata },
        update: { $set: airport },
        upsert: true
      }
    }));
    
    const result = await db.collection('airports').bulkWrite(operations);
    
    console.log('\nProcessing complete!');
    console.log('-------------------');
    console.log(`Total airports processed: ${airports.length}`);
    console.log(`New airports inserted: ${result.upsertedCount}`);
    console.log(`Existing airports updated: ${result.modifiedCount}`);
    console.log(`Unchanged airports: ${airports.length - (result.upsertedCount + result.modifiedCount)}`);

    // Print first 5 airports as sample
    console.log('\nSample of processed airports:');
    const sampleAirports = await db.collection('airports')
      .find()
      .limit(5)
      .toArray();
    console.log(sampleAirports);

    return {
      status: 'success',
      processed: airports.length,
      inserted: result.upsertedCount,
      modified: result.modifiedCount
    };
  } catch (error) {
    console.error('Error processing airports:', error);
    return {
      status: 'error',
      message: error.message
    };
  } finally {
    if (client) {
      console.log('Closing MongoDB connection...');
      await client.close();
    }
  }
}

// Execute the function
processAirports()
  .then(result => {
    console.log('Final result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
