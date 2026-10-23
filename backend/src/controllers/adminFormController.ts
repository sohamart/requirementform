import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { FormService } from '../services/formService.js';
import { logAuditEvent } from '../utils/audit.js';

export class AdminFormController {
  static async getAllForms(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const forms = await FormService.getAllForms();
      res.status(200).json({
        success: true,
        forms: forms.map((f) => ({
          id: f._id.toString(),
          slug: f.slug,
          title: f.title,
          description: f.description,
          category: f.category,
          version: f.version,
          status: f.status,
          stepsCount: f.steps?.length || 0,
          publishedAt: f.publishedAt?.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getFormById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const form = await FormService.getFormBySlugAndVersion(
        req.params.slug,
        req.query.version ? parseInt(req.query.version as string, 10) : undefined
      );

      if (!form) {
        res.status(404).json({ success: false, error: 'Form not found' });
        return;
      }

      res.status(200).json({
        success: true,
        form: {
          id: form._id.toString(),
          slug: form.slug,
          title: form.title,
          description: form.description,
          category: form.category,
          version: form.version,
          status: form.status,
          steps: form.steps,
          publishedAt: form.publishedAt?.toISOString(),
          updatedAt: form.updatedAt.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createForm(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const form = await FormService.createForm(req.body);
      await logAuditEvent(req, 'FORM_CREATED', 'FormDefinition', form._id.toString(), {
        slug: form.slug,
        version: form.version,
      });

      res.status(201).json({ success: true, form });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create form' });
    }
  }

  static async updateForm(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const form = await FormService.updateForm(req.params.id, req.body);
      if (!form) {
        res.status(404).json({ success: false, error: 'Form not found' });
        return;
      }

      await logAuditEvent(req, 'FORM_UPDATED', 'FormDefinition', form._id.toString());
      res.status(200).json({ success: true, form });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update form' });
    }
  }

  static async publishForm(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const form = await FormService.publishForm(req.params.id);
      if (!form) {
        res.status(404).json({ success: false, error: 'Form not found' });
        return;
      }

      await logAuditEvent(req, 'FORM_PUBLISHED', 'FormDefinition', form._id.toString(), {
        slug: form.slug,
        version: form.version,
      });

      res.status(200).json({ success: true, form });
    } catch (err) {
      next(err);
    }
  }

  // --- PRIVATE STEP NOTES (Gated by manage_internal_notes) ---

  static async getFormStepNotes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const formId = req.params.id;
      const version = parseInt(req.query.version as string, 10) || 1;
      const notes = await FormService.getStepNotes(formId, version);

      res.status(200).json({
        success: true,
        notes: notes.map((n) => ({
          id: n._id.toString(),
          formDefinitionId: n.formDefinitionId.toString(),
          formVersion: n.formVersion,
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

  static async saveFormStepNote(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const note = await FormService.saveStepNote({
        formDefinitionId: req.params.id,
        formVersion: req.body.formVersion || 1,
        stepId: req.body.stepId,
        notes: req.body.notes,
        authorId: req.user._id.toString(),
        authorName: req.user.fullName,
      });

      await logAuditEvent(req, 'FORM_STEP_NOTE_SAVED', 'FormStepNotes', note._id.toString(), {
        stepId: note.stepId,
      });

      res.status(200).json({ success: true, note });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to save note' });
    }
  }
}
