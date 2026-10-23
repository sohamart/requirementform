import mongoose, { Schema, Document } from 'mongoose';
import { SubmissionStatus } from '@shared/types/index.js';

export interface ISubmission extends Document {
  enquiryReference: string;
  clientId: mongoose.Types.ObjectId;
  clientSnapshot: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  formDefinitionId: mongoose.Types.ObjectId;
  formVersion: number;
  projectCategory: 'website' | 'app' | 'desktop';
  status: SubmissionStatus;
  answers: Record<string, any>;
  revisionNumber: number;
  idempotencyKey?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    enquiryReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      company: { type: String },
    },
    formDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'FormDefinition',
      required: true,
      index: true,
    },
    formVersion: {
      type: Number,
      required: true,
    },
    projectCategory: {
      type: String,
      enum: ['website', 'app', 'desktop'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'estimated',
        'quoted',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'submitted',
      index: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    revisionNumber: {
      type: Number,
      default: 1,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
