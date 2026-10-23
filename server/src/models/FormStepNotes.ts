import mongoose, { Schema, Document } from 'mongoose';

export interface IFormStepNotes extends Document {
  formDefinitionId: mongoose.Types.ObjectId;
  formVersion: number;
  stepId: string;
  notes: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormStepNotesSchema = new Schema<IFormStepNotes>(
  {
    formDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: 'FormDefinition',
      required: true,
      index: true,
    },
    formVersion: {
      type: Number,
      required: true,
      index: true,
    },
    stepId: {
      type: String,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

FormStepNotesSchema.index(
  { formDefinitionId: 1, formVersion: 1, stepId: 1 },
  { unique: true }
);

export const FormStepNotes = mongoose.model<IFormStepNotes>('FormStepNotes', FormStepNotesSchema);
