import mongoose from 'mongoose';
import crypto from 'crypto';
import { Submission, ISubmission } from '../models/Submission.js';
import { FormDefinition } from '../models/FormDefinition.js';
import { SubmissionInternalNotes, ISubmissionInternalNotes } from '../models/SubmissionInternalNotes.js';
import { ProjectFinancials } from '../models/ProjectFinancials.js';
import { Quotation } from '../models/Quotation.js';
import { IUser } from '../models/User.js';

export class SubmissionService {
  private static generateReference(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `REQ-${year}-${randomHex}`;
  }

  static async createSubmission(
    user: IUser,
    data: {
      formDefinitionId: string;
      projectCategory: 'website' | 'app';
      answers: Record<string, any>;
      stepDeveloperNotes?: Record<string, string>;
      idempotencyKey?: string;
    }
  ): Promise<ISubmission> {
    // Idempotency check to prevent accidental double-clicks or duplicate submissions
    if (data.idempotencyKey) {
      const existing = await Submission.findOne({
        idempotencyKey: data.idempotencyKey,
        clientId: user._id,
      });
      if (existing) {
        return existing;
      }
    }

    const formDef = await FormDefinition.findById(data.formDefinitionId);
    if (!formDef) {
      throw new Error('Form definition not found.');
    }

    // Generate unique reference
    let enquiryReference = this.generateReference();
    let isUnique = false;
    while (!isUnique) {
      const dup = await Submission.findOne({ enquiryReference });
      if (!dup) isUnique = true;
      else enquiryReference = this.generateReference();
    }

    const submission = await Submission.create({
      enquiryReference,
      clientId: user._id,
      clientSnapshot: {
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        company: user.company,
      },
      formDefinitionId: formDef._id,
      formVersion: formDef.version,
      projectCategory: data.projectCategory,
      status: 'submitted',
      answers: data.answers || {},
      revisionNumber: 1,
      idempotencyKey: data.idempotencyKey,
      submittedAt: new Date(),
    });

    // Save developer/team call notes ONLY if user is authorized (admin, superadmin, or has manage_internal_notes permission)
    const isAuthorizedForInternalNotes =
      user.role === 'admin' ||
      user.role === 'superadmin' ||
      (Array.isArray(user.permissions) && user.permissions.includes('manage_internal_notes'));

    if (isAuthorizedForInternalNotes && data.stepDeveloperNotes && typeof data.stepDeveloperNotes === 'object') {
      for (const [stepId, noteText] of Object.entries(data.stepDeveloperNotes)) {
        if (typeof noteText === 'string' && noteText.trim()) {
          await this.saveSubmissionStepNote({
            submissionId: submission._id.toString(),
            stepId,
            notes: noteText.trim(),
            authorId: user._id.toString(),
            authorName: user.fullName || user.email || 'Agency Team',
          });
        }
      }
    }

    // Initialize corresponding internal financial record (admin only)
    await ProjectFinancials.create({
      submissionId: submission._id,
      currency: 'INR',
      quotedRevenuePaise: 0,
      approvedRevenuePaise: 0,
      collectedRevenuePaise: 0,
      estimatedDirectCostPaise: 0,
      actualDirectCostPaise: 0,
      estimatedGrossProfitPaise: 0,
      actualGrossProfitPaise: 0,
      grossMarginPercent: null,
      markupPercent: null,
      targetMarginPercent: 45.0,
    });

    return submission;
  }

  static async getClientSubmissions(clientId: string): Promise<ISubmission[]> {
    return Submission.find({ clientId: new mongoose.Types.ObjectId(clientId) }).sort({
      submittedAt: -1,
    });
  }

  static async getClientSubmissionById(
    submissionId: string,
    clientId: string
  ): Promise<ISubmission | null> {
    return Submission.findOne({
      _id: new mongoose.Types.ObjectId(submissionId),
      clientId: new mongoose.Types.ObjectId(clientId),
    });
  }

  static async getAdminSubmissions(query?: {
    category?: 'website' | 'app';
    status?: string;
    search?: string;
  }): Promise<ISubmission[]> {
    const filter: Record<string, any> = {};

    if (query?.category) {
      filter.projectCategory = query.category;
    }
    if (query?.status) {
      filter.status = query.status;
    }
    if (query?.search) {
      filter.$or = [
        { enquiryReference: { $regex: query.search, $options: 'i' } },
        { 'clientSnapshot.name': { $regex: query.search, $options: 'i' } },
        { 'clientSnapshot.email': { $regex: query.search, $options: 'i' } },
      ];
    }

    return Submission.find(filter).sort({ submittedAt: -1 });
  }

  static async getAdminSubmissionById(submissionId: string): Promise<ISubmission | null> {
    return Submission.findById(submissionId);
  }

  static async updateSubmissionStatus(
    submissionId: string,
    status: string
  ): Promise<ISubmission | null> {
    return Submission.findByIdAndUpdate(submissionId, { status }, { new: true });
  }

  // --- SUBMISSION INTERNAL STEP NOTES (Admin Only) ---

  static async getSubmissionStepNotes(
    submissionId: string
  ): Promise<ISubmissionInternalNotes[]> {
    return SubmissionInternalNotes.find({
      submissionId: new mongoose.Types.ObjectId(submissionId),
    });
  }

  static async saveSubmissionStepNote(data: {
    submissionId: string;
    stepId: string;
    notes: string;
    authorId: string;
    authorName: string;
  }): Promise<ISubmissionInternalNotes> {
    return SubmissionInternalNotes.findOneAndUpdate(
      {
        submissionId: new mongoose.Types.ObjectId(data.submissionId),
        stepId: data.stepId,
      },
      {
        notes: data.notes,
        authorId: new mongoose.Types.ObjectId(data.authorId),
        authorName: data.authorName,
      },
      { upsert: true, new: true }
    );
  }
}
