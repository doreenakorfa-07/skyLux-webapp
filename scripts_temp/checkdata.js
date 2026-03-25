const { MongoClient } = require('mongodb');

async function checkData() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('airline_db');
    
    const usersCount = await db.collection('users').countDocuments();
    const flightsCount = await db.collection('flights').countDocuments();
    const bookingsCount = await db.collection('bookings').countDocuments();
    const paymentsCount = await db.collection('payments').countDocuments();

    console.log(`Users: ${usersCount}`);
    console.log(`Flights: ${flightsCount}`);
    console.log(`Bookings: ${bookingsCount}`);
    console.log(`Payments: ${paymentsCount}`);

    if (bookingsCount > 0) {
        const firstBooking = await db.collection('bookings').findOne();
        console.log("Sample Booking:", JSON.stringify(firstBooking, null, 2));
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkData();
