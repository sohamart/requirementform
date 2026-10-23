/**
 * Centralized Zod Validation Schemas
 * Shared between Server API Controllers and Client Forms
 */

import { z } from 'zod';
import { SYSTEM_PERMISSIONS } from '../constants/index.js';

// Auth Schemas
export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const UpdateUserPermissionsSchema = z.object({
  role: z.enum(['client', 'admin', 'superadmin']),
  permissions: z.array(z.enum(SYSTEM_PERMISSIONS)),
  status: z.enum(['active', 'suspended', 'pending']),
});

// Form Builder Schemas
export const FormQuestionSchema = z.object({
  id: z.string().min(1),
  fieldKey: z.string().optional(),
  label: z.string().min(1, 'Question label is required'),
  helperText: z.string().optional(),
  placeholder: z.string().optional(),
  type: z.enum([
    'text',
    'textarea',
    'email',
    'phone',
    'number',
    'url',
    'dropdown',
    'multiselect',
    'radio',
    'checkbox',
    'date',
    'budget_range',
    'file_upload',
    'yes_no',
    'info_block',
    'color_picker',
    'repeatable_url',
  ]),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  validationRules: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  conditionalVisibility: z
    .object({
      dependsOnQuestionId: z.string(),
      operator: z.enum(['equals', 'not_equals', 'contains', 'is_not_empty']),
      value: z.any(),
    })
    .optional(),
  order: z.number(),
});

export const FormStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Step title is required'),
  subtitle: z.string().optional(),
  order: z.number(),
  questions: z.array(FormQuestionSchema),
});

export const FormDefinitionSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(2, 'Description is required'),
  category: z.enum(['website', 'app', 'desktop']),
  steps: z.array(FormStepSchema),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

// Private Step Notes Schemas (Admin Only)
export const SaveStepNotesSchema = z.object({
  stepId: z.string().min(1),
  notes: z.string(),
});

// Submission Schema
export const CreateSubmissionSchema = z.object({
  formDefinitionId: z.string().min(1),
  projectCategory: z.enum(['website', 'app', 'desktop']),
  answers: z.record(z.string(), z.any()),
  stepDeveloperNotes: z.record(z.string(), z.string()).optional(),
  idempotencyKey: z.string().optional(),
});

export const UpdateSubmissionStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'under_review',
    'estimated',
    'quoted',
    'in_progress',
    'completed',
    'cancelled',
  ]),
});

