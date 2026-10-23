import mongoose, { Schema, Document } from 'mongoose';

export interface IBrandProfile extends Document {
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
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandProfileSchema = new Schema<IBrandProfile>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    logoText: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
    },
    primaryColor: {
      type: String,
      required: true,
      default: '#FF6B00',
    },
    secondaryColor: {
      type: String,
      required: true,
      default: '#121216',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
      required: true,
    },
    addressLines: [
      {
        type: String,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BrandProfile = mongoose.model<IBrandProfile>('BrandProfile', BrandProfileSchema);
