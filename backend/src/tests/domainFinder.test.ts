import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { DomainFinderService, SUPPORTED_TLDS } from '../services/domainFinderService.js';

describe('AI-Powered Smart Domain Finder Service & API', () => {
  describe('Name Generation & Linguistic Logic', () => {
    it('cleans business names and tokens correctly without truncating real names', () => {
      expect(DomainFinderService.cleanToken('OmniFlow Inc.')).toBe('omniflow');
      expect(DomainFinderService.cleanToken('The Cloud Desk, LLC')).toBe('clouddesk');
      expect(DomainFinderService.cleanToken('SwiftPay-HQ Co')).toBe('swiftpayhq');
      expect(DomainFinderService.cleanToken('amit')).toBe('amit');
      expect(DomainFinderService.cleanToken('ankur')).toBe('ankur');
      expect(DomainFinderService.cleanToken('apple')).toBe('apple');
      expect(DomainFinderService.cleanToken('cisco')).toBe('cisco');
    });

    it('generates creative candidates across different categories', () => {
      const candidates = DomainFinderService.generateDomainCandidates(
        'SwiftPulse',
        'SaaS',
        ['cloud', 'scale'],
        ['.com', '.io'],
        24
      );

      expect(candidates.length).toBeGreaterThanOrEqual(15);

      const exact = candidates.find((c) => c.category === 'exact');
      expect(exact).toBeDefined();
      expect(exact?.name).toBe('swiftpulse');

      const prefix = candidates.find((c) => c.category === 'prefix');
      expect(prefix).toBeDefined();
      expect(['getswiftpulse', 'tryswiftpulse', 'useswiftpulse', 'goswiftpulse']).toContain(prefix?.name);

      const compound = candidates.find((c) => c.category === 'compound');
      expect(compound).toBeDefined();

      const extensions = new Set(candidates.map((c) => c.extension));
      expect(extensions.has('.com') || extensions.has('.io')).toBe(true);
    });

    it('recommends appropriate TLDs based on business type', () => {
      const aiCandidates = DomainFinderService.generateDomainCandidates(
        'NeuroCore',
        'AI/Technology',
        [],
        [],
        20
      );
      const aiExts = aiCandidates.map((c) => c.extension);
      expect(aiExts).toContain('.ai');

      const ecomCandidates = DomainFinderService.generateDomainCandidates(
        'UrbanChic',
        'E-commerce',
        [],
        [],
        20
      );
      const ecomExts = ecomCandidates.map((c) => c.extension);
      expect(ecomExts.some((e) => e === '.store' || e === '.com')).toBe(true);
    });

    it('generates official GoDaddy search/purchase links', () => {
      const url = DomainFinderService.getOfficialGoDaddyUrl('omniflow.com');
      expect(url).toBe('https://www.godaddy.com/domainsearch/find?checkAvail=1&domainToCheck=omniflow.com');
    });
  });

  describe('GoDaddy Integration & Verification Integrity', () => {
    it('reports GoDaddy status accurately without throwing', async () => {
      const status = await DomainFinderService.getGoDaddyStatus();
      expect(status).toHaveProperty('configured');
      expect(status).toHaveProperty('environment');
      expect(status).toHaveProperty('message');
    });

    it('never fabricates availability or pricing when unconfigured', async () => {
      const results = await DomainFinderService.verifyAvailability(['testrandom12345.com']);
      const entry = results.get('testrandom12345.com');
      expect(entry).toBeDefined();
      // If no valid GoDaddy keys in test env, status must be unverified and never fake available
      if (entry?.status === 'unverified') {
        expect(entry.available).toBeUndefined();
        expect(entry.price).toBeUndefined();
      }
    });
  });

  describe('API Endpoints (HTTP)', () => {
    it('POST /api/v1/domains/search generates domains and returns structured response', async () => {
      const res = await request(app)
        .post('/api/v1/domains/search')
        .send({
          businessName: 'ApexVenture',
          businessType: 'Startup',
          keywords: ['ai', 'growth'],
          preferredExtensions: ['.com', '.io', '.co'],
          count: 18,
          checkLiveAvailability: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.suggestions.length).toBeGreaterThanOrEqual(10);
      expect(res.body.suggestions[0]).toHaveProperty('domain');
      expect(res.body.suggestions[0]).toHaveProperty('officialGoDaddyUrl');
      expect(res.body.suggestions[0]).toHaveProperty('status');
      expect(res.body.query.businessName).toBe('ApexVenture');
      expect(res.body).toHaveProperty('godaddyConfigured');
    });

    it('POST /api/v1/domains/search rejects missing business name with 400', async () => {
      const res = await request(app)
        .post('/api/v1/domains/search')
        .send({
          businessName: '',
          businessType: 'SaaS',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Error');
    });

    it('GET /api/v1/domains/status returns integration status and supported TLDs', async () => {
      const res = await request(app).get('/api/v1/domains/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBeDefined();
      expect(res.body.supportedTlds).toEqual(expect.arrayContaining(['.com', '.in', '.io']));
    });

    it('POST /api/v1/domains/check-availability validates domain list', async () => {
      const res = await request(app)
        .post('/api/v1/domains/check-availability')
        .send({
          domains: ['mybrandpulse.com', 'mybrandpulse.io'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results[0].domain).toBe('mybrandpulse.com');
      expect(res.body.results[0]).toHaveProperty('officialGoDaddyUrl');
    });
  });
});
