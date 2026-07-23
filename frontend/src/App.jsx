import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth/authContext';
import { ThemeProvider } from './lib/themeContext';
import { ToastProvider } from './components/feedback/ToastProvider';

// Layouts & Guards
import AppShell from './components/layout/AppShell';
import RoleGuard from './components/layout/RoleGuard';
import NotFoundPage from './components/layout/NotFoundPage';

// Auth Features
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import VerifyEmailPage from './features/auth/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// Dashboard
import DashboardPage from './features/dashboard/DashboardPage';

// Assets
import AssetCatalogPage from './features/assets/AssetCatalogPage';
import AssetDetailPage from './features/assets/AssetDetailPage';
import AssetManagementPage from './features/assets/AssetManagementPage';

// Masters
import CategoriesPage from './features/masters/CategoriesPage';
import LocationsPage from './features/masters/LocationsPage';

// Borrowing
import UserBorrowingsPage from './features/borrowing/UserBorrowingsPage';
import BorrowingApprovalPage from './features/borrowing/BorrowingApprovalPage';
import BorrowingHistoryPage from './features/borrowing/BorrowingHistoryPage';

// Allocation & Audit
import AllocationHistoryPage from './features/allocation/AllocationHistoryPage';
import LocationSummaryPage from './features/allocation/LocationSummaryPage';

// Root redirector based on authentication and role
const RootRedirect = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'SUPER_ADMIN' || role === 'STAFF') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/catalog" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Protected Workspace Layout */}
              <Route element={<AppShell />}>
                {/* Admin & Staff Only Routes */}
                <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN', 'STAFF']} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/assets" element={<AssetManagementPage />} />
                  <Route path="/borrowings" element={<BorrowingApprovalPage />} />
                  <Route path="/borrowings/history" element={<BorrowingHistoryPage />} />
                  <Route path="/masters/categories" element={<CategoriesPage />} />
                  <Route path="/masters/locations" element={<LocationsPage />} />
                  <Route path="/allocation/history" element={<AllocationHistoryPage />} />
                  <Route path="/allocation/location-summary" element={<LocationSummaryPage />} />
                </Route>

                {/* User & General Routes (accessible by all roles or student) */}
                <Route element={<RoleGuard allowedRoles={['USER', 'SUPER_ADMIN', 'STAFF']} />}>
                  <Route path="/catalog" element={<AssetCatalogPage />} />
                  <Route path="/catalog/:id" element={<AssetDetailPage />} />
                  <Route path="/assets/:id" element={<AssetDetailPage />} />
                  <Route path="/my-borrowings" element={<UserBorrowingsPage />} />
                  <Route path="/my-borrowings/history" element={<BorrowingHistoryPage />} />
                </Route>
              </Route>

              {/* Catch all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
