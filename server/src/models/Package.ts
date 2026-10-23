import mongoose, { Schema, Document } from 'mongoose';

export interface IPackage extends Document {
  slug: string;
  category: 'website' | 'app';
  name: string;
  description: string;
  pricingMode: 'fixed' | 'starting_price' | 'manual_review';
  standardPricePaise: number;
  offerPricePaise: number;
  billingFrequency: 'one_time' | 'monthly' | 'yearly';
  features: string[];
  maxRevisions: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['website', 'app'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    pricingMode: {
      type: String,
      enum: ['fixed', 'starting_price', 'manual_review'],
      default: 'fixed',
    },
    standardPricePaise: {
      type: Number,
      required: true,
    },
    offerPricePaise: {
      type: Number,
      required: true,
    },
    billingFrequency: {
      type: String,
      enum: ['one_time', 'monthly', 'yearly'],
      default: 'one_time',
    },
    features: [
      {
        type: String,
      },
    ],
    maxRevisions: {
      type: Number,
      default: 2,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Package = mongoose.model<IPackage>('Package', PackageSchema);
