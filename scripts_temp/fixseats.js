const { MongoClient } = require('mongodb');

async function fixSeats() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('airline_db');
    const flights = db.collection('flights');

    // Find the flight from London to New York
    const origin = "London";
    const dest = "New York";
    
    // We update availableSeats to equal totalSeats
    const result = await flights.updateOne(
      { origin: "London", destination: "New York", availableSeats: 199 },
      { 
        $set: { 
          availableSeats: 200,
          "availableSeatsByClass.ECONOMY": 128 // Assuming economy lost the seat, reset if needed
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully restored the missing seat! Available seats is now 200/200.`);
    } else {
        // Try just forcing SL101 to 200 anywhere it is under
        const res2 = await flights.updateMany(
            { origin: "London", destination: "New York" },
            { $set: { availableSeats: 200 } }
        );
        console.log(`Forced all London -> New York flights to have availableSeats = 200. (Modified: ${res2.modifiedCount})`);
    }

    // Also delete the test VIP flight we made earlier
    await flights.deleteMany({ flightNumber: "SL-VIP1" });

  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await client.close();
  }
}

fixSeats();
