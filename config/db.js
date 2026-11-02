const mongoose = require('mongoose');

/**
 * Connect to MongoDB Database (Atlas or Local MongoDB)
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('\n==============================================================================');
    console.warn('[CampusFind Alert] MONGO_URI is not defined in your .env file.');
    console.warn('To connect to MongoDB Atlas:');
    console.warn('  1. Copy .env.example to .env:');
    console.warn('     copy .env.example .env   (Windows)');
    console.warn('  2. Replace <username> & <password> with your MongoDB Atlas cluster credentials');
    console.warn('==============================================================================\n');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`\x1b[32m✔ MongoDB Connected Successfully: ${conn.connection.host}\x1b[0m`);
    return conn;
  } catch (error) {
    console.error('\n==============================================================================');
    console.error(`\x1b[31m✖ MongoDB Connection Error: ${error.message}\x1b[0m`);
    console.error('Please verify:');
    console.error('  1. Your IP address is whitelisted in MongoDB Atlas (Network Access -> Allow 0.0.0.0/0)');
    console.error('  2. Database user credentials (username and password) in MONGO_URI are correct');
    console.error('==============================================================================\n');
    return null;
  }
};

module.exports = connectDB;
