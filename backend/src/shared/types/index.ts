/**
 * Complete Shared TypeScript Interfaces & DTO Contracts
 */

import { SystemPermission } from '../constants/index.js';

// User & Session
export type UserRole = 'client' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  permissions: SystemPermission[];
  status: UserStatus;
  phone?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  isRevoked: boolean;
  expiresAt: string;
  lastActiveAt: string;
  createdAt: string;
}

// Form Definition
export type QuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'dropdown'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'budget_range'
  | 'file_upload'
  | 'yes_no'
  | 'info_block'
  | 'color_picker'
  | 'repeatable_url';

export interface FormQuestion {
  id: string;
  fieldKey?: string;
  label: string;
  helperText?: string;
  placeholder?: string;
  type: QuestionType;
  isRequired: boolean;
  isActive?: boolean;
  options?: string[];
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditionalVisibility?: {
    dependsOnQuestionId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'is_not_empty';
    value: any;
  };
  order: number;
}

export interface FormStep {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
  questions: FormQuestion[];
}

export type ProjectCategory = 'website' | 'app' | 'desktop';

export interface FormDefinitionDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  version: number;
  status: 'draft' | 'published' | 'archived';
  steps: FormStep[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Private Form Step Notes (Admin Only - gated by manage_internal_notes)
export interface FormStepNotesDTO {
  id: string;
  formDefinitionId: string;
  formVersion: number;
  stepId: string;
  notes: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Submission
export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'estimated'
  | 'quoted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ClientSubmissionDTO {
  id: string;
  enquiryReference: string;
  clientId: string;
  clientSnapshot: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  formDefinitionId: string;
  formVersion: number;
  projectCategory: ProjectCategory;
  status: SubmissionStatus;
  answers: Record<string, any>;
  submittedAt: string;
  updatedAt: string;
  revisionNumber: number;
  quotationAvailable?: boolean;
}

export interface AdminSubmissionDTO extends ClientSubmissionDTO {
  internalNotesCount?: number;
  hasQuotation?: boolean;
  financialSummary?: {
    quotedRevenuePaise: number;
    actualDirectCostPaise: number;
    grossMarginPercent: number | null;
  };
}

// Submission Specific Internal Notes (Admin Only - gated by manage_internal_notes)
export interface SubmissionInternalNotesDTO {
  id: string;
  submissionId: string;
  stepId: string;
  notes: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Packages & Addons
export interface PackageDTO {
  id: string;
  slug: string;
  category: ProjectCategory;
  name: string;
  description: string;
  pricingMode: 'fixed' | 'starting_price' | 'manual_review';
  standardPricePaise: number;
  offerPricePaise: number;
  billingFrequency: 'one_time' | 'monthly' | 'yearly';
  features: string[];
  maxRevisions: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddonDTO {
  id: string;
  slug: string;
  category: 'website' | 'app' | 'desktop' | 'both' | 'all';
  name: string;
  description: string;
  billingType: 'one_time' | 'monthly' | 'per_unit';
  unitPricePaise: number;
  unitLabel?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Brand Profile
export interface BrandProfileDTO {
  id: string;
  name: string;
  tagline: string;
  logoText: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  addressLines: string[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Quotation
export type QuotationStatus =
  | 'draft'
  | 'estimate'
  | 'issued'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface QuotationLineItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPricePaise: number;
  totalPaise: number;
  isOptional?: boolean;
  isSelected?: boolean;
}

export interface PaymentMilestone {
  title: string;
  percent: number;
  amountPaise: number;
  trigger: string;
}

export interface ClientQuotationDTO {
  id: string;
  quotationNumber: string;
  revisionNumber: number;
  submissionId: string;
  status: QuotationStatus;
  brandSnapshot: {
    name: string;
    tagline: string;
    logoText: string;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    contactPhone: string;
    websiteUrl: string;
    addressLines: string[];
  };
  clientSnapshot: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  packageName?: string;
  scopeSummary?: string;
  lineItems: QuotationLineItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxLines: { name: string; percent: number; amountPaise: number }[]; // Preserved empty for zero-tax
  totalPaise: number;
  estimatedTimelineDays?: number;
  paymentMilestones: PaymentMilestone[];
  revisionPolicy: string;
  exclusions: string[];
  clientResponsibilities: string[];
  termsAndConditions: string[];
  issuedAt?: string;
  validUntil?: string;
  approvedAt?: string;
  createdAt: string;
}

// Financials & Cost Tracking (Admin Only - gated by view_financials / manage_financials)
export type CostCategory =
  | 'internal_labour'
  | 'external_contractor'
  | 'infrastructure_third_party'
  | 'partner_allocation'
  | 'additional_expense';

export interface CostEntryDTO {
  id: string;
  submissionId: string;
  category: CostCategory;
  isActual: boolean; // true = actual recorded, false = estimated
  amountPaise: number;
  description: string;
  date: string;
  loggedByUserId: string;
  loggedByName: string;
  createdAt: string;
}

export interface PaymentRecordDTO {
  id: string;
  submissionId: string;
  quotationId?: string;
  amountPaise: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
  status: 'received' | 'pending' | 'failed';
  referenceNumber: string;
  notes?: string;
  recordedByUserId: string;
  createdAt: string;
}

export interface ProjectFinancialsDTO {
  id: string;
  submissionId: string;
  enquiryReference: string;
  projectCategory: ProjectCategory;
  clientName: string;
  status: SubmissionStatus;
  quotedRevenuePaise: number;
  approvedRevenuePaise: number;
  customRevenuePaise?: number;
  collectedRevenuePaise: number;
  outstandingReceivablesPaise: number;
  estimatedDirectCostPaise: number;
  actualDirectCostPaise: number;
  estimatedGrossProfitPaise: number;
  actualGrossProfitPaise: number;
  grossMarginPercent: number | null;
  markupPercent: number | null;
  targetMarginPercent: number;
  partnerSharePercent: number;
  partnerName: string;
  extraInHandCostPaise: number;
  partnerCutPaise: number;
  inHandProfitPaise: number;
  inHandMarginPercent: number | null;
  isBelowTargetMargin: boolean;
  hasMissingCosts: boolean;
  costEntries: CostEntryDTO[];
  paymentRecords: PaymentRecordDTO[];
  financialNotes?: string;
  updatedAt: string;
}

export interface CategoryMarginMetrics {
  totalRevenuePaise: number;
  totalCostPaise: number;
  totalProfitPaise: number;
  marginPercent: number | null;
  projectCount: number;
}

export interface FinancialAnalyticsDashboardDTO {
  totalQuotedRevenuePaise: number;
  totalApprovedRevenuePaise: number;
  totalCollectedRevenuePaise: number;
  totalOutstandingReceivablesPaise: number;
  totalEstimatedDirectCostPaise: number;
  totalActualDirectCostPaise: number;
  totalEstimatedGrossProfitPaise: number;
  totalActualGrossProfitPaise: number;
  overallGrossMarginPercent: number | null;
  overallMarkupPercent: number | null;
  projectsBelowTargetMarginCount: number;
  projectsWithMissingCostsCount: number;
  projects: ProjectFinancialsDTO[];
  categoryBreakdown?: {
    website: CategoryMarginMetrics;
    app: CategoryMarginMetrics;
    desktop: CategoryMarginMetrics;
  };
}

// ================= AI-POWERED SMART DOMAIN FINDER =================
export type BusinessType =
  | 'Agency'
  | 'SaaS'
  | 'AI/Technology'
  | 'E-commerce'
  | 'Education'
  | 'Portfolio'
  | 'Healthcare'
  | 'Finance'
  | 'Restaurant'
  | 'Fashion'
  | 'Startup'
  | 'Other';

export type DomainAvailabilityStatus =
  | 'available'
  | 'unavailable'
  | 'unsupported'
  | 'unverified'
  | 'error';

export interface DomainSuggestion {
  domain: string;
  name: string;
  extension: string;
  category: 'exact' | 'short' | 'brandable' | 'compound' | 'prefix' | 'suffix' | 'creative';
  status: DomainAvailabilityStatus;
  available?: boolean;
  price?: number;
  priceFormatted?: string;
  renewalPrice?: number;
  renewalPriceFormatted?: string;
  currency?: string;
  periodYears?: number;
  definitive?: boolean;
  officialGoDaddyUrl: string;
  reason?: string;
  isRecommendedExtension?: boolean;
}

export interface DomainSearchRequest {
  businessName: string;
  businessType: BusinessType;
  industry?: string;
  keywords?: string[];
  preferredExtensions?: string[];
  count?: number;
  checkLiveAvailability?: boolean;
}

export interface DomainSearchResponse {
  success: boolean;
  query: {
    businessName: string;
    businessType: BusinessType;
    extensions: string[];
  };
  godaddyConfigured: boolean;
  godaddyMessage?: string;
  recommendedExtensions: string[];
  suggestions: DomainSuggestion[];
  totalGenerated: number;
  availableCount: number;
}

export interface GoDaddyStatusDTO {
  configured: boolean;
  environment: 'production' | 'ote' | 'unconfigured';
  hasApiKey: boolean;
  hasApiSecret: boolean;
  apiConnected?: boolean;
  message: string;
}

