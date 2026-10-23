import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { INITIAL_WEBSITE_PACKAGES } from '../shared/constants/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/requirement_portal';

async function main() {
  console.log('[Sync] Connecting to database:', uri);
  await mongoose.connect(uri);
  console.log('[Sync] Connected to MongoDB.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  const packagesCollection = db.collection('packages');

  for (const pkg of INITIAL_WEBSITE_PACKAGES) {
    console.log(`[Sync] Updating package: ${pkg.slug} (${pkg.name}) -> Offer: ₹${pkg.offerPricePaise / 100}, Standard: ₹${pkg.standardPricePaise / 100}`);
    const res = await packagesCollection.updateOne(
      { slug: pkg.slug },
      {
        $set: {
          name: pkg.name,
          category: pkg.category,
          description: pkg.description,
          pricingMode: pkg.pricingMode,
          standardPricePaise: pkg.standardPricePaise,
          offerPricePaise: pkg.offerPricePaise,
          billingFrequency: pkg.billingFrequency,
          features: pkg.features,
          maxRevisions: pkg.maxRevisions,
          isActive: pkg.isActive,
          order: pkg.order,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`[Sync] Matched: ${res.matchedCount}, Modified: ${res.modifiedCount}, Upserted: ${res.upsertedCount}`);
  }

  console.log('[Sync] All packages successfully synchronized with updated pricing and features!');
  await mongoose.disconnect();
  console.log('[Sync] Disconnected.');
}

main().catch((err) => {
  console.error('[Sync] Error:', err);
  process.exit(1);
});
