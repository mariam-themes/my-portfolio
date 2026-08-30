require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function updateEmail() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    // Assuming the database is either 'test' or in the URI
    // Let's use the one from the URI or fallback to test
    const db = client.db(); 
    const res = await db.collection('globalsettings').updateOne({}, { $set: { email: 'info@mariammjstudio.com' } });
    console.log(res);
  } finally {
    await client.close();
  }
}
updateEmail();
