import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { Wallet, MessageSquareMore, LogOut, Menu, X, User, Fuel, ReceiptJapaneseYen, Settings, Globe, ChevronRight, Check, ChevronLeft, SquarePen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import OnboardingModal from './Onboarding';
import AgentPairingModal from './AgentPairingModal';
import ClaimWalletModal from './ClaimWalletModal';
import WalletDelegationModal from './WalletDelegationModal';
import svgPaths from "../../imports/svg-zu39gs7vho";

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
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAgentPairing, setShowAgentPairing] = useState(false);
  const [showClaimWallet, setShowClaimWallet] = useState(false);
  const [delegationTarget, setDelegationTarget] = useState<{ open: boolean; walletId: string }>({ open: false, walletId: "" });

  useEffect(() => {
    const currentUser = localStorage.getItem('agent_wallet_current_user');
    if (!currentUser) {
      navigate('/login');
    } else {
      const parsed = JSON.parse(currentUser);
      setUser(parsed);
      // Onboarding auto-open is now handled by WalletAgentPage
    }
  }, [navigate]);

  // Close desktop account dropdown when clicking outside (desktop only — mobile uses backdrop)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return; // mobile handled by backdrop overlay
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
        setLanguageFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Re-read user to reflect any changes from onboarding
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

  const primaryItems = [
    { path: '/dashboard', label: t('nav.walletAgent'), icon: Wallet },
    { path: '/dashboard/chat', label: t('nav.chat'), icon: MessageSquareMore },
    { path: '/dashboard/gas-account', label: t('nav.gasAccount'), icon: Fuel },
  ];

  const secondaryItems = [
    { path: '/dashboard/billing', label: t('nav.billing'), icon: ReceiptJapaneseYen },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar - Desktop: sticky, Mobile: slide-in drawer */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[280px] sm:w-[228px] lg:w-[220px] bg-white flex flex-col z-[60] lg:z-40 border-r border-[#EDEEF3]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="bg-[#FAFAFA] pt-[32px] pb-[32px] px-[24px]">
          <div className="h-[18px] relative w-[172px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 188.538 19.9998">
              <g>
                <path d={svgPaths.p12420d80} fill="#0A0A0A" />
                <path d={svgPaths.p19bafe80} fill="#0A0A0A" />
                <path d={svgPaths.p161a0400} fill="#0A0A0A" />
                <path d={svgPaths.p3456db00} fill="#0A0A0A" />
                <path d={svgPaths.p5983200} fill="#0A0A0A" />
                <path d={svgPaths.p35ddbb80} fill="#0A0A0A" />
                <path d={svgPaths.p192f4b80} fill="#4F5EFF" />
                <path d={svgPaths.p2c193100} fill="#4F5EFF" />
                <path d={svgPaths.p357a0d00} fill="#4F5EFF" />
                <path d={svgPaths.p26dee800} fill="#4F5EFF" />
                <path d={svgPaths.pf8ab380} fill="#4F5EFF" />
                <path d={svgPaths.p25b8a100} fill="#4F5EFF" />
                <path d={svgPaths.p1a427e00} fill="#4F5EFF" />
                <path d={svgPaths.p37c6db00} fill="#0A0A0A" />
                <path d={svgPaths.p16c2cc00} fill="#0A0A0A" />
                <path d={svgPaths.p2ed1f700} fill="#0A0A0A" />
                <path d={svgPaths.p123d8680} fill="#0A0A0A" />
              </g>
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 bg-[#FAFAFA] px-[8px] pt-[0px] pb-[16px] flex flex-col gap-[8px] overflow-y-auto">
          {/* Primary Nav */}
          {primaryItems.map((item) => {
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-[8px] px-[16px] h-[44px] rounded-[10px] transition-colors font-['Inter',sans-serif] text-[14px] leading-[20px] whitespace-nowrap
                  ${isActive
                    ? 'bg-[#EDEEF3] text-[#4F5EFF] font-medium'
                    : 'text-[#0A0A0A] font-normal hover:bg-[rgba(79,94,255,0.05)]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4F5EFF]' : ''}`} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-[rgba(10,10,10,0.08)] my-0" />

          {/* Secondary Nav */}
          {secondaryItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-[8px] px-[16px] h-[44px] rounded-[10px] transition-colors font-['Inter',sans-serif] text-[14px] leading-[20px] whitespace-nowrap
                  ${isActive
                    ? 'bg-[#EDEEF3] text-[#4F5EFF] font-semibold'
                    : 'text-[#0A0A0A] font-normal hover:bg-[rgba(79,94,255,0.05)]'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4F5EFF]' : ''}`} strokeWidth={2} />
                <span>{item.label}</span>
                <span className="ml-auto font-['Inter',sans-serif] font-normal text-[10px] text-[#7C7C7C] bg-[#EDEEF3] px-1.5 py-0.5 rounded">
                  {t('nav.comingSoon')}
                </span>
              </Link>
            );
          })}

        </nav>

        {/* User Profile */}
        <div ref={accountMenuRef} className="bg-[#FAFAFA] border-t border-[rgba(10,10,10,0.08)] relative">
          <button
            onClick={() => {
              setAccountMenuOpen(!accountMenuOpen);
              setLanguageFlyoutOpen(false);
              setMobileLangPanel(false);
              // On mobile, close sidebar so the bottom sheet is visible
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className="w-full p-[16px] flex items-center gap-[8px]"
          >
            <div className="w-[40px] h-[40px] bg-[#4F4F4F] rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#0A0A0A] truncate">{user.name}</div>
              <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] truncate">{user.email}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7c7c7c] shrink-0" />
          </button>

          {/* Account Menu Dropdown — desktop only (mobile uses bottom sheet) */}
          {accountMenuOpen && (
            <div className="hidden lg:block absolute bottom-full left-0 right-0 mb-1 bg-white rounded-[8px] border border-[rgba(10,10,10,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] mx-2">
              <div className="p-[8px] flex flex-col gap-[4px]">
                <Link
                  to="/dashboard/settings"
                  onClick={() => { setAccountMenuOpen(false); setSidebarOpen(false); }}
                  className="flex items-center gap-[8px] p-2 rounded-[6px] hover:bg-[rgba(79,94,255,0.05)] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0a0a0a]">
                    {t('nav.settings')}
                  </span>
                </Link>

                {/* Language with hover flyout */}
                <div
                  className="relative"
                  onMouseEnter={() => setLanguageFlyoutOpen(true)}
                  onMouseLeave={() => setLanguageFlyoutOpen(false)}
                >
                  <button className={`flex items-center gap-[8px] p-2 rounded-[6px] transition-colors w-full ${languageFlyoutOpen ? 'bg-[rgba(79,94,255,0.05)]' : 'hover:bg-[rgba(79,94,255,0.05)]'}`}>
                    <Globe className="w-4 h-4 text-[#0a0a0a]" />
                    <span className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0a0a0a]">{t('nav.language')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#0a0a0a] ml-auto" />
                  </button>
                  {languageFlyoutOpen && (
                    <div className="absolute left-full top-0 pl-2 z-10">
                      <div className="bg-white rounded-[8px] border border-[rgba(10,10,10,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] min-w-[140px]">
                        <div className="p-[8px] flex flex-col gap-[4px]">
                          <button
                            onClick={() => { setLanguage('en'); setLanguageFlyoutOpen(false); setAccountMenuOpen(false); }}
                            className="flex items-center gap-[8px] p-2 rounded-[6px] hover:bg-[rgba(79,94,255,0.05)] transition-colors w-full"
                          >
                            <Check className={`w-3.5 h-3.5 shrink-0 ${language === 'en' ? 'text-[#4f5eff]' : 'text-transparent'}`} />
                            <span className={`font-['Inter',sans-serif] text-[13px] ${language === 'en' ? 'font-medium text-[#4f5eff]' : 'font-normal text-[#0a0a0a]'}`}>English</span>
                          </button>
                          <button
                            onClick={() => { setLanguage('zh'); setLanguageFlyoutOpen(false); setAccountMenuOpen(false); }}
                            className="flex items-center gap-[8px] p-2 rounded-[6px] hover:bg-[rgba(79,94,255,0.05)] transition-colors w-full"
                          >
                            <Check className={`w-3.5 h-3.5 shrink-0 ${language === 'zh' ? 'text-[#4f5eff]' : 'text-transparent'}`} />
                            <span className={`font-['Inter',sans-serif] text-[13px] ${language === 'zh' ? 'font-medium text-[#4f5eff]' : 'font-normal text-[#0a0a0a]'}`}>中文</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setAccountMenuOpen(false); setShowLogoutConfirm(true); }}
                  className="flex items-center gap-[8px] p-2 rounded-[6px] hover:bg-[rgba(79,94,255,0.05)] transition-colors w-full"
                >
                  <LogOut className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0a0a0a]">
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
          className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header — logo left, hamburger/X right (Privy pattern) */}
        <div className="lg:hidden bg-white border-b border-[rgba(10,10,10,0.08)] px-4 py-3 flex items-center justify-between z-50">
          <div className="h-[18px] relative w-[172px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 188.538 19.9998">
              <g>
                <path d={svgPaths.p12420d80} fill="#0A0A0A" />
                <path d={svgPaths.p19bafe80} fill="#0A0A0A" />
                <path d={svgPaths.p161a0400} fill="#0A0A0A" />
                <path d={svgPaths.p3456db00} fill="#0A0A0A" />
                <path d={svgPaths.p5983200} fill="#0A0A0A" />
                <path d={svgPaths.p35ddbb80} fill="#0A0A0A" />
                <path d={svgPaths.p192f4b80} fill="#4F5EFF" />
                <path d={svgPaths.p2c193100} fill="#4F5EFF" />
                <path d={svgPaths.p357a0d00} fill="#4F5EFF" />
                <path d={svgPaths.p26dee800} fill="#4F5EFF" />
                <path d={svgPaths.pf8ab380} fill="#4F5EFF" />
                <path d={svgPaths.p25b8a100} fill="#4F5EFF" />
                <path d={svgPaths.p1a427e00} fill="#4F5EFF" />
                <path d={svgPaths.p37c6db00} fill="#0A0A0A" />
                <path d={svgPaths.p16c2cc00} fill="#0A0A0A" />
                <path d={svgPaths.p2ed1f700} fill="#0A0A0A" />
                <path d={svgPaths.p123d8680} fill="#0A0A0A" />
              </g>
            </svg>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#0A0A0A] p-2 -mr-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{
            onSetupWallet: () => setShowOnboarding(true),
            onPairAgent: () => setShowAgentPairing(true),
            onClaimWallet: () => setShowClaimWallet(true),
            onDelegateWallet: (walletId: string) => setDelegationTarget({ open: true, walletId }),
          }} />
        </main>
      </div>

      {/* Mobile Account Menu - Bottom Sheet */}
      {accountMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); }}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl animate-slide-up overflow-hidden">
            {/* Two-panel container */}
            <div className={`flex transition-transform duration-300 ease-in-out ${mobileLangPanel ? '-translate-x-1/2' : 'translate-x-0'}`} style={{ width: '200%' }}>

              {/* Panel 1: Main menu */}
              <div className="w-1/2 p-6">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#EDEEF3]">
                  <div className="w-12 h-12 bg-[#4F4F4F] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#0a0a0a]">{user.name}</div>
                    <div className="font-['Inter',sans-serif] text-[13px] text-[#7c7c7c]">{user.email}</div>
                  </div>
                </div>

                <div className="space-y-[4px] mb-6">
                  <Link
                    to="/dashboard/settings"
                    onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); }}
                    className="flex items-center gap-[10px] px-[12px] py-[12px] rounded-[10px] hover:bg-[rgba(79,94,255,0.05)] transition-colors"
                  >
                    <Settings className="w-[18px] h-[18px] text-[#0a0a0a]" />
                    <span className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0a0a0a]">{t('nav.settings')}</span>
                  </Link>

                  <button
                    onClick={() => setMobileLangPanel(true)}
                    className="w-full flex items-center gap-[10px] px-[12px] py-[12px] rounded-[10px] hover:bg-[rgba(79,94,255,0.05)] transition-colors"
                  >
                    <Globe className="w-[18px] h-[18px] text-[#0a0a0a]" />
                    <span className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0a0a0a]">{t('nav.language')}</span>
                    <ChevronRight className="w-4 h-4 text-[#7c7c7c] ml-auto" />
                  </button>

                  <button
                    onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); setShowLogoutConfirm(true); }}
                    className="w-full flex items-center gap-[10px] px-[12px] py-[12px] rounded-[10px] hover:bg-[rgba(79,94,255,0.05)] transition-colors"
                  >
                    <LogOut className="w-[18px] h-[18px] text-[#0a0a0a]" />
                    <span className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0a0a0a]">{t('auth.logout')}</span>
                  </button>
                </div>

                <button
                  onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); }}
                  className="w-full bg-[rgba(10,10,10,0.05)] hover:bg-[rgba(10,10,10,0.08)] text-[#0a0a0a] font-['Inter',sans-serif] font-medium text-[14px] py-[12px] rounded-[10px] transition-colors"
                >
                  {t('account.cancel')}
                </button>
              </div>

              {/* Panel 2: Language picker */}
              <div className="w-1/2 p-6">
                <button
                  onClick={() => setMobileLangPanel(false)}
                  className="flex items-center gap-[6px] mb-6 font-['Inter',sans-serif] font-medium text-[14px]"
                >
                  <ChevronLeft className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-[#0a0a0a]">{t('nav.language')}</span>
                </button>

                <div className="space-y-[4px]">
                  <button
                    onClick={() => { setLanguage('en'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                    className="w-full flex items-center gap-[10px] px-[12px] py-[12px] rounded-[10px] hover:bg-[rgba(79,94,255,0.05)] transition-colors"
                  >
                    <Check className={`w-4 h-4 shrink-0 ${language === 'en' ? 'text-[#4f5eff]' : 'text-transparent'}`} />
                    <span className={`font-['Inter',sans-serif] text-[14px] ${language === 'en' ? 'font-medium text-[#4f5eff]' : 'font-normal text-[#0a0a0a]'}`}>English</span>
                  </button>
                  <button
                    onClick={() => { setLanguage('zh'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                    className="w-full flex items-center gap-[10px] px-[12px] py-[12px] rounded-[10px] hover:bg-[rgba(79,94,255,0.05)] transition-colors"
                  >
                    <Check className={`w-4 h-4 shrink-0 ${language === 'zh' ? 'text-[#4f5eff]' : 'text-transparent'}`} />
                    <span className={`font-['Inter',sans-serif] text-[14px] ${language === 'zh' ? 'font-medium text-[#4f5eff]' : 'font-normal text-[#0a0a0a]'}`}>中文</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}

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
