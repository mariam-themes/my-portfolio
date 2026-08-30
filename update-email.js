const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb+srv://eixglow_db_user:pxmR4cqikVBUsnxO@portfoliodb.ikqmtb5.mongodb.net/?appName=portfolioDB');
  await mongoose.connection.db.collection('globalsettings').updateOne({}, { $set: { email: 'info@mariammjstudio.com' } });
  console.log('Updated email in MongoDB');
  process.exit(0);
}
run();
