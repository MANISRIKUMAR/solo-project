const mongoose = require("mongoose");

const dbStatus = {
  connected: false,
  error: null,
};

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    dbStatus.connected = true;
    dbStatus.error = null;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.error = error.message;
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

module.exports = { connectDB, dbStatus };

