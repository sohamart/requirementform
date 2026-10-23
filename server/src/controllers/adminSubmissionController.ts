import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SubmissionService } from '../services/submissionService.js';
import { QuotationService } from '../services/quotationService.js';
import { ProjectFinancials } from '../models/ProjectFinancials.js';
import { serializeAdminSubmission, serializeClientQuotation } from '../utils/serializers.js';
import { logAuditEvent } from '../utils/audit.js';

export class AdminSubmissionController {
  static async getAllSubmissions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const submissions = await SubmissionService.getAdminSubmissions({
        category: req.query.category as any,
        status: req.query.status as any,
        search: req.query.search as any,
      });

      const canViewFinancials =
        req.user?.role === 'superadmin' || req.user?.permissions?.includes('view_financials');

      const serialized = await Promise.all(
        submissions.map(async (sub) => {
          const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
          const notes = await SubmissionService.getSubmissionStepNotes(sub._id.toString());

          let financialSummary = undefined;
          if (canViewFinancials) {
            const fin = await ProjectFinancials.findOne({ submissionId: sub._id });
            if (fin) {
              financialSummary = {
                quotedRevenuePaise: fin.quotedRevenuePaise,
                actualDirectCostPaise: fin.actualDirectCostPaise,
                grossMarginPercent: fin.grossMarginPercent,
              };
            }
          }

          return serializeAdminSubmission(sub, {
            internalNotesCount: notes.length,
            hasQuotation: quote !== null,
            financialSummary,
          });
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

  static async getSubmissionById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sub = await SubmissionService.getAdminSubmissionById(req.params.id);
      if (!sub) {
        res.status(404).json({ success: false, error: 'Submission not found' });
        return;
      }

      const quote = await QuotationService.getQuotationBySubmissionId(sub._id.toString());
      const notes = await SubmissionService.getSubmissionStepNotes(sub._id.toString());

      res.status(200).json({
        success: true,
        submission: serializeAdminSubmission(sub, {
          internalNotesCount: notes.length,
          hasQuotation: quote !== null,
        }),
        quotation: quote ? serializeClientQuotation(quote) : null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sub = await SubmissionService.updateSubmissionStatus(req.params.id, req.body.status);
      if (!sub) {
        res.status(404).json({ success: false, error: 'Submission not found' });
        return;
      }

      await logAuditEvent(req, 'SUBMISSION_STATUS_UPDATED', 'Submission', sub._id.toString(), {
        status: req.body.status,
      });

      res.status(200).json({
        success: true,
        submission: serializeAdminSubmission(sub),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Status update failed' });
    }
  }

  // --- SUBMISSION STEP NOTES (Gated by manage_internal_notes) ---

  static async getSubmissionStepNotes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notes = await SubmissionService.getSubmissionStepNotes(req.params.id);
      res.status(200).json({
        success: true,
        notes: notes.map((n) => ({
          id: n._id.toString(),
          submissionId: n.submissionId.toString(),
          stepId: n.stepId,
          notes: n.notes,
          authorName: n.authorName,
          updatedAt: n.updatedAt.toISOString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async saveSubmissionStepNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const note = await SubmissionService.saveSubmissionStepNote({
        submissionId: req.params.id,
        stepId: req.body.stepId,
        notes: req.body.notes,
        authorId: req.user._id.toString(),
        authorName: req.user.fullName,
      });

      await logAuditEvent(
        req,
        'SUBMISSION_INTERNAL_NOTE_SAVED',
        'SubmissionInternalNotes',
        note._id.toString(),
        { stepId: note.stepId }
      );

      res.status(200).json({ success: true, note });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to save note' });
    }
  }
}
