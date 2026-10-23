import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { runSeed } from '../seed/seed.js';
import { FormDefinition } from '../models/FormDefinition.js';
import { FormStepNotes } from '../models/FormStepNotes.js';
import { serializeClientSubmission } from '../utils/serializers.js';

describe('Master Website & App Dynamic Requirements Specification', () => {
  beforeAll(async () => {
    await connectDB();
    await runSeed();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('contains master Website form with 8 steps and complete question coverage', async () => {
    const webForm = await FormDefinition.findOne({ slug: 'website-requirements', status: 'published' });
    expect(webForm).toBeDefined();
    expect(webForm?.steps).toHaveLength(8);

    const questionIds = webForm?.steps.flatMap((s) => s.questions.map((q) => q.id)) || [];
    expect(questionIds.length).toBeGreaterThanOrEqual(46);

    // Verify key fieldKeys
    const fieldKeys = webForm?.steps.flatMap((s) => s.questions.map((q) => q.fieldKey)) || [];
    expect(fieldKeys).toContain('client_name');
    expect(fieldKeys).toContain('company_name');
    expect(fieldKeys).toContain('website_type');
    expect(fieldKeys).toContain('required_pages');
    expect(fieldKeys).toContain('design_style');
    expect(fieldKeys).toContain('required_features');
    expect(fieldKeys).toContain('estimated_budget');
    expect(fieldKeys).toContain('accuracy_confirmed');

    // Verify conditional visibility
    const otherCategoryQ = webForm?.steps
      .flatMap((s) => s.questions)
      .find((q) => q.id === 'business_category_other');
    expect(otherCategoryQ?.conditionalVisibility).toEqual({
      dependsOnQuestionId: 'business_category',
      operator: 'equals',
      value: 'Other',
    });

    const websiteUrlQ = webForm?.steps
      .flatMap((s) => s.questions)
      .find((q) => q.id === 'existing_website_url');
    expect(websiteUrlQ?.conditionalVisibility).toEqual({
      dependsOnQuestionId: 'has_existing_website',
      operator: 'equals',
      value: 'Yes',
    });
  });

  it('contains master App form with 7 steps and complete question coverage', async () => {
    const appForm = await FormDefinition.findOne({ slug: 'app-requirements', status: 'published' });
    expect(appForm).toBeDefined();
    expect(appForm?.steps).toHaveLength(7);

    const questionIds = appForm?.steps.flatMap((s) => s.questions.map((q) => q.id)) || [];
    expect(questionIds.length).toBeGreaterThanOrEqual(37);

    const fieldKeys = appForm?.steps.flatMap((s) => s.questions.map((q) => q.fieldKey)) || [];
    expect(fieldKeys).toContain('app_client_name');
    expect(fieldKeys).toContain('app_type');
    expect(fieldKeys).toContain('app_target_platforms');
    expect(fieldKeys).toContain('app_required_features');
    expect(fieldKeys).toContain('app_backend_req');
    expect(fieldKeys).toContain('app_design_style');
    expect(fieldKeys).toContain('app_estimated_budget');
    expect(fieldKeys).toContain('app_accuracy_confirmed');
  });

  it('stores private step notes for every single step and never leaks them in client serializers', async () => {
    const webForm = await FormDefinition.findOne({ slug: 'website-requirements' });
    const stepNotes = await FormStepNotes.find({ formDefinitionId: webForm?._id });

    // Expect notes for all 8 website steps
    expect(stepNotes.length).toBeGreaterThanOrEqual(8);

    // Simulate raw database document with private notes injected
    const mockSubmissionDoc: any = {
      _id: new mongoose.Types.ObjectId(),
      enquiryReference: 'REQ-2026-TEST',
      clientId: new mongoose.Types.ObjectId(),
      clientSnapshot: {
        name: 'Test Client',
        email: 'test@client.com',
        phone: '+91 99887 76655',
        company: 'Test Org',
      },
      formDefinitionId: webForm?._id,
      formVersion: 1,
      projectCategory: 'website',
      revisionNumber: 1,
      status: 'submitted',
      answers: {
        client_name: 'Test Client',
        website_type: 'Business Website',
      },
      pricingSummary: {
        standardTotalPaise: 1499900,
        offerTotalPaise: 899900,
        discountPaise: 0,
        taxLines: [],
      },
      stepInternalNotes: 'LEAK RISK: Developer internal margin 55%',
      privateCostNotes: 'Contractor budget ₹2,500',
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    const clientDTO = serializeClientSubmission(mockSubmissionDoc, false);
    const jsonString = JSON.stringify(clientDTO);

    expect(jsonString).not.toContain('LEAK RISK');
    expect(jsonString).not.toContain('stepInternalNotes');
    expect(jsonString).not.toContain('privateCostNotes');
    expect((clientDTO as any).stepInternalNotes).toBeUndefined();
    expect((clientDTO as any).privateCostNotes).toBeUndefined();
  });
});
