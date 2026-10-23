import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmissionInternalNotes extends Document {
  submissionId: mongoose.Types.ObjectId;
  stepId: string;
  notes: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionInternalNotesSchema = new Schema<ISubmissionInternalNotes>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    stepId: {
      type: String,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SubmissionInternalNotesSchema.index(
  { submissionId: 1, stepId: 1 },
  { unique: true }
);

export const SubmissionInternalNotes = mongoose.model<ISubmissionInternalNotes>(
  'SubmissionInternalNotes',
  SubmissionInternalNotesSchema
);
