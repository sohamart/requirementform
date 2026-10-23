import { describe, it, expect } from 'vitest';
import { QuotationService } from '../services/quotationService.js';
import { PDFService, cleanText } from '../services/pdfService.js';
import { ClientQuotationDTO, QuotationLineItem } from '@shared/types/index.js';

describe('Quotation PDF Generator & Financial Milestone Calculations', () => {
  describe('Mathematical Reconciliation of Payment Milestones', () => {
    it('reconciles ₹59,999 with 40%/40%/20% milestones to sum to exactly ₹59,999 with zero rounding creep', () => {
      const totalPaise = 5999900; // ₹59,999
      const configuredMilestones = [
        { title: 'Kickoff', percent: 40, amountPaise: 0, trigger: 'Start' },
        { title: 'Alpha', percent: 40, amountPaise: 0, trigger: 'Build' },
        { title: 'Launch', percent: 20, amountPaise: 0, trigger: 'Deploy' },
      ];

      const reconciled = QuotationService.reconcilePaymentMilestones(configuredMilestones, totalPaise);

      expect(reconciled).toHaveLength(3);
      expect(reconciled[0].amountPaise).toBe(2400000); // ₹24,000
      expect(reconciled[1].amountPaise).toBe(2400000); // ₹24,000
      expect(reconciled[2].amountPaise).toBe(1199900); // ₹11,999 (balanced remainder)

      const sumPaise = reconciled.reduce((acc, m) => acc + m.amountPaise, 0);
      expect(sumPaise).toBe(totalPaise);
      expect(sumPaise).toBe(5999900); // ₹59,999.00 exact!
    });

    it('guarantees sum(milestones.amountPaise) === totalPaise for arbitrary totals and odd percentage splits', () => {
      const testCases = [
        { totalPaise: 10000000, splits: [50, 30, 20] }, // ₹1,00,000
        { totalPaise: 7345600, splits: [33, 33, 34] },   // ₹73,456
        { totalPaise: 2999900, splits: [40, 40, 20] },   // ₹29,999
        { totalPaise: 1549900, splits: [50, 50] },       // ₹15,499
        { totalPaise: 9999999, splits: [25, 25, 25, 25] }, // ₹99,999.99
      ];

      for (const tc of testCases) {
        const inputMilestones = tc.splits.map((s, idx) => ({
          title: `Milestone ${idx + 1}`,
          percent: s,
          amountPaise: 0,
          trigger: `Trigger ${idx + 1}`,
        }));

        const result = QuotationService.reconcilePaymentMilestones(inputMilestones, tc.totalPaise);
        const sum = result.reduce((acc, m) => acc + m.amountPaise, 0);

        expect(sum).toBe(tc.totalPaise);
      }
    });
  });

  describe('Hosting & Third-Party Cost Contradiction Reconciliation', () => {
    it('detects hosting line items and prevents claiming hosting is excluded', () => {
      const lineItemsWithHosting: QuotationLineItem[] = [
        { id: '1', title: 'Custom Website Design', quantity: 1, unitPricePaise: 5000000, totalPaise: 5000000 },
        { id: '2', title: '1 Year Managed Cloud Hosting & Backups', quantity: 1, unitPricePaise: 999900, totalPaise: 999900 },
      ];

      const defaultExclusions = [
        'Domain registration & DNS management costs are paid directly to domain registrars.',
        'Cloud hosting & server subscription fees are paid directly to AWS / DigitalOcean / Vercel.',
        'Paid third-party API usage (e.g. Twilio, OpenAI, Google Maps) is billed to client accounts directly.',
      ];

      const reconciledExclusions = QuotationService.reconcileExclusions(lineItemsWithHosting, defaultExclusions);

      // Must acknowledge hosting is included for the term
      const hostingExclusion = reconciledExclusions.find(e => e.toLowerCase().includes('hosting'));
      expect(hostingExclusion).toBeDefined();
      expect(hostingExclusion?.toLowerCase()).toContain('included for the initial term');
      expect(hostingExclusion?.toLowerCase()).not.toContain('paid directly to aws');
    });

    it('keeps client-paid hosting statement when hosting is NOT in line items', () => {
      const lineItemsWithoutHosting: QuotationLineItem[] = [
        { id: '1', title: 'Custom Mobile Application', quantity: 1, unitPricePaise: 8000000, totalPaise: 8000000 },
      ];

      const defaultExclusions = [
        'Domain registration & DNS management costs are paid directly to domain registrars.',
        'Cloud hosting & server subscription fees are paid directly to AWS / DigitalOcean / Vercel.',
      ];

      const reconciledExclusions = QuotationService.reconcileExclusions(lineItemsWithoutHosting, defaultExclusions);

      const hostingExclusion = reconciledExclusions.find(e => e.toLowerCase().includes('hosting'));
      expect(hostingExclusion).toBeDefined();
      expect(hostingExclusion?.toLowerCase()).toContain('billed directly to client');
    });
  });

  describe('Character Normalization for Standard PDF Fonts', () => {
    it('normalizes cross symbols, em-dashes, and currency symbols into clean standard glyphs', () => {
      expect(cleanText('Weblets × Esyus')).toBe('Weblets x Esyus');
      expect(cleanText('Full-Stack — Modern Architecture')).toBe('Full-Stack - Modern Architecture');
      expect(cleanText('“Smart Quotes” & ‘Apostrophes’')).toBe('"Smart Quotes" & \'Apostrophes\'');
      expect(cleanText('₹59,999')).toBe('INR 59,999');
      expect(cleanText(null)).toBe('');
      expect(cleanText(undefined)).toBe('');
    });
  });

  describe('PDF Document Generation', () => {
    it('generates a valid binary PDF buffer with correct headers and sanitized client data', async () => {
      const mockQuote: ClientQuotationDTO = {
        id: 'mock-qte-id-1',
        quotationNumber: 'QTE-2026-999',
        revisionNumber: 1,
        submissionId: 'sub-id-1',
        packageName: 'Enterprise Modern Web Application',
        scopeSummary: 'Custom full-stack web application with secure client authentication and automated reporting.',
        status: 'issued',
        brandSnapshot: {
          name: 'Weblets × Esyus',
          tagline: 'Modern Digital Engineering & Scalable Cloud Solutions',
          logoText: 'WEB',
          primaryColor: '#FF6B00',
          secondaryColor: '#0F172A',
          contactEmail: 'solutions@agency.com',
          contactPhone: '+91 98765 43210',
          websiteUrl: 'https://agency.com',
          addressLines: ['Cyber Hub, Gurgaon 122002'],
        },
        clientSnapshot: {
          name: 'Vikram Malhotra',
          email: 'vikram@enterprise.com',
          company: 'Malhotra Enterprises',
          phone: '+91 99887 76655',
        },
        lineItems: [
          {
            id: 'item-1',
            title: 'Full-Stack Architecture & API Design',
            description: 'Scalable Node.js / React platform with PostgreSQL and Redis caching.',
            quantity: 1,
            unitPricePaise: 5000000,
            totalPaise: 5000000,
          },
          {
            id: 'item-2',
            title: '1 Year Managed Cloud Infrastructure',
            description: 'AWS ECS container deployment, SSL termination, and automated daily backups.',
            quantity: 1,
            unitPricePaise: 999900,
            totalPaise: 999900,
          },
        ],
        subtotalPaise: 5999900,
        discountPaise: 0,
        taxLines: [],
        totalPaise: 5999900,
        estimatedTimelineDays: 30,
        paymentMilestones: [
          { title: 'Project Initiation', percent: 40, amountPaise: 2400000, trigger: 'Upon signing' },
          { title: 'Milestone 2 Alpha', percent: 40, amountPaise: 2400000, trigger: 'Upon Alpha' },
          { title: 'Final Handover', percent: 20, amountPaise: 1199900, trigger: 'Upon Deployment' },
        ],
        revisionPolicy: 'Up to 3 rounds of design and functional revisions included.',
        exclusions: [
          'Domain registration renewal fees are paid directly to domain registrars.',
          'Managed cloud hosting infrastructure & backups are included for the initial term as itemized.',
        ],
        clientResponsibilities: [
          'Provide brand assets and timely feedback.',
        ],
        termsAndConditions: [
          'This proposal is valid for 30 calendar days.',
          'All intellectual property rights transfer upon final clearance.',
        ],
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      const pdfBuffer = await PDFService.generateQuotationPDF(mockQuote);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(5000);
      // Valid PDF magic header
      expect(pdfBuffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
    });
  });
});
