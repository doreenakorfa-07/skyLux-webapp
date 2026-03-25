const { MongoClient } = require('mongodb');

async function cleanup() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('airline_db');
    const users = await db.collection('users').find({}).toArray();
    
    // find "Ben J"
    const ben = users.find(u => 
      (u.username && u.username.includes('Ben')) || 
      (u.firstName && u.firstName.includes('Ben')) ||
      (u.email && u.email.includes('ben'))
    );
    
    if (!ben) {
      console.log("Could not find Ben J!");
      console.log("Users:", users.map(u => ({id: u._id, username: u.username, firstName: u.firstName, lastName: u.lastName})));
      return;
    }
    
    console.log("Found Ben:", ben.firstName, ben.lastName, "ID:", ben._id);
    
    const bookings = db.collection('bookings');
    const payments = db.collection('payments');
    
    // delete all bookings where user != ben._id
    const result = await bookings.deleteMany({
      $or: [
        { "user.$id": { $ne: ben._id } },
        { "user": null }
      ]
    });
    
    console.log(`Deleted ${result.deletedCount} bookings not belonging to Ben J.`);
    
    const pResult = await payments.deleteMany({
      $or: [
        { "user.$id": { $ne: ben._id } },
        { "user": null }
      ]
    });
    
    console.log(`Deleted ${pResult.deletedCount} payments not belonging to Ben J.`);

  } catch (error) {
    console.error("Error during DB manual cleanup:", error);
  } finally {
    await client.close();
  }
}
cleanup();
