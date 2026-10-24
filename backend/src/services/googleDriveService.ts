import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';
import { DriveDocument, DriveCategory, IDriveDocument } from '../models/DriveDocument.js';
import { ISubmission } from '../models/Submission.js';
import { IQuotation } from '../models/Quotation.js';
import { PDFService } from './pdfService.js';
import { serializeClientQuotation, serializeClientSubmission } from '../utils/serializers.js';

export interface UploadResult {
  document: IDriveDocument;
  driveFile: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    webViewLink?: string;
  };
}

export class GoogleDriveService {
  private static driveClient: drive_v3.Drive | null = null;

  public static resetDriveClient(): void {
    this.driveClient = null;
  }

  /**
   * Initializes and validates Google Drive API v3 client using Service Account credentials.
   * Credentials must reside solely on the backend in environment variables.
   */
  public static getDriveClient(): drive_v3.Drive {
    if (this.driveClient) {
      return this.driveClient;
    }

    const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

    // 1. Check for OAuth2 user credentials (ideal for personal Google Drive @gmail.com accounts)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken && parentFolderId) {
      const oAuth2Client = new google.auth.OAuth2(clientId.trim(), clientSecret.trim());
      oAuth2Client.setCredentials({ refresh_token: refreshToken.trim() });
      this.driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
      return this.driveClient;
    }

