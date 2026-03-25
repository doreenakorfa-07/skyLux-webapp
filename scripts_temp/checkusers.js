const { MongoClient, ObjectId } = require('mongodb');

async function checkUsers() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('airline_db');
    
    const users = await db.collection('users').find({}).toArray();
    console.log("All Users:", JSON.stringify(users, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

checkUsers();
