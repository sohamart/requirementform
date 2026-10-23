import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../server/src/server.js';
import { connectDB } from '../server/src/config/db.js';

let isDbConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure database is connected before handling requests
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] Database connection failed:', err);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        message: err instanceof Error ? err.message : 'Unable to connect to database',
      });
    }
  }

  // Forward request and response directly to the Express application instance
  return app(req as any, res as any);
}
