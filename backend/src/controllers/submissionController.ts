import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SubmissionService } from '../services/submissionService.js';
import { QuotationService } from '../services/quotationService.js';
import { PDFService } from '../services/pdfService.js';
import { serializeClientSubmission, serializeClientQuotation } from '../utils/serializers.js';
import { logAuditEvent } from '../utils/audit.js';

export class SubmissionController {
  static async createSubmission(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submission = await SubmissionService.createSubmission(req.user, req.body);

      await logAuditEvent(
        req,
        'SUBMISSION_CREATED',
        'Submission',
        submission._id.toString(),
        {
          enquiryReference: submission.enquiryReference,
          category: submission.projectCategory,
        }
      );

      res.status(201).json({
        success: true,
        submission: serializeClientSubmission(submission, false),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to submit requirements.',
      });
    }
  }

  static async getMySubmissions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submissions = await SubmissionService.getClientSubmissions(req.user._id.toString());

      // Check which submissions have an issued quotation
      const serialized = await Promise.all(
        submissions.map(async (sub) => {
          const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
          const quotationAvailable =
            quote !== null && (quote.status === 'issued' || quote.status === 'approved');
          return serializeClientSubmission(sub, quotationAvailable);
        })
      );

      res.status(200).json({
        success: true,
        submissions: serialized,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMySubmissionById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const sub = await SubmissionService.getClientSubmissionById(
        req.params.id,
        req.user._id.toString()
      );

      if (!sub) {
        res.status(404).json({ success: false, error: 'Submission not found' });
        return;
      }

      const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
      const quotationAvailable =
        quote !== null && (quote.status === 'issued' || quote.status === 'approved');

      res.status(200).json({
        success: true,
        submission: serializeClientSubmission(sub, quotationAvailable),
        quotation: quote && quotationAvailable ? serializeClientQuotation(quote) : null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadRequirementPDF(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      // Allow admin or owner client
      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const sub = isAdmin
        ? await SubmissionService.getAdminSubmissionById(req.params.id)
        : await SubmissionService.getClientSubmissionById(req.params.id, req.user._id.toString());

      if (!sub) {
        res.status(404).json({ success: false, error: 'Submission document not found.' });
        return;
      }

      // Convert to strictly sanitized ClientSubmissionDTO
      const safeDTO = serializeClientSubmission(sub, false);
      const pdfBuffer = await PDFService.generateRequirementDetailsPDF(safeDTO);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Requirements-${sub.enquiryReference}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  static async downloadQuotationPDF(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      let quote = await QuotationService.getQuotationById(req.params.id);
      if (!quote) {
        quote = await QuotationService.getQuotationBySubmissionId(req.params.id);
      }
      if (!quote) {
        res.status(404).json({ success: false, error: 'Quotation not found.' });
        return;
      }

      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const isOwner = quote.clientId.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        res.status(403).json({ success: false, error: 'Access denied: You do not own this quotation.' });
        return;
      }

      // Draft quotes cannot be downloaded by clients
      if (!isAdmin && quote.status === 'draft') {
        res.status(403).json({
          success: false,
          error: 'This quotation is currently in draft review and not yet available for download.',
        });
        return;
      }

      // Strictly sanitized ClientQuotationDTO
      const safeQuoteDTO = serializeClientQuotation(quote);
      const pdfBuffer = await PDFService.generateQuotationPDF(safeQuoteDTO);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Quotation-${quote.quotationNumber}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
}
