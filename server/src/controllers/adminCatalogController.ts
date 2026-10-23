import { Request, Response, NextFunction } from 'express';
import { Package } from '../models/Package.js';
import { Addon } from '../models/Addon.js';
import { BrandProfile } from '../models/BrandProfile.js';
import { logAuditEvent } from '../utils/audit.js';

export class AdminCatalogController {
  // --- PACKAGES ---
  static async getAllPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const packages = await Package.find().sort({ category: 1, order: 1 });
      res.status(200).json({
        success: true,
        packages: packages.map((p) => ({
          ...p.toObject(),
          id: p._id.toString(),
          _id: p._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async createPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pkg = await Package.create(req.body);
      await logAuditEvent(req, 'PACKAGE_CREATED', 'Package', pkg._id.toString(), { name: pkg.name });
      res.status(201).json({ success: true, package: pkg });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create package' });
    }
  }

  static async updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!pkg) {
        res.status(404).json({ success: false, error: 'Package not found' });
        return;
      }
      await logAuditEvent(req, 'PACKAGE_UPDATED', 'Package', pkg._id.toString());
      res.status(200).json({ success: true, package: pkg });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update package' });
    }
  }

  // --- ADDONS ---
  static async getAllAddons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addons = await Addon.find().sort({ order: 1 });
      res.status(200).json({
        success: true,
        addons: addons.map((a) => ({
          ...a.toObject(),
          id: a._id.toString(),
          _id: a._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async createAddon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addon = await Addon.create(req.body);
      await logAuditEvent(req, 'ADDON_CREATED', 'Addon', addon._id.toString(), { name: addon.name });
      res.status(201).json({ success: true, addon });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create addon' });
    }
  }

  static async updateAddon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!addon) {
        res.status(404).json({ success: false, error: 'Addon not found' });
        return;
      }
      await logAuditEvent(req, 'ADDON_UPDATED', 'Addon', addon._id.toString());
      res.status(200).json({ success: true, addon });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to update addon' });
    }
  }

  // --- BRAND PROFILES ---
  static async getAllBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await BrandProfile.find().sort({ isDefault: -1, name: 1 });
      res.status(200).json({
        success: true,
        brands: brands.map((b) => ({
          ...b.toObject(),
          id: b._id.toString(),
          _id: b._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  static async createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.body.isDefault) {
        await BrandProfile.updateMany({}, { isDefault: false });
      }

      const brand = await BrandProfile.create(req.body);
      await logAuditEvent(req, 'BRAND_CREATED', 'BrandProfile', brand._id.toString(), {
        name: brand.name,
      });

      res.status(201).json({ success: true, brand });
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(400).json({
          success: false,
          error: `A brand profile named "${req.body.name}" already exists. Please edit the existing brand or use a unique name.`,
        });
        return;
      }
      res.status(400).json({ success: false, error: err.message || 'Failed to create brand' });
    }
  }

  static async updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.body.isDefault) {
        await BrandProfile.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
      }

      const brand = await BrandProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!brand) {
        res.status(404).json({ success: false, error: 'Brand not found' });
        return;
      }

      await logAuditEvent(req, 'BRAND_UPDATED', 'BrandProfile', brand._id.toString());
      res.status(200).json({ success: true, brand });
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(400).json({
          success: false,
          error: `Another brand profile named "${req.body.name}" already exists.`,
        });
        return;
      }
      res.status(400).json({ success: false, error: err.message || 'Failed to update brand' });
    }
  }
}
