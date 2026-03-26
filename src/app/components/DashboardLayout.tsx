import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { Wallet, LogOut, Menu, X, User, Fuel, ReceiptJapaneseYen, Settings, Globe, ChevronRight, Play, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import LanguageSwitcher from './LanguageSwitcher';
import OnboardingModal from './Onboarding';
import AgentPairingModal from './AgentPairingModal';
import ClaimWalletModal from './ClaimWalletModal';
import WalletDelegationModal from './WalletDelegationModal';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import Gasless from './Gasless';
import Billing from './Billing';
import AccountSettings from './AccountSettings';


export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [languageFlyoutOpen, setLanguageFlyoutOpen] = useState(false);
  const [mobileLangPanel, setMobileLangPanel] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [demoApproval, setDemoApproval] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAgentPairing, setShowAgentPairing] = useState(false);
  const [showClaimWallet, setShowClaimWallet] = useState(false);
  const [delegationTarget, setDelegationTarget] = useState<{ open: boolean; walletId: string }>({ open: false, walletId: "" });
  const [activeModal, setActiveModal] = useState<'gas' | 'billing' | 'settings' | null>(null);
  const [hasActiveChat, setHasActiveChat] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toggleTooltip, setToggleTooltip] = useState(false);
  const [avatarTooltip, setAvatarTooltip] = useState(false);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuPortalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('agent_wallet_current_user');
    if (!currentUser) {
      navigate('/login');
    } else {
      const parsed = JSON.parse(currentUser);
      setUser(parsed);
    }
  }, [navigate]);

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // On mobile, the bottom-sheet uses its own backdrop — skip click-outside logic
      if (window.innerWidth < 1024) return;
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node) && !accountMenuPortalRef.current?.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountMenuOpen]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    const currentUser = localStorage.getItem('agent_wallet_current_user');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('agent_wallet_current_user');
    navigate('/login');
  };

  const { addWalletWithAgent, addAgent, addWallet, addDelegation, agents, delegations, getDelegationsForWallet, hasWallets } = useWalletStore();

  const handleWalletCreated = (wallet: { policy: { singleTxLimit: number; dailyLimit: number }; walletId: string; agentId: string }) => {
    addWalletWithAgent({
      walletId: wallet.walletId,
      agentId: wallet.agentId,
      policy: wallet.policy,
    });
  };

  const handleAgentPaired = (agent: { agentId: string; agentName: string }) => {
    addAgent({ id: agent.agentId, name: agent.agentName });
  };

  const handleWalletClaimed = (data: { walletId: string; agentId: string; agentName: string }) => {
    addWalletWithAgent({
      walletId: data.walletId,
      agentId: data.agentId,
      agentName: data.agentName,
    });
  };

  const handleDelegate = (data: { agentId: string; permissions: import('../hooks/useWalletStore').Permission[]; policy: Partial<import('../hooks/useWalletStore').Policy> }) => {
    addDelegation({
      walletId: delegationTarget.walletId,
      agentId: data.agentId,
      permissions: data.permissions,
      policy: data.policy,
    });
  };

  const handleDelegationNewAgent = (agent: { agentId: string; agentName: string }) => {
    addAgent({ id: agent.agentId, name: agent.agentName });
  };

  // Nav items for user menu — open modals instead of navigating
  const navItems: { key: 'gas' | 'billing' | 'settings'; label: string; icon: typeof Wallet }[] = [
    { key: 'gas', label: t('nav.gasAccount'), icon: Fuel },
    { key: 'billing', label: t('nav.billing'), icon: ReceiptJapaneseYen },
    { key: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  if (!user) return null;

  const LogoText = () => (
    <svg width="108" height="18" viewBox="0 0 108 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.76805 17.4717C4.68805 17.4717 3.04005 16.8957 1.82405 15.7437C0.608049 14.5757 4.8846e-05 12.9117 4.8846e-05 10.7517V6.71974C4.8846e-05 4.55974 0.608049 2.90374 1.82405 1.75174C3.04005 0.583741 4.68805 -0.000258923 6.76805 -0.000258923C8.83205 -0.000258923 10.424 0.567741 11.544 1.70374C12.68 2.82374 13.2481 4.36774 13.2481 6.33574V6.47974H10.128V6.23974C10.128 5.24774 9.84805 4.43174 9.28805 3.79174C8.74405 3.15174 7.90405 2.83174 6.76805 2.83174C5.64805 2.83174 4.76805 3.17574 4.12805 3.86374C3.48805 4.55174 3.16805 5.48774 3.16805 6.67174V10.7997C3.16805 11.9677 3.48805 12.9037 4.12805 13.6077C4.76805 14.2957 5.64805 14.6397 6.76805 14.6397C7.90405 14.6397 8.74405 14.3197 9.28805 13.6797C9.84805 13.0237 10.128 12.2077 10.128 11.2317V10.7997H13.2481V11.1357C13.2481 13.1037 12.68 14.6557 11.544 15.7917C10.424 16.9117 8.83205 17.4717 6.76805 17.4717ZM21.1894 17.4717C20.0054 17.4717 18.9414 17.2317 17.9974 16.7517C17.0534 16.2717 16.3094 15.5757 15.7654 14.6637C15.2214 13.7517 14.9494 12.6557 14.9494 11.3757V10.9917C14.9494 9.71174 15.2214 8.61574 15.7654 7.70374C16.3094 6.79174 17.0534 6.09574 17.9974 5.61574C18.9414 5.13574 20.0054 4.89574 21.1894 4.89574C22.3734 4.89574 23.4374 5.13574 24.3814 5.61574C25.3254 6.09574 26.0694 6.79174 26.6134 7.70374C27.1574 8.61574 27.4294 9.71174 27.4294 10.9917V11.3757C27.4294 12.6557 27.1574 13.7517 26.6134 14.6637C26.0694 15.5757 25.3254 16.2717 24.3814 16.7517C23.4374 17.2317 22.3734 17.4717 21.1894 17.4717ZM21.1894 14.7837C22.1174 14.7837 22.8854 14.4877 23.4934 13.8957C24.1014 13.2877 24.4054 12.4237 24.4054 11.3037V11.0637C24.4054 9.94374 24.1014 9.08774 23.4934 8.49574C22.9014 7.88774 22.1334 7.58374 21.1894 7.58374C20.2614 7.58374 19.4934 7.88774 18.8854 8.49574C18.2774 9.08774 17.9734 9.94374 17.9734 11.0637V11.3037C17.9734 12.4237 18.2774 13.2877 18.8854 13.8957C19.4934 14.4877 20.2614 14.7837 21.1894 14.7837ZM36.9727 17.4717C35.9007 17.4717 35.0767 17.2877 34.5007 16.9197C33.9247 16.5517 33.5007 16.1437 33.2287 15.6957H32.7967V17.1357H29.8207V0.335741H32.8447V6.59974H33.2767C33.4527 6.31174 33.6847 6.03974 33.9727 5.78374C34.2767 5.52774 34.6687 5.31974 35.1487 5.15974C35.6447 4.98374 36.2527 4.89574 36.9727 4.89574C37.9327 4.89574 38.8207 5.13574 39.6367 5.61574C40.4527 6.07974 41.1087 6.76774 41.6047 7.67974C42.1007 8.59174 42.3487 9.69574 42.3487 10.9917V11.3757C42.3487 12.6717 42.1007 13.7757 41.6047 14.6877C41.1087 15.5997 40.4527 16.2957 39.6367 16.7757C38.8207 17.2397 37.9327 17.4717 36.9727 17.4717ZM36.0607 14.8317C36.9887 14.8317 37.7647 14.5357 38.3887 13.9437C39.0127 13.3357 39.3247 12.4557 39.3247 11.3037V11.0637C39.3247 9.91174 39.0127 9.03974 38.3887 8.44774C37.7807 7.83974 37.0047 7.53574 36.0607 7.53574C35.1327 7.53574 34.3567 7.83974 33.7327 8.44774C33.1087 9.03974 32.7967 9.91174 32.7967 11.0637V11.3037C32.7967 12.4557 33.1087 13.3357 33.7327 13.9437C34.3567 14.5357 35.1327 14.8317 36.0607 14.8317ZM50.3894 17.4717C49.2054 17.4717 48.1414 17.2317 47.1974 16.7517C46.2534 16.2717 45.5094 15.5757 44.9654 14.6637C44.4214 13.7517 44.1494 12.6557 44.1494 11.3757V10.9917C44.1494 9.71174 44.4214 8.61574 44.9654 7.70374C45.5094 6.79174 46.2534 6.09574 47.1974 5.61574C48.1414 5.13574 49.2054 4.89574 50.3894 4.89574C51.5734 4.89574 52.6374 5.13574 53.5814 5.61574C54.5254 6.09574 55.2694 6.79174 55.8134 7.70374C56.3574 8.61574 56.6294 9.71174 56.6294 10.9917V11.3757C56.6294 12.6557 56.3574 13.7517 55.8134 14.6637C55.2694 15.5757 54.5254 16.2717 53.5814 16.7517C52.6374 17.2317 51.5734 17.4717 50.3894 17.4717ZM50.3894 14.7837C51.3174 14.7837 52.0854 14.4877 52.6934 13.8957C53.3014 13.2877 53.6054 12.4237 53.6054 11.3037V11.0637C53.6054 9.94374 53.3014 9.08774 52.6934 8.49574C52.1014 7.88774 51.3334 7.58374 50.3894 7.58374C49.4614 7.58374 48.6934 7.88774 48.0854 8.49574C47.4774 9.08774 47.1734 9.94374 47.1734 11.0637V11.3037C47.1734 12.4237 47.4774 13.2877 48.0854 13.8957C48.6934 14.4877 49.4614 14.7837 50.3894 14.7837Z" fill="#1C1C1C"/>
      <path d="M58.9247 17.1357V0.335741H65.8367C66.8927 0.335741 67.8207 0.551741 68.6207 0.983741C69.4367 1.39974 70.0687 1.99174 70.5167 2.75974C70.9807 3.52774 71.2127 4.43974 71.2127 5.49574V5.83174C71.2127 6.87174 70.9727 7.78374 70.4927 8.56774C70.0287 9.33574 69.3887 9.93574 68.5727 10.3677C67.7727 10.7837 66.8607 10.9917 65.8367 10.9917H62.0927V17.1357H58.9247ZM62.0927 8.11174H65.5247C66.2767 8.11174 66.8847 7.90374 67.3487 7.48774C67.8127 7.07174 68.0447 6.50374 68.0447 5.78374V5.54374C68.0447 4.82374 67.8127 4.25574 67.3487 3.83974C66.8847 3.42374 66.2767 3.21574 65.5247 3.21574H62.0927V8.11174ZM76.5667 17.4717C75.7187 17.4717 74.9587 17.3277 74.2867 17.0397C73.6147 16.7357 73.0787 16.3037 72.6787 15.7437C72.2947 15.1677 72.1027 14.4717 72.1027 13.6557C72.1027 12.8397 72.2947 12.1597 72.6787 11.6157C73.0787 11.0557 73.6227 10.6397 74.3107 10.3677C75.0147 10.0797 75.8147 9.93574 76.7107 9.93574H79.9747V9.26374C79.9747 8.70374 79.7987 8.24774 79.4467 7.89574C79.0947 7.52774 78.5347 7.34374 77.7667 7.34374C77.0147 7.34374 76.4547 7.51974 76.0867 7.87174C75.7187 8.20774 75.4787 8.64774 75.3667 9.19174L72.5827 8.25574C72.7747 7.64774 73.0787 7.09574 73.4947 6.59974C73.9267 6.08774 74.4947 5.67974 75.1987 5.37574C75.9187 5.05574 76.7907 4.89574 77.8147 4.89574C79.3827 4.89574 80.6227 5.28774 81.5347 6.07174C82.4467 6.85574 82.9027 7.99174 82.9027 9.47974V13.9197C82.9027 14.3997 83.1267 14.6397 83.5747 14.6397H84.5347V17.1357H82.5187C81.9267 17.1357 81.4387 16.9917 81.0547 16.7037C80.6707 16.4157 80.4787 16.0317 80.4787 15.5517V15.5277H80.0227C79.9587 15.7197 79.8147 15.9757 79.5907 16.2957C79.3667 16.5997 79.0147 16.8717 78.5347 17.1117C78.0547 17.3517 77.3987 17.4717 76.5667 17.4717ZM77.0947 15.0237C77.9427 15.0237 78.6307 14.7917 79.1587 14.3277C79.7027 13.8477 79.9747 13.2157 79.9747 12.4317V12.1917H76.9267C76.3667 12.1917 75.9267 12.3117 75.6067 12.5517C75.2867 12.7917 75.1267 13.1277 75.1267 13.5597C75.1267 13.9917 75.2947 14.3437 75.6307 14.6157C75.9667 14.8877 76.4547 15.0237 77.0947 15.0237ZM91.7033 17.4717C90.5513 17.4717 89.5033 17.2317 88.5593 16.7517C87.6313 16.2717 86.8953 15.5757 86.3513 14.6637C85.8073 13.7517 85.5353 12.6477 85.5353 11.3517V11.0157C85.5353 9.71974 85.8073 8.61574 86.3513 7.70374C86.8953 6.79174 87.6313 6.09574 88.5593 5.61574C89.5033 5.13574 90.5513 4.89574 91.7033 4.89574C92.8393 4.89574 93.8153 5.09574 94.6313 5.49574C95.4473 5.89574 96.1033 6.44774 96.5993 7.15174C97.1113 7.83974 97.4473 8.62374 97.6073 9.50374L94.6793 10.1277C94.6153 9.64774 94.4713 9.21574 94.2473 8.83174C94.0233 8.44774 93.7033 8.14374 93.2873 7.91974C92.8873 7.69574 92.3833 7.58374 91.7753 7.58374C91.1673 7.58374 90.6153 7.71974 90.1193 7.99174C89.6393 8.24774 89.2553 8.63974 88.9673 9.16774C88.6953 9.67974 88.5593 10.3117 88.5593 11.0637V11.3037C88.5593 12.0557 88.6953 12.6957 88.9673 13.2237C89.2553 13.7357 89.6393 14.1277 90.1193 14.3997C90.6153 14.6557 91.1673 14.7837 91.7753 14.7837C92.6873 14.7837 93.3753 14.5517 93.8393 14.0877C94.3193 13.6077 94.6233 12.9837 94.7513 12.2157L97.6793 12.9117C97.4713 13.7597 97.1113 14.5357 96.5993 15.2397C96.1033 15.9277 95.4473 16.4717 94.6313 16.8717C93.8153 17.2717 92.8393 17.4717 91.7033 17.4717ZM103.935 17.1357C103.151 17.1357 102.511 16.8957 102.015 16.4157C101.535 15.9197 101.295 15.2637 101.295 14.4477V7.72774H98.3194V5.23174H101.295V1.53574H104.319V5.23174H107.583V7.72774H104.319V13.9197C104.319 14.3997 104.543 14.6397 104.991 14.6397H107.295V17.1357H103.935Z" fill="#5564FF"/>
    </svg>
  );

  return (
    <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-[#FAFAFA] flex flex-col z-[60] border-r border-[#EDEEF3]
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarCollapsed ? 'w-[52px] bg-white' : 'w-[260px]'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        <div className="w-[260px] shrink-0 flex flex-col h-full relative z-[1]">
        {/* Logo - desktop */}
        <div className="hidden lg:flex items-center h-[64px] pl-4 pr-3 pointer-events-none">
          <div className={`shrink-0 transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <LogoText />
          </div>
        </div>
        {/* Mobile header — logo + close */}
        <div className="h-[64px] flex items-center justify-between px-4 lg:hidden">
          <LogoText />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        {/* Chat sessions portal area - AIAssistant will render here */}
        <div id="sidebar-chat-area" className="overflow-hidden flex flex-col min-h-0 [&:not(:empty)]:flex-1" />

        {/* User Profile */}
        <div className={`relative transition-[border-color] duration-300 ease-in-out ${sidebarCollapsed ? 'border-t border-transparent' : 'border-t border-[#EDEEF3]'}`} ref={accountMenuRef}>
          <button
            ref={avatarBtnRef}
            onClick={() => { setAvatarTooltip(false); setAccountMenuOpen(!accountMenuOpen); setMobileLangPanel(false); }}
            onMouseEnter={() => { if (sidebarCollapsed && !accountMenuOpen) setAvatarTooltip(true); }}
            onMouseLeave={() => setAvatarTooltip(false)}
            className={`w-full flex items-center gap-[12px] transition-all duration-300 ease-in-out rounded-none overflow-hidden py-[16px] ${sidebarCollapsed ? 'px-[8px]' : 'px-[16px] hover:bg-[#EDEEF3]'}`}
          >
            <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'rounded-none p-[8px] -m-[8px] hover:bg-[#EDEEF3] transition-colors' : ''}`}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><rect width="36" height="36" rx="18" fill="#4F5EFF"/><path d="M16.8247 12H19.1753L24 24H21.7909L20.6421 20.9916H15.3579L14.2091 24H12L16.8247 12ZM15.9764 19.3782H20.0236L18.0442 14.1176H17.9735L15.9764 19.3782Z" fill="white"/></svg>
            </div>
            <div className={`flex-1 min-w-0 text-left whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="font-['Inter',sans-serif] font-semibold text-[14px] leading-[20px] text-[#1c1c1c] truncate">{user.name}</div>
              <div className="font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] text-[#7C7C7C] truncate">{user.email}</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 transition-all duration-300 ease-in-out ${accountMenuOpen ? '-rotate-90' : ''} ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}><path d="M7.5 15L12.5 10L7.5 5" stroke="#7C7C7C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Account Menu Dropdown - rendered via portal to avoid sidebar overflow clipping (desktop only) */}
          {accountMenuOpen && createPortal(
            <div
              ref={accountMenuPortalRef}
              className="fixed z-[100] bg-white rounded-[8px] border border-[rgba(10,10,10,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] max-h-[70vh] overflow-y-auto hidden lg:block"
              style={{
                width: sidebarCollapsed ? '220px' : '244px',
                left: sidebarCollapsed ? '4px' : '8px',
                bottom: `${window.innerHeight - (accountMenuRef.current?.getBoundingClientRect().top ?? 0) + 4}px`,
              }}
            >
              <div className="p-[6px] flex flex-col gap-[2px]">
                {/* Nav items — open modals */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setSidebarOpen(false);
                        setActiveModal(item.key);
                      }}
                      className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#FAFAFA] transition-colors w-full text-[#0A0A0A]"
                    >
                      <Icon className="w-4 h-4 text-[#4F4F4F]" />
                      <span className="font-['Inter',sans-serif] font-medium text-[13px]">
                        {item.label}
                      </span>
                    </button>
                  );
                })}

                <div className="border-t border-[rgba(10,10,10,0.06)] my-[2px]" />

                {/* Demo Approval Toggle */}
                <button
                  onClick={() => setDemoApproval(!demoApproval)}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#FAFAFA] transition-colors w-full"
                >
                  <Play className="w-4 h-4 text-[#4F4F4F]" />
                  <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0A0A0A]">
                    {language === 'zh' ? '审批提示演示' : 'Approval Demo'}
                  </span>
                  <div className="ml-auto">
                    <div className={`relative w-[36px] h-[20px] rounded-full transition-colors cursor-pointer ${demoApproval ? 'bg-[#4F5EFF]' : 'bg-[#D9D9D9]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${demoApproval ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                </button>

                {/* Language */}
                <button
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#FAFAFA] transition-colors w-full"
                >
                  <Globe className="w-4 h-4 text-[#4F4F4F]" />
                  <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0A0A0A] mr-2">
                    {t('nav.language')}
                  </span>
                  <div className="ml-auto">
                    <LanguageSwitcher compact />
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#FAFAFA] transition-colors w-full"
                >
                  <LogOut className="w-4 h-4 text-[#4F4F4F]" />
                  <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0A0A0A]">
                    {t('auth.logout')}
                  </span>
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
        </div>
        {/* Sidebar toggle button - desktop only, paints on top of inner wrapper */}
        <button
          onClick={() => { setToggleTooltip(false); setSidebarCollapsed(!sidebarCollapsed); }}
          onMouseEnter={() => setToggleTooltip(true)}
          onMouseLeave={() => setToggleTooltip(false)}
          className="hidden lg:flex w-[36px] h-[36px] items-center justify-center rounded-[8px] hover:bg-[#EDEEF3] transition-colors text-[#7C7C7C] absolute top-[14px] z-10"
          style={{ left: sidebarCollapsed ? 'calc(50% - 18px)' : 'calc(100% - 48px)', transition: 'left 0.3s ease-in-out' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 2.5V17.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {toggleTooltip && createPortal(
          <div
            className="fixed z-[200] px-[6px] py-[4px] bg-[#1C1C1C] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none"
            style={sidebarCollapsed ? {
              top: `${14 + 18}px`,
              left: `${52 + 8}px`,
              transform: 'translateY(-50%)',
            } : {
              top: `${14 + 36 + 8}px`,
              left: `${212 + 18}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {sidebarCollapsed ? (language === 'zh' ? '打开边栏' : 'Open sidebar') : (language === 'zh' ? '关闭边栏' : 'Close sidebar')}
          </div>,
          document.body
        )}
        {avatarTooltip && sidebarCollapsed && createPortal(
          <div
            className="fixed z-[200] px-[6px] py-[4px] bg-[#1C1C1C] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none"
            style={{
              bottom: `${window.innerHeight - (avatarBtnRef.current?.getBoundingClientRect().top ?? 0) - (avatarBtnRef.current?.getBoundingClientRect().height ?? 0) / 2}px`,
              left: `${52 + 8}px`,
              transform: 'translateY(50%)',
            }}
          >
            {user?.name || 'Account'}
          </div>,
          document.body
        )}
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile bottom-sheet account menu */}
      {accountMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); }}
          />
          {/* Bottom sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: mobileLangPanel ? 'translateX(-50%)' : 'translateX(0)' }}
              >
                {/* Panel 1: Account menu */}
                <div className="w-full shrink-0 px-6 pt-6 pb-8">
                  {/* User info */}
                  <div className="flex items-center gap-3 mb-5">
                    <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><rect width="36" height="36" rx="18" fill="#4F5EFF"/><path d="M16.8247 12H19.1753L24 24H21.7909L20.6421 20.9916H15.3579L14.2091 24H12L16.8247 12ZM15.9764 19.3782H20.0236L18.0442 14.1176H17.9735L15.9764 19.3782Z" fill="white"/></svg>
                    <div className="min-w-0">
                      <div className="font-semibold text-[15px] text-[#1c1c1c] truncate">{user.name}</div>
                      <div className="text-[13px] text-[#7C7C7C] truncate">{user.email}</div>
                    </div>
                  </div>

                  {/* Nav items */}
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setAccountMenuOpen(false);
                          setMobileLangPanel(false);
                          setSidebarOpen(false);
                          setActiveModal(item.key);
                        }}
                        className="flex items-center gap-3 w-full py-3 text-[#0A0A0A]"
                      >
                        <Icon className="w-5 h-5 text-[#4F4F4F]" />
                        <span className="font-medium text-[15px]">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#7C7C7C] ml-auto" />
                      </button>
                    );
                  })}

                  <div className="border-t border-[rgba(10,10,10,0.06)] my-2" />

                  {/* Language button */}
                  <button
                    onClick={() => setMobileLangPanel(true)}
                    className="flex items-center gap-3 w-full py-3"
                  >
                    <Globe className="w-5 h-5 text-[#4F4F4F]" />
                    <span className="font-medium text-[15px] text-[#0A0A0A]">{t('nav.language')}</span>
                    <span className="ml-auto text-[13px] text-[#7C7C7C] mr-1">{language === 'en' ? 'English' : '中文'}</span>
                    <ChevronRight className="w-4 h-4 text-[#7C7C7C]" />
                  </button>

                  <div className="border-t border-[rgba(10,10,10,0.06)] my-2" />

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setMobileLangPanel(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex items-center gap-3 w-full py-3"
                  >
                    <LogOut className="w-5 h-5 text-[#4F4F4F]" />
                    <span className="font-medium text-[15px] text-[#0A0A0A]">{t('auth.logout')}</span>
                  </button>

                  {/* Cancel */}
                  <button
                    onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); }}
                    className="w-full mt-3 py-3 text-center font-medium text-[15px] text-[#7C7C7C] rounded-xl bg-[#F5F5F5]"
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </button>
                </div>

                {/* Panel 2: Language picker */}
                <div className="w-full shrink-0 px-6 pt-6 pb-8">
                  <button
                    onClick={() => setMobileLangPanel(false)}
                    className="flex items-center gap-2 mb-5 text-[#0A0A0A]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-semibold text-[15px]">{t('nav.language')}</span>
                  </button>

                  <button
                    onClick={() => { setLanguage('en'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                    className={`flex items-center justify-between w-full py-3 px-3 rounded-xl mb-2 ${language === 'en' ? 'bg-[#F0F1FF]' : 'bg-[#F5F5F5]'}`}
                  >
                    <span className="font-medium text-[15px] text-[#0A0A0A]">English</span>
                    {language === 'en' && <div className="w-2 h-2 rounded-full bg-[#4F5EFF]" />}
                  </button>
                  <button
                    onClick={() => { setLanguage('zh'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                    className={`flex items-center justify-between w-full py-3 px-3 rounded-xl ${language === 'zh' ? 'bg-[#F0F1FF]' : 'bg-[#F5F5F5]'}`}
                  >
                    <span className="font-medium text-[15px] text-[#0A0A0A]">中文</span>
                    {language === 'zh' && <div className="w-2 h-2 rounded-full bg-[#4F5EFF]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white relative">

        {/* Logo bar when sidebar collapsed (desktop) */}
        <div className={`logo-bar-collapsed hidden lg:block ${sidebarCollapsed ? 'h-[64px]' : 'h-0'}`} />
        <div className={`logo-bar-collapsed hidden lg:flex items-center h-[64px] pl-[24px] bg-white absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <LogoText />
        </div>
        <div className={`logo-bar-collapsed hidden lg:block absolute top-[64px] left-0 right-0 h-px bg-[#EDEEF3] z-10 transition-opacity duration-300 ease-in-out ${sidebarCollapsed && hasActiveChat ? 'opacity-100' : 'opacity-0'}`} />

        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-[rgba(10,10,10,0.08)] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center">
            <LogoText />
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#0A0A0A] p-2 -mr-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 flex flex-col min-h-0">
          <Outlet context={{
            onSetupWallet: () => {
              // Route to chat-based onboarding instead of modal
              navigate('/dashboard/chat?startOnboarding=true');
            },
            onPairAgent: () => setShowAgentPairing(true),
            onClaimWallet: () => setShowClaimWallet(true),
            onDelegateWallet: (walletId: string) => setDelegationTarget({ open: true, walletId }),
            onOpenWalletModal: () => {},
            onShowWalletPage: () => setActiveModal('wallet-page'),
            onHideWalletPage: () => setActiveModal(null),
            showWalletPage: activeModal === 'wallet-page',
            onShowApprovalPage: () => setActiveModal('approval-page'),
            onHideApprovalPage: () => setActiveModal(null),
            showApprovalPage: activeModal === 'approval-page',
            sidebarCollapsed,
            demoApproval,
            setHasActiveChat,
          }} />
        </main>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onWalletCreated={handleWalletCreated}
        onClaimWallet={() => { setShowOnboarding(false); setShowClaimWallet(true); }}
        isFirstWallet={!hasWallets}
      />

      {/* Agent Pairing Modal */}
      <AgentPairingModal
        open={showAgentPairing}
        onClose={() => setShowAgentPairing(false)}
        onAgentPaired={handleAgentPaired}
      />

      {/* Claim Wallet Modal */}
      <ClaimWalletModal
        open={showClaimWallet}
        onClose={() => setShowClaimWallet(false)}
        onWalletClaimed={handleWalletClaimed}
      />

      {/* Wallet Delegation Modal */}
      <WalletDelegationModal
        open={delegationTarget.open}
        onClose={() => setDelegationTarget({ open: false, walletId: "" })}
        walletId={delegationTarget.walletId}
        agents={agents}
        existingAgentIds={delegationTarget.walletId ? getDelegationsForWallet(delegationTarget.walletId).map(d => d.agentId) : []}
        onDelegate={handleDelegate}
        onNewAgentPaired={handleDelegationNewAgent}
      />

      {/* Feature Page Modals — unified sizing */}
      {(['gas', 'billing', 'settings'] as const).map((key) => (
        <Dialog key={key} open={activeModal === key} onOpenChange={(val) => { if (!val) setActiveModal(null); }}>
          <DialogContent className="max-w-[calc(100vw-3rem)] sm:max-w-[860px] max-h-[90vh] overflow-y-auto p-6 sm:p-10 rounded-2xl">
            <DialogTitle className="sr-only">
              {key === 'gas' ? t('nav.gasAccount') : key === 'billing' ? t('nav.billing') : t('nav.settings')}
            </DialogTitle>
            {key === 'gas' && <Gasless />}
            {key === 'billing' && <Billing />}
            {key === 'settings' && <AccountSettings />}
          </DialogContent>
        </Dialog>
      ))}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Confirm Logout</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-medium py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-[#4f5eff] hover:bg-[#3d4dd9] active:bg-[#2d3db9] text-white font-medium py-3 rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
