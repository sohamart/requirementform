import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { QuotationService } from '../services/quotationService.js';
import { PDFService } from '../services/pdfService.js';
import { serializeClientQuotation } from '../utils/serializers.js';
import { logAuditEvent } from '../utils/audit.js';

export class AdminQuotationController {
  static async getAllQuotations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quotes = await QuotationService.getAllQuotations();
      res.status(200).json({
        success: true,
        quotations: quotes.map(serializeClientQuotation),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getQuotationById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quote = await QuotationService.getQuotationById(req.params.id);
      if (!quote) {
        res.status(404).json({ success: false, error: 'Quotation not found' });
        return;
      }

      res.status(200).json({
        success: true,
        quotation: serializeClientQuotation(quote),
      });
    } catch (err) {
      next(err);
    }
  }

  static async createQuotation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quote = await QuotationService.createQuotation(req.body);

      await logAuditEvent(req, 'QUOTATION_CREATED', 'Quotation', quote._id.toString(), {
        quotationNumber: quote.quotationNumber,
        totalPaise: quote.totalPaise,
        status: quote.status,
      });

      res.status(201).json({
        success: true,
        quotation: serializeClientQuotation(quote),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create quotation' });
    }
  }

  static async updateQuotation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quote = await QuotationService.updateQuotation(req.params.id, req.body);
      if (!quote) {
        res.status(404).json({ success: false, error: 'Quotation not found' });
        return;
      }

      await logAuditEvent(req, 'QUOTATION_UPDATED', 'Quotation', quote._id.toString(), {
        status: quote.status,
        totalPaise: quote.totalPaise,
      });

      res.status(200).json({
        success: true,
        quotation: serializeClientQuotation(quote),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update quotation' });
    }
  }

  static async downloadPDF(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quote = await QuotationService.getQuotationById(req.params.id);
      if (!quote) {
        res.status(404).json({ success: false, error: 'Quotation not found' });
        return;
      }

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
