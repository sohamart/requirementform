import { Router } from 'express';
import { DomainFinderController } from '../controllers/domainFinderController.js';

const router = Router();

// Publicly accessible domain finder endpoints
router.post('/search', DomainFinderController.searchDomains);
router.post('/check-availability', DomainFinderController.checkAvailability);
router.get('/status', DomainFinderController.getStatus);

export default router;
