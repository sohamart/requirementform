import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FinancialService } from '../services/financialService.js';
import { logAuditEvent } from '../utils/audit.js';

export class AdminFinancialController {
  static async getDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dashboard = await FinancialService.getFinancialAnalyticsDashboard();
      res.status(200).json({
        success: true,
        dashboard,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProjectFinancials(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const financials = await FinancialService.getProjectFinancialsBySubmissionId(
        req.params.submissionId
      );

      if (!financials) {
        res.status(404).json({ success: false, error: 'Financial records not found' });
        return;
      }

      res.status(200).json({
        success: true,
        financials,
      });
    } catch (err) {
      next(err);
    }
  }

  static async addCostEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const cost = await FinancialService.addCostEntry({
        submissionId: req.body.submissionId,
        category: req.body.category,
        isActual: req.body.isActual ?? true,
        amountPaise: req.body.amountPaise,
        description: req.body.description,
        date: req.body.date,
        userId: req.user._id.toString(),
        userName: req.user.fullName,
      });

      await logAuditEvent(req, 'FINANCIAL_COST_ENTRY_ADDED', 'CostEntry', cost._id.toString(), {
        submissionId: cost.submissionId.toString(),
        category: cost.category,
        amountPaise: cost.amountPaise,
        isActual: cost.isActual,
      });

      res.status(201).json({ success: true, cost });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to add cost entry' });
    }
  }

  static async addPaymentRecord(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const payment = await FinancialService.addPaymentRecord({
        submissionId: req.body.submissionId,
        quotationId: req.body.quotationId,
        amountPaise: req.body.amountPaise,
        paymentDate: req.body.paymentDate,
        paymentMethod: req.body.paymentMethod,
        status: req.body.status,
        referenceNumber: req.body.referenceNumber,
        notes: req.body.notes,
        userId: req.user._id.toString(),
      });

      await logAuditEvent(req, 'PAYMENT_RECORDED', 'PaymentRecord', payment._id.toString(), {
        submissionId: payment.submissionId.toString(),
        amountPaise: payment.amountPaise,
        status: payment.status,
      });

      res.status(201).json({ success: true, payment });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to record payment' });
    }
  }

  static async updateTargetMargin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fin = await FinancialService.updateTargetMargin(
        req.params.submissionId,
        req.body.targetMarginPercent,
        req.body.financialNotes
      );

      if (!fin) {
        res.status(404).json({ success: false, error: 'Financial record not found' });
        return;
      }

      await logAuditEvent(
        req,
        'TARGET_MARGIN_UPDATED',
        'ProjectFinancials',
        fin._id.toString(),
        {
          targetMarginPercent: fin.targetMarginPercent,
        }
      );

      res.status(200).json({ success: true, financials: fin });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update target margin' });
    }
  }
}
