import { Request, Response, NextFunction } from 'express';
import { FormService } from '../services/formService.js';
import { Package } from '../models/Package.js';
import { Addon } from '../models/Addon.js';
import { BrandProfile } from '../models/BrandProfile.js';

export class PublicController {
  /**
   * Get active published form for Website or App
   * Strictly returns only the client-visible form schema.
   */
  static async getPublishedForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.params.category as 'website' | 'app' | 'desktop';
      if (category !== 'website' && category !== 'app' && category !== 'desktop') {
        res.status(400).json({ success: false, error: 'Category must be website, app, or desktop' });
        return;
      }

      const form = await FormService.getPublishedForm(category);
      if (!form) {
        res.status(404).json({ success: false, error: `No published form found for ${category}` });
        return;
      }

      res.status(200).json({
        success: true,
        form: {
          id: form._id.toString(),
          slug: form.slug,
          title: form.title,
          description: form.description,
          category: form.category,
          version: form.version,
          steps: form.steps,
          publishedAt: form.publishedAt?.toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const filter: Record<string, any> = { isActive: true };
      if (category === 'website' || category === 'app' || category === 'desktop') {
        filter.category = category;
      }

      const packages = await Package.find(filter).sort({ order: 1 });
      res.status(200).json({
        success: true,
        packages: packages.map((p) => ({
          id: p._id.toString(),
          slug: p.slug,
          category: p.category,
          name: p.name,
          description: p.description,
          pricingMode: p.pricingMode,
          standardPricePaise: p.standardPricePaise,
          offerPricePaise: p.offerPricePaise,
          billingFrequency: p.billingFrequency,
          features: p.features,
          maxRevisions: p.maxRevisions,
          order: p.order,
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAddons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const filter: Record<string, any> = { isActive: true };
      if (category === 'website' || category === 'app' || category === 'desktop') {
        filter.category = { $in: [category, 'both', 'all'] };
      }

      const addons = await Addon.find(filter).sort({ order: 1 });
      res.status(200).json({
        success: true,
        addons: addons.map((a) => ({
          id: a._id.toString(),
          slug: a.slug,
          category: a.category,
          name: a.name,
          description: a.description,
          billingType: a.billingType,
          unitPricePaise: a.unitPricePaise,
          unitLabel: a.unitLabel,
          order: a.order,
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await BrandProfile.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
      const hasDefault = brands.some((b) => b.isDefault);
      if (!hasDefault && brands.length > 0) {
        brands[0].isDefault = true;
        await BrandProfile.findByIdAndUpdate(brands[0]._id, { isDefault: true });
      }

      res.status(200).json({
        success: true,
        brands: brands.map((b) => ({
          id: b._id.toString(),
          name: b.name,
          tagline: b.tagline,
          logoText: b.logoText,
          logoUrl: b.logoUrl,
          primaryColor: b.primaryColor,
          secondaryColor: b.secondaryColor,
          contactEmail: b.contactEmail,
          contactPhone: b.contactPhone,
          websiteUrl: b.websiteUrl,
          addressLines: b.addressLines,
          isDefault: b.isDefault,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
}
