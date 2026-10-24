import { IUser } from '../models/User.js';
import { ISubmission } from '../models/Submission.js';
import { IQuotation } from '../models/Quotation.js';
import { IProjectFinancials } from '../models/ProjectFinancials.js';
import { ICostEntry } from '../models/CostEntry.js';
import { IPaymentRecord } from '../models/PaymentRecord.js';
import {
  UserDTO,
  ClientSubmissionDTO,
  AdminSubmissionDTO,
  ClientQuotationDTO,
  ProjectFinancialsDTO,
  CostEntryDTO,
  PaymentRecordDTO,
} from '@shared/types/index.js';

export function serializeUser(user: IUser): UserDTO {
  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    permissions: user.permissions || [],
    status: user.status,
    phone: user.phone,
    company: user.company,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * CLIENT SUBMISSION SERIALIZER
 * Guarantees zero leakage of internal notes, direct costs, or margin data.
 */
export function serializeClientSubmission(
  sub: ISubmission,
  quotationAvailable: boolean = false
): ClientSubmissionDTO {
  return {
    id: sub._id.toString(),
    enquiryReference: sub.enquiryReference,
    clientId: sub.clientId.toString(),
    clientSnapshot: {
      name: sub.clientSnapshot.name,
      email: sub.clientSnapshot.email,
      phone: sub.clientSnapshot.phone,
      company: sub.clientSnapshot.company,
    },
    formDefinitionId: sub.formDefinitionId.toString(),
    formVersion: sub.formVersion,
    projectCategory: sub.projectCategory,
    status: sub.status,
    answers: sub.answers || {},
    submittedAt: sub.submittedAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    revisionNumber: sub.revisionNumber,
    quotationAvailable,
  };
}

/**
 * ADMIN SUBMISSION SERIALIZER
 * Includes metadata counts for administrators.
 */
export function serializeAdminSubmission(
  sub: ISubmission,
  extra?: {
    internalNotesCount?: number;
    hasQuotation?: boolean;
    financialSummary?: {
      quotedRevenuePaise: number;
      actualDirectCostPaise: number;
      grossMarginPercent: number | null;
    };
  }
): AdminSubmissionDTO {
  const base = serializeClientSubmission(sub, extra?.hasQuotation);
  return {
    ...base,
    internalNotesCount: extra?.internalNotesCount,
    hasQuotation: extra?.hasQuotation,
    financialSummary: extra?.financialSummary,
  };
}

/**
 * CLIENT QUOTATION SERIALIZER
 * Guarantees zero internal costs, labour splits, or markup percentages.
 */
export function serializeClientQuotation(quote: IQuotation): ClientQuotationDTO {
  return {
    id: quote._id.toString(),
    quotationNumber: quote.quotationNumber,
    revisionNumber: quote.revisionNumber,
    submissionId: quote.submissionId.toString(),
    status: quote.status,
    brandSnapshot: {
      name: quote.brandSnapshot.name,
      tagline: quote.brandSnapshot.tagline,
      logoText: quote.brandSnapshot.logoText,
      primaryColor: quote.brandSnapshot.primaryColor,
      secondaryColor: quote.brandSnapshot.secondaryColor,
      contactEmail: quote.brandSnapshot.contactEmail,
      contactPhone: quote.brandSnapshot.contactPhone,
      websiteUrl: quote.brandSnapshot.websiteUrl,
      addressLines: quote.brandSnapshot.addressLines || [],
    },
    clientSnapshot: {
      name: quote.clientSnapshot.name,
      email: quote.clientSnapshot.email,
      company: quote.clientSnapshot.company,
      phone: quote.clientSnapshot.phone,
    },
    packageName: quote.packageName,
    scopeSummary: quote.scopeSummary,
    lineItems: (quote.lineItems || []).map((li) => ({
      id: li.id,
      title: li.title,
      description: li.description,
      quantity: li.quantity,
      unitPricePaise: li.unitPricePaise,
      totalPaise: li.totalPaise,
      isOptional: li.isOptional,
      isSelected: li.isSelected,
    })),
    subtotalPaise: quote.subtotalPaise,
    discountPaise: quote.discountPaise,
    taxLines: quote.taxLines || [], // Preserved empty array for zero tax
    totalPaise: quote.totalPaise,
    estimatedTimelineDays: quote.estimatedTimelineDays,
    paymentMilestones: (quote.paymentMilestones || []).map((pm) => ({
      title: pm.title,
      percent: pm.percent,
      amountPaise: pm.amountPaise,
      trigger: pm.trigger,
    })),
    revisionPolicy: quote.revisionPolicy,
    exclusions: quote.exclusions || [],
    clientResponsibilities: quote.clientResponsibilities || [],
    termsAndConditions: quote.termsAndConditions || [],
    issuedAt: quote.issuedAt?.toISOString(),
    validUntil: quote.validUntil?.toISOString(),
    approvedAt: quote.approvedAt?.toISOString(),
    createdAt: quote.createdAt.toISOString(),
  };
}

export function serializeCostEntry(entry: ICostEntry): CostEntryDTO {
  return {
    id: entry._id.toString(),
    submissionId: entry.submissionId.toString(),
    category: entry.category,
    isActual: entry.isActual,
    amountPaise: entry.amountPaise,
    description: entry.description,
    date: entry.date.toISOString(),
    loggedByUserId: entry.loggedByUserId.toString(),
    loggedByName: entry.loggedByName,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function serializePaymentRecord(record: IPaymentRecord): PaymentRecordDTO {
  return {
    id: record._id.toString(),
    submissionId: record.submissionId.toString(),
    quotationId: record.quotationId?.toString(),
    amountPaise: record.amountPaise,
    paymentDate: record.paymentDate.toISOString(),
    paymentMethod: record.paymentMethod,
    status: record.status,
    referenceNumber: record.referenceNumber,
    notes: record.notes,
    recordedByUserId: record.recordedByUserId.toString(),
    createdAt: record.createdAt.toISOString(),
  };
}

export function serializeProjectFinancials(
  fin: IProjectFinancials,
  submission: ISubmission,
  costEntries: ICostEntry[] = [],
  paymentRecords: IPaymentRecord[] = []
): ProjectFinancialsDTO {
  const isBelowTarget =
    fin.grossMarginPercent !== null && fin.grossMarginPercent < fin.targetMarginPercent;
  const hasMissingCosts =
    fin.actualDirectCostPaise === 0 && fin.estimatedDirectCostPaise === 0;

  const partnerSharePercent = fin.partnerSharePercent ?? 0;
  const partnerName = fin.partnerName || 'Partner';
  const extraInHandCostPaise = fin.extraInHandCostPaise ?? 0;
  const customRevenuePaise = fin.customRevenuePaise ?? 0;

  const effectiveRevenue =
    customRevenuePaise > 0
      ? customRevenuePaise
      : fin.approvedRevenuePaise > 0
      ? fin.approvedRevenuePaise
      : fin.quotedRevenuePaise;

  const grossProfit = fin.actualGrossProfitPaise;
  const partnerCutPaise = Math.round(Math.max(0, grossProfit) * (partnerSharePercent / 100));
  const inHandProfitPaise = grossProfit - partnerCutPaise - extraInHandCostPaise;
  const inHandMarginPercent =
    effectiveRevenue > 0 ? Math.round((inHandProfitPaise / effectiveRevenue) * 1000) / 10 : null;

  return {
    id: fin._id.toString(),
    submissionId: fin.submissionId.toString(),
    enquiryReference: submission.enquiryReference,
    projectCategory: submission.projectCategory,
    clientName: submission.clientSnapshot.name,
    status: submission.status,
    quotedRevenuePaise: fin.quotedRevenuePaise,
    approvedRevenuePaise: fin.approvedRevenuePaise,
    customRevenuePaise,
    collectedRevenuePaise: fin.collectedRevenuePaise,
    outstandingReceivablesPaise: Math.max(0, fin.approvedRevenuePaise - fin.collectedRevenuePaise),
    estimatedDirectCostPaise: fin.estimatedDirectCostPaise,
    actualDirectCostPaise: fin.actualDirectCostPaise,
    estimatedGrossProfitPaise: fin.estimatedGrossProfitPaise,
    actualGrossProfitPaise: fin.actualGrossProfitPaise,
    grossMarginPercent: fin.grossMarginPercent,
    markupPercent: fin.markupPercent,
    targetMarginPercent: fin.targetMarginPercent,
    partnerSharePercent,
    partnerName,
    extraInHandCostPaise,
    partnerCutPaise,
    inHandProfitPaise,
    inHandMarginPercent,
    isBelowTargetMargin: isBelowTarget,
    hasMissingCosts,
    costEntries: costEntries.map(serializeCostEntry),
    paymentRecords: paymentRecords.map(serializePaymentRecord),
    financialNotes: fin.financialNotes,
    updatedAt: fin.updatedAt.toISOString(),
  };
}
