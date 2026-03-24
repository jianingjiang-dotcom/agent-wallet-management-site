import { createBrowserRouter, Navigate } from "react-router";
import { LanguageProvider } from "./contexts/LanguageContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./components/Login";
import AIAssistant from "./components/AIAssistant";
import InviteCodePage from "./components/InviteCodePage";
import AgentSetupPage from "./components/AgentSetupPage";
import SetupSuccessPage from "./components/SetupSuccessPage";

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
    path: "/invite",
    element: <Navigate to="/dashboard/chat" replace />,
  },
  {
    path: "/setup",
    element: <Navigate to="/dashboard/chat" replace />,
  },
  {
    path: "/setup-success",
    element: <Navigate to="/dashboard/chat" replace />,
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
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "chat",
        element: <AIAssistant />,
      },
      // Legacy routes → redirect to chat
      {
        path: "wallet-agent",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "gas-account",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "settings",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "billing",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "ai-assistant",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "account",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "delegation",
        element: <Navigate to="/dashboard/chat" replace />,
      },
      {
        path: "gasless",
        element: <Navigate to="/dashboard/chat" replace />,
      },
    ],
  },
]);
