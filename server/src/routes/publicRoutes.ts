import { Router } from 'express';
import { PublicController } from '../controllers/publicController.js';

const router = Router();

router.get('/forms/:category', PublicController.getPublishedForm);
router.get('/packages', PublicController.getPackages);
router.get('/addons', PublicController.getAddons);
router.get('/brands', PublicController.getBrands);

export default router;
