import mongoose, { Schema, Document } from 'mongoose';
import { FormStep } from '@shared/types/index.js';

export interface IFormDefinition extends Document {
  slug: string;
  title: string;
  description: string;
  category: 'website' | 'app' | 'desktop';
  version: number;
  status: 'draft' | 'published' | 'archived';
  steps: FormStep[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    fieldKey: { type: String },
    label: { type: String, required: true },
    helperText: { type: String },
    placeholder: { type: String },
    type: { type: String, required: true },
    isRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    options: [{ type: String }],
    validationRules: {
      minLength: { type: Number },
      maxLength: { type: Number },
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String },
    },
    conditionalVisibility: {
      dependsOnQuestionId: { type: String },
      operator: { type: String },
      value: { type: Schema.Types.Mixed },
    },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const StepSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    order: { type: Number, default: 0 },
    questions: [QuestionSchema],
  },
  { _id: false }
);

const FormDefinitionSchema = new Schema<IFormDefinition>(
  {
    slug: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['website', 'app', 'desktop'],
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    steps: [StepSchema],
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

FormDefinitionSchema.index({ slug: 1, version: 1 }, { unique: true });

export const FormDefinition = mongoose.model<IFormDefinition>('FormDefinition', FormDefinitionSchema);
