import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ENV } from './env.js';

let replSetInstance: MongoMemoryReplSet | null = null;
let cachedConnectionPromise: Promise<any> | null = null;

export async function connectDB(): Promise<string> {
  // Re-use active connection in serverless warm invocations
  if (mongoose.connection.readyState === 1) {
    return 'connected';
  }

  if (cachedConnectionPromise) {
    await cachedConnectionPromise;
    return 'connected';
  }

  let uri = ENV.MONGODB_URI;

  if (!uri && ENV.ALLOW_IN_MEMORY_DB && process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
    console.log('[Database] No MONGODB_URI provided. Initializing MongoMemoryReplSet for transactional parity...');
    try {
      replSetInstance = await MongoMemoryReplSet.create({
        replSet: {
          count: 1,
          storageEngine: 'wiredTiger',
        },
      });
      uri = replSetInstance.getUri();
      console.log(`[Database] In-memory Replica Set initialized at: ${uri}`);
    } catch (err) {
      console.error('[Database] Failed to initialize in-memory replica set:', err);
      throw err;
    }
  }

  if (!uri) {
    throw new Error('Database connection failed: No MONGODB_URI and in-memory replica set not enabled.');
  }

  try {
    cachedConnectionPromise = mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await cachedConnectionPromise;
    console.log('[Database] Connected successfully to MongoDB.');
    return uri;
  } catch (err) {
    cachedConnectionPromise = null;
    console.error('[Database] Mongoose connection error:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (replSetInstance) {
      await replSetInstance.stop();
      replSetInstance = null;
    }
    console.log('[Database] Disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err);
  }
}
