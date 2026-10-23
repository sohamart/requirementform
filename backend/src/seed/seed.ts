import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Package } from '../models/Package.js';
import { Addon } from '../models/Addon.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { FormDefinition } from '../models/FormDefinition.js';
import { FormStepNotes } from '../models/FormStepNotes.js';
import {
  INITIAL_WEBSITE_PACKAGES,
  INITIAL_APP_PACKAGES,
  INITIAL_DESKTOP_PACKAGES,
  INITIAL_ADDONS,
  INITIAL_BRANDS,
  SYSTEM_PERMISSIONS,
} from '@shared/constants/index.js';
import {
  MASTER_WEBSITE_STEPS,
  MASTER_APP_STEPS,
  MASTER_DESKTOP_STEPS,
  MASTER_WEBSITE_STEP_NOTES,
  MASTER_APP_STEP_NOTES,
  MASTER_DESKTOP_STEP_NOTES,
} from './masterFormData.js';
import { ENV } from '../config/env.js';

export async function runSeed(): Promise<void> {
  console.log('[Seed] Starting database seed...');

  // 1. Seed Admin & Test Client Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(ENV.ADMIN_PASSWORD, salt);

  const admin = await User.findOneAndUpdate(
    { email: ENV.ADMIN_EMAIL.toLowerCase() },
    {
      fullName: 'System Administrator',
      email: ENV.ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'superadmin',
      permissions: [...SYSTEM_PERMISSIONS],
      status: 'active',
      company: 'Digital Agency HQ',
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Superadmin ready: ${admin.email}`);

  // 2. Seed Brand Profiles (Only seed initial defaults if collection is empty to avoid resetting user edits)
  const brandCount = await BrandProfile.countDocuments();
  if (brandCount === 0) {
    for (const b of INITIAL_BRANDS) {
      await BrandProfile.create(b);
    }
    console.log(`[Seed] Seeded ${INITIAL_BRANDS.length} Brand Profiles.`);
  } else {
    console.log(`[Seed] Found ${brandCount} existing Brand Profiles. Preserving user configurations.`);
  }

  // 3. Seed Packages (Website, App, Desktop)
  const allInitialPackages = [
    ...INITIAL_WEBSITE_PACKAGES,
    ...INITIAL_APP_PACKAGES,
    ...INITIAL_DESKTOP_PACKAGES,
  ];
  for (const p of allInitialPackages) {
    await Package.findOneAndUpdate(
      { slug: p.slug },
      { $set: p },
      { upsert: true, new: true }
    );
  }
  console.log(`[Seed] Synced ${allInitialPackages.length} packages across Website, App, and Desktop categories.`);

  // 4. Seed Addons
  for (const a of INITIAL_ADDONS) {
    await Addon.findOneAndUpdate(
      { slug: a.slug },
      { $set: a },
      { upsert: true, new: true }
    );
  }
  console.log(`[Seed] Synced ${INITIAL_ADDONS.length} Addons.`);

  // 5. Seed Website Requirements Form (8 Structured Steps, 46 Questions)
  const websiteForm = await FormDefinition.findOneAndUpdate(
    { slug: 'website-requirements', version: 1 },
    {
      slug: 'website-requirements',
      title: 'Website Project Requirement Specification',
      description: 'Comprehensive multi-step requirement builder for web design and development projects.',
      category: 'website',
      version: 1,
      status: 'published',
      steps: MASTER_WEBSITE_STEPS,
      publishedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Master Website Requirements Form ready (${MASTER_WEBSITE_STEPS.length} steps, id: ${websiteForm._id})`);

  // 6. Seed App Requirements Form (7 Structured Steps, 37 Questions)
  const appForm = await FormDefinition.findOneAndUpdate(
    { slug: 'app-requirements', version: 1 },
    {
      slug: 'app-requirements',
      title: 'App Project Requirement Specification',
      description: 'Dynamic multi-step builder for native mobile apps, cross-platform apps, and custom software.',
      category: 'app',
      version: 1,
      status: 'published',
      steps: MASTER_APP_STEPS,
      publishedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Master App Requirements Form ready (${MASTER_APP_STEPS.length} steps, id: ${appForm._id})`);

  // 7. Seed Desktop Software Requirements Form (8 Structured Steps)
  const desktopForm = await FormDefinition.findOneAndUpdate(
    { slug: 'desktop-app-requirements', version: 1 },
    {
      slug: 'desktop-app-requirements',
      title: 'Desktop Software Requirement Specification',
      description: 'Comprehensive multi-step specification builder for Windows, macOS & Linux desktop applications, POS systems, and native software.',
      category: 'desktop',
      version: 1,
      status: 'published',
      steps: MASTER_DESKTOP_STEPS,
      publishedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  console.log(`[Seed] Master Desktop Software Requirements Form ready (${MASTER_DESKTOP_STEPS.length} steps, id: ${desktopForm._id})`);

  // 8. Seed Form-Level Private Step Notes for All Steps
  for (const [stepId, notes] of Object.entries(MASTER_WEBSITE_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: websiteForm._id,
        formVersion: 1,
        stepId,
      },
      {
        notes,
        authorId: admin._id,
        authorName: admin.fullName,
      },
      { upsert: true }
    );
  }

  for (const [stepId, notes] of Object.entries(MASTER_APP_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: appForm._id,
        formVersion: 1,
        stepId,
      },
      {
        notes,
        authorId: admin._id,
        authorName: admin.fullName,
      },
      { upsert: true }
    );
  }

  for (const [stepId, notes] of Object.entries(MASTER_DESKTOP_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: desktopForm._id,
        formVersion: 1,
        stepId,
      },
      {
        notes,
        authorId: admin._id,
        authorName: admin.fullName,
      },
      { upsert: true }
    );
  }
  console.log('[Seed] Seeded private FormStepNotes for all Website, App, and Desktop steps.');

  console.log('[Seed] Database initialization and seeding completed successfully!');
}

if (process.argv[1] && (process.argv[1].includes('seed.ts') || process.argv[1].includes('seed.js'))) {
  connectDB()
    .then(() => runSeed())
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error seeding database:', err);
      process.exit(1);
    });
}
