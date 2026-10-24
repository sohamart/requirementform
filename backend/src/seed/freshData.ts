import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { Submission } from '../models/Submission.js';
import { SubmissionInternalNotes } from '../models/SubmissionInternalNotes.js';
import { Quotation } from '../models/Quotation.js';
import { CostEntry } from '../models/CostEntry.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { ProjectFinancials } from '../models/ProjectFinancials.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { FormDefinition } from '../models/FormDefinition.js';
import { FormStepNotes } from '../models/FormStepNotes.js';
import { Package } from '../models/Package.js';
import { Addon } from '../models/Addon.js';
import { DriveDocument } from '../models/DriveDocument.js';
import {
  INITIAL_WEBSITE_PACKAGES,
  INITIAL_ADDONS,
  INITIAL_BRANDS,
  SYSTEM_PERMISSIONS,
} from '@shared/constants/index.js';
import {
  MASTER_WEBSITE_STEPS,
  MASTER_APP_STEPS,
  MASTER_WEBSITE_STEP_NOTES,
  MASTER_APP_STEP_NOTES,
} from './masterFormData.js';

export async function runFreshDataSetup(): Promise<void> {
  console.log('--- [Fresh Data Setup] Starting data wipe and fresh provisioning ---');

  // 1. Purge Demo / Test Operational Data
  const deletedSubmissions = await Submission.deleteMany({});
  const deletedSubmissionNotes = await SubmissionInternalNotes.deleteMany({});
  const deletedQuotations = await Quotation.deleteMany({});
  const deletedDriveDocs = await DriveDocument.deleteMany({});
  const deletedCostEntries = await CostEntry.deleteMany({});
  const deletedPaymentRecords = await PaymentRecord.deleteMany({});
  const deletedFinancials = await ProjectFinancials.deleteMany({});
  const deletedNotifications = await Notification.deleteMany({});
  const deletedAuditLogs = await AuditLog.deleteMany({});
  const deletedSessions = await Session.deleteMany({});

  console.log(`[Fresh Data] Cleared ${deletedSubmissions.deletedCount} submissions.`);
  console.log(`[Fresh Data] Cleared ${deletedSubmissionNotes.deletedCount} submission internal notes.`);
  console.log(`[Fresh Data] Cleared ${deletedQuotations.deletedCount} quotations.`);
  console.log(`[Fresh Data] Cleared ${deletedDriveDocs.deletedCount} drive documents.`);
  console.log(`[Fresh Data] Cleared ${deletedCostEntries.deletedCount} cost entries.`);
  console.log(`[Fresh Data] Cleared ${deletedPaymentRecords.deletedCount} payment records.`);
  console.log(`[Fresh Data] Cleared ${deletedFinancials.deletedCount} project financials.`);
  console.log(`[Fresh Data] Cleared ${deletedNotifications.deletedCount} notifications.`);
  console.log(`[Fresh Data] Cleared ${deletedAuditLogs.deletedCount} audit logs.`);
  console.log(`[Fresh Data] Cleared ${deletedSessions.deletedCount} user sessions.`);

  // 2. Remove Demo Users & All Automated Test Accounts (keep only superadmin)
  const deletedUsers = await User.deleteMany({
    email: { $ne: 'sohamduttabwn@gmail.com' },
  });
  console.log(`[Fresh Data] Removed ${deletedUsers.deletedCount} demo / automated test accounts from users collection.`);

  // 3. Create or Update Superadmin: sohamduttabwn@gmail.com / Rohit@1905
  const adminEmail = 'sohamduttabwn@gmail.com';
  const adminPasswordPlain = 'Rohit@1905';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPasswordPlain, salt);

  const superadmin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      fullName: 'Soham Dutta',
      email: adminEmail,
      passwordHash,
      role: 'superadmin',
      permissions: [...SYSTEM_PERMISSIONS],
      status: 'active',
      company: 'Esyus × Weblets',
    },
    { upsert: true, new: true }
  );
  console.log(`[Fresh Data] Superadmin account provisioned successfully: ${superadmin.email} (id: ${superadmin._id})`);

  // 4. Ensure Brand Profile matches Esyus × Weblets
  const brandCount = await BrandProfile.countDocuments();
  if (brandCount === 0) {
    for (const b of INITIAL_BRANDS) {
      await BrandProfile.create(b);
    }
    console.log(`[Fresh Data] Seeded ${INITIAL_BRANDS.length} Brand Profiles.`);
  } else {
    await BrandProfile.updateMany(
      { isDefault: true },
      {
        $set: {
          brandName: 'Esyus × Weblets',
          companyLegalName: 'Esyus × Weblets Technologies',
          updatedAt: new Date(),
        },
      }
    );
    console.log(`[Fresh Data] Brand profile synchronized to Esyus × Weblets.`);
  }

  // 5. Ensure Master Packages
  const pkgCount = await Package.countDocuments();
  if (pkgCount === 0) {
    for (const p of INITIAL_WEBSITE_PACKAGES) {
      await Package.create(p);
    }
    console.log(`[Fresh Data] Seeded ${INITIAL_WEBSITE_PACKAGES.length} Website Packages.`);
  }

  // 6. Ensure Master Addons
  const addonCount = await Addon.countDocuments();
  if (addonCount === 0) {
    for (const a of INITIAL_ADDONS) {
      await Addon.create(a);
    }
    console.log(`[Fresh Data] Seeded ${INITIAL_ADDONS.length} Addons.`);
  }

  // 7. Ensure Master Forms & Step Notes
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

  // Link FormStepNotes author to the superadmin
  for (const [stepId, notes] of Object.entries(MASTER_WEBSITE_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      { formDefinitionId: websiteForm._id, formVersion: 1, stepId },
      { notes, authorId: superadmin._id, authorName: superadmin.fullName },
      { upsert: true }
    );
  }

  for (const [stepId, notes] of Object.entries(MASTER_APP_STEP_NOTES)) {
    await FormStepNotes.findOneAndUpdate(
      { formDefinitionId: appForm._id, formVersion: 1, stepId },
      { notes, authorId: superadmin._id, authorName: superadmin.fullName },
      { upsert: true }
    );
  }

  console.log('--- [Fresh Data Setup] Completed successfully! All data is fresh and clean. ---');
}

if (process.argv[1] && (process.argv[1].includes('freshData.ts') || process.argv[1].includes('freshData.js'))) {
  connectDB()
    .then(() => runFreshDataSetup())
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Fresh Data Setup] Error:', err);
      process.exit(1);
    });
}
