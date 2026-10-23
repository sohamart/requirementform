import mongoose, { Schema, Document } from 'mongoose';

export interface IAddon extends Document {
  slug: string;
  category: 'website' | 'app' | 'both';
  name: string;
  description: string;
  billingType: 'one_time' | 'monthly' | 'per_unit';
  unitPricePaise: number;
  unitLabel?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddonSchema = new Schema<IAddon>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['website', 'app', 'both'],
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
    billingType: {
      type: String,
      enum: ['one_time', 'monthly', 'per_unit'],
      default: 'one_time',
    },
    unitPricePaise: {
      type: Number,
      required: true,
    },
    unitLabel: {
      type: String,
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

export const Addon = mongoose.model<IAddon>('Addon', AddonSchema);
