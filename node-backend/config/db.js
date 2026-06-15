const mongoose = require('mongoose');

const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/library_mongo';

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully: ${mongoUri}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
