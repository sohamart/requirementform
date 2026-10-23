import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentRecord extends Document {
  submissionId: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  amountPaise: number;
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'upi' | 'card' | 'cheque' | 'other';
  status: 'received' | 'pending' | 'failed';
  referenceNumber: string;
  notes?: string;
  recordedByUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: 'Quotation',
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'card', 'cheque', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['received', 'pending', 'failed'],
      default: 'received',
      index: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
    },
    recordedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentRecord = mongoose.model<IPaymentRecord>(
  'PaymentRecord',
  PaymentRecordSchema
);
