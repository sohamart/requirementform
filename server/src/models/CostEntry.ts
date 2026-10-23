import mongoose, { Schema, Document } from 'mongoose';
import { CostCategory } from '@shared/types/index.js';

export interface ICostEntry extends Document {
  submissionId: mongoose.Types.ObjectId;
  category: CostCategory;
  isActual: boolean; // true = actual recorded, false = estimated
  amountPaise: number;
  description: string;
  date: Date;
  loggedByUserId: mongoose.Types.ObjectId;
  loggedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const CostEntrySchema = new Schema<ICostEntry>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'internal_labour',
        'external_contractor',
        'infrastructure_third_party',
        'partner_allocation',
        'additional_expense',
      ],
      required: true,
      index: true,
    },
    isActual: {
      type: Boolean,
      default: true,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    loggedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loggedByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CostEntry = mongoose.model<ICostEntry>('CostEntry', CostEntrySchema);
