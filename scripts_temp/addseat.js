const { MongoClient } = require('mongodb');

async function addSeatFlight() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('airline_db');
    const flights = db.collection('flights');

    const oneSeatFlight = {
      flightNumber: "SL-VIP1",
      origin: "London",
      destination: "New York",
      departureTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
      arrivalTime: new Date(Date.now() + 86400000 * 2 + 3600000 * 8), // +8 hours
      price: 9999.0,
      totalSeats: 1,
      availableSeats: 1,
      totalSeatsByClass: {
        FIRST: 1,
        BUSINESS: 0,
        PREMIUM_ECONOMY: 0,
        ECONOMY: 0
      },
      availableSeatsByClass: {
        FIRST: 1,
        BUSINESS: 0,
        PREMIUM_ECONOMY: 0,
        ECONOMY: 0
      },
      _class: "com.airline.entity.Flight"
    };

    // Upsert the flight
    await flights.updateOne(
      { flightNumber: "SL-VIP1" },
      { $set: oneSeatFlight },
      { upsert: true }
    );

    console.log("Successfully added the exclusive 1-seat flight SL-VIP1 from London to New York!");

  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await client.close();
  }
}

addSeatFlight();
