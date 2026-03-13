import { createBrowserRouter, Navigate } from "react-router";
import { LanguageProvider } from "./contexts/LanguageContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./components/Login";
import AIAssistant from "./components/AIAssistant";
import WalletAgentPage from "./components/WalletAgentPage";
import AccountSettings from "./components/AccountSettings";
import Gasless from "./components/Gasless";
import Billing from "./components/Billing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <LanguageProvider>
        <Login />
      </LanguageProvider>
    ),
  },
  {
    path: "/login",
    element: (
      <LanguageProvider>
        <Login />
      </LanguageProvider>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <LanguageProvider>
        <DashboardLayout />
      </LanguageProvider>
    ),
    children: [
      {
        index: true,
        element: <WalletAgentPage />,
      },
      // Backward compat: old wallet-agent route → index
      {
        path: "wallet-agent",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "chat",
        element: <AIAssistant />,
      },
      {
        path: "gas-account",
        element: <Gasless />,
      },
      {
        path: "settings",
        element: <AccountSettings />,
      },
      {
        path: "billing",
        element: <Billing />,
      },
      // Legacy route aliases (backward compatibility)
      {
        path: "delegation",
        element: <Navigate to="/dashboard/wallet-agent" replace />,
      },
      {
        path: "gasless",
        element: <Navigate to="/dashboard/gas-account" replace />,
      },
      {
        path: "ai-assistant",
        element: <AIAssistant />,
      },
      {
        path: "account",
        element: <AccountSettings />,
      },
    ],
  },
]);