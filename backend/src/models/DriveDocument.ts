import mongoose, { Schema, Document } from 'mongoose';

export type DriveCategory =
  | '01_Client_Requirements'
  | '02_Quotations'
  | '03_Project_Details'
  | '04_Client_Documents'
  | '05_Design_And_Assets'
  | '06_Development_Documents'
  | '07_Delivery_And_Final_Files'
  | '08_Records_And_History';

export interface IDriveDocument extends Document {
  submissionId: mongoose.Types.ObjectId;
  enquiryReference: string;
  clientId: mongoose.Types.ObjectId;
  category: DriveCategory;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
  mimeType: string;
  driveFileId: string;
  driveFolderId: string;
  webViewLink?: string;
  webContentLink?: string;
  version: number;
  uploadedBy: {
    userId: mongoose.Types.ObjectId;
    name: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DriveDocumentSchema = new Schema<IDriveDocument>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    enquiryReference: {
      type: String,
      required: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        '01_Client_Requirements',
        '02_Quotations',
        '03_Project_Details',
        '04_Client_Documents',
        '05_Design_And_Assets',
        '06_Development_Documents',
        '07_Delivery_And_Final_Files',
        '08_Records_And_History',
      ],
      required: true,
      index: true,
      default: '04_Client_Documents',
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileExtension: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    driveFileId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    driveFolderId: {
      type: String,
      required: true,
    },
    webViewLink: {
      type: String,
    },
    webContentLink: {
      type: String,
    },
    version: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

DriveDocumentSchema.index({ submissionId: 1, category: 1, createdAt: -1 });

export const DriveDocument = mongoose.model<IDriveDocument>('DriveDocument', DriveDocumentSchema);
