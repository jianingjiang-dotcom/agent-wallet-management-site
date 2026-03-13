import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { Shield, MessageSquare, LogOut, Menu, X, User, Fuel, CreditCard, Settings, Globe, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import LanguageSwitcher from './LanguageSwitcher';
import OnboardingModal from './Onboarding';
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

  const { addWallet } = useWalletStore();

  const handleWalletCreated = (wallet: { address: string; policy: { singleTxLimit: number; dailyLimit: number }; walletId: string; agentId: string }) => {
    addWallet({
      id: wallet.walletId,
      address: wallet.address,
      withAgent: true,
      agentId: wallet.agentId,
      policy: wallet.policy,
    });
  };

  const primaryItems = [
    { path: '/dashboard', label: t('nav.walletAgent'), icon: Shield },
    { path: '/dashboard/chat', label: t('nav.chat'), icon: MessageSquare },
    { path: '/dashboard/gas-account', label: t('nav.gasAccount'), icon: Fuel },
  ];

  const secondaryItems = [
    { path: '/dashboard/billing', label: t('nav.billing'), icon: CreditCard },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar - Desktop: sticky, Mobile: slide-in drawer */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[280px] sm:w-[228px] bg-white flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="bg-[#fafafa] h-[80px] flex items-center justify-between px-[24px]">
          <div className="h-[16px] relative w-[152px]">
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
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 bg-[#fafafa] px-[24px] pt-[16px] pb-[16px] flex flex-col gap-[8px] overflow-y-auto">
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
                  flex items-center gap-[8px] px-[12px] py-[10px] rounded-[6px] h-[40px] transition-colors font-['Inter',sans-serif] font-medium text-[16px]
                  ${isActive
                    ? 'bg-[#4f5eff] text-white'
                    : 'text-[#0a0a0a] hover:bg-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-[rgba(10,10,10,0.08)] my-1" />

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
                  flex items-center gap-[8px] px-[12px] py-[10px] rounded-[6px] h-[40px] transition-colors font-['Inter',sans-serif] font-medium text-[14px]
                  ${isActive
                    ? 'bg-[#4f5eff] text-white'
                    : 'text-[#7c7c7c] hover:bg-white hover:text-[#0a0a0a]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span className="ml-auto font-['Inter',sans-serif] font-normal text-[10px] text-[#b0b0b0] bg-[rgba(10,10,10,0.04)] px-1.5 py-0.5 rounded">
                  {t('nav.comingSoon')}
                </span>
              </Link>
            );
          })}

        </nav>

        {/* User Profile */}
        <div className="bg-white border-t border-[rgba(10,10,10,0.08)] relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="w-full p-[16px] flex items-center gap-[8px] hover:bg-[#fafafa] transition-colors"
          >
            <div className="w-[40px] h-[40px] bg-[rgba(79,94,255,0.1)] border-[1.25px] border-[rgba(79,94,255,0.2)] rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#4f5eff]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-['Inter',sans-serif] font-semibold text-[14px] text-black truncate">{user.name}</div>
              <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] truncate">{user.email}</div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#7c7c7c] shrink-0 transition-transform ${accountMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Account Menu Dropdown */}
          {accountMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-[8px] border border-[rgba(10,10,10,0.08)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] mx-2">
              <div className="p-[8px] flex flex-col gap-[4px]">
                <Link
                  to="/dashboard/settings"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] hover:bg-[#fafafa] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#4f4f4f]" />
                  <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                    {t('nav.settings')}
                  </span>
                </Link>
                <button
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] hover:bg-[#fafafa] transition-colors w-full"
                >
                  <Globe className="w-4 h-4 text-[#4f4f4f]" />
                  <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a] mr-2">
                    {t('nav.language')}
                  </span>
                  <div className="ml-auto">
                    <LanguageSwitcher compact />
                  </div>
                </button>
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] hover:bg-[#fafafa] transition-colors w-full"
                >
                  <LogOut className="w-4 h-4 text-[#4f4f4f]" />
                  <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
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
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white border-b border-[rgba(10,10,10,0.08)] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#0a0a0a] p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="h-[16px] relative w-[152px]">
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
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="w-8 h-8 bg-[rgba(79,94,255,0.1)] border border-[rgba(79,94,255,0.2)] rounded-full flex items-center justify-center"
          >
            <User className="w-4 h-4 text-[#4f5eff]" />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet context={{ onSetupWallet: () => setShowOnboarding(true) }} />
        </main>
      </div>

      {/* Mobile Account Menu - Bottom Sheet */}
      {accountMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setAccountMenuOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 shadow-2xl animate-slide-up">
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                <div className="w-12 h-12 bg-[rgba(79,94,255,0.1)] border-2 border-[rgba(79,94,255,0.2)] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-[#4f5eff]" />
                </div>
                <div>
                  <div className="font-semibold text-base text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 mb-6">
                <Link
                  to="/dashboard/settings"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors active:bg-slate-100"
                >
                  <Settings className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">{t('nav.settings')}</span>
                </Link>

                <button
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-600" />
                    <span className="font-medium text-slate-900">{t('nav.language')}</span>
                  </div>
                  <LanguageSwitcher compact />
                </button>

                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors active:bg-red-100"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-600">{t('auth.logout')}</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setAccountMenuOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal open={showOnboarding} onClose={handleOnboardingClose} onWalletCreated={handleWalletCreated} />

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
