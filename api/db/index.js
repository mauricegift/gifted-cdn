/**
 * Database Connection Module
 *
 * This module handles MongoDB connection using Mongoose ODM.
 * It establishes connection, handles errors, and manages connection lifecycle.
 *
 * @module api/db
 */

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const config = require('../../config');

/**
 * Connect to MongoDB database
 *
 * Establishes connection to MongoDB using the URI from configuration.
 * Sets up error handlers and connection event listeners.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} If connection fails, process exits with code 1
 */
const connectDB = async () => {
  try {
    mongoose.connect(config.mongoUri)
  .then(() => console.log('Database Connected ✅'))
  .catch(err => console.error('DB connection error:', err));
    
    const db = mongoose.connection;
    
    db.on('error', (error) => {
      console.error('DB connection error:', error);
    });
    
    db.once('open', () => {
      console.log('DB Connection Established');
    });
    
  } catch (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1); 
  }
};

module.exports = connectDB; 
