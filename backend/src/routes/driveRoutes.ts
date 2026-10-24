import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { DriveController } from '../controllers/driveController.js';

const router = Router();

// Configure Multer for in-memory handling (support PDF, TXT, and all client image formats)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
    const validMimes = [
      'application/pdf',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
      'image/gif',
    ];

    if (validExtensions.includes(ext) || validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file format. Only PDF (.pdf), Text (.txt), and Images (.png, .jpg, .jpeg, .webp, .svg, .gif) are permitted.'
        )
      );
    }
  },
});

// Drive Overview & Bulk Sync (Google Drive Hub)
router.get(
  '/overview',
  requireAuth,
  requirePermission('view_google_drive'),
  DriveController.getDriveOverview
);

router.post(
  '/bulk-sync',
  requireAuth,
  requirePermission('manage_google_drive'),
  DriveController.bulkSyncAll
);

router.post(
  '/bulk-sync/:submissionId',
  requireAuth,
  requirePermission('manage_google_drive'),
  DriveController.bulkSyncSubmission
);

// Upload one file or image to a specific project submission
router.post(
  '/upload/:submissionId',
  requireAuth,
  upload.single('file'),
  DriveController.uploadFile
);

// Get list of uploaded Drive documents for a project
router.get(
  '/files/:submissionId',
  requireAuth,
  DriveController.getFiles
);

// One-click sync generated quotation PDF to Drive
router.post(
  '/sync-quotation/:quotationId',
  requireAuth,
  DriveController.syncQuotation
);

// One-click sync generated requirements brief PDF to Drive
router.post(
  '/sync-requirements/:submissionId',
  requireAuth,
  DriveController.syncRequirements
);

// OAuth2 Authentication Routes (Superadmin only to connect or switch Google account)
router.get('/connect', requireAuth, requireSuperAdmin, DriveController.connectGoogleDrive);
router.get('/callback', DriveController.oauthCallback);
router.get('/status', requireAuth, DriveController.getDriveAuthStatus);

export default router;
