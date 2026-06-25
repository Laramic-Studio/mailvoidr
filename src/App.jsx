import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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
          <Route path="/workspaces" element={<WorkspaceSelect />} />
          <Route path="/invite" element={<InviteAccept />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/docs" element={<DocsLanding />} />
          <Route path="/docs/:slug" element={<DocsArticle />} />

          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/send" element={<SendEmail />} />
          <Route path="/dashboard/testing" element={<Testing />} />
          <Route path="/dashboard/inboxes" element={<Inboxes />} />
          <Route path="/dashboard/inboxes/:id" element={<InboxDetail />} />
          <Route path="/dashboard/domains" element={<Domains />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/logs" element={<EmailLogs />} />
          <Route path="/dashboard/templates" element={<Templates />} />
          <Route path="/dashboard/api-keys" element={<APIKeys />} />
          <Route path="/dashboard/smtp" element={<SMTP />} />
          <Route path="/dashboard/webhooks" element={<Webhooks />} />
          <Route path="/dashboard/teams" element={<Teams />} />
          <Route path="/dashboard/billing" element={<Billing />} />
          <Route path="/dashboard/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
