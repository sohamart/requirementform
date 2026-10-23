import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectFinancials extends Document {
  submissionId: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  currency: 'INR';
  quotedRevenuePaise: number;
  approvedRevenuePaise: number;
  collectedRevenuePaise: number;
  estimatedDirectCostPaise: number;
  actualDirectCostPaise: number;
  estimatedGrossProfitPaise: number;
  actualGrossProfitPaise: number;
  grossMarginPercent: number | null;
  markupPercent: number | null;
  targetMarginPercent: number;
  financialNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFinancialsSchema = new Schema<IProjectFinancials>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      unique: true,
      index: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
      index: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    quotedRevenuePaise: {
      type: Number,
      default: 0,
    },
    approvedRevenuePaise: {
      type: Number,
      default: 0,
    },
    collectedRevenuePaise: {
      type: Number,
      default: 0,
    },
    estimatedDirectCostPaise: {
      type: Number,
      default: 0,
    },
    actualDirectCostPaise: {
      type: Number,
      default: 0,
    },
    estimatedGrossProfitPaise: {
      type: Number,
      default: 0,
    },
    actualGrossProfitPaise: {
      type: Number,
      default: 0,
    },
    grossMarginPercent: {
      type: Number,
      default: null,
    },
    markupPercent: {
      type: Number,
      default: null,
    },
    targetMarginPercent: {
      type: Number,
      default: 45.0, // Default 45% target margin
    },
    financialNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ProjectFinancials = mongoose.model<IProjectFinancials>(
  'ProjectFinancials',
  ProjectFinancialsSchema
);
