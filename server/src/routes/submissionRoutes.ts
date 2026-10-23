import { Router } from 'express';
import { SubmissionController } from '../controllers/submissionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { CreateSubmissionSchema } from '@shared/schemas/index.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  submissionLimiter,
  validateBody(CreateSubmissionSchema),
  SubmissionController.createSubmission
);

router.get('/my', requireAuth, SubmissionController.getMySubmissions);
router.get('/:id', requireAuth, SubmissionController.getMySubmissionById);
router.get('/:id/download-requirements', requireAuth, SubmissionController.downloadRequirementPDF);
router.get('/:id/download-quotation', requireAuth, SubmissionController.downloadQuotationPDF);

export default router;
