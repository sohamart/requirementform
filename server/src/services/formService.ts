import mongoose from 'mongoose';
import { FormDefinition, IFormDefinition } from '../models/FormDefinition.js';
import { FormStepNotes, IFormStepNotes } from '../models/FormStepNotes.js';
import { FormDefinitionDTO, FormStepNotesDTO } from '@shared/types/index.js';

export class FormService {
  /**
   * Get the active published form for clients.
   * NEVER returns private step notes.
   */
  static async getPublishedForm(category: 'website' | 'app'): Promise<IFormDefinition | null> {
    return FormDefinition.findOne({
      category,
      status: 'published',
    }).sort({ version: -1 });
  }

  static async getFormBySlugAndVersion(
    slug: string,
    version?: number
  ): Promise<IFormDefinition | null> {
    if (version) {
      return FormDefinition.findOne({ slug, version });
    }
    return FormDefinition.findOne({ slug, status: 'published' }).sort({ version: -1 });
  }

  /**
   * Admin: List all forms including drafts & versions
   */
  static async getAllForms(): Promise<IFormDefinition[]> {
    return FormDefinition.find().sort({ updatedAt: -1 });
  }

  static async createForm(data: {
    slug: string;
    title: string;
    description: string;
    category: 'website' | 'app';
    steps: any[];
  }): Promise<IFormDefinition> {
    const latest = await FormDefinition.findOne({ slug: data.slug }).sort({ version: -1 });
    const version = latest ? latest.version + 1 : 1;

    return FormDefinition.create({
      slug: data.slug,
      title: data.title,
      description: data.description,
      category: data.category,
      version,
      status: 'draft',
      steps: data.steps,
    });
  }

  static async updateForm(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      steps: any[];
    }>
  ): Promise<IFormDefinition | null> {
    return FormDefinition.findByIdAndUpdate(id, data, { new: true });
  }

  static async publishForm(id: string): Promise<IFormDefinition | null> {
    const form = await FormDefinition.findById(id);
    if (!form) return null;

    // Archive previously published forms of this category
    await FormDefinition.updateMany(
      { category: form.category, status: 'published', _id: { $ne: form._id } },
      { status: 'archived' }
    );

    form.status = 'published';
    form.publishedAt = new Date();
    return form.save();
  }

  // --- PRIVATE STEP NOTES (Admin Only) ---

  static async getStepNotes(
    formDefinitionId: string,
    formVersion: number
  ): Promise<IFormStepNotes[]> {
    return FormStepNotes.find({
      formDefinitionId: new mongoose.Types.ObjectId(formDefinitionId),
      formVersion,
    });
  }

  static async saveStepNote(data: {
    formDefinitionId: string;
    formVersion: number;
    stepId: string;
    notes: string;
    authorId: string;
    authorName: string;
  }): Promise<IFormStepNotes> {
    return FormStepNotes.findOneAndUpdate(
      {
        formDefinitionId: new mongoose.Types.ObjectId(data.formDefinitionId),
        formVersion: data.formVersion,
        stepId: data.stepId,
      },
      {
        notes: data.notes,
        authorId: new mongoose.Types.ObjectId(data.authorId),
        authorName: data.authorName,
      },
      { upsert: true, new: true }
    );
  }
}
