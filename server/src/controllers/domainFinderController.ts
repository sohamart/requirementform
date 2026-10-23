import { Request, Response } from 'express';
import { DomainFinderService, SUPPORTED_TLDS } from '../services/domainFinderService.js';
import { DomainSearchSchema, CheckAvailabilitySchema } from '@shared/schemas/index.js';

export class DomainFinderController {
  /**
   * Generates AI domain candidates and checks availability
   * POST /api/v1/domains/search
   */
  public static async searchDomains(req: Request, res: Response): Promise<void> {
    try {
      const validated = DomainSearchSchema.parse(req.body);
      const result = await DomainFinderService.searchDomains(validated as any);
      res.status(200).json(result);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: err.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to search domain names',
      });
    }
  }

  /**
   * Verifies live availability for a custom list of domains
   * POST /api/v1/domains/check-availability
   */
  public static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const validated = CheckAvailabilitySchema.parse(req.body);
      const verificationMap = await DomainFinderService.verifyAvailability(validated.domains);
      const godaddyStatus = await DomainFinderService.getGoDaddyStatus();

      const results = validated.domains.map((d) => {
        const v = verificationMap.get(d.toLowerCase()) || {
          status: 'unverified',
          available: undefined,
        };
        return {
          domain: d,
          ...v,
          officialGoDaddyUrl: DomainFinderService.getOfficialGoDaddyUrl(d),
        };
      });

      res.status(200).json({
        success: true,
        godaddyConfigured: godaddyStatus.configured && (godaddyStatus.apiConnected ?? false),
        godaddyMessage: godaddyStatus.message,
        results,
      });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          details: err.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to check domain availability',
      });
    }
  }

  /**
   * Returns current GoDaddy API integration status
   * GET /api/v1/domains/status
   */
  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await DomainFinderService.getGoDaddyStatus();
      res.status(200).json({
        success: true,
        status,
        supportedTlds: SUPPORTED_TLDS,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to get GoDaddy status',
      });
    }
  }
}
