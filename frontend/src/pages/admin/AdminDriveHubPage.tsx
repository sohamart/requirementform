import React, { useState, useEffect, useRef } from 'react';
import {
  HardDrive,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Search,
  Layers,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Check,
  X,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { driveApi, ProjectDriveItemDTO, DriveStatsDTO, DriveStatusDTO } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const AdminDriveHubPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectDriveItemDTO[]>([]);
  const [stats, setStats] = useState<DriveStatsDTO>({
    totalProjects: 0,
    fullySyncedProjects: 0,
    pendingSyncCount: 0,
    totalDriveFiles: 0,
  });
  const [driveStatus, setDriveStatus] = useState<DriveStatusDTO | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'website' | 'app' | 'desktop'>('all');
  const [syncFilter, setSyncFilter] = useState<'all' | 'needs_sync' | 'synced'>('all');

  // Bulk sync states
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);
  const [syncAlert, setSyncAlert] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string[];
  } | null>(null);

  // Direct Asset Upload Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetProject, setTargetProject] = useState<ProjectDriveItemDTO | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('05_Design_And_Assets');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await driveApi.getOverview();
      if (res.data.success) {
        setProjects(res.data.projects);
        setStats(res.data.stats);
        setDriveStatus(res.data.driveStatus);
      }
    } catch (err: any) {
      console.error('Failed to load drive overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSyncAll = async () => {
    setBulkSyncing(true);
    setSyncAlert(null);
    try {
      const res = await driveApi.bulkSyncAll();
      if (res.data.success) {
        setSyncAlert({
          type: 'success',
          message: res.data.message,
          details: res.data.errors && res.data.errors.length > 0 ? res.data.errors : undefined,
        });
        await loadOverview();
      }
    } catch (err: any) {
      setSyncAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to complete bulk sync to Google Drive.',
      });
    } finally {
      setBulkSyncing(false);
    }
  };

  const handleSyncProject = async (projectId: string) => {
    setSyncingProjectId(projectId);
    setSyncAlert(null);
    try {
      const res = await driveApi.bulkSyncSubmission(projectId);
      if (res.data.success) {
        setSyncAlert({
          type: 'success',
          message: res.data.message,
        });
        await loadOverview();
      }
    } catch (err: any) {
      setSyncAlert({
        type: 'error',
        message: err.response?.data?.error || 'Failed to sync project to Google Drive.',
      });
    } finally {
      setSyncingProjectId(null);
    }
  };

  const handleOpenUploadModal = (project?: ProjectDriveItemDTO) => {
    setTargetProject(project || (projects.length > 0 ? projects[0] : null));
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedCategory('05_Design_And_Assets');
    setUploadError(null);
    setUploadSuccess(null);
    setUploadModalOpen(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeBytes = 25 * 1024 * 1024; // 25 MB
      if (file.size > maxSizeBytes) {
        setUploadError('File exceeds maximum allowed size of 25 MB.');
        return;
      }
      setSelectedFile(file);

      const isImage =
        file.type.startsWith('image/') ||
        ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'].some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );

      if (isImage) {
        setSelectedCategory('05_Design_And_Assets');
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFilePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUploadDirect = async () => {
    if (!targetProject || !selectedFile || uploadingFile) return;

    setUploadingFile(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await driveApi.uploadFile(
        targetProject.submissionId,
        selectedFile,
        selectedCategory,
        (percent) => setUploadProgress(percent)
      );

      if (res.data.success) {
        setUploadSuccess(`File "${res.data.file.name}" uploaded successfully to Google Drive!`);
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadOverview();
        setTimeout(() => {
          setUploadModalOpen(false);
          setUploadSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      setUploadError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to upload file to Google Drive.'
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.enquiryReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;

    const matchesSync =
      syncFilter === 'all'
        ? true
        : syncFilter === 'needs_sync'
        ? !p.isFullySynced
        : p.isFullySynced;

    return matchesSearch && matchesCategory && matchesSync;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
              CLOUD STORAGE & CLIENT ARCHIVES
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              1-CLICK BULK SYNC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <HardDrive className="w-7 h-7 text-brand-500" />
            <span>Google Drive Storage Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centrally synchronize and manage client project folders, requirement briefs, quotations, and image assets in Google Drive.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {driveStatus?.rootFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${driveStatus.rootFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-all cursor-pointer shadow-sm"
              title="Open the default primary client projects root folder on Google Drive"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Open Primary Drive Folder</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
            </a>
          )}

          <button
            onClick={loadOverview}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <button
            onClick={() => handleOpenUploadModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-800 dark:text-white transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
            <span>Upload Image / Asset</span>
          </button>

          <button
            onClick={handleBulkSyncAll}
            disabled={bulkSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-glow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {bulkSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing All Projects...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>1-Click Bulk Sync All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cloud Account Status Banner */}
      <div className="p-4 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Agency Google Drive Active
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>sohamduttabwn@gmail.com</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All administrative and client project files are securely stored within your centralized 15 GB Google Drive.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {driveStatus?.rootFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${driveStatus.rootFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
              title="Open the default primary client projects root folder (GOOGLE_DRIVE_PARENT_FOLDER_ID) on Google Drive"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open Primary Folder</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          )}

          {/* Superadmin Quick Connect (Hidden for all other users) */}
          {isSuperadmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Superadmin:</span>
              <a
                href="/api/v1/drive/connect"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-200 transition-colors"
                title="Only Super Administrator can reconnect Google Drive"
              >
                <span>Reconnect</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Sync Alert Banner if triggered */}
      {syncAlert && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 animate-in fade-in ${
            syncAlert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {syncAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
            )}
            <div>
              <p className="font-bold">{syncAlert.message}</p>
              {syncAlert.details && syncAlert.details.length > 0 && (
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] opacity-90">
                  {syncAlert.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            onClick={() => setSyncAlert(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <Layers className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats.totalProjects}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Client requirement submissions</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Fully Synced</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.fullySyncedProjects}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Requirements & quotes in Drive</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Sync</span>
            <UploadCloud className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingSyncCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Unsynced briefs or quotations</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Drive Documents</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {stats.totalDriveFiles}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">PDFs, specifications & images</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, reference, company..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs focus:outline-none focus:border-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="website">Websites</option>
            <option value="app">Mobile Apps</option>
            <option value="desktop">Desktop Apps</option>
          </select>

          {/* Sync Status Filter */}
          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-white dark:bg-charcoal-900 text-xs font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Sync States</option>
            <option value="needs_sync">Needs Sync (Pending)</option>
            <option value="synced">Fully Synced</option>
          </select>
        </div>
      </div>

      {/* Projects and Drive Hierarchy Table */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <span>Loading Google Drive cloud archives and project hierarchies...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs italic glass-panel rounded-3xl border border-slate-200 dark:border-charcoal-750">
          No client projects matched your search or filter.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredProjects.map((project) => {
            const isSyncingThis = syncingProjectId === project.submissionId;

            return (
              <div
                key={project.submissionId}
                className="p-5 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 hover:border-brand-500/40 transition-all shadow-sm"
              >
                {/* Project Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-charcoal-750">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                      {project.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {project.clientName}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300">
                          {project.enquiryReference}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            project.category === 'website'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : project.category === 'app'
                              ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {project.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {project.clientEmail} {project.company ? `• ${project.company}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Project Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Overall Sync Badge */}
                    {project.isFullySynced ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" />
                        <span>All Assets Synced</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSyncProject(project.submissionId)}
                        disabled={isSyncingThis || bulkSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        title="Upload missing requirement brief & quotations to Google Drive"
                      >
                        {isSyncingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>Sync This Project</span>
                      </button>
                    )}

                    {/* Direct Upload Asset Button */}
                    <button
                      onClick={() => handleOpenUploadModal(project)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-750 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                      <span>Upload Image</span>
                    </button>

                    {/* Open Project Folder in Drive */}
                    {project.folderUrl && (
                      <a
                        href={project.folderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors"
                        title="Open client project folder in Google Drive"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Open in Drive</span>
                        <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Standardized Folder Structure Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 text-xs">
                  {/* 1. Requirements Folder (01_Client_Requirements) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-charcoal-850/70 border border-slate-100 dark:border-charcoal-750">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <FolderOpen className="w-3.5 h-3.5 text-brand-500" />
                        <span>01_Client_Requirements</span>
                      </div>
                      {project.hasRequirementPdf ? (
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          <span>Uploaded</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-500">
                          Pending Sync
                        </span>
                      )}
                    </div>

                    {project.requirementPdf ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                            {project.requirementPdf.name}
                          </span>
                        </div>
                        {project.requirementPdf.webViewLink && (
                          <a
                            href={project.requirementPdf.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-brand-500 transition-colors shrink-0"
                            title="View PDF in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Requirement PDF will be generated on 1-click sync.
                      </p>
                    )}
                  </div>

                  {/* 2. Quotations Folder (02_Quotations) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-charcoal-850/70 border border-slate-100 dark:border-charcoal-750">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
                        <span>02_Quotations ({project.quotations.length})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {project.quotations.filter((q) => q.isSynced).length} / {project.quotations.length} Synced
                      </span>
                    </div>

                    {project.quotations.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No commercial quotation generated yet for this project.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {project.quotations.map((q) => (
                          <div
                            key={q.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-800 text-[11px]"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {q.quotationNumber} (v{q.revisionNumber})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ₹{(q.totalPaise / 100).toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {q.isSynced ? (
                                q.driveFile?.webViewLink && (
                                  <a
                                    href={q.driveFile.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-slate-400 hover:text-purple-500 transition-colors"
                                    title="View Quotation PDF in Drive"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                                  </a>
                                )
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Design & Client Assets (05_Design_And_Assets / 04_Client_Documents) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-charcoal-850/70 border border-slate-100 dark:border-charcoal-750">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <FolderOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Images & Assets ({project.assets.length})</span>
                      </div>
                      <button
                        onClick={() => handleOpenUploadModal(project)}
                        className="text-[10px] font-bold text-brand-500 hover:underline cursor-pointer"
                      >
                        + Upload
                      </button>
                    </div>

                    {project.assets.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No client images or custom attachments uploaded yet.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {project.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-100 dark:border-charcoal-800 text-[11px]"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(
                                asset.fileExtension.toLowerCase()
                              ) ? (
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {asset.fileName}
                              </span>
                            </div>

                            {asset.webViewLink && (
                              <a
                                href={asset.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-brand-500 transition-colors shrink-0 ml-1"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIRECT IMAGE & FILE UPLOAD MODAL */}
      {uploadModalOpen && targetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl glass-panel border border-slate-200 dark:border-charcoal-750 shadow-2xl relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Upload Project Image or Document
                </h3>
                <p className="text-[11px] text-slate-400">
                  Target Drive Folder: CLIENT-{targetProject.enquiryReference}_{targetProject.clientName}
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              {/* Client Project Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Selected Client Project:
                </label>
                <select
                  value={targetProject.submissionId}
                  onChange={(e) => {
                    const match = projects.find((p) => p.submissionId === e.target.value);
                    if (match) setTargetProject(match);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-bold"
                >
                  {projects.map((p) => (
                    <option key={p.submissionId} value={p.submissionId}>
                      {p.enquiryReference} — {p.clientName} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Subfolder Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Subfolder:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-750 bg-slate-50 dark:bg-charcoal-850 text-xs font-medium"
                >
                  <option value="05_Design_And_Assets">05_Design_And_Assets (Images, UI, Logos, Mockups)</option>
                  <option value="04_Client_Documents">04_Client_Documents (Client Briefs, Contracts)</option>
                  <option value="03_Project_Details">03_Project_Details (Technical Scope)</option>
                  <option value="07_Delivery_And_Final_Files">07_Delivery_And_Final_Files (Final Exports)</option>
                </select>
              </div>

              {/* File Dropzone */}
              <div
                onClick={() => !uploadingFile && fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-charcoal-750 bg-slate-50/50 dark:bg-charcoal-850/50 hover:border-brand-500/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.svg,.gif,.pdf,.txt,image/*,application/pdf"
                  onChange={handleFileInputChange}
                  disabled={uploadingFile}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    {filePreview ? (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-md">
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
                        {formatFileSize(selectedFile.size)} • Ready for direct upload
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Click to select image or document
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PNG, JPG, WebP, SVG, GIF or PDF • Up to 25 MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {uploadingFile && (
                <div className="w-full bg-slate-200 dark:bg-charcoal-750 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full transition-all duration-200 ease-out"
                    style={{ width: `${Math.max(8, uploadProgress)}%` }}
                  />
                </div>
              )}

              {/* Success / Error alerts */}
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-charcoal-750">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                disabled={uploadingFile}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadDirect}
                disabled={!selectedFile || uploadingFile}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm disabled:opacity-50 cursor-pointer transition-all"
              >
                {uploadingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading {uploadProgress}%...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload to Drive</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
