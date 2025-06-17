// src/lib/mongodb.js

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable.");
}

// Global cache to avoid re-connecting on every request in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  try {
    // If we have a cached connection, return it
    if (cached.conn) {
      console.log("Using cached database connection");
      return cached.conn;
    }

    // If we don't have a connection promise, create one
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      console.log("Creating new database connection");
      cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
        console.log("Database connected successfully");
        return mongoose;
      });
    }

    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Clear the cached promise on error
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Also export as default for backward compatibility
export default connectToDB;
