import { Router } from 'express';
import { requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { validateBody } from '../middleware/validation.js';
import {
  FormDefinitionSchema,
  SaveStepNotesSchema,
  UpdateSubmissionStatusSchema,
  CreateQuotationSchema,
  CreateCostEntrySchema,
  CreatePaymentRecordSchema,
  UpdateTargetMarginSchema,
  PackageSchema,
  AddonSchema,
  BrandProfileSchema,
  UpdateUserPermissionsSchema,
} from '@shared/schemas/index.js';

import { AdminFormController } from '../controllers/adminFormController.js';
import { AdminSubmissionController } from '../controllers/adminSubmissionController.js';
import { AdminQuotationController } from '../controllers/adminQuotationController.js';
import { AdminFinancialController } from '../controllers/adminFinancialController.js';
import { AdminCatalogController } from '../controllers/adminCatalogController.js';
import { AdminUserController } from '../controllers/adminUserController.js';
import { AuditLogController } from '../controllers/auditLogController.js';

const router = Router();

// All routes require Administrator session
router.use(requireAdmin);

// --- FORMS & BUILDER ---
router.get('/forms', requirePermission('manage_forms'), AdminFormController.getAllForms);
router.get('/forms/:slug', requirePermission('manage_forms'), AdminFormController.getFormById);
router.post(
  '/forms',
  requirePermission('manage_forms'),
  validateBody(FormDefinitionSchema),
  AdminFormController.createForm
);
router.put('/forms/:id', requirePermission('manage_forms'), AdminFormController.updateForm);
router.post('/forms/:id/publish', requirePermission('manage_forms'), AdminFormController.publishForm);

// Private Form Step Notes (Gated by manage_internal_notes)
router.get(
  '/forms/:id/notes',
  requirePermission('manage_internal_notes'),
  AdminFormController.getFormStepNotes
);
router.post(
  '/forms/:id/notes',
  requirePermission('manage_internal_notes'),
  validateBody(SaveStepNotesSchema),
  AdminFormController.saveFormStepNote
);

// --- SUBMISSIONS ---
router.get(
  '/submissions',
  requirePermission('manage_submissions'),
  AdminSubmissionController.getAllSubmissions
);
router.get(
  '/submissions/:id',
  requirePermission('manage_submissions'),
  AdminSubmissionController.getSubmissionById
);
router.put(
  '/submissions/:id/status',
  requirePermission('manage_submissions'),
  validateBody(UpdateSubmissionStatusSchema),
  AdminSubmissionController.updateStatus
);

// Private Submission Step Notes (Gated by manage_internal_notes)
router.get(
  '/submissions/:id/notes',
  requirePermission('manage_internal_notes'),
  AdminSubmissionController.getSubmissionStepNotes
);
router.post(
  '/submissions/:id/notes',
  requirePermission('manage_internal_notes'),
  validateBody(SaveStepNotesSchema),
  AdminSubmissionController.saveSubmissionStepNote
);

// --- QUOTATIONS ---
router.get(
  '/quotations',
  requirePermission('manage_quotations'),
  AdminQuotationController.getAllQuotations
);
router.get(
  '/quotations/:id',
  requirePermission('manage_quotations'),
  AdminQuotationController.getQuotationById
);
router.post(
  '/quotations',
  requirePermission('manage_quotations'),
  validateBody(CreateQuotationSchema),
  AdminQuotationController.createQuotation
);
router.put(
  '/quotations/:id',
  requirePermission('manage_quotations'),
  AdminQuotationController.updateQuotation
);
router.get(
  '/quotations/:id/download',
  requirePermission('manage_quotations'),
  AdminQuotationController.downloadPDF
);

// --- FINANCIALS & PROFIT MARGINS (Gated: Superadmin or Admins with Financial Permissions) ---
router.get(
  '/financials/dashboard',
  requirePermission('view_financials'),
  AdminFinancialController.getDashboard
);
router.get(
  '/financials/projects/:submissionId',
  requirePermission('view_financials'),
  AdminFinancialController.getProjectFinancials
);
router.post(
  '/financials/costs',
  requirePermission('manage_financials'),
  validateBody(CreateCostEntrySchema),
  AdminFinancialController.addCostEntry
);
router.delete(
  '/financials/costs/:id',
  requirePermission('manage_financials'),
  AdminFinancialController.deleteCostEntry
);
router.post(
  '/financials/payments',
  requirePermission('manage_financials'),
  validateBody(CreatePaymentRecordSchema),
  AdminFinancialController.addPaymentRecord
);
router.put(
  '/financials/config/:submissionId',
  requirePermission('manage_financials'),
  AdminFinancialController.updateFinancialConfig
);
router.put(
  '/financials/target-margin/:submissionId',
  requirePermission('manage_financials'),
  AdminFinancialController.updateTargetMargin
);

// --- CATALOG (Packages, Addons, Brands) ---
router.get('/packages', requirePermission('manage_packages'), AdminCatalogController.getAllPackages);
router.post(
  '/packages',
  requirePermission('manage_packages'),
  validateBody(PackageSchema),
  AdminCatalogController.createPackage
);
router.put('/packages/:id', requirePermission('manage_packages'), AdminCatalogController.updatePackage);

router.get('/addons', requirePermission('manage_packages'), AdminCatalogController.getAllAddons);
router.post(
  '/addons',
  requirePermission('manage_packages'),
  validateBody(AddonSchema),
  AdminCatalogController.createAddon
);
router.put('/addons/:id', requirePermission('manage_packages'), AdminCatalogController.updateAddon);

router.get('/brands', requirePermission('manage_brands'), AdminCatalogController.getAllBrands);
router.post(
  '/brands',
  requirePermission('manage_brands'),
  validateBody(BrandProfileSchema),
  AdminCatalogController.createBrand
);
router.put('/brands/:id', requirePermission('manage_brands'), AdminCatalogController.updateBrand);

// --- USERS & ACCESS ---
router.get('/users', requirePermission('manage_users'), AdminUserController.getAllUsers);
router.put(
  '/users/:id',
  requirePermission('manage_users'),
  validateBody(UpdateUserPermissionsSchema),
  AdminUserController.updateUser
);
router.put(
  '/users/:id/password',
  requireSuperAdmin,
  AdminUserController.changeUserPassword
);

// --- AUDIT LOGS ---
router.get('/audit-logs', requirePermission('manage_settings'), AuditLogController.getAllAuditLogs);

export default router;
