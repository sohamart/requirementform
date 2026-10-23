import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientUserId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'submission' | 'quotation' | 'margin_alert' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['submission', 'quotation', 'margin_alert', 'system'],
      default: 'system',
      index: true,
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
