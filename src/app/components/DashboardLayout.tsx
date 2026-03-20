import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { Wallet, LogOut, Menu, X, User, Fuel, ReceiptJapaneseYen, Settings, Globe, ChevronRight } from 'lucide-react';
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
import WalletAgentPage from './WalletAgentPage';
import Gasless from './Gasless';
import Billing from './Billing';
import AccountSettings from './AccountSettings';
import svgPaths from "../../imports/svg-zu39gs7vho";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAgentPairing, setShowAgentPairing] = useState(false);
  const [showClaimWallet, setShowClaimWallet] = useState(false);
  const [delegationTarget, setDelegationTarget] = useState<{ open: boolean; walletId: string }>({ open: false, walletId: "" });
  const [activeModal, setActiveModal] = useState<'wallet' | 'gas' | 'billing' | 'settings' | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

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
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
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
  const navItems: { key: 'wallet' | 'gas' | 'billing' | 'settings'; label: string; icon: typeof Wallet }[] = [
    { key: 'wallet', label: t('nav.walletAgent'), icon: Wallet },
    { key: 'gas', label: t('nav.gasAccount'), icon: Fuel },
    { key: 'billing', label: t('nav.billing'), icon: ReceiptJapaneseYen },
    { key: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  if (!user) return null;

  const LogoSvg = () => (
    <svg className="absolute block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 188.538 19.9998">
      <g>
        <path d={svgPaths.p12420d80} fill="#1C1C1C" />
        <path d={svgPaths.p19bafe80} fill="#1C1C1C" />
        <path d={svgPaths.p161a0400} fill="#1C1C1C" />
        <path d={svgPaths.p3456db00} fill="#1C1C1C" />
        <path d={svgPaths.p5983200} fill="#1C1C1C" />
        <path d={svgPaths.p35ddbb80} fill="#1C1C1C" />
        <path d={svgPaths.p192f4b80} fill="#4F5EFF" />
        <path d={svgPaths.p2c193100} fill="#4F5EFF" />
        <path d={svgPaths.p357a0d00} fill="#4F5EFF" />
        <path d={svgPaths.p26dee800} fill="#4F5EFF" />
        <path d={svgPaths.pf8ab380} fill="#4F5EFF" />
        <path d={svgPaths.p25b8a100} fill="#4F5EFF" />
        <path d={svgPaths.p1a427e00} fill="#4F5EFF" />
        <path d={svgPaths.p37c6db00} fill="#1C1C1C" />
        <path d={svgPaths.p16c2cc00} fill="#1C1C1C" />
        <path d={svgPaths.p2ed1f700} fill="#1C1C1C" />
        <path d={svgPaths.p123d8680} fill="#1C1C1C" />
      </g>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[280px] sm:w-[260px] lg:w-[260px] bg-[#FAFAFA] flex flex-col z-40 border-r border-[#EBEBEB]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="pt-[24px] pb-[16px] flex items-center justify-between px-[20px]">
          <div className="h-[18px] relative w-[172px]">
            <LogoSvg />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Chat sessions portal area - AIAssistant will render here */}
        <div id="sidebar-chat-area" className="flex-1 overflow-hidden flex flex-col min-h-0" />

        {/* User Profile */}
        <div className="border-t border-[rgba(10,10,10,0.08)] relative" ref={accountMenuRef}>
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="w-full p-[16px] flex items-center gap-[8px] hover:bg-[#EBEBEB] transition-colors rounded-none"
          >
            <div className="w-[36px] h-[36px] bg-[rgba(79,94,255,0.1)] border-[1.25px] border-[rgba(79,94,255,0.2)] rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#4f5eff]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#0A0A0A] truncate">{user.name}</div>
              <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#4F4F4F] truncate">{user.email}</div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#4F4F4F] shrink-0 transition-transform ${accountMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Account Menu Dropdown - upward popover */}
          {accountMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-[10px] border border-[rgba(10,10,10,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] mx-2 max-h-[70vh] overflow-y-auto">
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
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-[rgba(10,10,10,0.08)] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#0A0A0A] p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="h-[16px] relative w-[152px]">
            <LogoSvg />
          </div>
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="w-8 h-8 bg-[rgba(79,94,255,0.1)] border border-[rgba(79,94,255,0.2)] rounded-full flex items-center justify-center"
          >
            <User className="w-4 h-4 text-[#4f5eff]" />
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
      {(['wallet', 'gas', 'billing', 'settings'] as const).map((key) => (
        <Dialog key={key} open={activeModal === key} onOpenChange={(val) => { if (!val) setActiveModal(null); }}>
          <DialogContent className="max-w-[calc(100vw-3rem)] sm:max-w-[860px] max-h-[90vh] overflow-y-auto p-6 sm:p-10 rounded-2xl">
            <DialogTitle className="sr-only">
              {key === 'wallet' ? t('nav.walletAgent') : key === 'gas' ? t('nav.gasAccount') : key === 'billing' ? t('nav.billing') : t('nav.settings')}
            </DialogTitle>
            {key === 'wallet' && (
              <WalletAgentPage
                onSetupWallet={() => { setActiveModal(null); setShowOnboarding(true); }}
                onClaimWallet={() => { setActiveModal(null); setShowClaimWallet(true); }}
                onDelegateWallet={(walletId) => { setActiveModal(null); setDelegationTarget({ open: true, walletId }); }}
              />
            )}
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