    // 2. Service Account credentials (ideal for Google Workspace Shared Drives)
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !rawPrivateKey || !parentFolderId) {
      throw new Error(
        'Google Drive is not configured. Missing credentials in backend/.env.'
      );
    }

    // Robustly clean key of JSON artifacts (quotes, trailing commas, and escaped newlines)
    let privateKey = rawPrivateKey.trim();
    privateKey = privateKey.replace(/,\s*$/, '').trim();
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
    if (privateKey.startsWith('\\"') && privateKey.endsWith('\\"')) {
      privateKey = privateKey.slice(2, -2);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: clientEmail.trim().replace(/^["']|["',]$/g, ''),
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({ version: 'v3', auth });
    return this.driveClient;
  }

  /**
   * Sanitizes names for filesystem and Google Drive folder naming safety.
   */
  private static sanitizeName(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  /**
   * Locates or lazily creates a folder inside a parent folder on Google Drive.
   * Handles both Google Workspace Shared Drives and Personal Drive shared folders.
   */
  public static async findOrCreateFolder(
    folderName: string,
    parentFolderId: string
  ): Promise<string> {
    const drive = this.getDriveClient();

    // Escape single quotes for Google Drive search query
    const escapedName = folderName.replace(/'/g, "\\'");
    const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${escapedName}' and '${parentFolderId}' in parents and trashed = false`;

    const searchRes = await drive.files.list({
      q,
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      return searchRes.data.files[0].id!;
    }

    // Folder does not exist, create it inside the parent
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id, name',
      supportsAllDrives: true,
    });

    if (!createRes.data.id) {
      throw new Error(`Failed to create Google Drive folder: ${folderName}`);
    }

    return createRes.data.id;
  }

  /**
   * Resolves or creates the dedicated Client Project Folder:
   * Google Drive/
   * └── Client Projects/
   *     └── CLIENT-001_Client-Name/
   */
  public static async getClientProjectFolder(sub: ISubmission): Promise<string> {
    const rootParentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID!;
    const safeClientName = this.sanitizeName(sub.clientSnapshot.name || 'Valued-Client');
    const folderName = `CLIENT-${sub.enquiryReference}_${safeClientName}`;

    return await this.findOrCreateFolder(folderName, rootParentId);
  }

  public static async getClientProjectFolderUrl(sub: ISubmission): Promise<string> {
    const folderId = await this.getClientProjectFolder(sub);
    return `https://drive.google.com/drive/folders/${folderId}`;
  }

  /**
   * Resolves or lazily creates a standard category subfolder inside the project folder.
   */
  public static async getCategoryFolder(
    projectFolderId: string,
    category: DriveCategory
  ): Promise<string> {
    return await this.findOrCreateFolder(category, projectFolderId);
  }

  /**
   * Searches for an existing file by exact name in the destination folder to prevent duplicates.
   */
  public static async findExistingFile(
    folderId: string,
    fileName: string
  ): Promise<{ id: string; name: string; webViewLink?: string; webContentLink?: string } | null> {
    const drive = this.getDriveClient();
    const safeName = fileName.replace(/'/g, "\\'");
    const q = `'${folderId}' in parents and name = '${safeName}' and trashed = false`;

    const res = await drive.files.list({
      q,
      fields: 'files(id, name, webViewLink, webContentLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1,
    });

    if (res.data.files && res.data.files.length > 0) {
      const f = res.data.files[0];
      return {
        id: f.id!,
        name: f.name!,
        webViewLink: f.webViewLink || undefined,
        webContentLink: f.webContentLink || undefined,
      };
    }

    return null;
  }

  /**
   * Uploads an in-memory file buffer (PDF, image, or TXT) to the designated project category folder.
   * If the file already exists, updates it in place in Google Drive to strictly avoid duplicate files.
   * Records or updates the action in MongoDB DriveDocument.
   */
  public static async uploadBufferToDrive(params: {
    submission: ISubmission;
    category: DriveCategory;
    buffer: Buffer;
    originalFileName: string;
    mimeType: string;
    uploader: { userId: any; name: string; role: string };
  }): Promise<UploadResult> {
    const { submission, category, buffer, originalFileName, mimeType, uploader } = params;

    const drive = this.getDriveClient();

    // 1. Resolve project root folder and category subfolder
    const projectFolderId = await this.getClientProjectFolder(submission);
    const categoryFolderId = await this.getCategoryFolder(projectFolderId, category);

    // 2. Check if a file with the same name already exists in this folder to avoid duplicates
    const existingFile = await this.findExistingFile(categoryFolderId, originalFileName);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    let fileId: string;
    let webViewLink: string;
    let webContentLink: string | undefined;

    if (existingFile) {
      // Update existing file in-place in Google Drive (NO duplicate files created)
      const updateRes = await drive.files.update({
        fileId: existingFile.id,
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id, name, mimeType, size, webViewLink, webContentLink',
        supportsAllDrives: true,
      });

      fileId = existingFile.id;
      webViewLink =
        updateRes.data.webViewLink ||
        existingFile.webViewLink ||
        `https://drive.google.com/file/d/${fileId}/view`;
      webContentLink = updateRes.data.webContentLink || existingFile.webContentLink;
    } else {
      // Create new file
      const driveRes = await drive.files.create({
        requestBody: {
          name: originalFileName,
          parents: [categoryFolderId],
        },
        media: {
          mimeType,
          body: stream,
        },
        fields: 'id, name, mimeType, size, webViewLink, webContentLink',
        supportsAllDrives: true,
      });

      const fileData = driveRes.data;
      if (!fileData.id) {
        throw new Error('Google Drive upload failed: No file ID returned.');
      }

      fileId = fileData.id;
      webViewLink = fileData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
      webContentLink = fileData.webContentLink || undefined;
    }

    const ext = path.extname(originalFileName).toLowerCase();

    // 3. Update or create structured metadata in MongoDB DriveDocument without duplicates
    let docRecord = await DriveDocument.findOne({
      submissionId: submission._id,
      category,
      fileName: originalFileName,
    });

    if (docRecord) {
      docRecord.driveFileId = fileId;
      docRecord.driveFolderId = categoryFolderId;
      docRecord.fileSizeBytes = buffer.length;
      docRecord.mimeType = mimeType;
      docRecord.fileExtension = ext;
      docRecord.webViewLink = webViewLink;
      if (webContentLink) docRecord.webContentLink = webContentLink;
      docRecord.uploadedBy = uploader;
      await docRecord.save();
    } else {
      docRecord = await DriveDocument.create({
        submissionId: submission._id,
        enquiryReference: submission.enquiryReference,
        clientId: submission.clientId,
        category,
        fileName: originalFileName,
        fileExtension: ext,
        fileSizeBytes: buffer.length,
        mimeType,
        driveFileId: fileId,
        driveFolderId: categoryFolderId,
        webViewLink,
        webContentLink,
        version: 1,
        uploadedBy: uploader,
      });
    }

    return {
      document: docRecord,
      driveFile: {
        id: fileId,
        name: originalFileName,
        size: buffer.length,
        mimeType,
        webViewLink: docRecord.webViewLink,
      },
    };
  }

  /**
   * Syncs the existing system-generated Commercial Quotation PDF directly into:
   * Google Drive/Client Projects/CLIENT-XXX/02_Quotations/Quotation-QT-XXX.pdf
   */
  public static async syncQuotationToDrive(
    quotation: IQuotation,
    submission: ISubmission,
    uploader: { userId: any; name: string; role: string }
  ): Promise<UploadResult> {
    const safeDTO = serializeClientQuotation(quotation);
    const pdfBuffer = await PDFService.generateQuotationPDF(safeDTO);
    const fileName = `Quotation-${quotation.quotationNumber}_v${quotation.revisionNumber}.pdf`;

    return await this.uploadBufferToDrive({
      submission,
      category: '02_Quotations',
      buffer: pdfBuffer,
      originalFileName: fileName,
      mimeType: 'application/pdf',
      uploader,
    });
  }

  /**
   * Syncs the existing system-generated Requirement Specification PDF directly into:
   * Google Drive/Client Projects/CLIENT-XXX/01_Client_Requirements/Requirements-REQ-XXX.pdf
   */
  public static async syncRequirementToDrive(
    submission: ISubmission,
    uploader: { userId: any; name: string; role: string }
  ): Promise<UploadResult> {
    const safeDTO = serializeClientSubmission(submission, false);
    const pdfBuffer = await PDFService.generateRequirementDetailsPDF(safeDTO);
    const fileName = `Requirements-${submission.enquiryReference}.pdf`;

    return await this.uploadBufferToDrive({
      submission,
      category: '01_Client_Requirements',
      buffer: pdfBuffer,
      originalFileName: fileName,
      mimeType: 'application/pdf',
      uploader,
    });
  }

  /**
   * Retrieves all Drive document records associated with a submission.
   */
  public static async getSubmissionDriveFiles(submissionId: string): Promise<IDriveDocument[]> {
    return await DriveDocument.find({ submissionId }).sort({ createdAt: -1 });
  }
}
