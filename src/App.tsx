import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import Onboarding from "@/pages/Onboarding";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import TwoFA from "@/pages/auth/TwoFA";
import WorkspaceSelect from "@/pages/auth/WorkspaceSelect";
import InviteAccept from "@/pages/auth/InviteAccept";

import DashboardOverview from "@/pages/dashboard/Overview";
import SendEmail from "@/pages/dashboard/SendEmail";
import Testing from "@/pages/dashboard/Testing";
import Inboxes from "@/pages/dashboard/Inboxes";
import InboxDetail from "@/pages/dashboard/InboxDetail";
import Domains from "@/pages/dashboard/Domains";
import Analytics from "@/pages/dashboard/Analytics";
import EmailLogs from "@/pages/dashboard/EmailLogs";
import Templates from "@/pages/dashboard/Templates";
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

function Protected({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingHome />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/status" element={<Status />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/2fa" element={<TwoFA />} />
          <Route
            path="/workspaces"
            element={
              <Protected>
                <WorkspaceSelect />
              </Protected>
            }
          />
          <Route path="/invite" element={<InviteAccept />} />
          <Route
            path="/onboarding"
            element={
              <Protected>
                <Onboarding />
              </Protected>
            }
          />

          <Route path="/docs" element={<DocsLanding />} />
          <Route path="/docs/:slug" element={<DocsArticle />} />

          <Route
            path="/dashboard"
            element={
              <Protected>
                <DashboardOverview />
              </Protected>
            }
          />
          <Route
            path="/dashboard/send"
            element={
              <Protected>
                <SendEmail />
              </Protected>
            }
          />
          <Route
            path="/dashboard/testing"
            element={
              <Protected>
                <Testing />
              </Protected>
            }
          />
          <Route
            path="/dashboard/inboxes"
            element={
              <Protected>
                <Inboxes />
              </Protected>
            }
          />
          <Route
            path="/dashboard/inboxes/:id"
            element={
              <Protected>
                <InboxDetail />
              </Protected>
            }
          />
          <Route
            path="/dashboard/domains"
            element={
              <Protected>
                <Domains />
              </Protected>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <Protected>
                <Analytics />
              </Protected>
            }
          />
          <Route
            path="/dashboard/logs"
            element={
              <Protected>
                <EmailLogs />
              </Protected>
            }
          />
          <Route
            path="/dashboard/templates"
            element={
              <Protected>
                <Templates />
              </Protected>
            }
          />
          <Route
            path="/dashboard/templates/:id"
            element={
              <Protected>
                <TemplateDetail />
              </Protected>
            }
          />
          <Route
            path="/dashboard/api-keys"
            element={
              <Protected>
                <APIKeys />
              </Protected>
            }
          />
          <Route
            path="/dashboard/smtp"
            element={
              <Protected>
                <SMTP />
              </Protected>
            }
          />
          <Route
            path="/dashboard/webhooks"
            element={
              <Protected>
                <Webhooks />
              </Protected>
            }
          />
          <Route
            path="/dashboard/teams"
            element={
              <Protected>
                <Teams />
              </Protected>
            }
          />
          <Route
            path="/dashboard/billing"
            element={
              <Protected>
                <Billing />
              </Protected>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <Protected>
                <Settings />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
