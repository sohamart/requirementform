import PDFDocument from 'pdfkit';
import { ClientSubmissionDTO, ClientQuotationDTO } from '@shared/types/index.js';
import { formatINR, toRupees } from '@shared/utils/currency.js';

/**
 * Normalizes unicode characters into clean, standard-font compatible glyphs.
 * Prevents replacement character glyphs (e.g. cross x, dashes, quotes).
 */
export function cleanText(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/[\u00D7\u2715\u2716]/g, 'x') // multiplication sign × -> x
    .replace(/[\u2014\u2013]/g, '-') // em/en dashes — -> -
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes
    .replace(/[\u2022\u2023]/g, '-') // bullets • -> -
    .replace(/[\u20B9]/g, 'INR '); // ₹ symbol fallback -> INR
}

export class PDFService {
  /**
   * Generates a Requirement Details PDF from a sanitized ClientSubmissionDTO.
   * STRICT GUARANTEE: Receives only ClientSubmissionDTO. Never touches internal notes or costs.
   */
  static async generateRequirementDetailsPDF(sub: ClientSubmissionDTO): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Requirement Details - ${sub.enquiryReference}`,
            Author: 'Client Portal',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // --- PAGE HEADER ---
        doc
          .rect(50, 45, 495, 60)
          .fill('#121216');

        doc
          .fillColor('#FF6B00')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('PROJECT SPECIFICATION & REQUIREMENT BRIEF', 65, 58);

        doc
          .fillColor('#FFFFFF')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(`Reference: ${sub.enquiryReference}`, 65, 75);

        doc
          .fillColor('#94A3B8')
          .fontSize(9)
          .font('Helvetica')
          .text(
            `Category: ${sub.projectCategory.toUpperCase()} | Submitted: ${new Date(sub.submittedAt).toLocaleDateString()}`,
            310,
            78,
            { align: 'right' }
          );

        doc.moveDown(3);

        // --- CLIENT DETAILS BLOCK ---
        const startY = 125;
        doc
          .rect(50, startY, 495, 65)
          .fillAndStroke('#F8FAFC', '#E2E8F0');

        doc
          .fillColor('#0F172A')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Client Information', 65, startY + 12);

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#334155')
          .text(`Name: ${sub.clientSnapshot.name}`, 65, startY + 30)
          .text(`Email: ${sub.clientSnapshot.email}`, 65, startY + 45)
          .text(`Company: ${sub.clientSnapshot.company || 'N/A'}`, 280, startY + 30)
          .text(`Phone: ${sub.clientSnapshot.phone || 'N/A'}`, 280, startY + 45);

        // --- SUBMITTED REQUIREMENTS LIST ---
        let currentY = startY + 85;

        doc
          .fillColor('#0F172A')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text('Submitted Requirements & Specifications', 50, currentY);

        currentY += 25;

        const answers = sub.answers || {};
        const entries = Object.entries(answers);

        if (entries.length === 0) {
          doc
            .fontSize(10)
            .font('Helvetica-Oblique')
            .fillColor('#64748B')
            .text('No detailed responses recorded for this requirement submission.', 50, currentY);
        } else {
          entries.forEach(([key, val], index) => {
            // Check page overflow
            if (currentY > 700) {
              doc.addPage();
              currentY = 50;
            }

            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())
              .replace(/_/g, ' ');

            const formattedVal =
              Array.isArray(val)
                ? val.join(', ')
                : typeof val === 'object' && val !== null
                ? JSON.stringify(val)
                : String(val);

            // Row background
            const rowHeight = Math.max(30, 20 + Math.ceil(formattedVal.length / 70) * 12);
            if (index % 2 === 0) {
              doc.rect(50, currentY, 495, rowHeight).fill('#F8FAFC');
            }

            doc
              .fontSize(9)
              .font('Helvetica-Bold')
              .fillColor('#1E293B')
              .text(formattedKey, 60, currentY + 7, { width: 180 });

            doc
              .fontSize(9)
              .font('Helvetica')
              .fillColor('#334155')
              .text(formattedVal, 245, currentY + 7, { width: 290 });

            currentY += rowHeight + 4;
          });
        }

        // --- FOOTER ---
        const pageCount = (doc as any)._pageBuffer ? (doc as any)._pageBuffer.length : 1;
        doc
          .fontSize(8)
          .fillColor('#94A3B8')
          .text(
            `Generated on ${new Date().toLocaleDateString()} | Confidential Project Specification Document`,
            50,
            780,
            { align: 'center', width: 495 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a World-Class Corporate Proposal Quotation PDF.
   * STRICT PRIVACY GUARANTEE: Receives only ClientQuotationDTO. Zero internal costs, margins or private notes.
   * LAYOUT GUARANTEE: Uses responsive bounded widths, safe margins (40pt), two-pass dynamic page counts (Page X of Y),
   * no clipping, dynamic branding from selected profile, and reconciled payment milestones.
   */
  static async generateQuotationPDF(quote: ClientQuotationDTO): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const PAGE_WIDTH = 595.28;
        const PAGE_HEIGHT = 841.89;
        const MARGIN = 40;
        const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 515.28 pt

        const doc = new PDFDocument({
          size: 'A4',
          margin: MARGIN,
          bufferPages: true,
          info: {
            Title: `Commercial Proposal - ${quote.quotationNumber}`,
            Author: quote.brandSnapshot.name,
            Subject: quote.packageName || 'Turnkey Digital Solution',
            Keywords: 'Quotation, Proposal, Commercial Agreement, Web & App Development',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const brand = quote.brandSnapshot;
        const brandColor = brand.primaryColor || '#FF6B00';
        const darkColor = '#0F172A';
        const slate900 = '#0F172A';
        const slate700 = '#334155';
        const slate500 = '#64748B';
        const slate400 = '#94A3B8';
        const borderLight = '#E2E8F0';
        const bgSubtle = '#F8FAFC';

        // Reconcile milestones if sum has any discrepancy
        const milestones = quote.paymentMilestones && quote.paymentMilestones.length > 0
          ? quote.paymentMilestones
          : [
              { title: 'Advance Mobilization & Project Initiation', percent: 20, amountPaise: Math.round(quote.totalPaise * 0.2), trigger: 'Mandatory 20% advance upon contract signing & resource mobilization' },
              { title: 'UI/UX Design System & Core Architecture Preview', percent: 30, amountPaise: Math.round(quote.totalPaise * 0.3), trigger: 'Upon staging presentation of interactive prototypes & database schema approval' },
              { title: 'Core Development & Functional Alpha Release', percent: 30, amountPaise: Math.round(quote.totalPaise * 0.3), trigger: 'Upon functional module completion, third-party integrations & client walkthrough' },
              { title: 'Final UAT Sign-off & Production Deployment', percent: 20, amountPaise: quote.totalPaise - Math.round(quote.totalPaise * 0.2) - Math.round(quote.totalPaise * 0.3) - Math.round(quote.totalPaise * 0.3), trigger: 'Prior to DNS go-live, production deployment, and 100% IP/credential handover' }
            ];

        // Format currency helper safe for standard PDFKit fonts (INR format without missing glyphs)
        const formatRupees = (paise: number) => {
          const rupees = toRupees(paise);
          const hasPaise = paise % 100 !== 0;
          const formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: hasPaise ? 2 : 0,
            maximumFractionDigits: hasPaise ? 2 : 0,
          }).format(rupees);
          return `INR ${formatted}`;
        };

        // Date formatting helper
        const formatDate = (dateStr?: string | Date) => {
          const d = dateStr ? new Date(dateStr) : new Date();
          return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        const issueDateStr = formatDate(quote.createdAt);
        const validUntilDate = quote.validUntil
          ? formatDate(quote.validUntil)
          : formatDate(new Date(Date.now() + (quote.estimatedTimelineDays || 30) * 86400000));

        // ================= PAGE 1: EXECUTIVE SUMMARY & COMMERCIAL OVERVIEW =================
        // Top Brand & Document Header
        let y = 40;

        // Left Branding Block
        doc.roundedRect(MARGIN, y, 40, 40, 8).fill(brandColor);
        const badgeInitial = brand.logoText ? brand.logoText.slice(0, 3).toUpperCase() : brand.name.slice(0, 2).toUpperCase();
        doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text(cleanText(badgeInitial), MARGIN, y + 13, { width: 40, align: 'center' });

        doc.fillColor(slate900).fontSize(16).font('Helvetica-Bold').text(cleanText(brand.name), MARGIN + 50, y + 4, { width: 250 });
        doc.fillColor(slate500).fontSize(8.5).font('Helvetica').text(cleanText(brand.tagline || 'Modern Digital Engineering & Enterprise Architecture'), MARGIN + 50, y + 24, { width: 250, lineGap: 1 });

        // Right Proposal Reference Block (Strictly Bounded Inside Margin)
        const rightBoxWidth = 210.28;
        const rightBoxX = PAGE_WIDTH - MARGIN - rightBoxWidth; // 595.28 - 40 - 210.28 = 345

        doc.fillColor(brandColor).fontSize(8).font('Helvetica-Bold').text('COMMERCIAL PROPOSAL', rightBoxX, y + 3, { width: rightBoxWidth, align: 'right' });
        doc.fillColor(slate900).fontSize(13).font('Helvetica-Bold').text(quote.quotationNumber, rightBoxX, y + 14, { width: rightBoxWidth, align: 'right' });
        doc.fillColor(slate500).fontSize(8.5).font('Helvetica').text(`Revision: v${quote.revisionNumber} | Date: ${issueDateStr}`, rightBoxX, y + 30, { width: rightBoxWidth, align: 'right' });
        doc.fillColor(slate500).fontSize(8.5).font('Helvetica').text(`Valid Until: ${validUntilDate}`, rightBoxX, y + 41, { width: rightBoxWidth, align: 'right' });

        // Header Divider Rule
        y = 92;
        doc.rect(MARGIN, y, CONTENT_WIDTH, 1).fill(borderLight);

        // Project Specification Card (Dynamically Bounded for Long Titles)
        y += 14;
        const specTitle = cleanText(quote.packageName || 'Comprehensive Digital Solution Package');
        const specDesc = cleanText(quote.scopeSummary || 'Turnkey digital solution engineered to client specifications with responsive architecture.');

        const specTitleH = doc.fontSize(13).font('Helvetica-Bold').heightOfString(specTitle, { width: CONTENT_WIDTH - 28 });
        const specDescH = doc.fontSize(8.5).font('Helvetica').heightOfString(specDesc, { width: CONTENT_WIDTH - 28, lineGap: 2 });
        const specCardHeight = Math.max(74, 12 + 10 + specTitleH + 6 + specDescH + 12);

        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, specCardHeight, 6).fillAndStroke(bgSubtle, borderLight);
        doc.roundedRect(MARGIN, y, 4, specCardHeight, 2).fill(brandColor);

        doc.fillColor(brandColor).fontSize(7.5).font('Helvetica-Bold').text('PROJECT PROPOSAL & SPECIFICATION BRIEF', MARGIN + 14, y + 10);
        doc.fillColor(slate900).fontSize(13).font('Helvetica-Bold').text(specTitle, MARGIN + 14, y + 22, { width: CONTENT_WIDTH - 28 });
        doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(
          specDesc,
          MARGIN + 14,
          y + 22 + specTitleH + 5,
          { width: CONTENT_WIDTH - 28, lineGap: 2 }
        );

        // Two-Column Grid: Client Information & Service Provider Details
        y += specCardHeight + 14;
        const panelWidth = (CONTENT_WIDTH - 14) / 2; // ~250.64 pt
        const panelHeight = 112;

        // Left Panel: Client Information
        const leftPanelX = MARGIN;
        doc.roundedRect(leftPanelX, y, panelWidth, panelHeight, 6).fillAndStroke(bgSubtle, borderLight);
        doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text('PREPARED FOR (CLIENT)', leftPanelX + 12, y + 10);
        doc.rect(leftPanelX + 12, y + 22, panelWidth - 24, 0.5).fill(borderLight);

        doc.fillColor(slate900).fontSize(10).font('Helvetica-Bold').text(quote.clientSnapshot.name, leftPanelX + 12, y + 30, { width: panelWidth - 24 });
        if (quote.clientSnapshot.company) {
          doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(`Organization: ${quote.clientSnapshot.company}`, leftPanelX + 12, y + 46, { width: panelWidth - 24 });
        }
        doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(`Email: ${quote.clientSnapshot.email}`, leftPanelX + 12, quote.clientSnapshot.company ? y + 62 : y + 48, { width: panelWidth - 24 });
        if (quote.clientSnapshot.phone) {
          doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(`Phone: ${quote.clientSnapshot.phone}`, leftPanelX + 12, quote.clientSnapshot.company ? y + 78 : y + 64, { width: panelWidth - 24 });
        }

        // Right Panel: Service Provider Details
        const rightPanelX = MARGIN + panelWidth + 14;
        doc.roundedRect(rightPanelX, y, panelWidth, panelHeight, 6).fillAndStroke(bgSubtle, borderLight);
        doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text('SERVICE PROVIDER (AGENCY)', rightPanelX + 12, y + 10);
        doc.rect(rightPanelX + 12, y + 22, panelWidth - 24, 0.5).fill(borderLight);

        doc.fillColor(slate900).fontSize(10).font('Helvetica-Bold').text(cleanText(brand.name), rightPanelX + 12, y + 30, { width: panelWidth - 24 });
        doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(`Email: ${brand.contactEmail}`, rightPanelX + 12, y + 46, { width: panelWidth - 24 });
        doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(`Phone: ${brand.contactPhone}`, rightPanelX + 12, y + 62, { width: panelWidth - 24 });
        doc.fillColor(slate700).fontSize(8.5).font('Helvetica').text(`Website: ${brand.websiteUrl}`, rightPanelX + 12, y + 78, { width: panelWidth - 24 });
        if (brand.addressLines && brand.addressLines.length > 0) {
          doc.fillColor(slate500).fontSize(7.5).font('Helvetica').text(brand.addressLines.slice(0, 2).join(', '), rightPanelX + 12, y + 92, { width: panelWidth - 24 });
        }

        // Total Commercial Investment Overview Banner
        y += panelHeight + 14;
        const totalBannerHeight = 92;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, totalBannerHeight, 8).fill(darkColor);

        // Left Total Banner Info
        doc.fillColor(slate400).fontSize(7.5).font('Helvetica-Bold').text('TOTAL PROPOSAL INVESTMENT (INR)', MARGIN + 18, y + 16);
        doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text(formatRupees(quote.totalPaise), MARGIN + 18, y + 28);
        const discountSubtext = quote.discountPaise > 0
          ? `Includes INR ${formatINR(quote.discountPaise, false)} commercial waiver. B2B Services | Preserved zero-tax schedule.`
          : 'Direct B2B Development Services | Preserved zero-tax schedule as configured.';
        doc.fillColor(slate400).fontSize(7.5).font('Helvetica').text(cleanText(discountSubtext), MARGIN + 18, y + 58, { width: 260 });

        // Right Total Banner Meta (Strictly Bounded)
        const rightMetaWidth = 200;
        const rightMetaX = PAGE_WIDTH - MARGIN - rightMetaWidth - 18;
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(`Delivery Timeline: ${quote.estimatedTimelineDays || 14} Working Days`, rightMetaX, y + 16, { width: rightMetaWidth, align: 'right' });
        doc.fillColor(slate400).fontSize(8).font('Helvetica').text(`Quotation Validity: 30 Calendar Days`, rightMetaX, y + 32, { width: rightMetaWidth, align: 'right' });
        const advancePercent = milestones[0]?.percent || 20;
        doc.fillColor(brandColor).fontSize(8).font('Helvetica-Bold').text(`Kick-off Deposit: ${advancePercent}% Advance (Mandatory)`, rightMetaX, y + 60, { width: rightMetaWidth, align: 'right' });

        // Executive Engagement Highlights (2x2 Grid)
        y += totalBannerHeight + 16;
        doc.fillColor(slate900).fontSize(10.5).font('Helvetica-Bold').text('Executive Engagement Standards & Delivery Governance', MARGIN, y);
        doc.fillColor(slate500).fontSize(8).font('Helvetica').text('Key delivery commitments and technical governance principles governing this proposal.', MARGIN, y + 14);

        y += 28;
        const boxWidth = (CONTENT_WIDTH - 12) / 2;
        const boxHeight = 62;

        const highlights = [
          {
            title: 'Iterative Agile Delivery',
            desc: 'Sprint-based milestones with staging environment previews for structured feedback and approval.',
          },
          {
            title: 'Production Hardening',
            desc: 'OWASP security compliance, responsive testing, and performance optimization prior to go-live.',
          },
          {
            title: '100% IP & Code Ownership',
            desc: 'Complete intellectual property rights, repositories, and credentials transfer upon final clearance.',
          },
          {
            title: 'Dedicated Warranty Support',
            desc: '30-day post-launch warranty covering defect remediation, DNS handover, and transition onboarding.',
          },
        ];

        highlights.forEach((h, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const bx = MARGIN + col * (boxWidth + 12);
          const by = y + row * (boxHeight + 10);

          doc.roundedRect(bx, by, boxWidth, boxHeight, 5).fillAndStroke(bgSubtle, borderLight);
          doc.roundedRect(bx, by, 3, boxHeight, 1).fill(brandColor);

          doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text(h.title, bx + 10, by + 8, { width: boxWidth - 18 });
          doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(h.desc, bx + 10, by + 22, { width: boxWidth - 18, lineGap: 1.5 });
        });

        // ================= PAGE 2: ITEMIZED DELIVERABLES & PRICING TABLE =================
        doc.addPage();
        y = 72;

        doc.fillColor(brandColor).fontSize(8).font('Helvetica-Bold').text('SCOPE SPECIFICATIONS', MARGIN, y);
        doc.fillColor(slate900).fontSize(13).font('Helvetica-Bold').text('Itemized Scope of Work & Pricing Schedule', MARGIN, y + 11);
        doc.fillColor(slate500).fontSize(8.5).font('Helvetica').text(
          'Detailed breakdown of deliverables, technical modules, quantities, and commercial rates.',
          MARGIN,
          y + 26
        );

        y += 42;

        // Table Header Function (Optimized Column Widths to Prevent Number Wrapping)
        const renderPricingTableHeader = (currentY: number) => {
          doc.roundedRect(MARGIN, currentY, CONTENT_WIDTH, 22, 4).fill(darkColor);
          doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
          doc.text('#', MARGIN + 4, currentY + 7, { width: 20, align: 'center' });
          doc.text('Deliverable & Service Component', MARGIN + 28, currentY + 7, { width: 155 });
          doc.text('Detailed Inclusions & Specifications', MARGIN + 188, currentY + 7, { width: 165 });
          doc.text('Qty', MARGIN + 358, currentY + 7, { width: 24, align: 'center' });
          doc.text('Rate', MARGIN + 386, currentY + 7, { width: 58, align: 'right' });
          doc.text('Total (INR)', MARGIN + 448, currentY + 7, { width: 62, align: 'right' });
          return currentY + 22;
        };

        y = renderPricingTableHeader(y);

        // Render Table Rows
        quote.lineItems.forEach((item, idx) => {
          const title = cleanText(item.title);
          const desc = cleanText(item.description || 'Comprehensive module architecture and integration as specified.');

          // Calculate dynamic height
          const titleH = doc.fontSize(8.5).font('Helvetica-Bold').heightOfString(title, { width: 150 });
          const descH = doc.fontSize(7.5).font('Helvetica').heightOfString(desc, { width: 165, lineGap: 1 });
          const rowHeight = Math.max(28, Math.max(titleH, descH) + 14);

          // Check for page break
          if (y + rowHeight > 730) {
            doc.addPage();
            y = renderPricingTableHeader(72);
          }

          const isEven = idx % 2 === 0;
          doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(isEven ? '#FFFFFF' : bgSubtle);
          doc.rect(MARGIN, y + rowHeight - 0.5, CONTENT_WIDTH, 0.5).fill(borderLight);

          // Col 0: Item #
          doc.fillColor(slate500).fontSize(8).font('Helvetica-Bold').text(String(idx + 1).padStart(2, '0'), MARGIN + 4, y + 8, { width: 20, align: 'center' });

          // Col 1: Title
          doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text(title, MARGIN + 28, y + 8, { width: 150 });

          // Col 2: Inclusions & Description
          doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(desc, MARGIN + 188, y + 8, { width: 165, lineGap: 1 });

          // Col 3: Qty
          doc.fillColor(slate900).fontSize(8.5).font('Helvetica').text(String(item.quantity), MARGIN + 358, y + 8, { width: 24, align: 'center' });

          // Col 4: Unit Rate
          doc.fillColor(slate700).fontSize(8).font('Helvetica').text(formatRupees(item.unitPricePaise), MARGIN + 386, y + 8, { width: 58, align: 'right' });

          // Col 5: Total
          doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text(formatRupees(item.totalPaise), MARGIN + 448, y + 8, { width: 62, align: 'right' });

          y += rowHeight;
        });

        // Right-aligned Financial Totals Summary Box
        y += 14;
        if (y + 100 > 750) {
          doc.addPage();
          y = 65;
        }

        const totalsBoxWidth = 230;
        const totalsBoxX = PAGE_WIDTH - MARGIN - totalsBoxWidth; // 595.28 - 40 - 230 = 325.28
        const totalsBoxHeight = quote.discountPaise > 0 ? 84 : 68;

        doc.roundedRect(totalsBoxX, y, totalsBoxWidth, totalsBoxHeight, 6).fillAndStroke(bgSubtle, borderLight);

        let tY = y + 10;
        // Subtotal
        doc.fillColor(slate500).fontSize(8).font('Helvetica').text('Proposal Subtotal:', totalsBoxX + 12, tY);
        doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text(formatRupees(quote.subtotalPaise), totalsBoxX + 110, tY, { width: 108, align: 'right' });

        if (quote.discountPaise > 0) {
          tY += 16;
          doc.fillColor(slate500).fontSize(8).font('Helvetica').text('Commercial Waiver:', totalsBoxX + 12, tY);
          doc.fillColor('#DC2626').fontSize(8.5).font('Helvetica-Bold').text(`- ${formatRupees(quote.discountPaise)}`, totalsBoxX + 110, tY, { width: 108, align: 'right' });
        }

        tY += 16;
        doc.rect(totalsBoxX + 12, tY, totalsBoxWidth - 24, 0.5).fill(borderLight);

        tY += 8;
        doc.fillColor(slate900).fontSize(9.5).font('Helvetica-Bold').text('Total Payable:', totalsBoxX + 12, tY);
        doc.fillColor(brandColor).fontSize(11).font('Helvetica-Bold').text(formatRupees(quote.totalPaise), totalsBoxX + 110, tY - 1, { width: 108, align: 'right' });

        // Quality & Technical Assurance Callout (Left of Totals or Below)
        y += totalsBoxHeight + 20;
        if (y + 90 <= 750) {
          doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 70, 6).fillAndStroke('#F1F5F9', borderLight);
          doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text('Technical Governance & Code Quality Inclusions', MARGIN + 12, y + 10);
          doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(
            cleanText(
              '- All deliverables include continuous integration, staging environment deployment, and cross-browser testing.\n' +
              '- Clean architectural separation of concerns, modular TypeScript implementation, and security hardening.\n' +
              '- Includes 3 rounds of structured stakeholder review per deliverable module before production deployment sign-off.'
            ),
            MARGIN + 12,
            y + 24,
            { width: CONTENT_WIDTH - 24, lineGap: 3 }
          );
        }

        // ================= PAGE 3: PAYMENT MILESTONES & TERMS =================
        doc.addPage();
        y = 72;

        doc.fillColor(brandColor).fontSize(8).font('Helvetica-Bold').text('COMMERCIAL AGREEMENT', MARGIN, y);
        doc.fillColor(slate900).fontSize(13).font('Helvetica-Bold').text('Payment Milestones & Commercial Terms', MARGIN, y + 11);
        doc.fillColor(slate500).fontSize(8.5).font('Helvetica').text(
          'Structured milestone payment distribution, third-party exclusions, and formal terms of engagement.',
          MARGIN,
          y + 26
        );

        y += 38;

        // 20% Advance Payment Callout Banner
        const advanceNoticeHeight = 32;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, advanceNoticeHeight, 4).fillAndStroke('#FFF7ED', '#FDBA74');
        doc.roundedRect(MARGIN, y, 3.5, advanceNoticeHeight, 1).fill('#EA580C');
        doc.fillColor('#9A3412').fontSize(7.5).font('Helvetica-Bold').text('MANDATORY ADVANCE MOBILIZATION REQUIREMENT (20%)', MARGIN + 12, y + 6);
        doc.fillColor('#7C2D12').fontSize(7).font('Helvetica').text(
          'A mandatory 20% initial advance payment is required upon quotation signing. Engineering sprints, cloud architecture provisioning, and dedicated developer allocation commence strictly upon receipt of this deposit.',
          MARGIN + 12,
          y + 17,
          { width: CONTENT_WIDTH - 24, lineBreak: false }
        );
        y += advanceNoticeHeight + 12;

        // Milestones Table Header
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 22, 4).fill(darkColor);
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
        doc.text('Milestone & Phase Description', MARGIN + 12, y + 7, { width: 170 });
        doc.text('Deliverable Trigger & Stage Gate', MARGIN + 185, y + 7, { width: 195 });
        doc.text('Split', MARGIN + 385, y + 7, { width: 35, align: 'center' });
        doc.text('Payable (INR)', MARGIN + 425, y + 7, { width: 85, align: 'right' });

        y += 22;

        milestones.forEach((m, idx) => {
          const isEven = idx % 2 === 0;
          const isFirst = idx === 0;
          const rowH = isFirst ? 36 : 32;

          doc.rect(MARGIN, y, CONTENT_WIDTH, rowH).fill(isEven ? '#FFFFFF' : bgSubtle);
          doc.rect(MARGIN, y + rowH - 0.5, CONTENT_WIDTH, 0.5).fill(borderLight);

          doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text(cleanText(m.title), MARGIN + 12, y + 6, { width: 170 });
          if (isFirst) {
            doc.fillColor(brandColor).fontSize(6.5).font('Helvetica-Bold').text('(MANDATORY INITIAL ADVANCE DEPOSIT)', MARGIN + 12, y + 19);
          }

          doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(cleanText(m.trigger), MARGIN + 185, y + 6, { width: 195, lineGap: 1 });
          doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text(`${m.percent}%`, MARGIN + 385, y + 7, { width: 35, align: 'center' });
          doc.fillColor(brandColor).fontSize(9).font('Helvetica-Bold').text(formatRupees(m.amountPaise), MARGIN + 425, y + 7, { width: 85, align: 'right' });

          y += rowH;
        });

        // Third-Party Exclusions & Pass-Through Costs (Hosting Contradiction Resolved)
        y += 16;
        if (y + 40 > 745) {
          doc.addPage();
          y = 72;
        }

        doc.fillColor(slate900).fontSize(9.5).font('Helvetica-Bold').text('Third-Party Exclusions & Pass-Through Subscriptions', MARGIN, y);
        y += 14;

        quote.exclusions.forEach((ex) => {
          const cleaned = cleanText(ex);
          const itemH = doc.fontSize(7.5).font('Helvetica').heightOfString(cleaned, { width: CONTENT_WIDTH - 26 }) + 5;
          if (y + itemH > 745) {
            doc.addPage();
            y = 72;
          }
          doc.circle(MARGIN + 10, y + 4.5, 2).fill(brandColor);
          doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(cleaned, MARGIN + 20, y, { width: CONTENT_WIDTH - 26, lineGap: 1 });
          y += itemH;
        });

        // Commercial Terms & Operating Policies
        y += 14;
        if (y + 40 > 745) {
          doc.addPage();
          y = 72;
        }

        doc.fillColor(slate900).fontSize(9.5).font('Helvetica-Bold').text('Commercial Terms & Engagement Policies', MARGIN, y);
        y += 14;

        quote.termsAndConditions.forEach((term, tIdx) => {
          const cleaned = cleanText(term);
          const colonIdx = cleaned.indexOf(':');
          const termTitle = colonIdx > -1 ? cleaned.slice(0, colonIdx + 1) : '';
          const termBody = colonIdx > -1 ? cleaned.slice(colonIdx + 1).trim() : cleaned;

          const itemH = doc.fontSize(7.5).font('Helvetica').heightOfString(cleaned, { width: CONTENT_WIDTH - 26, lineGap: 1.5 }) + 6;

          if (y + itemH > 745) {
            doc.addPage();
            y = 72;
            doc.fillColor(slate900).fontSize(9.5).font('Helvetica-Bold').text('Commercial Terms & Engagement Policies (Continued)', MARGIN, y);
            y += 16;
          }

          doc.circle(MARGIN + 10, y + 4.5, 2).fill(brandColor);

          if (termTitle) {
            doc.fillColor(slate900).fontSize(7.5).font('Helvetica-Bold').text(`${String(tIdx + 1).padStart(2, '0')}. ${termTitle} `, MARGIN + 20, y, { continued: true });
            doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(termBody, { width: CONTENT_WIDTH - 26, lineGap: 1.5 });
          } else {
            doc.fillColor(slate700).fontSize(7.5).font('Helvetica').text(`${String(tIdx + 1).padStart(2, '0')}. ${cleaned}`, MARGIN + 20, y, { width: CONTENT_WIDTH - 26, lineGap: 1.5 });
          }

          y += itemH;
        });

        // ================= COMMERCIAL ACCEPTANCE & PROJECT EXECUTION =================
        const totalExecutionHeight = 260;
        if (y + totalExecutionHeight > 745) {
          doc.addPage();
          y = 72;
          doc.fillColor(brandColor).fontSize(8).font('Helvetica-Bold').text('COMMERCIAL EXECUTION', MARGIN, y);
          doc.fillColor(slate900).fontSize(13).font('Helvetica-Bold').text('Acceptance Sign-off & Mobilization Protocol', MARGIN, y + 11);
          doc.fillColor(slate500).fontSize(8.5).font('Helvetica').text(
            'Formal proposal acceptance, onboarding roadmap, payment remittance guidelines, and authorized execution.',
            MARGIN,
            y + 26
          );
          y += 44;
        } else {
          y += 16;
          doc.fillColor(slate900).fontSize(9.5).font('Helvetica-Bold').text('Acceptance Sign-off & Mobilization Protocol', MARGIN, y);
          y += 14;
        }

        // Project Mobilization Sequence (3-Step Roadmap)
        const seqBoxH = 64;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, seqBoxH, 4).fillAndStroke('#F8FAFC', borderLight);
        doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text('PROJECT ONBOARDING & MOBILIZATION ROADMAP', MARGIN + 12, y + 8);

        const colW = (CONTENT_WIDTH - 24) / 3;
        // Step 1
        const s1X = MARGIN + 12;
        doc.fillColor(brandColor).fontSize(7.5).font('Helvetica-Bold').text('01. Contract Execution', s1X, y + 22);
        doc.fillColor(slate700).fontSize(6.8).font('Helvetica').text(
          'Countersigning locks project scope, technical specifications, and fixed milestone pricing schedule.',
          s1X,
          y + 33,
          { width: colW - 12, lineGap: 1 }
        );

        // Step 2
        const s2X = MARGIN + 12 + colW;
        doc.fillColor(brandColor).fontSize(7.5).font('Helvetica-Bold').text('02. 20% Advance Remittance', s2X, y + 22);
        doc.fillColor(slate700).fontSize(6.8).font('Helvetica').text(
          'Mandatory 20% advance payment mobilizes developer sprint capacity and cloud staging environments.',
          s2X,
          y + 33,
          { width: colW - 12, lineGap: 1 }
        );

        // Step 3
        const s3X = MARGIN + 12 + colW * 2;
        doc.fillColor(brandColor).fontSize(7.5).font('Helvetica-Bold').text('03. Architecture & Sprint 1', s3X, y + 22);
        doc.fillColor(slate700).fontSize(6.8).font('Helvetica').text(
          'Technical kickoff briefing scheduled within 48 business hours; interactive prototypes and backlog shared.',
          s3X,
          y + 33,
          { width: colW - 12, lineGap: 1 }
        );

        y += seqBoxH + 12;

        // Payment Remittance & Invoicing Instructions Card
        const remitH = 46;
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH, remitH, 4).fillAndStroke('#F8FAFC', borderLight);
        doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text('PAYMENT REMITTANCE & COMMERCIAL INVOICING', MARGIN + 12, y + 8);
        doc.fillColor(slate700).fontSize(7).font('Helvetica').text(
          `Remittance Methods: Direct Corporate Bank Wire (RTGS / NEFT / IMPS) & Authorized Corporate UPI.\n` +
          `Official GST Commercial Tax Invoices and digital receipts are generated instantly upon clearance of each milestone payment.\n` +
          `Please reference Proposal Ref Number: ${quote.quotationNumber} on all remittance transfers.`,
          MARGIN + 12,
          y + 20,
          { width: CONTENT_WIDTH - 24, lineGap: 1.5 }
        );
        y += remitH + 12;

        // Formal Recital
        doc.fillColor(slate700).fontSize(7.2).font('Helvetica').text(
          cleanText(
            `IN WITNESS WHEREOF, the authorized representatives of both parties have executed this Commercial Agreement. By countersigning below, the Client confirms acceptance of the scope of work, technical specifications, payment milestone distribution (including the mandatory 20% advance mobilization deposit), and all engagement policies set forth in Proposal ${quote.quotationNumber}.`
          ),
          MARGIN,
          y,
          { width: CONTENT_WIDTH, lineGap: 1.5 }
        );
        y += 28;

        // Acceptance & Signature Blocks
        const sigBoxWidth = (CONTENT_WIDTH - 14) / 2; // ~250.64 pt
        const sigBoxHeight = 100;

        // Client Signatory Box
        const sigLeftX = MARGIN;
        doc.roundedRect(sigLeftX, y, sigBoxWidth, sigBoxHeight, 6).fillAndStroke('#FFFFFF', borderLight);
        doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text('Authorised Client Acceptance', sigLeftX + 12, y + 10);
        doc.fillColor(slate500).fontSize(7).font('Helvetica').text('By signing below, client confirms acceptance of proposal scope, pricing and milestones.', sigLeftX + 12, y + 21, { width: sigBoxWidth - 24 });

        doc.fillColor(slate700).fontSize(8).font('Helvetica').text('Signature: ________________________________', sigLeftX + 12, y + 44);
        doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text(`Name: ${quote.clientSnapshot.name}`, sigLeftX + 12, y + 60, { width: sigBoxWidth - 24 });
        doc.fillColor(slate500).fontSize(7.5).font('Helvetica').text(`Designation: Authorised Signatory`, sigLeftX + 12, y + 73);
        doc.fillColor(slate500).fontSize(7.5).font('Helvetica').text(`Date: ____________________________________`, sigLeftX + 12, y + 85);

        // Service Provider Signatory Box
        const sigRightX = MARGIN + sigBoxWidth + 14;
        doc.roundedRect(sigRightX, y, sigBoxWidth, sigBoxHeight, 6).fillAndStroke('#FFFFFF', borderLight);
        doc.fillColor(slate900).fontSize(8.5).font('Helvetica-Bold').text(cleanText(`For ${brand.name}`), sigRightX + 12, y + 10);
        doc.fillColor(slate500).fontSize(7).font('Helvetica').text('Commercial commitment on behalf of the agency service provider.', sigRightX + 12, y + 21, { width: sigBoxWidth - 24 });

        doc.fillColor(slate700).fontSize(8).font('Helvetica').text('Signature: ________________________________', sigRightX + 12, y + 44);
        doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text(`Authorised Signatory: Commercial Director`, sigRightX + 12, y + 60, { width: sigBoxWidth - 24 });
        doc.fillColor(slate500).fontSize(7.5).font('Helvetica').text(`Entity: ${cleanText((brand as any).companyDetails || brand.tagline || brand.name)}`, sigRightX + 12, y + 73, { width: sigBoxWidth - 24 });
        doc.fillColor(slate500).fontSize(7.5).font('Helvetica').text(`Date: ${issueDateStr}`, sigRightX + 12, y + 85);

        // ================= TWO-PASS RUNNING HEADERS & FOOTERS =================
        const range = doc.bufferedPageRange();
        const totalPages = range.count;

        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          const pageNum = i + 1;

          // Temporarily zero margins so PDFKit NEVER triggers an automatic page addition
          const origBottom = doc.page.margins.bottom;
          const origTop = doc.page.margins.top;
          doc.page.margins.bottom = 0;
          doc.page.margins.top = 0;

          // Running Header on pages 2+
          if (pageNum > 1) {
            doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text(cleanText(brand.name.toUpperCase()), MARGIN, 26, { width: 250, lineBreak: false });
            doc.fillColor(slate500).fontSize(7).font('Helvetica').text(cleanText(brand.tagline || 'Commercial Development Proposal'), MARGIN, 37, { width: 250, lineBreak: false });

            const rHeadWidth = 230;
            const rHeadX = PAGE_WIDTH - MARGIN - rHeadWidth;
            doc.fillColor(slate900).fontSize(8).font('Helvetica-Bold').text(`REF: ${cleanText(quote.quotationNumber)} (v${quote.revisionNumber})`, rHeadX, 26, { width: rHeadWidth, align: 'right', lineBreak: false });
            doc.fillColor(brandColor).fontSize(7).font('Helvetica-Bold').text(cleanText(quote.packageName || 'Commercial Proposal'), rHeadX, 37, { width: rHeadWidth, align: 'right', lineBreak: false });

            doc.rect(MARGIN, 54, CONTENT_WIDTH, 0.5).fill(borderLight);
          }

          // Running Footer on ALL pages (Strictly Bounded at bottom)
          doc.rect(MARGIN, 804, CONTENT_WIDTH, 0.5).fill(borderLight);

          // Left Footer
          doc.fillColor(slate400).fontSize(7.5).font('Helvetica').text(
            cleanText(`Confidential Proposal | ${brand.name} | ${quote.quotationNumber}`),
            MARGIN,
            810,
            { width: 340, align: 'left', lineBreak: false }
          );

          // Right Footer: Dynamic "Page X of Y"
          const pageStrWidth = 150;
          const pageStrX = PAGE_WIDTH - MARGIN - pageStrWidth;
          doc.fillColor(slate500).fontSize(7.5).font('Helvetica-Bold').text(
            `Page ${pageNum} of ${totalPages}`,
            pageStrX,
            810,
            { width: pageStrWidth, align: 'right', lineBreak: false }
          );

          doc.page.margins.bottom = origBottom;
          doc.page.margins.top = origTop;
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
