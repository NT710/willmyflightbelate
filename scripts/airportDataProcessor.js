// airportDataProcessor.js
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

async function processAirports() {
  try {
    // Download the CSV file
    const response = await fetch('https://ourairports.com/data/airports.csv');
    const data = await response.text();
    
    // Parse CSV (simple parsing, no external library needed)
    const rows = data.split('\n').map(row => row.split(','));
    const headers = rows[0];
    
    // Find the indexes of the columns we want
    const iataIndex = headers.findIndex(h => h === '"iata_code"');
    const nameIndex = headers.findIndex(h => h === '"name"');
    const latIndex = headers.findIndex(h => h === '"latitude_deg"');
    const lonIndex = headers.findIndex(h => h === '"longitude_deg"');
    const typeIndex = headers.findIndex(h => h === '"type"');
    
    // Process airports
    const airports = rows.slice(1)
      .filter(row => {
        // Only keep airports with IATA codes and that are large/medium airports
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

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DBNAME);
    
    // Create indexes if they don't exist
    await db.collection('airports').createIndex({ iata: 1 }, { unique: true });
    await db.collection('airports').createIndex({ location: "2dsphere" });
    
    // Bulk upsert the airports
    const operations = airports.map(airport => ({
      updateOne: {
        filter: { iata: airport.iata },
        update: { $set: airport },
        upsert: true
      }
    }));
    
    const result = await db.collection('airports').bulkWrite(operations);
    
    await client.close();
    
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
  }
}

export default processAirports;
