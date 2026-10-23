import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import {
  serializeClientSubmission,
  serializeClientQuotation,
} from '../utils/serializers.js';
import { PDFService } from '../services/pdfService.js';
import { ClientSubmissionDTO, ClientQuotationDTO } from '../shared/types/index.js';

describe('Continuous Privacy Leak Gate Test Suite', () => {
  it('strictly guarantees serializeClientSubmission omits private step notes, internal costs and margins', () => {
    const rawMockSubmission: any = {
      _id: new mongoose.Types.ObjectId(),
      enquiryReference: 'REQ-2026-TEST',
      clientId: new mongoose.Types.ObjectId(),
      clientSnapshot: {
        name: 'Test Client',
        email: 'client@example.com',
        phone: '+91 99999 88888',
        company: 'Confidential Corp',
      },
      formDefinitionId: new mongoose.Types.ObjectId(),
      formVersion: 1,
      projectCategory: 'website',
      status: 'submitted',
      answers: {
        businessName: 'Confidential Corp',
        websiteType: 'E-commerce Store',
      },
      submittedAt: new Date(),
      updatedAt: new Date(),
      revisionNumber: 1,
      // Injected private fields that must NEVER leak
      internalNotes: 'SECRET_ADMIN_ESTIMATE_NOTE: Low margin risk, client is difficult.',
      directCostPaise: 4000000,
      grossProfitPaise: 2000000,
      grossMarginPercent: 33.3,
      contractorAllocation: 'SECRET_SUBCONTRACTOR_50_PERCENT',
      financialNotes: 'PRIVATE_FINANCIAL_COMMENTARY: High complexity',
    };

    const clientDTO = serializeClientSubmission(rawMockSubmission, false);

    // Assert that clientDTO does NOT contain any of the private fields
    expect((clientDTO as any).internalNotes).toBeUndefined();
    expect((clientDTO as any).directCostPaise).toBeUndefined();
    expect((clientDTO as any).grossProfitPaise).toBeUndefined();
    expect((clientDTO as any).grossMarginPercent).toBeUndefined();
    expect((clientDTO as any).contractorAllocation).toBeUndefined();
    expect((clientDTO as any).financialNotes).toBeUndefined();

    // Verify allowed fields are intact
    expect(clientDTO.enquiryReference).toBe('REQ-2026-TEST');
    expect(clientDTO.answers.businessName).toBe('Confidential Corp');
  });

  it('strictly guarantees serializeClientQuotation omits internal costs, markup and margin fields', () => {
    const rawMockQuote: any = {
      _id: new mongoose.Types.ObjectId(),
      quotationNumber: 'QTE-2026-001',
      revisionNumber: 1,
      submissionId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      status: 'issued',
      brandSnapshot: {
        name: 'Weblets',
        tagline: 'Modern Digital Engineering',
        logoText: 'WEBLETS',
        primaryColor: '#FF6B00',
        secondaryColor: '#121216',
        contactEmail: 'contact@weblets.io',
        contactPhone: '+91 98765 43210',
        websiteUrl: 'https://weblets.io',
        addressLines: ['Cyber City'],
      },
      clientSnapshot: {
        name: 'Test Client',
        email: 'client@example.com',
      },
      packageName: 'Business Website',
      scopeSummary: 'Standard 7 page business website',
      lineItems: [
        {
          id: 'item-1',
          title: 'Business Website Core Package',
          quantity: 1,
          unitPricePaise: 899900,
          totalPaise: 899900,
          // Injected private line item costs
          internalLabourCostPaise: 300000,
          markupPercent: 200,
        },
      ],
      subtotalPaise: 899900,
      discountPaise: 0,
      taxLines: [],
      totalPaise: 899900,
      paymentMilestones: [
        { title: 'Kickoff', percent: 50, amountPaise: 449950, trigger: 'Start' },
      ],
      revisionPolicy: 'Up to 3 revisions',
      exclusions: ['Hosting fees'],
      clientResponsibilities: ['Assets'],
      termsAndConditions: ['30 days validity'],
      createdAt: new Date(),
      // Injected private proposal fields
      internalDirectCostPaise: 400000,
      expectedGrossProfitPaise: 499900,
      targetMarginPercent: 45,
      actualMarginPercent: 55.5,
      privateAdminComments: 'PRIVATE_ADMIN_ONLY_APPROVAL_NOTES',
    };

    const clientQuoteDTO = serializeClientQuotation(rawMockQuote);

    // Verify all private fields are completely stripped
    expect((clientQuoteDTO as any).internalDirectCostPaise).toBeUndefined();
    expect((clientQuoteDTO as any).expectedGrossProfitPaise).toBeUndefined();
    expect((clientQuoteDTO as any).targetMarginPercent).toBeUndefined();
    expect((clientQuoteDTO as any).actualMarginPercent).toBeUndefined();
    expect((clientQuoteDTO as any).privateAdminComments).toBeUndefined();
    expect((clientQuoteDTO.lineItems[0] as any).internalLabourCostPaise).toBeUndefined();
    expect((clientQuoteDTO.lineItems[0] as any).markupPercent).toBeUndefined();

    // Verify client total is preserved
    expect(clientQuoteDTO.totalPaise).toBe(899900);
    expect(clientQuoteDTO.quotationNumber).toBe('QTE-2026-001');
  });

  it('guarantees PDFService creates Requirement Details PDF without leaking private data', async () => {
    const cleanSubDTO: ClientSubmissionDTO = {
      id: 'sub-123',
      enquiryReference: 'REQ-2026-PRIVACY-CHECK',
      clientId: 'client-123',
      clientSnapshot: {
        name: 'Safe Client',
        email: 'safe@client.com',
      },
      formDefinitionId: 'form-123',
      formVersion: 1,
      projectCategory: 'website',
      status: 'submitted',
      answers: {
        businessName: 'Safe Business Inc',
        category: 'Portfolio Website',
      },
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revisionNumber: 1,
    };

    const pdfBuffer = await PDFService.generateRequirementDetailsPDF(cleanSubDTO);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000); // Valid PDF binary

    // Verify PDF binary does not contain leak markers
    const pdfString = pdfBuffer.toString('utf-8');
    expect(pdfString).not.toContain('SECRET_ADMIN_ESTIMATE_NOTE');
    expect(pdfString).not.toContain('PRIVATE_FINANCIAL_COMMENTARY');
    expect(pdfString).not.toContain('directCostPaise');
    expect(pdfString).not.toContain('grossMarginPercent');
  });

  it('guarantees PDFService creates Quotation Proposal PDF without leaking private costs or margins', async () => {
    const cleanQuoteDTO: ClientQuotationDTO = {
      id: 'quote-123',
      quotationNumber: 'QTE-2026-PRIVACY-CHECK',
      revisionNumber: 1,
      submissionId: 'sub-123',
      status: 'issued',
      brandSnapshot: {
        name: 'Weblets',
        tagline: 'Modern Web Engineering',
        logoText: 'WEBLETS',
        primaryColor: '#FF6B00',
        secondaryColor: '#121216',
        contactEmail: 'contact@weblets.io',
        contactPhone: '+91 98765 43210',
        websiteUrl: 'https://weblets.io',
        addressLines: ['Tech City'],
      },
      clientSnapshot: {
        name: 'Test Client',
        email: 'client@test.com',
      },
      packageName: 'Landing Page Package',
      scopeSummary: 'Single page landing page for product launch',
      lineItems: [
        {
          id: 'li-1',
          title: 'High-Conversion Landing Page',
          quantity: 1,
          unitPricePaise: 499900,
          totalPaise: 499900,
        },
      ],
      subtotalPaise: 499900,
      discountPaise: 0,
      taxLines: [],
      totalPaise: 499900,
      paymentMilestones: [
        { title: 'Kickoff', percent: 50, amountPaise: 249950, trigger: 'Start' },
        { title: 'Handover', percent: 50, amountPaise: 249950, trigger: 'Launch' },
      ],
      revisionPolicy: 'Up to 2 rounds of revisions',
      exclusions: ['Domain and hosting costs'],
      clientResponsibilities: ['Provide branding assets'],
      termsAndConditions: ['Valid for 30 days'],
      createdAt: new Date().toISOString(),
    };

    const pdfBuffer = await PDFService.generateQuotationPDF(cleanQuoteDTO);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(2000); // Valid multi-page PDF

    const pdfString = pdfBuffer.toString('utf-8');
    expect(pdfString).not.toContain('internalDirectCostPaise');
    expect(pdfString).not.toContain('grossMarginPercent');
    expect(pdfString).not.toContain('markupPercent');
    expect(pdfString).not.toContain('subcontractor');
  });
});
