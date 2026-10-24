import { Response, NextFunction, Request } from 'express';
import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Submission } from '../models/Submission.js';
import { Quotation } from '../models/Quotation.js';
import { GoogleDriveService } from '../services/googleDriveService.js';
import { DriveCategory, DriveDocument } from '../models/DriveDocument.js';
import { logAuditEvent } from '../utils/audit.js';

function updateEnvFile(key: string, value: string) {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend', '.env'),
  ];
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      if (regex.test(content)) {
        content = content.replace(regex, newLine);
      } else {
        content = content.trimEnd() + `\n${newLine}\n`;
      }
      fs.writeFileSync(envPath, content, 'utf8');
    }
  }
}

export class DriveController {
  /**
   * Handles one-click file upload (PDF or TXT) into a project's Google Drive folder.
   * Enforces project isolation and validation.
   */
  static async uploadFile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: 'No file selected for upload.' });
        return;
      }

      const submissionId = req.params.submissionId;
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Client project submission not found.' });
        return;
      }

      // Project Isolation & Ownership check
      const isSuperadmin = req.user.role === 'superadmin';
      const isAdminWithDrive =
        req.user.role === 'admin' &&
        (req.user.permissions?.includes('manage_google_drive') ||
          req.user.permissions?.includes('view_google_drive'));
      const isOwner = submission.clientId.toString() === req.user._id.toString();

      if (!isSuperadmin && !isAdminWithDrive && !isOwner) {
        res.status(403).json({
          success: false,
          error:
            'Access denied: You do not have permission to upload files to Google Drive for this project.',
        });
        return;
      }

      // Validate file extension and MIME type (PDF, TXT, and all Images)
      const ext = path.extname(file.originalname).toLowerCase();
      const validExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
      const validMimeTypes = [
        'application/pdf',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml',
        'image/gif',
      ];

      if (!validExtensions.includes(ext) || !validMimeTypes.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          error:
            'Invalid file format. Supported formats: PDF (.pdf), Text (.txt), and Images (.png, .jpg, .jpeg, .webp, .svg, .gif).',
        });
        return;
      }

      // Max size: 25MB
      const maxSizeBytes = 25 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        res.status(400).json({
          success: false,
          error: 'File size exceeds maximum allowed limit of 25 MB.',
        });
        return;
      }

      // Category validation (default to 05_Design_And_Assets for images, 04_Client_Documents for docs)
      const isImage = ext !== '.pdf' && ext !== '.txt';
      const defaultCategory = isImage ? '05_Design_And_Assets' : '04_Client_Documents';
      const requestedCategory = (req.body.category || defaultCategory) as DriveCategory;
      const validCategories: DriveCategory[] = [
        '01_Client_Requirements',
        '02_Quotations',
        '03_Project_Details',
        '04_Client_Documents',
        '05_Design_And_Assets',
        '06_Development_Documents',
        '07_Delivery_And_Final_Files',
        '08_Records_And_History',
      ];

      const category = validCategories.includes(requestedCategory)
        ? requestedCategory
        : defaultCategory;

      const uploader = {
        userId: req.user._id,
        name: req.user.fullName,
        role: req.user.role,
      };

      const result = await GoogleDriveService.uploadBufferToDrive({
        submission,
        category,
        buffer: file.buffer,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        uploader,
      });

      await logAuditEvent(
        req,
        'DRIVE_FILE_UPLOADED' as any,
        'DriveDocument',
        result.document._id.toString(),
        {
          fileName: result.driveFile.name,
          category,
          enquiryReference: submission.enquiryReference,
          fileSize: result.driveFile.size,
          driveFileId: result.driveFile.id,
        }
      );

      res.status(201).json({
        success: true,
        message: 'File successfully uploaded to Google Drive.',
        file: {
          id: result.driveFile.id,
          name: result.driveFile.name,
          size: result.driveFile.size,
          mimeType: result.driveFile.mimeType,
          category,
          webViewLink: result.driveFile.webViewLink,
          uploadedAt: result.document.createdAt,
        },
      });
    } catch (err: any) {
      console.error('[DriveController] Upload error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to upload document to Google Drive.',
      });
    }
  }

  /**
   * Retrieves all Drive files linked to a client project.
   */
  static async getFiles(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submissionId = req.params.submissionId;
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Project submission not found.' });
        return;
      }

      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const isOwner = submission.clientId.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        res.status(403).json({ success: false, error: 'Access denied: Project isolated.' });
        return;
      }

      const files = await GoogleDriveService.getSubmissionDriveFiles(submissionId);

      res.status(200).json({
        success: true,
        files: files.map((f) => ({
          id: f._id,
          driveFileId: f.driveFileId,
          fileName: f.fileName,
          fileExtension: f.fileExtension,
          fileSizeBytes: f.fileSizeBytes,
          category: f.category,
          version: f.version,
          webViewLink: f.webViewLink,
          uploadedBy: f.uploadedBy.name,
          uploadedAt: f.createdAt,
        })),
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Generates and syncs the official Quotation PDF into Google Drive (02_Quotations).
   */
  static async syncQuotation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const quotationId = req.params.quotationId;
      const quotation = await Quotation.findById(quotationId);
      if (!quotation) {
        res.status(404).json({ success: false, error: 'Quotation not found.' });
        return;
      }

      const submission = await Submission.findById(quotation.submissionId);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Linked submission not found.' });
        return;
      }

      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const isOwner = quotation.clientId.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        res.status(403).json({ success: false, error: 'Access denied.' });
        return;
      }

      const uploader = {
        userId: req.user._id,
        name: req.user.fullName,
        role: req.user.role,
      };

      const result = await GoogleDriveService.syncQuotationToDrive(quotation, submission, uploader);

      await logAuditEvent(
        req,
        'QUOTATION_SYNCED_TO_DRIVE' as any,
        'Quotation',
        quotation._id.toString(),
        {
          quotationNumber: quotation.quotationNumber,
          driveFileId: result.driveFile.id,
          driveLink: result.driveFile.webViewLink,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Quotation PDF successfully synchronized to Google Drive.',
        file: result.driveFile,
      });
    } catch (err: any) {
      console.error('[DriveController] Sync Quotation error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to sync quotation PDF to Google Drive.',
      });
    }
  }

  /**
   * Generates and syncs the official Requirement PDF into Google Drive (01_Client_Requirements).
   */
  static async syncRequirements(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submissionId = req.params.submissionId;
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
      const isOwner = submission.clientId.toString() === req.user._id.toString();

      if (!isAdmin && !isOwner) {
        res.status(403).json({ success: false, error: 'Access denied.' });
        return;
      }

      const uploader = {
        userId: req.user._id,
        name: req.user.fullName,
        role: req.user.role,
      };

      const result = await GoogleDriveService.syncRequirementToDrive(submission, uploader);

      await logAuditEvent(
        req,
        'REQUIREMENT_SYNCED_TO_DRIVE' as any,
        'Submission',
        submission._id.toString(),
        {
          enquiryReference: submission.enquiryReference,
          driveFileId: result.driveFile.id,
          driveLink: result.driveFile.webViewLink,
        }
      );

      res.status(200).json({
        success: true,
        message: 'Requirement brief PDF successfully synchronized to Google Drive.',
        file: result.driveFile,
      });
    } catch (err: any) {
      console.error('[DriveController] Sync Requirements error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to sync requirement PDF to Google Drive.',
      });
    }
  }

  /**
   * Retrieves comprehensive Google Drive overview for all projects,
   * showing sync status for requirements, quotations, assets, and 1-click sync actions.
   */
  static async getDriveOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submissions = await Submission.find().sort({ createdAt: -1 });
      const quotations = await Quotation.find().sort({ createdAt: -1 });
      const driveDocs = await DriveDocument.find().sort({ createdAt: -1 });

      const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;
      const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
      const hasFolderId = !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

      let pendingSyncCount = 0;
      let fullySyncedProjects = 0;

      const projectOverviews = submissions.map((sub) => {
        const subIdStr = sub._id.toString();
        const subQuotes = quotations.filter((q) => q.submissionId.toString() === subIdStr);
        const subDocs = driveDocs.filter((d) => d.submissionId.toString() === subIdStr);

        // Check if Requirement brief PDF is in Drive (01_Client_Requirements)
        const reqDoc = subDocs.find((d) => d.category === '01_Client_Requirements');
        const hasRequirementPdf = !!reqDoc;

        if (!hasRequirementPdf) {
          pendingSyncCount++;
        }

        // Check quotation sync statuses
        const quoteStatuses = subQuotes.map((q) => {
          const qDoc = subDocs.find(
            (d) =>
              d.category === '02_Quotations' &&
              d.fileName.toLowerCase().includes(q.quotationNumber.toLowerCase())
          );
          const isSynced = !!qDoc;
          if (!isSynced) {
            pendingSyncCount++;
          }
          return {
            id: q._id,
            quotationNumber: q.quotationNumber,
            revisionNumber: q.revisionNumber,
            totalPaise: q.totalPaise,
            status: q.status,
            isSynced,
            driveFile: qDoc
              ? {
                  id: qDoc.driveFileId,
                  name: qDoc.fileName,
                  webViewLink: qDoc.webViewLink,
                }
              : null,
          };
        });

        // Other documents and image assets
        const clientAssets = subDocs
          .filter(
            (d) => d.category !== '01_Client_Requirements' && d.category !== '02_Quotations'
          )
          .map((d) => ({
            id: d._id,
            fileName: d.fileName,
            fileExtension: d.fileExtension,
            fileSizeBytes: d.fileSizeBytes,
            category: d.category,
            webViewLink: d.webViewLink,
            uploadedBy: d.uploadedBy.name,
            createdAt: d.createdAt,
          }));

        const isFullySynced =
          hasRequirementPdf && (quoteStatuses.length === 0 || quoteStatuses.every((q) => q.isSynced));

        if (isFullySynced) {
          fullySyncedProjects++;
        }

        // Project Folder link in Drive if available
        const folderDoc = subDocs[0];
        const folderUrl = folderDoc?.driveFolderId
          ? `https://drive.google.com/drive/folders/${folderDoc.driveFolderId}`
          : undefined;

        return {
          submissionId: sub._id,
          enquiryReference: sub.enquiryReference,
          clientName: sub.clientSnapshot.name,
          clientEmail: sub.clientSnapshot.email,
          company: sub.clientSnapshot.company,
          category: sub.projectCategory,
          createdAt: sub.createdAt,
          hasRequirementPdf,
          requirementPdf: reqDoc
            ? {
                id: reqDoc.driveFileId,
                name: reqDoc.fileName,
                webViewLink: reqDoc.webViewLink,
              }
            : null,
          quotations: quoteStatuses,
          assets: clientAssets,
          isFullySynced,
          folderUrl,
        };
      });

      res.status(200).json({
        success: true,
        projects: projectOverviews,
        stats: {
          totalProjects: submissions.length,
          fullySyncedProjects,
          pendingSyncCount,
          totalDriveFiles: driveDocs.length,
        },
        driveStatus: {
          isPersonalOAuthConnected: hasRefreshToken && hasClientId,
          hasFolderConfigured: hasFolderId,
          rootFolderId: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
          accountEmail: 'sohamduttabwn@gmail.com',
        },
      });
    } catch (err: any) {
      console.error('[DriveController] getDriveOverview error:', err);
      next(err);
    }
  }

  /**
   * One-Click Bulk Sync: Syncs all unsynced Requirement PDFs and Commercial Quotations
   * into clean, standardized Google Drive folders.
   */
  static async bulkSyncAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submissions = await Submission.find().sort({ createdAt: -1 });
      const quotations = await Quotation.find().sort({ createdAt: -1 });
      const driveDocs = await DriveDocument.find();

      const uploader = {
        userId: req.user._id,
        name: req.user.fullName,
        role: req.user.role,
      };

      let syncedRequirements = 0;
      let syncedQuotations = 0;
      const errors: string[] = [];

      for (const sub of submissions) {
        const subIdStr = sub._id.toString();

        // 1. Sync Requirement PDF if not yet synced
        const reqDocExists = driveDocs.some(
          (d) => d.submissionId.toString() === subIdStr && d.category === '01_Client_Requirements'
        );

        if (!reqDocExists) {
          try {
            const result = await GoogleDriveService.syncRequirementToDrive(sub, uploader);
            driveDocs.push(result.document as any);
            syncedRequirements++;
          } catch (err: any) {
            console.error(`[BulkSync] Failed to sync requirements for ${sub.enquiryReference}:`, err);
            errors.push(`Requirement brief for ${sub.enquiryReference}: ${err.message}`);
          }
        }

        // 2. Sync linked Quotations under this requirement if not yet synced
        const subQuotes = quotations.filter((q) => q.submissionId.toString() === subIdStr);
        for (const q of subQuotes) {
          const qDocExists = driveDocs.some(
            (d) =>
              d.submissionId.toString() === subIdStr &&
              d.category === '02_Quotations' &&
              d.fileName.toLowerCase().includes(q.quotationNumber.toLowerCase())
          );

          if (!qDocExists) {
            try {
              const qResult = await GoogleDriveService.syncQuotationToDrive(q, sub, uploader);
              driveDocs.push(qResult.document as any);
              syncedQuotations++;
            } catch (err: any) {
              console.error(`[BulkSync] Failed to sync quotation ${q.quotationNumber}:`, err);
              errors.push(`Quotation ${q.quotationNumber}: ${err.message}`);
            }
          }
        }
      }

      await logAuditEvent(
        req,
        'DRIVE_BULK_SYNC' as any,
        'DriveDocument',
        req.user._id.toString(),
        {
          syncedRequirements,
          syncedQuotations,
          errorsCount: errors.length,
        }
      );

      res.status(200).json({
        success: true,
        message: `Bulk synchronization completed: ${syncedRequirements} project requirement brief(s) and ${syncedQuotations} quotation(s) uploaded to Google Drive.`,
        syncedRequirements,
        syncedQuotations,
        errors,
      });
    } catch (err: any) {
      console.error('[DriveController] Bulk sync error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to complete bulk sync to Google Drive.',
      });
    }
  }

  /**
   * One-Click Project Sync: Syncs requirement PDF and all quotations for a single project.
   */
  static async bulkSyncSubmission(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const submissionId = req.params.submissionId;
      const submission = await Submission.findById(submissionId);
      if (!submission) {
        res.status(404).json({ success: false, error: 'Submission not found.' });
        return;
      }

      const quotations = await Quotation.find({ submissionId });
      const driveDocs = await DriveDocument.find({ submissionId });

      const uploader = {
        userId: req.user._id,
        name: req.user.fullName,
        role: req.user.role,
      };

      let syncedReq = false;
      let syncedQuotes = 0;

      // Sync requirement PDF if missing
      const reqDocExists = driveDocs.some((d) => d.category === '01_Client_Requirements');
      if (!reqDocExists) {
        await GoogleDriveService.syncRequirementToDrive(submission, uploader);
        syncedReq = true;
      }

      // Sync quotations if missing
      for (const q of quotations) {
        const qDocExists = driveDocs.some(
          (d) =>
            d.category === '02_Quotations' &&
            d.fileName.toLowerCase().includes(q.quotationNumber.toLowerCase())
        );

        if (!qDocExists) {
          await GoogleDriveService.syncQuotationToDrive(q, submission, uploader);
          syncedQuotes++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Project synced: ${syncedReq ? 'Requirement brief uploaded. ' : ''}${syncedQuotes} quotation(s) uploaded to Google Drive.`,
        syncedRequirement: syncedReq,
        syncedQuotationsCount: syncedQuotes,
      });
    } catch (err: any) {
      console.error('[DriveController] Single project sync error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to sync project to Google Drive.',
      });
    }
  }

  /**
   * Initiates Google OAuth consent screen to link personal 15GB Google Drive account.
   * Only Super Administrator is permitted to execute this action.
   */
  static async connectGoogleDrive(req: Request, res: Response): Promise<void> {
    const userRole = (req as AuthenticatedRequest).user?.role;
    if (userRole && userRole !== 'superadmin') {
      res.status(403).send('Access denied: Only Super Administrator is permitted to link Google Drive accounts.');
      return;
    }
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Setup Required</title></head>
        <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
          <h2 style="color: #ef4444; margin-bottom: 12px;">Google OAuth Credentials Missing</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Please add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to your <code>backend/.env</code> file first, then revisit this link.
          </p>
        </body>
        </html>
      `);
      return;
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/drive/callback`;
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/drive'],
    });

    res.redirect(authUrl);
  }

  /**
   * OAuth callback to exchange authorization code for permanent refresh token.
   */
  static async oauthCallback(req: Request, res: Response): Promise<void> {
    try {
      const code = req.query.code as string;
      const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

      if (!code || !clientId || !clientSecret) {
        res.status(400).send('Authorization code or client credentials missing.');
        return;
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/v1/drive/callback`;
      const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

      const { tokens } = await oAuth2Client.getToken(code);
      if (tokens.refresh_token) {
        updateEnvFile('GOOGLE_REFRESH_TOKEN', tokens.refresh_token);
        process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
        GoogleDriveService.resetDriveClient();
      }

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}/admin/drive?drive_auth=success`);
    } catch (err: any) {
      console.error('[DriveController] OAuth callback error:', err);
      res.status(500).send(`OAuth authorization failed: ${err.message}`);
    }
  }

  /**
   * Checks if personal Google Drive is authorized with a refresh token.
   */
  static async getDriveAuthStatus(req: Request, res: Response): Promise<void> {
    const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
    const hasFolderId = !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

    res.status(200).json({
      success: true,
      isPersonalOAuthConnected: hasRefreshToken && hasClientId,
      hasFolderConfigured: hasFolderId,
    });
  }
}
