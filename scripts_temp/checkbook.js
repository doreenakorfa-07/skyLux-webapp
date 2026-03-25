const { MongoClient } = require('mongodb');

async function checkBookings() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('airline_db');
    
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log("All Bookings:", JSON.stringify(bookings, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkBookings();
