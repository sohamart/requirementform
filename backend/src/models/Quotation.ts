import mongoose, { Schema, Document } from 'mongoose';
import { QuotationStatus, QuotationLineItem, PaymentMilestone } from '@shared/types/index.js';

export interface IQuotation extends Document {
  quotationNumber: string;
  revisionNumber: number;
  submissionId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  status: QuotationStatus;
  brandSnapshot: {
    name: string;
    tagline: string;
    logoText: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    contactPhone: string;
    websiteUrl: string;
    addressLines: string[];
  };
  clientSnapshot: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  packageName?: string;
  scopeSummary?: string;
  lineItems: QuotationLineItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxLines: { name: string; percent: number; amountPaise: number }[];
  totalPaise: number;
  estimatedTimelineDays?: number;
  paymentMilestones: PaymentMilestone[];
  revisionPolicy: string;
  exclusions: string[];
  clientResponsibilities: string[];
  termsAndConditions: string[];
  issuedAt?: Date;
  validUntil?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationLineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    unitPricePaise: { type: Number, required: true },
    totalPaise: { type: Number, required: true },
    isOptional: { type: Boolean, default: false },
    isSelected: { type: Boolean, default: true },
  },
  { _id: false }
);

const PaymentMilestoneSchema = new Schema(
  {
    title: { type: String, required: true },
    percent: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    trigger: { type: String, required: true },
  },
  { _id: false }
);

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    revisionNumber: {
      type: Number,
      default: 1,
    },
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'estimate', 'issued', 'approved', 'rejected', 'expired'],
      default: 'draft',
      index: true,
    },
    brandSnapshot: {
      name: { type: String, required: true },
      tagline: { type: String, required: true },
      logoText: { type: String, required: true },
      logoUrl: { type: String },
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String, required: true },
      contactEmail: { type: String, required: true },
      contactPhone: { type: String, required: true },
      websiteUrl: { type: String, required: true },
      addressLines: [{ type: String }],
    },
    clientSnapshot: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      company: { type: String },
      phone: { type: String },
    },
    packageName: { type: String },
    scopeSummary: { type: String },
    lineItems: [QuotationLineItemSchema],
    subtotalPaise: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    taxLines: [
      {
        name: { type: String, required: true },
        percent: { type: Number, required: true },
        amountPaise: { type: Number, required: true },
      },
    ],
    totalPaise: { type: Number, required: true },
    estimatedTimelineDays: { type: Number },
    paymentMilestones: [PaymentMilestoneSchema],
    revisionPolicy: { type: String, required: true },
    exclusions: [{ type: String }],
    clientResponsibilities: [{ type: String }],
    termsAndConditions: [{ type: String }],
    issuedAt: { type: Date },
    validUntil: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Quotation = mongoose.model<IQuotation>('Quotation', QuotationSchema);
