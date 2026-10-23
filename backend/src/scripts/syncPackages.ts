import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  INITIAL_WEBSITE_PACKAGES,
  INITIAL_APP_PACKAGES,
  INITIAL_DESKTOP_PACKAGES,
  INITIAL_ADDONS,
} from '../shared/constants/index.js';

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
  const allPackages = [
    ...INITIAL_WEBSITE_PACKAGES,
    ...INITIAL_APP_PACKAGES,
    ...INITIAL_DESKTOP_PACKAGES,
  ];

  for (const pkg of allPackages) {
    console.log(`[Sync] Updating package: [${pkg.category}] ${pkg.slug} (${pkg.name}) -> Offer: ₹${pkg.offerPricePaise / 100}, Standard: ₹${pkg.standardPricePaise / 100}`);
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

  const addonsCollection = db.collection('addons');
  for (const addon of INITIAL_ADDONS) {
    console.log(`[Sync] Updating addon: [${addon.category}] ${addon.slug} (${addon.name})`);
    await addonsCollection.updateOne(
      { slug: addon.slug },
      {
        $set: {
          name: addon.name,
          category: addon.category,
          description: addon.description,
          billingType: addon.billingType,
          unitPricePaise: addon.unitPricePaise,
          unitLabel: addon.unitLabel,
          isActive: addon.isActive,
          order: addon.order,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  console.log('[Sync] All packages and addons successfully synchronized with updated catalog data!');
  await mongoose.disconnect();
  console.log('[Sync] Disconnected.');
}

main().catch((err) => {
  console.error('[Sync] Error:', err);
  process.exit(1);
});
