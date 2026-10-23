import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/common/Navbar.js';
import { MobileBottomDock } from './components/common/MobileBottomDock.js';
import { ProjectSelectionPopup } from './components/common/ProjectSelectionPopup.js';
import { UniversalSearchModal } from './components/common/UniversalSearchModal.js';
import { LandingPage } from './pages/LandingPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { RequirementFormPage } from './pages/RequirementFormPage.js';
import { ClientPortalPage } from './pages/ClientPortalPage.js';

// Admin Modules
import { AdminLayout } from './components/admin/AdminLayout.js';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage.js';
import { AdminMarginDashboardPage } from './pages/admin/AdminMarginDashboardPage.js';
import { AdminProjectCostsPage } from './pages/admin/AdminProjectCostsPage.js';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage.js';
import { AdminFormBuilderPage } from './pages/admin/AdminFormBuilderPage.js';
import { AdminPackagesPage } from './pages/admin/AdminPackagesPage.js';
import { AdminAddonsPage } from './pages/admin/AdminAddonsPage.js';
import { AdminQuotationsPage } from './pages/admin/AdminQuotationsPage.js';
import { AdminBrandsPage } from './pages/admin/AdminBrandsPage.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { AdminInternalNotesPage } from './pages/admin/AdminInternalNotesPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage.js';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.js';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-charcoal-950">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isFormRoute = location.pathname.startsWith('/requirements');

  // Global Ctrl+K / Cmd+K shortcut to open Universal Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Marketing Navbar: Only on non-admin routes to prevent double header collision */}
      {!isAdminRoute && (
        <Navbar
          onOpenProjectSelector={() => setProjectSelectorOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* Global Project Selection Welcome Popup */}
      <ProjectSelectionPopup
        isOpen={projectSelectorOpen}
        onClose={() => setProjectSelectorOpen(false)}
      />

      {/* Global Universal Search Palette (Packages, Domains, Addons & Charges) */}
      <UniversalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onOpenProjectSelector={() => {
          setSearchModalOpen(false);
          setProjectSelectorOpen(true);
        }}
      />

      <div className={`flex-1 ${isAdminRoute ? '' : isFormRoute ? 'pb-8 md:pb-0' : 'pb-20 md:pb-0'}`}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<LandingPage onOpenProjectSelector={() => setProjectSelectorOpen(true)} />}
          />
          <Route
            path="/domains"
            element={<LandingPage onOpenProjectSelector={() => setProjectSelectorOpen(true)} />}
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/requirements/:category" element={<RequirementFormPage />} />

          {/* Client Portal */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <ClientPortalPage onOpenProjectSelector={() => setProjectSelectorOpen(true)} />
              </ProtectedRoute>
            }
          />

          {/* Admin Suite (16 Complete Modules) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* 1. Overview */}
            <Route index element={<AdminOverviewPage />} />

            {/* 2. User & Access Management */}
            <Route path="users" element={<AdminUsersPage />} />

            {/* 3 & 4. Website and App Submissions */}
            <Route path="submissions/website" element={<AdminSubmissionsPage />} />
            <Route path="submissions/app" element={<AdminSubmissionsPage />} />

            {/* 5. Dynamic Form Builder */}
            <Route path="forms" element={<AdminFormBuilderPage />} />

            {/* 6. Package & Pricing Manager */}
            <Route path="packages" element={<AdminPackagesPage />} />

            {/* 7. Optional Services Manager */}
            <Route path="addons" element={<AdminAddonsPage />} />

            {/* 8. Quotation Manager */}
            <Route path="quotations" element={<AdminQuotationsPage />} />

            {/* 9. Brand Profiles & Templates */}
            <Route path="brands" element={<AdminBrandsPage />} />

            {/* 10. Profit & Margin Dashboard (HIGHEST PRIORITY) */}
            <Route path="financials" element={<AdminMarginDashboardPage />} />

            {/* 11. Project Cost Tracking */}
            <Route path="costs" element={<AdminProjectCostsPage />} />

            {/* 12. Internal Notes Explorer */}
            <Route path="internal-notes" element={<AdminInternalNotesPage />} />

            {/* 13. Settings & Terms */}
            <Route path="settings" element={<AdminSettingsPage />} />

            {/* 14. Notifications */}
            <Route path="notifications" element={<AdminNotificationsPage />} />

            {/* 15. Audit Logs */}
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />

            {/* 16. System Health */}
            <Route path="system-health" element={<AdminSystemHealthPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Modern Web App Mobile Bottom Dock: Only show on consumer/portal pages */}
      {!isAdminRoute && !isFormRoute && (
        <MobileBottomDock onOpenProjectSelector={() => setProjectSelectorOpen(true)} />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
