import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '@shared/types/index.js';
import { SystemPermission, SYSTEM_PERMISSIONS } from '@shared/constants/index.js';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  permissions: SystemPermission[];
  status: UserStatus;
  phone?: string;
  company?: string;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['client', 'admin', 'superadmin'],
      default: 'client',
      index: true,
    },
    permissions: [
      {
        type: String,
        enum: SYSTEM_PERMISSIONS,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
