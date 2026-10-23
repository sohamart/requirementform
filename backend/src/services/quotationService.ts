import mongoose from 'mongoose';
import crypto from 'crypto';
import { Quotation, IQuotation } from '../models/Quotation.js';
import { Submission } from '../models/Submission.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { ProjectFinancials } from '../models/ProjectFinancials.js';
import { QuotationLineItem, PaymentMilestone } from '@shared/types/index.js';
import { DEFAULT_COMMERCIAL_TERMS } from '@shared/schemas/index.js';
import { calcGrossProfit, calcGrossMarginPercent, calcMarkupPercent } from '@shared/utils/currency.js';

export class QuotationService {
  private static async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const existingQuotes = await Quotation.find({ quotationNumber: new RegExp(`^QTE-${year}-`) })
      .select('quotationNumber')
      .lean();

    let maxNum = 0;
    for (const q of existingQuotes) {
      const match = q.quotationNumber?.match(/QTE-\d{4}-(\d+)/);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (parsed > maxNum) maxNum = parsed;
      }
    }

    let nextNum = maxNum + 1;
    let candidate = `QTE-${year}-${String(nextNum).padStart(3, '0')}`;
    while (await Quotation.exists({ quotationNumber: candidate })) {
      nextNum++;
      candidate = `QTE-${year}-${String(nextNum).padStart(3, '0')}`;
    }
    return candidate;
  }

  /**
   * Reconciles payment milestones so that their sum EQUALS totalPaise exactly down to the last paise.
   * Allocates rounded amounts to earlier milestones and assigns the exact remaining balance to the final milestone.
   */
  static reconcilePaymentMilestones(
    milestones: PaymentMilestone[] | undefined,
    totalPaise: number
  ): PaymentMilestone[] {
    const defaultMilestones: PaymentMilestone[] = [
      {
        title: 'Advance Mobilization & Project Initiation',
        percent: 20,
        amountPaise: 0,
        trigger: 'Mandatory 20% advance upon contract signing & resource mobilization',
      },
      {
        title: 'UI/UX Design System & Core Architecture Preview',
        percent: 30,
        amountPaise: 0,
        trigger: 'Upon staging presentation of interactive prototypes & database schema approval',
      },
      {
        title: 'Core Development & Functional Alpha Release',
        percent: 30,
        amountPaise: 0,
        trigger: 'Upon functional module completion, third-party integrations & client walkthrough',
      },
      {
        title: 'Final UAT Sign-off & Production Deployment',
        percent: 20,
        amountPaise: 0,
        trigger: 'Prior to DNS go-live, production deployment, and 100% IP/credential handover',
      },
    ];

    const source = milestones && milestones.length > 0 ? milestones : defaultMilestones;
    let allocatedPaise = 0;
    const isWholeRupees = totalPaise % 100 === 0;

    return source.map((m, index) => {
      let amountPaise = 0;
      if (index === source.length - 1) {
        amountPaise = Math.max(0, totalPaise - allocatedPaise);
      } else {
        if (isWholeRupees) {
          const rupees = Math.round((totalPaise / 100) * (m.percent / 100));
          amountPaise = rupees * 100;
        } else {
          amountPaise = Math.round(totalPaise * (m.percent / 100));
        }
        allocatedPaise += amountPaise;
      }
      return {
        title: m.title,
        percent: m.percent,
        amountPaise,
        trigger: m.trigger,
      };
    });
  }

  /**
   * Reconciles exclusions against line items to eliminate commercial contradictions (e.g. hosting or domains).
   */
  static reconcileExclusions(lineItems: QuotationLineItem[], customExclusions?: string[]): string[] {
    const hasHosting = lineItems.some((li) =>
      /hosting|server|vps|cloud compute|aws|digitalocean|infrastructure/i.test(
        `${li.title} ${li.description || ''}`
      )
    );

    const hasDomain = lineItems.some((li) =>
      /domain|dns/i.test(`${li.title} ${li.description || ''}`)
    );

    const base = customExclusions && customExclusions.length > 0 ? [...customExclusions] : [];

    // Filter out contradictory items
    const filtered = base.filter((ex) => {
      if (hasHosting && /cloud hosting|server compute|vps infrastructure/i.test(ex)) {
        return false;
      }
      if (hasDomain && /domain registration|annual dns/i.test(ex)) {
        return false;
      }
      return true;
    });

    const reconciled: string[] = [];

    if (hasDomain) {
      reconciled.push(
        'Primary domain registration is included for Year 1 as itemized; subsequent annual renewals are handled through the domain registrar.'
      );
    } else {
      reconciled.push(
        'Domain registration & annual DNS renewal fees paid directly by client to domain registrar.'
      );
    }

    if (hasHosting) {
      reconciled.push(
        'Managed cloud hosting infrastructure & backups are included for the initial term as itemized; specialized cluster expansion beyond quoted bandwidth is billed separately.'
      );
    } else {
      reconciled.push(
        'Cloud hosting, server compute & VPS infrastructure costs billed directly to client accounts (AWS / DigitalOcean / Vercel).'
      );
    }

    reconciled.push(
      'Third-party paid API consumption (SMS gateways, OpenAI tokens, Google Maps platform) billed directly to client accounts.'
    );

    for (const ex of filtered) {
      if (!reconciled.some((r) => r.toLowerCase().includes(ex.toLowerCase().slice(0, 20)))) {
        reconciled.push(ex);
      }
    }

    return reconciled;
  }

  static async createQuotation(data: {
    submissionId: string;
    brandProfileId: string;
    packageName?: string;
    scopeSummary?: string;
    lineItems: QuotationLineItem[];
    discountPaise?: number;
    estimatedTimelineDays?: number;
    paymentMilestones?: PaymentMilestone[];
    revisionPolicy?: string;
    exclusions?: string[];
    clientResponsibilities?: string[];
    termsAndConditions?: string[];
    validityDays?: number;
    status?: 'draft' | 'estimate' | 'issued' | 'approved';
  }): Promise<IQuotation> {
    const submission = await Submission.findById(data.submissionId);
    if (!submission) {
      throw new Error('Submission not found.');
    }

    // Check if quotation already exists for this requirement
    const existingQuotation = await Quotation.findOne({ submissionId: data.submissionId });
    if (existingQuotation) {
      throw new Error(
        `Quotation already exists for this requirement (${existingQuotation.quotationNumber}). Please edit the existing quotation.`
      );
    }

    const brand = await BrandProfile.findById(data.brandProfileId);
    if (!brand) {
      throw new Error('Brand profile not found.');
    }

    // Calculate subtotal and total in paise
    let subtotalPaise = 0;
    const sanitizedLineItems = data.lineItems.map((item) => {
      const itemTotal = item.quantity * item.unitPricePaise;
      subtotalPaise += itemTotal;
      return {
        ...item,
        totalPaise: itemTotal,
      };
    });

    const discountPaise = data.discountPaise || 0;
    const totalPaise = Math.max(0, subtotalPaise - discountPaise);

    const quotationNumber = await this.generateQuotationNumber();
    const issuedAt = new Date();
    const validUntil = new Date();
    validUntil.setDate(issuedAt.getDate() + (data.validityDays || 30));

    // Reconcile milestones with 100% mathematical precision
    const paymentMilestones = this.reconcilePaymentMilestones(data.paymentMilestones, totalPaise);

    // Reconcile exclusions to resolve any hosting contradiction
    const exclusions = this.reconcileExclusions(sanitizedLineItems, data.exclusions);

    const quotation = await Quotation.create({
      quotationNumber,
      revisionNumber: 1,
      submissionId: submission._id,
      clientId: submission.clientId,
      status: data.status || 'draft',
      brandSnapshot: {
        name: brand.name,
        tagline: brand.tagline,
        logoText: brand.logoText,
        logoUrl: brand.logoUrl,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
        contactEmail: brand.contactEmail,
        contactPhone: brand.contactPhone,
        websiteUrl: brand.websiteUrl,
        addressLines: brand.addressLines,
      },
      clientSnapshot: submission.clientSnapshot,
      packageName: data.packageName || 'Custom Development Package',
      scopeSummary: data.scopeSummary || 'Turnkey digital solution developed to client requirements.',
      lineItems: sanitizedLineItems,
      subtotalPaise,
      discountPaise,
      taxLines: [], // Zero tax - empty array preserved
      totalPaise,
      estimatedTimelineDays: data.estimatedTimelineDays || 14,
      paymentMilestones,
      revisionPolicy:
        data.revisionPolicy || 'Includes up to 3 structured rounds of revisions before production sign-off.',
      exclusions,
      clientResponsibilities: data.clientResponsibilities || [
        'Provide all required logos, images, copy and product assets within 5 business days.',
        'Designate a single primary point of contact for milestone reviews and feedback.',
        'Review and provide structured feedback within 3 business days of preview releases.',
      ],
      termsAndConditions:
        data.termsAndConditions && data.termsAndConditions.length > 0
          ? data.termsAndConditions
          : DEFAULT_COMMERCIAL_TERMS,
      issuedAt,
      validUntil,
    });

    // Update Submission status if quoted
    if (data.status === 'issued') {
      submission.status = 'quoted';
      await submission.save();
    }

    // Sync with Project Financials
    await this.syncFinancials(submission._id.toString(), quotation);

    return quotation;
  }

  static async updateQuotation(
    id: string,
    data: Partial<{
      status: 'draft' | 'estimate' | 'issued' | 'approved' | 'rejected' | 'expired';
      lineItems: QuotationLineItem[];
      discountPaise: number;
      packageName: string;
      scopeSummary: string;
      estimatedTimelineDays: number;
      paymentMilestones: PaymentMilestone[];
      revisionPolicy: string;
      exclusions: string[];
      clientResponsibilities: string[];
      termsAndConditions: string[];
    }>
  ): Promise<IQuotation | null> {
    const quotation = await Quotation.findById(id);
    if (!quotation) return null;

    if (data.lineItems) {
      let subtotalPaise = 0;
      const sanitized = data.lineItems.map((item) => {
        const itemTotal = item.quantity * item.unitPricePaise;
        subtotalPaise += itemTotal;
        return { ...item, totalPaise: itemTotal };
      });
      quotation.lineItems = sanitized as any;
      quotation.subtotalPaise = subtotalPaise;
    }

    if (data.discountPaise !== undefined) {
      quotation.discountPaise = data.discountPaise;
    }

    quotation.totalPaise = Math.max(0, quotation.subtotalPaise - quotation.discountPaise);

    if (data.status) quotation.status = data.status;
    if (data.packageName) quotation.packageName = data.packageName;
    if (data.scopeSummary) quotation.scopeSummary = data.scopeSummary;
    if (data.estimatedTimelineDays) quotation.estimatedTimelineDays = data.estimatedTimelineDays;
    
    // Always reconcile milestones to match new totalPaise exactly
    quotation.paymentMilestones = this.reconcilePaymentMilestones(
      data.paymentMilestones || quotation.paymentMilestones,
      quotation.totalPaise
    ) as any;

    if (data.revisionPolicy) quotation.revisionPolicy = data.revisionPolicy;

    // Always reconcile exclusions against line items
    quotation.exclusions = this.reconcileExclusions(
      quotation.lineItems,
      data.exclusions || quotation.exclusions
    );

    if (data.clientResponsibilities) quotation.clientResponsibilities = data.clientResponsibilities;
    if (data.termsAndConditions) quotation.termsAndConditions = data.termsAndConditions;

    if (data.status === 'approved' && !quotation.approvedAt) {
      quotation.approvedAt = new Date();
    }

    quotation.revisionNumber += 1;
    await quotation.save();

    // Sync with Submission status & Financials
    if (data.status === 'issued') {
      await Submission.findByIdAndUpdate(quotation.submissionId, { status: 'quoted' });
    } else if (data.status === 'approved') {
      await Submission.findByIdAndUpdate(quotation.submissionId, { status: 'in_progress' });
    }

    await this.syncFinancials(quotation.submissionId.toString(), quotation);

    return quotation;
  }

  static async getQuotationBySubmissionId(submissionId: string): Promise<IQuotation | null> {
    return Quotation.findOne({ submissionId: new mongoose.Types.ObjectId(submissionId) }).sort({
      revisionNumber: -1,
    });
  }

  static async getQuotationById(id: string): Promise<IQuotation | null> {
    return Quotation.findById(id);
  }

  static async getAllQuotations(): Promise<IQuotation[]> {
    return Quotation.find().sort({ createdAt: -1 });
  }

  private static async syncFinancials(submissionId: string, quotation: IQuotation): Promise<void> {
    const fin = await ProjectFinancials.findOne({ submissionId });
    if (!fin) return;

    fin.quotationId = quotation._id as any;
    fin.quotedRevenuePaise = quotation.totalPaise;

    if (quotation.status === 'approved') {
      fin.approvedRevenuePaise = quotation.totalPaise;
    }

    const effectiveRevenue = fin.approvedRevenuePaise > 0 ? fin.approvedRevenuePaise : fin.quotedRevenuePaise;
    fin.estimatedGrossProfitPaise = calcGrossProfit(effectiveRevenue, fin.estimatedDirectCostPaise);
    fin.actualGrossProfitPaise = calcGrossProfit(effectiveRevenue, fin.actualDirectCostPaise);
    fin.grossMarginPercent = calcGrossMarginPercent(effectiveRevenue, fin.actualDirectCostPaise);
    fin.markupPercent = calcMarkupPercent(effectiveRevenue, fin.actualDirectCostPaise);

    await fin.save();
  }
}
