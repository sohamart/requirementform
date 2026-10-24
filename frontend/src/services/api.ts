import axios from 'axios';
import {
  UserDTO,
  ClientSubmissionDTO,
  AdminSubmissionDTO,
  ClientQuotationDTO,
  PackageDTO,
  AddonDTO,
  BrandProfileDTO,
  FormDefinitionDTO,
  FormStepNotesDTO,
  SubmissionInternalNotesDTO,
  ProjectFinancialsDTO,
  FinancialAnalyticsDashboardDTO,
  DomainSearchRequest,
  DomainSearchResponse,
  DomainSuggestion,
  GoDaddyStatusDTO,
} from '@shared/types/index.js';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl ? `${rawApiUrl}/api/v1` : '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage to support cross-origin deployments & Safari/Chrome cookie restrictions
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthMe = error.config?.url?.includes('/auth/me');
      if (isAuthMe) {
        localStorage.removeItem('auth_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  getMe: () => api.get<{ success: boolean; user: UserDTO }>('/auth/me'),
  login: (data: any) => api.post<{ success: boolean; user: UserDTO; token: string }>('/auth/login', data),
  register: (data: any) => api.post<{ success: boolean; user: UserDTO; token: string }>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  logoutEverywhere: () => api.post('/auth/logout-all'),
  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    api.put<{ success: boolean; message: string }>('/auth/change-password', data),
};

export const publicApi = {
  getPublishedForm: (category: 'website' | 'app' | 'desktop') =>
    api.get<{ success: boolean; form: FormDefinitionDTO }>(`/public/forms/${category}`),
  getPackages: (category?: 'website' | 'app' | 'desktop' | string) =>
    api.get<{ success: boolean; packages: PackageDTO[] }>('/public/packages', { params: { category } }),
  getAddons: (category?: string) =>
    api.get<{ success: boolean; addons: AddonDTO[] }>('/public/addons', { params: { category } }),
  getBrands: () =>
    api.get<{ success: boolean; brands: BrandProfileDTO[] }>('/public/brands'),
};

export const clientApi = {
  createSubmission: (data: any) =>
    api.post<{ success: boolean; submission: ClientSubmissionDTO }>('/submissions', data),
  getMySubmissions: () =>
    api.get<{ success: boolean; submissions: ClientSubmissionDTO[] }>('/submissions/my'),
  getMySubmissionById: (id: string) =>
    api.get<{ success: boolean; submission: ClientSubmissionDTO; quotation?: ClientQuotationDTO | null }>(
      `/submissions/${id}`
    ),
  downloadRequirementPDF: (id: string) =>
    api.get(`/submissions/${id}/download-requirements`, { responseType: 'blob' }),
  downloadQuotationPDF: (id: string) =>
    api.get(`/submissions/${id}/download-quotation`, { responseType: 'blob' }),
};

export const adminApi = {
  // Forms & Builder
  getAllForms: () => api.get<{ success: boolean; forms: any[] }>('/admin/forms'),
  getFormById: (slug: string, version?: number) =>
    api.get<{ success: boolean; form: FormDefinitionDTO }>(`/admin/forms/${slug}`, { params: { version } }),
  createForm: (data: any) => api.post('/admin/forms', data),
  updateForm: (id: string, data: any) => api.put(`/admin/forms/${id}`, data),
  publishForm: (id: string) => api.post(`/admin/forms/${id}/publish`),
  getFormStepNotes: (formId: string, version: number = 1) =>
    api.get<{ success: boolean; notes: FormStepNotesDTO[] }>(`/admin/forms/${formId}/notes`, {
      params: { version },
    }),
  saveFormStepNote: (formId: string, data: { stepId: string; notes: string; formVersion?: number }) =>
    api.post<{ success: boolean; note: any }>(`/admin/forms/${formId}/notes`, data),

  // Submissions
  getAllSubmissions: (params?: any) =>
    api.get<{ success: boolean; submissions: AdminSubmissionDTO[] }>('/admin/submissions', { params }),
  getSubmissionById: (id: string) =>
    api.get<{ success: boolean; submission: AdminSubmissionDTO; quotation?: ClientQuotationDTO | null }>(
      `/admin/submissions/${id}`
    ),
  updateSubmissionStatus: (id: string, status: string) =>
    api.put(`/admin/submissions/${id}/status`, { status }),
  getSubmissionStepNotes: (submissionId: string) =>
    api.get<{ success: boolean; notes: SubmissionInternalNotesDTO[] }>(
      `/admin/submissions/${submissionId}/notes`
    ),
  saveSubmissionStepNote: (submissionId: string, data: { stepId: string; notes: string }) =>
    api.post(`/admin/submissions/${submissionId}/notes`, data),

  // Quotations
  getAllQuotations: () => api.get<{ success: boolean; quotations: ClientQuotationDTO[] }>('/admin/quotations'),
  getQuotationById: (id: string) =>
    api.get<{ success: boolean; quotation: ClientQuotationDTO }>(`/admin/quotations/${id}`),
  createQuotation: (data: any) => api.post<{ success: boolean; quotation: ClientQuotationDTO }>('/admin/quotations', data),
  updateQuotation: (id: string, data: any) => api.put<{ success: boolean; quotation: ClientQuotationDTO }>(`/admin/quotations/${id}`, data),
  downloadQuotationPDF: (id: string) =>
    api.get(`/admin/quotations/${id}/download`, { responseType: 'blob' }),

  // Financials & Margins (Strictly Gated)
  getFinancialDashboard: () =>
    api.get<{ success: boolean; dashboard: FinancialAnalyticsDashboardDTO }>('/admin/financials/dashboard'),
  getProjectFinancials: (submissionId: string) =>
    api.get<{ success: boolean; financials: ProjectFinancialsDTO }>(
      `/admin/financials/projects/${submissionId}`
    ),
  addCostEntry: (data: any) => api.post('/admin/financials/costs', data),
  deleteCostEntry: (id: string) => api.delete<{ success: boolean; message: string }>(`/admin/financials/costs/${id}`),
  addPaymentRecord: (data: any) => api.post('/admin/financials/payments', data),
  updateTargetMargin: (submissionId: string, data: any) =>
    api.put(`/admin/financials/target-margin/${submissionId}`, data),
  updateFinancialConfig: (submissionId: string, data: any) =>
    api.put<{ success: boolean; financials: any }>(`/admin/financials/config/${submissionId}`, data),

  // Catalog
  getAllPackages: () => api.get<{ success: boolean; packages: PackageDTO[] }>('/admin/packages'),
  createPackage: (data: any) => api.post('/admin/packages', data),
  updatePackage: (id: string, data: any) => api.put(`/admin/packages/${id}`, data),

  getAllAddons: () => api.get<{ success: boolean; addons: AddonDTO[] }>('/admin/addons'),
  createAddon: (data: any) => api.post('/admin/addons', data),
  updateAddon: (id: string, data: any) => api.put(`/admin/addons/${id}`, data),

  getAllBrands: () => api.get<{ success: boolean; brands: BrandProfileDTO[] }>('/admin/brands'),
  createBrand: (data: any) => api.post('/admin/brands', data),
  updateBrand: (id: string, data: any) => api.put(`/admin/brands/${id}`, data),

  // Users & Access
  getAllUsers: () => api.get<{ success: boolean; users: UserDTO[] }>('/admin/users'),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  changeUserPassword: (userId: string, newPassword: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/users/${userId}/password`, { newPassword }),

  // Audit Logs
  getAllAuditLogs: () => api.get<{ success: boolean; logs: any[] }>('/admin/audit-logs'),
};

export const domainApi = {
  search: (data: DomainSearchRequest) =>
    api.post<DomainSearchResponse>('/domains/search', data),
  checkAvailability: (domains: string[]) =>
    api.post<{
      success: boolean;
      godaddyConfigured: boolean;
      godaddyMessage?: string;
      results: Array<DomainSuggestion>;
    }>('/domains/check-availability', { domains }),
  getStatus: () =>
    api.get<{
      success: boolean;
      status: GoDaddyStatusDTO;
      supportedTlds: string[];
    }>('/domains/status'),
};

export interface DriveFileDTO {
  id: string;
  driveFileId: string;
  fileName: string;
  fileExtension: string;
  fileSizeBytes: number;
  category: string;
  version: number;
  webViewLink?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectDriveItemDTO {
  submissionId: string;
  enquiryReference: string;
  clientName: string;
  clientEmail: string;
  company?: string;
  category: string;
  createdAt: string;
  hasRequirementPdf: boolean;
  requirementPdf: { id: string; name: string; webViewLink?: string } | null;
  quotations: {
    id: string;
    quotationNumber: string;
    revisionNumber: number;
    totalPaise: number;
    status: string;
    isSynced: boolean;
    driveFile: { id: string; name: string; webViewLink?: string } | null;
  }[];
  assets: {
    id: string;
    fileName: string;
    fileExtension: string;
    fileSizeBytes: number;
    category: string;
    webViewLink?: string;
    uploadedBy: string;
    createdAt: string;
  }[];
  isFullySynced: boolean;
  folderUrl?: string;
}

export interface DriveStatsDTO {
  totalProjects: number;
  fullySyncedProjects: number;
  pendingSyncCount: number;
  totalDriveFiles: number;
}

export interface DriveStatusDTO {
  isPersonalOAuthConnected: boolean;
  hasFolderConfigured: boolean;
  rootFolderId?: string;
  accountEmail?: string;
}

export const driveApi = {
  uploadFile: (
    submissionId: string,
    file: File,
    category?: string,
    onUploadProgress?: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    return api.post<{
      success: boolean;
      message: string;
      file: {
        id: string;
        name: string;
        size: number;
        mimeType: string;
        category: string;
        webViewLink?: string;
        uploadedAt: string;
      };
    }>(`/drive/upload/${submissionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
  },

  getFiles: (submissionId: string) =>
    api.get<{ success: boolean; files: DriveFileDTO[] }>(`/drive/files/${submissionId}`),

  syncQuotation: (quotationId: string) =>
    api.post<{
      success: boolean;
      message: string;
      file: { id: string; name: string; size: number; webViewLink?: string };
    }>(`/drive/sync-quotation/${quotationId}`),

  syncRequirements: (submissionId: string) =>
    api.post<{
      success: boolean;
      message: string;
      file: { id: string; name: string; size: number; webViewLink?: string };
    }>(`/drive/sync-requirements/${submissionId}`),

  getOverview: () =>
    api.get<{
      success: boolean;
      projects: ProjectDriveItemDTO[];
      stats: DriveStatsDTO;
      driveStatus: DriveStatusDTO;
    }>('/drive/overview'),

  bulkSyncAll: () =>
    api.post<{
      success: boolean;
      message: string;
      syncedRequirements: number;
      syncedQuotations: number;
      errors: string[];
    }>('/drive/bulk-sync'),

  bulkSyncSubmission: (submissionId: string) =>
    api.post<{
      success: boolean;
      message: string;
      syncedRequirement: boolean;
      syncedQuotationsCount: number;
    }>(`/drive/bulk-sync/${submissionId}`),

  getAuthStatus: () =>
    api.get<{
      success: boolean;
      isPersonalOAuthConnected: boolean;
      hasFolderConfigured: boolean;
    }>('/drive/status'),
};


