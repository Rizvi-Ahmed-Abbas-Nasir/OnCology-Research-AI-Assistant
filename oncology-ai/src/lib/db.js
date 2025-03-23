import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      console.log('Successfully connected to MongoDB');
      return mongoose;
    }).catch((error) => {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    });
  }

  cached.conn = await cached.promise;

  // Ensure the connection is established before querying collections
  const db = cached.conn.connection.db;
  if (!db) {
    throw new Error("MongoDB connection is not ready.");
  }

  // Debug: List collections
  const collections = await db.listCollections().toArray();
  console.log('Collections in the database:', collections.map(c => c.name));

  return cached.conn;
}

export default connectMongoDB;
