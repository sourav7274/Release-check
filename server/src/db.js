const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

let db;

if (USE_MOCK_DB || !MONGODB_URI) {
  console.log('⚠️ Using Mock Database');
  db = require('./mock-db');
} else {
  // Use Mongoose for MongoDB
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('🚀 Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
  
  db = mongoose.connection;
}

module.exports = db;
