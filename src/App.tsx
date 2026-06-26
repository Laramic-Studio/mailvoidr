import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { GuestLayout, OnboardingLayout, ProtectedLayout } from "@/routes/guards";

import Onboarding from "@/pages/Onboarding";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import TwoFA from "@/pages/auth/TwoFA";
import OAuthCallback from "@/pages/auth/OAuthCallback";
import WorkspaceSelect from "@/pages/auth/WorkspaceSelect";
import InviteAccept from "@/pages/auth/InviteAccept";

import DashboardOverview from "@/pages/dashboard/Overview";
import SendEmail from "@/pages/dashboard/SendEmail";
import Inbox from "@/pages/dashboard/Inbox";
import VirtualEmails from "@/pages/dashboard/VirtualEmails";
import VirtualEmailDetail from "@/pages/dashboard/VirtualEmailDetail";
import Domains from "@/pages/dashboard/Domains";
import Analytics from "@/pages/dashboard/Analytics";
import EmailLogs from "@/pages/dashboard/EmailLogs";
import Templates from "@/pages/dashboard/Templates";
import TemplateMarketplace from "@/pages/dashboard/TemplateMarketplace";
import TemplateDetail from "@/pages/dashboard/TemplateDetail";
import APIKeys from "@/pages/dashboard/APIKeys";
import SMTP from "@/pages/dashboard/SMTP";
import Webhooks from "@/pages/dashboard/Webhooks";
import Teams from "@/pages/dashboard/Teams";
import Billing from "@/pages/dashboard/Billing";
import Settings from "@/pages/dashboard/Settings";

import DocsLanding from "@/pages/docs/DocsLanding";
import DocsArticle from "@/pages/docs/DocsArticle";

import MarketingHome from "@/pages/marketing/Home";
import Features from "@/pages/marketing/Features";
import Pricing from "@/pages/marketing/Pricing";
import Enterprise from "@/pages/marketing/Enterprise";
import Blog from "@/pages/marketing/Blog";
import About from "@/pages/marketing/About";
import Status from "@/pages/marketing/Status";
import Contact from "@/pages/marketing/Contact";

function LegacyVirtualEmailDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/virtual-emails/${id ?? ""}`} replace />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public — no auth required */}
          <Route path="/" element={<MarketingHome />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/status" element={<Status />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/docs" element={<DocsLanding />} />
          <Route path="/docs/:slug" element={<DocsArticle />} />

          {/* Guest-only — signed-in users are redirected */}
          <Route element={<GuestLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Mid-login 2FA — no session yet */}
          <Route path="/2fa" element={<TwoFA />} />
          <Route path="/auth/oauth/callback" element={<OAuthCallback />} />

          <Route path="/invite" element={<InviteAccept />} />

          {/* Authenticated app */}
          <Route element={<ProtectedLayout />}>
            <Route element={<OnboardingLayout />}>
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/workspaces" element={<WorkspaceSelect />} />

              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/send" element={<SendEmail />} />
              <Route path="/dashboard/inbox" element={<Inbox />} />
              <Route path="/dashboard/virtual-emails" element={<VirtualEmails />} />
              <Route path="/dashboard/virtual-emails/:id" element={<VirtualEmailDetail />} />

              {/* Legacy routes */}
              <Route path="/dashboard/testing" element={<Navigate to="/dashboard/inbox" replace />} />
              <Route path="/dashboard/inboxes" element={<Navigate to="/dashboard/virtual-emails" replace />} />
              <Route path="/dashboard/inboxes/:id" element={<LegacyVirtualEmailDetailRedirect />} />

              <Route path="/dashboard/domains" element={<Domains />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/logs" element={<EmailLogs />} />
              <Route path="/dashboard/templates/marketplace" element={<TemplateMarketplace />} />
              <Route path="/dashboard/templates" element={<Templates />} />
              <Route path="/dashboard/templates/:id" element={<TemplateDetail />} />
              <Route path="/dashboard/api-keys" element={<APIKeys />} />
              <Route path="/dashboard/smtp" element={<SMTP />} />
              <Route path="/dashboard/webhooks" element={<Webhooks />} />
              <Route path="/dashboard/teams" element={<Teams />} />
              <Route path="/dashboard/billing" element={<Billing />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
