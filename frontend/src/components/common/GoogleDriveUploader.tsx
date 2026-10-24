import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  HardDrive,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { driveApi, DriveFileDTO } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface GoogleDriveUploaderProps {
  submissionId: string;
  enquiryReference?: string;
  quotationId?: string;
  isAdmin?: boolean;
}

export const GoogleDriveUploader: React.FC<GoogleDriveUploaderProps> = ({
  submissionId,
  enquiryReference,
  quotationId,
  isAdmin = false,
}) => {
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [category, setCategory] = useState('04_Client_Documents');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    size: number;
    link?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existingFiles, setExistingFiles] = useState<DriveFileDTO[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [syncingQuote, setSyncingQuote] = useState(false);
  const [syncingReq, setSyncingReq] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [submissionId]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await driveApi.getFiles(submissionId);
      if (res.data.success) {
        setExistingFiles(res.data.files);
      }
    } catch {
      // Non-blocking if drive is not configured yet
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    const validExtensions = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isImage = file.type.startsWith('image/') || validExtensions.includes(ext);

    if (!validExtensions.includes(ext) && !isImage) {
      return 'Only PDF (.pdf), TXT (.txt), and Images (.png, .jpg, .jpeg, .webp, .svg, .gif) are supported.';
    }
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxSizeBytes) {
      return 'File size exceeds maximum allowed limit (25 MB).';
    }
    return null;
  };

  const processSelectedFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setSelectedFile(file);

    const isImage = file.type.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].some(ext => file.name.toLowerCase().endsWith(ext));
    if (isImage) {
      setCategory('05_Design_And_Assets');
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg(null);
    setSuccessInfo(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessInfo(null);
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadProgress(0);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const res = await driveApi.uploadFile(
        submissionId,
        selectedFile,
        category,
        (percent) => setUploadProgress(percent)
      );

      if (res.data.success) {
        setSuccessInfo({
          name: res.data.file.name,
          size: res.data.file.size,
          link: res.data.file.webViewLink,
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await loadFiles();
      } else {
        setErrorMsg(res.data.message || 'Upload failed.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to connect to Google Drive. Please ensure Drive credentials are configured.';
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSyncRequirements = async () => {
    setSyncingReq(true);
    setErrorMsg(null);
    try {
      const res = await driveApi.syncRequirements(submissionId);
      if (res.data.success) {
        setSuccessInfo({
          name: res.data.file.name,
          size: res.data.file.size,
          link: res.data.file.webViewLink,
        });
        await loadFiles();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to sync requirement PDF to Google Drive.');
    } finally {
      setSyncingReq(false);
    }
  };

  const handleSyncQuotation = async () => {
    if (!quotationId) return;
    setSyncingQuote(true);
    setErrorMsg(null);
    try {
      const res = await driveApi.syncQuotation(quotationId);
      if (res.data.success) {
        setSuccessInfo({
          name: res.data.file.name,
          size: res.data.file.size,
          link: res.data.file.webViewLink,
        });
        await loadFiles();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to sync quotation PDF to Google Drive.');
    } finally {
      setSyncingQuote(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case '01_Client_Requirements':
        return 'Requirements';
      case '02_Quotations':
        return 'Quotation';
      case '03_Project_Details':
        return 'Project Brief';
      case '04_Client_Documents':
        return 'Client Document';
      case '05_Design_And_Assets':
        return 'Design & Assets';
      default:
        return cat.replace(/^[0-9]+_/, '').replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-charcoal-750">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Google Drive Project Storage
              {enquiryReference && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                  {enquiryReference}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click secure document upload & synchronized client archives (.pdf, .txt)
            </p>
          </div>
        </div>

        {/* Quick Sync Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncRequirements}
            disabled={syncingReq || uploading}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Auto-generate and upload Requirement brief PDF to 01_Client_Requirements"
          >
            {syncingReq ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Sync Requirements PDF</span>
          </button>

          {quotationId && (
            <button
              type="button"
              onClick={handleSyncQuotation}
              disabled={syncingQuote || uploading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              title="Auto-generate and upload Commercial Quotation PDF to 02_Quotations"
            >
              {syncingQuote ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5" />
              )}
              <span>Sync Quotation PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <label className="font-semibold text-slate-700 dark:text-slate-300">
          Target Project Folder:
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={uploading}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-500 font-medium"
        >
          <option value="04_Client_Documents">04_Client_Documents (Client Briefs & Specs)</option>
          <option value="01_Client_Requirements">01_Client_Requirements (Requirements Briefs)</option>
          <option value="02_Quotations">02_Quotations (Proposals & Estimates)</option>
          <option value="03_Project_Details">03_Project_Details (Scope & Architecture)</option>
          <option value="05_Design_And_Assets">05_Design_And_Assets (Brand Assets & UI)</option>
        </select>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
          dragActive
            ? 'border-brand-500 bg-brand-500/5'
            : selectedFile
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-charcoal-850'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.svg,.gif,application/pdf,text/plain,image/*"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            {filePreview ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <FileText className="w-8 h-8" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white break-all">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(selectedFile.size)} • Ready for One-Click Upload
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to browse or drag & drop files / images
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supported formats: PDF (.pdf), Text (.txt) & Images (.png, .jpg, .webp, .svg) • Up to 25 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Action & Progress */}
      {selectedFile && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Folder destination:{' '}
            <span className="font-bold text-brand-500">{getCategoryLabel(category)}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={uploading}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-charcoal-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading {uploadProgress}%...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload to Google Drive</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar in-flight */}
      {uploading && (
        <div className="w-full bg-slate-200 dark:bg-charcoal-750 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${Math.max(5, uploadProgress)}%` }}
          />
        </div>
      )}

      {/* Success Notification */}
      {successInfo && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Successfully saved to Google Drive!</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              File: <span className="font-semibold">{successInfo.name}</span> (
              {formatFileSize(successInfo.size)})
            </p>
            {successInfo.link && (
              <a
                href={successInfo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold underline mt-1 text-emerald-700 dark:text-emerald-300 hover:opacity-80"
              >
                <span>Open document in Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error Alert / Storage Quota Helper (Only Superadmin sees connect button) */}
      {errorMsg && errorMsg.includes('storage quota') ? (
        isSuperadmin ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="font-bold text-sm">Personal Google Drive: One-Time Connection Required</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Google policy gives Service Accounts 0 MB storage on personal Gmail accounts. To use your personal 15 GB storage, connect your personal Google Drive once:
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="/api/v1/drive/connect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm cursor-pointer transition-colors"
                >
                  <span>Connect Personal Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-3 text-xs">
            <HardDrive className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" />
            <div>
              <p className="font-bold">Agency Google Drive Storage Active</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                All client documents and image assets are stored directly in the centralized Agency Google Drive.
              </p>
            </div>
          </div>
        )
      ) : (
        errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Google Drive Operation Failed</p>
              <p className="text-[11px] opacity-90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )
      )}

      {/* Existing Project Documents List */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-charcoal-750">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Project Drive Documents ({existingFiles.length})
          </span>
          <button
            type="button"
            onClick={loadFiles}
            className="text-[11px] text-brand-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingFiles ? (
          <div className="py-4 text-center text-xs text-slate-400">Loading documents...</div>
        ) : existingFiles.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 italic bg-slate-50/50 dark:bg-charcoal-850/50 rounded-xl border border-dashed border-slate-200 dark:border-charcoal-750">
            No files uploaded to Google Drive yet for this client project.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {existingFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-charcoal-850 border border-slate-100 dark:border-charcoal-750 text-xs hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {f.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-charcoal-750 font-medium">
                        {getCategoryLabel(f.category)}
                      </span>
                      <span>{formatFileSize(f.fileSizeBytes)}</span>
                      <span>• v{f.version}</span>
                      <span>• By {f.uploadedBy}</span>
                    </div>
                  </div>
                </div>

                {f.webViewLink && (
                  <a
                    href={f.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 transition-colors shrink-0 ml-2"
                    title="View in Google Drive"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
