import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AppShell } from './components/layout/AppShell';

// Authenticated Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BusinessHealthPage } from './pages/health/BusinessHealthPage';
import { RiskPage } from './pages/risk/RiskPage';
import { LeadsPage } from './pages/crm/LeadsPage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { FinancePage } from './pages/finance/FinancePage';
import { DocumentsPage } from './pages/documents/DocumentsPage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { MarketingPage } from './pages/marketing/MarketingPage';
import { CompetitorsPage } from './pages/competitors/CompetitorsPage';
import { FeedbackPage } from './pages/feedback/FeedbackPage';
import { AutomationsPage } from './pages/automations/AutomationsPage';
import { AdminPage } from './pages/admin/AdminPage';
import { WorkspaceSettingsPage } from './pages/settings/WorkspaceSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Authenticated Workspace Application Shell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/health" element={<BusinessHealthPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/crm" element={<LeadsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/competitors" element={<CompetitorsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/automations" element={<AutomationsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<WorkspaceSettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