// Package & Addon Schemas
export const PackageSchema = z.object({
  slug: z.string().min(2),
  category: z.enum(['website', 'app', 'desktop']),
  name: z.string().min(2),
  description: z.string(),
  pricingMode: z.enum(['fixed', 'starting_price', 'manual_review']),
  standardPricePaise: z.number().int().nonnegative(),
  offerPricePaise: z.number().int().nonnegative(),
  billingFrequency: z.enum(['one_time', 'monthly', 'yearly']),
  features: z.array(z.string()),
  maxRevisions: z.number().int().min(0),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const AddonSchema = z.object({
  slug: z.string().min(2),
  category: z.enum(['website', 'app', 'desktop', 'both', 'all']),
  name: z.string().min(2),
  description: z.string(),
  billingType: z.enum(['one_time', 'monthly', 'per_unit']),
  unitPricePaise: z.number().int().nonnegative(),
  unitLabel: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

// Brand Profile Schema
export const BrandProfileSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().min(2),
  logoText: z.string().min(1),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code'),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  websiteUrl: z.string().url(),
  addressLines: z.array(z.string()),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Quotation Line Item & Quotation Schemas
export const QuotationLineItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPricePaise: z.number().int().nonnegative(),
  totalPaise: z.number().int().nonnegative(),
  isOptional: z.boolean().optional(),
  isSelected: z.boolean().optional(),
});

export const PaymentMilestoneSchema = z.object({
  title: z.string().min(1),
  percent: z.number().min(1).max(100),
  amountPaise: z.number().int().nonnegative(),
  trigger: z.string().min(1),
});

export const DEFAULT_COMMERCIAL_TERMS = [
  'Advance Mobilization Requirement: A mandatory 20% advance payment is required upon quotation signing to schedule developer sprints, provision cloud staging environments, and allocate engineering capacity.',
  'Commercial Proposal Validity: This quotation, itemized deliverables, and agreed rates remain locked and valid for 30 calendar days from the date of issuance.',
  'Stage-Gate Milestone Governance: Project development proceeds across defined milestones; each milestone is formally demonstrated and approved on the staging environment prior to commencing subsequent modules.',
  'Scope Integrity & Change Request (CR) Protocol: All deliverables are strictly bounded by the itemized specifications. Additional feature requests or architectural deviations will be evaluated under a transparent written Change Request with agreed cost and timeline adjustments.',
  'Client Feedback & Approval Turnaround: The client agrees to provide required branding assets within 5 business days and review staging milestone deliverables within 3 business days of presentation to maintain sprint momentum.',
  '100% Intellectual Property & Source Code Transfer: Complete intellectual property rights, Git repositories, database architectures, design assets, and production credentials transfer unconditionally to the client upon clearance of the final milestone payment.',
  '30-Day Post-Launch Warranty Support: Includes a dedicated 30-day post-launch warranty covering defect remediation, cross-browser compatibility fixes, and stability patch releases at zero incremental charge.',
  'Third-Party Services & Operational Pass-Throughs: Domain renewals, server infrastructure beyond quoted terms, payment gateway interchange fees, and usage-based third-party APIs (e.g. SMS, AI tokens, Maps) are direct pass-through expenses billed directly to client corporate accounts.',
  'Mutual Confidentiality & Non-Disclosure: Both parties agree to protect all proprietary business data, trade secrets, architecture briefs, and transactional records under strict non-disclosure obligations.',
  'Payment Remittance & Invoicing: Remittances may be processed via Direct RTGS/NEFT Bank Transfer or corporate UPI. Official GST commercial tax invoices and digital receipts are issued immediately upon clearance of each milestone payment.',
];

export const CreateQuotationSchema = z.object({
  submissionId: z.string().min(1),
  brandProfileId: z.string().min(1),
  packageName: z.string().optional(),
  scopeSummary: z.string().optional(),
  lineItems: z.array(QuotationLineItemSchema).min(1, 'At least one line item is required'),
  discountPaise: z.number().int().nonnegative().default(0),
  estimatedTimelineDays: z.number().int().positive().optional(),
  paymentMilestones: z.array(PaymentMilestoneSchema).optional(),
  revisionPolicy: z.string().default('Up to 3 rounds of design and functional revisions included.'),
  exclusions: z.array(z.string()).default([
    'Domain registration & DNS management costs are paid directly to domain registrars.',
    'Cloud hosting & server subscription fees are paid directly to AWS / DigitalOcean / Vercel.',
    'Paid third-party API usage (e.g. Twilio, OpenAI, Google Maps) is billed to client accounts directly.'
  ]),
  clientResponsibilities: z.array(z.string()).default([
    'Provide branding assets, vector logos, and content in a timely manner.',
    'Provide feedback within 3 business days during development review milestones.',
    'Supply API credentials or accounts required for third-party integrations.'
  ]),
  termsAndConditions: z.array(z.string()).default(DEFAULT_COMMERCIAL_TERMS),
  validityDays: z.number().int().positive().default(30),
  status: z.enum(['draft', 'estimate', 'issued', 'approved', 'rejected', 'expired']).default('draft'),
});

// Cost Entry & Financial Schemas (Admin Only)
export const CreateCostEntrySchema = z.object({
  submissionId: z.string().min(1),
  category: z.enum([
    'internal_labour',
    'external_contractor',
    'infrastructure_third_party',
    'partner_allocation',
    'additional_expense',
  ]),
  isActual: z.boolean().default(true),
  amountPaise: z.number().int().positive('Amount must be positive'),
  description: z.string().min(2, 'Description is required'),
  date: z.string().optional(),
});

export const UpdateTargetMarginSchema = z.object({
  targetMarginPercent: z.number().min(0).max(100),
  financialNotes: z.string().optional(),
});

export const CreatePaymentRecordSchema = z.object({
  submissionId: z.string().min(1),
  quotationId: z.string().optional(),
  amountPaise: z.number().int().positive('Payment amount must be positive'),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['bank_transfer', 'upi', 'card', 'cheque', 'other']),
  status: z.enum(['received', 'pending', 'failed']).default('received'),
  referenceNumber: z.string().min(1, 'Reference number or transaction ID is required'),
  notes: z.string().optional(),
});

// Domain Finder Schemas
export const BusinessTypeSchema = z.enum([
  'Agency',
  'SaaS',
  'AI/Technology',
  'E-commerce',
  'Education',
  'Portfolio',
  'Healthcare',
  'Finance',
  'Restaurant',
  'Fashion',
  'Startup',
  'Other',
]);

export const DomainSearchSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100),
  businessType: BusinessTypeSchema.default('SaaS'),
  industry: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
  preferredExtensions: z.array(z.string()).optional().default([]),
  count: z.number().int().min(4).max(60).optional().default(24),
  checkLiveAvailability: z.boolean().optional().default(true),
});

export const CheckAvailabilitySchema = z.object({
  domains: z.array(z.string().min(3).max(100)).min(1, 'At least one domain must be checked').max(100),
});

