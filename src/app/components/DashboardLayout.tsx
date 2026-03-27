import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useNavigate, Link, useLocation } from 'react-router';
import { Wallet, LogOut, Menu, X, User, Fuel, ReceiptJapaneseYen, Settings, Globe, ChevronRight, Play, ChevronLeft, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
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
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [languageFlyoutOpen, setLanguageFlyoutOpen] = useState(false);
  const [mobileLangPanel, setMobileLangPanel] = useState(false);
  const [mobileSettingsPage, setMobileSettingsPage] = useState<'gas' | 'billing' | 'settings' | null>(null);
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
    <svg width="140" height="24" viewBox="0 0 312 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--app-text)]">
      <path fillRule="evenodd" clipRule="evenodd" d="M86.4809 33.3248C86.485 43.2354 79.4301 51.7466 69.6867 53.5896C59.9404 55.4316 50.2619 50.0849 46.6433 40.8568L54.5068 32.9987V33.3248C54.4987 38.7434 58.3251 43.4116 63.6411 44.4749C68.9592 45.5372 74.2873 42.6967 76.3657 37.6923C78.4441 32.6878 76.693 26.9118 72.1846 23.9012C67.6753 20.8886 61.6671 21.48 57.8326 25.3128L35.2229 47.8885C29.3242 53.7871 20.4493 55.5531 12.7388 52.3633C5.02721 49.1715 0 41.6537 0 33.3157C0 24.9766 5.02721 17.4588 12.7388 14.268C20.4493 11.0782 29.3242 12.8432 35.2229 18.7429C36.3902 19.9205 36.8422 21.6299 36.4044 23.2288C35.9687 24.8288 34.7111 26.0743 33.108 26.4946C31.5029 26.9168 29.7954 26.452 28.628 25.2743C24.1946 20.8593 17.0191 20.8694 12.5969 25.2956C8.17263 29.7208 8.17263 36.8913 12.5969 41.3155C17.0191 45.7427 24.1946 45.7518 28.628 41.3368L51.2195 18.7429C57.1202 12.8422 65.9972 11.0762 73.7087 14.269C81.4203 17.4609 86.4465 24.9827 86.4424 33.3248H86.4809ZM176 33.3248C176.027 43.2547 168.967 51.7942 159.205 53.6393C149.439 55.4833 139.746 50.1123 136.144 40.8568L144.008 32.9987V33.3248C144.017 38.7242 147.841 43.3641 153.14 44.4071C158.441 45.4521 163.741 42.6107 165.801 37.6214C167.861 32.6291 166.107 26.8804 161.611 23.8881C157.114 20.8947 151.129 21.4911 147.314 25.3128L124.819 47.8115C118.937 53.7547 110.049 55.5622 102.312 52.3866C94.5755 49.212 89.523 41.6831 89.5189 33.3248V4.35129C89.676 1.90375 91.7088 0 94.1621 0C96.6154 0 98.6482 1.90375 98.8052 4.35129V16.0908C104.513 12.3309 111.716 11.6433 118.034 14.2579C124.351 16.8705 128.958 22.444 130.336 29.1365L140.759 18.7236C146.66 12.8362 155.528 11.0802 163.232 14.269C170.934 17.4609 175.958 24.9726 175.962 33.3056L176 33.3248ZM121.512 33.3248C121.512 28.7386 118.745 24.604 114.506 22.8501C110.264 21.0982 105.383 22.0704 102.141 25.3169C98.8974 28.5624 97.9327 33.4402 99.6939 37.6771C101.455 41.9109 105.599 44.6683 110.188 44.6602C116.446 44.6491 121.512 39.5788 121.512 33.3248Z" fill="#1F32D6"/>
      <path d="M294.169 31.2223V33.7314H289.178V49.973H286.102V33.7314H281.084V31.2223H294.169Z" fill="currentColor"/>
      <path d="M270.173 33.7042V39.208H276.648V41.7171H270.173V47.4637H277.457V49.9728H267.097V31.1952H277.457V33.7042H270.173Z" fill="currentColor"/>
      <path d="M257.375 47.4909H263.715V49.973H254.299V31.2223H257.375V47.4909Z" fill="currentColor"/>
      <path d="M244.578 47.4909H250.919V49.973H241.503V31.2223H244.578V47.4909Z" fill="currentColor"/>
      <path d="M233.186 46.1418H225.335L223.986 49.9728H220.776L227.494 31.1952H231.055L237.773 49.9728H234.535L233.186 46.1418ZM232.323 43.6327L229.274 34.9183L226.199 43.6327H232.323Z" fill="currentColor"/>
      <path d="M218.535 31.2223L212.977 49.973H209.497L205.558 35.7818L201.376 49.973L197.922 50L192.607 31.2223H195.872L199.757 46.4926L203.966 31.2223H207.419L211.331 46.4117L215.243 31.2223H218.535Z" fill="currentColor"/>
      <path d="M293.563 13.5777C293.563 11.7431 293.986 10.0974 294.831 8.64046C295.694 7.18357 296.854 6.05044 298.311 5.24105C299.786 4.41368 301.396 4 303.141 4C305.137 4 306.909 4.49462 308.456 5.48387C310.02 6.45513 311.153 7.84007 311.855 9.6387H308.159C307.673 8.64946 306.999 7.91202 306.135 7.42639C305.272 6.94076 304.274 6.69794 303.141 6.69794C301.9 6.69794 300.793 6.97673 299.822 7.53431C298.851 8.09188 298.086 8.89227 297.529 9.93547C296.989 10.9787 296.719 12.1928 296.719 13.5777C296.719 14.9626 296.989 16.1767 297.529 17.2199C298.086 18.2631 298.851 19.0725 299.822 19.6481C300.793 20.2056 301.9 20.4844 303.141 20.4844C304.274 20.4844 305.272 20.2416 306.135 19.756C306.999 19.2704 307.673 18.5329 308.159 17.5437H311.855C311.153 19.3423 310.02 20.7272 308.456 21.6985C306.909 22.6698 305.137 23.1554 303.141 23.1554C301.378 23.1554 299.768 22.7507 298.311 21.9413C296.854 21.114 295.694 19.9718 294.831 18.5149C293.986 17.058 293.563 15.4123 293.563 13.5777Z" fill="currentColor"/>
      <path d="M289.741 4.24291V22.9936H286.665V4.24291H289.741Z" fill="currentColor"/>
      <path d="M282.741 4.24291V6.752H277.75V22.9936H274.674V6.752H269.656V4.24291H282.741Z" fill="currentColor"/>
      <path d="M265.779 22.9934H262.703L253.449 8.99108V22.9934H250.373V4.21572H253.449L262.703 18.1911V4.21572H265.779V22.9934Z" fill="currentColor"/>
      <path d="M238.492 6.7248V12.2286H244.967V14.7377H238.492V20.4843H245.777V22.9934H235.417V4.21572H245.777V6.7248H238.492Z" fill="currentColor"/>
      <path d="M227.311 9.6387C226.825 8.70341 226.151 8.00195 225.288 7.53431C224.424 7.04868 223.426 6.80586 222.293 6.80586C221.052 6.80586 219.946 7.08465 218.974 7.64222C218.003 8.1998 217.239 8.99119 216.681 10.0164C216.142 11.0416 215.872 12.2287 215.872 13.5777C215.872 14.9267 216.142 16.1228 216.681 17.166C217.239 18.1912 218.003 18.9826 218.974 19.5401C219.946 20.0977 221.052 20.3765 222.293 20.3765C223.966 20.3765 225.324 19.9089 226.367 18.9736C227.41 18.0383 228.048 16.7703 228.282 15.1695H221.241V12.7144H231.574V15.1155C231.376 16.5724 230.854 17.9124 230.009 19.1355C229.182 20.3585 228.093 21.3388 226.744 22.0762C225.413 22.7957 223.93 23.1554 222.293 23.1554C220.53 23.1554 218.92 22.7507 217.464 21.9413C216.007 21.114 214.847 19.9718 213.983 18.5149C213.138 17.058 212.715 15.4123 212.715 13.5777C212.715 11.7431 213.138 10.0974 213.983 8.64046C214.847 7.18357 216.007 6.05044 217.464 5.24105C218.938 4.41368 220.548 4 222.293 4C224.289 4 226.061 4.49462 227.608 5.48387C229.173 6.45513 230.306 7.84007 231.007 9.6387H227.311Z" fill="currentColor"/>
      <path d="M205.423 19.1623H197.572L196.223 22.9934H193.013L199.73 4.21572H203.292L210.01 22.9934H206.772L205.423 19.1623ZM204.56 16.6532L201.511 7.93888L198.435 16.6532H204.56Z" fill="currentColor"/>
    </svg>
  );

  return (
    <div className="h-screen bg-[var(--app-bg)] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-[var(--app-sidebar-bg)] flex flex-col z-[60] border-r border-[var(--app-border-medium)]
          transition-all duration-300 ease-in-out overflow-hidden
          w-[260px] ${sidebarCollapsed ? 'lg:w-[56px] lg:bg-[var(--app-card-bg)]' : ''}
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
            className="p-2 -mr-2 rounded-lg hover:bg-[var(--app-hover-bg)] transition-colors"
          >
            <X className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
          </button>
        </div>
        {/* Chat sessions portal area - AIAssistant will render here */}
        <div id="sidebar-chat-area" className="overflow-hidden flex flex-col min-h-0 [&:not(:empty)]:flex-1" />

        {/* User Profile */}
        <div className={`relative transition-[border-color] duration-300 ease-in-out ${sidebarCollapsed ? 'border-t border-transparent' : 'border-t border-[var(--app-border-medium)]'}`} ref={accountMenuRef}>
          <button
            ref={avatarBtnRef}
            onClick={() => { setAvatarTooltip(false); setAccountMenuOpen(!accountMenuOpen); setMobileLangPanel(false); }}
            onMouseEnter={() => { if (sidebarCollapsed && !accountMenuOpen) setAvatarTooltip(true); }}
            onMouseLeave={() => setAvatarTooltip(false)}
            className={`w-full flex items-center gap-[12px] transition-all duration-300 ease-in-out rounded-none overflow-hidden py-[16px] ${sidebarCollapsed ? 'px-[9px]' : 'px-[16px] hover:bg-[var(--app-hover-accent-bg)]'}`}
          >
            <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'hover:bg-[var(--app-hover-accent-bg)] transition-colors rounded-[8px]' : ''}`}>
              <div className="w-[36px] h-[36px] rounded-full bg-[var(--app-accent)] flex items-center justify-center shrink-0">
                <span className="text-white text-[14px] font-semibold leading-none">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
            </div>
            <div className={`flex-1 min-w-0 text-left whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="font-semibold text-[14px] leading-[20px] text-[var(--app-text)] truncate">{user.name}</div>
              <div className="font-normal text-[12px] leading-[16px] text-[var(--app-text-secondary)] truncate">{user.email}</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 transition-all duration-300 ease-in-out ${accountMenuOpen ? '-rotate-90' : ''} ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}><path d="M7.5 15L12.5 10L7.5 5" stroke="#7C7C7C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Account Menu Dropdown - rendered via portal to avoid sidebar overflow clipping (desktop only) */}
          {accountMenuOpen && createPortal(
            <div
              ref={accountMenuPortalRef}
              className="fixed z-[100] bg-[var(--app-card-bg)] rounded-[8px] border border-[var(--app-border)] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] max-h-[70vh] overflow-y-auto hidden lg:block"
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
                      className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors w-full text-[var(--app-text)]"
                    >
                      <Icon className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                      <span className="font-medium text-[13px]">
                        {item.label}
                      </span>
                    </button>
                  );
                })}

                <div className="border-t border-[var(--app-border)] my-[2px]" />

                {/* Demo Approval Toggle */}
                <button
                  onClick={() => setDemoApproval(!demoApproval)}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors w-full"
                >
                  <Play className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                  <span className="font-medium text-[13px] text-[var(--app-text)]">
                    {language === 'zh' ? '审批提示演示' : 'Approval Demo'}
                  </span>
                  <div className="ml-auto">
                    <div className={`relative w-[36px] h-[20px] rounded-full transition-colors cursor-pointer ${demoApproval ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-hover-bg-dark)]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${demoApproval ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--app-hover-bg)] transition-colors w-full"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--app-text-secondary)]" /> : <Moon className="w-4 h-4 text-[var(--app-text-secondary)]" />}
                  <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[var(--app-text)]">
                    {theme === 'dark' ? (language === 'zh' ? '浅色模式' : 'Light Mode') : (language === 'zh' ? '深色模式' : 'Dark Mode')}
                  </span>
                  <div className="ml-auto">
                    <div className={`relative w-[36px] h-[20px] rounded-full transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-switch-off-bg)]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                </button>

                {/* Language */}
                <button
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors w-full"
                >
                  <Globe className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                  <span className="font-medium text-[13px] text-[var(--app-text)]">
                    {t('nav.language')}
                  </span>
                  <span className="ml-auto text-[12px] text-[var(--app-text-secondary)]">{language === 'en' ? 'EN' : '中文'}</span>
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors w-full"
                >
                  <LogOut className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                  <span className="font-medium text-[13px] text-[var(--app-text)]">
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
          className="hidden lg:flex w-[28px] h-[28px] items-center justify-center rounded-[6px] hover:bg-[var(--app-hover-accent-bg)] transition-colors text-[var(--app-text-secondary)] absolute top-[18px] z-10"
          style={{ left: sidebarCollapsed ? 'calc(50% - 14px)' : 'calc(100% - 44px)', transition: 'left 0.3s ease-in-out' }}
        >
          <svg width="16" height="13" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.625" y="0.625" width="18.75" height="14.75" rx="2.5" stroke="currentColor" strokeWidth="1.25"/><line x1="7" y1="0.625" x2="7" y2="15.375" stroke="currentColor" strokeWidth="1.25"/></svg>
        </button>
        {toggleTooltip && createPortal(
          <div
            className="fixed z-[200] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none"
            style={sidebarCollapsed ? {
              top: `${14 + 18}px`,
              left: `${56 + 8}px`,
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
            className="fixed z-[200] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none"
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

      {/* Mobile slide-up account/settings sheet */}
      {accountMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-[70]"
            onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); setMobileSettingsPage(null); }}
          />
          {/* Sheet — slides up, leaves gap at top */}
          <div className="fixed bottom-0 left-0 right-0 z-[80] bg-[var(--app-card-bg)] rounded-t-[20px] flex flex-col shadow-2xl animate-slide-up max-h-[85vh]">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-[5px] rounded-full bg-[var(--app-hover-bg-dark)]" />
          </div>
          {/* Sub-page: Gas / Billing / Settings */}
          {mobileSettingsPage ? (
            <>
              <div className="flex items-center justify-between px-4 h-[48px] shrink-0">
                <button
                  onClick={() => setMobileSettingsPage(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--app-sidebar-bg)]"
                >
                  <ChevronLeft className="w-[18px] h-[18px] text-[var(--app-text)]" />
                </button>
                <span className="font-semibold text-[16px] text-[var(--app-text)]">
                  {mobileSettingsPage === 'gas' ? t('nav.gasAccount') : mobileSettingsPage === 'billing' ? t('nav.billing') : t('nav.settings')}
                </span>
                <div className="w-9" />
              </div>
              <div className="border-b border-[var(--app-border-medium)]" />
              <div className="flex-1 overflow-y-auto p-5">
                {mobileSettingsPage === 'gas' && <Gasless compact />}
                {mobileSettingsPage === 'billing' && <Billing compact />}
                {mobileSettingsPage === 'settings' && <AccountSettings compact />}
              </div>
            </>
          ) : !mobileLangPanel ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 h-[48px] shrink-0">
                <button
                  onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); setMobileSettingsPage(null); }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--app-sidebar-bg)]"
                >
                  <X className="w-[18px] h-[18px] text-[var(--app-text)]" />
                </button>
                <span className="font-semibold text-[16px] text-[var(--app-text)]">{language === 'zh' ? '菜单' : 'Menu'}</span>
                <div className="w-9" />
              </div>
              <div className="border-b border-[var(--app-border-medium)]" />

              {/* Content */}
              <div className="overflow-y-auto px-5 pt-4 pb-8">
                {/* Nav items — open as sub-pages */}
                <div className="space-y-0">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => setMobileSettingsPage(item.key)}
                        className="flex items-center gap-3 w-full py-3.5 px-1 text-[var(--app-text)]"
                      >
                        <Icon className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                        <span className="font-medium text-[15px]">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-[var(--app-text-secondary)] ml-auto" />
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[var(--app-border-medium)] my-3" />

                {/* Approval Demo Toggle */}
                <button
                  onClick={() => setDemoApproval(!demoApproval)}
                  className="flex items-center gap-3 w-full py-3.5 px-1"
                >
                  <Play className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                  <span className="font-medium text-[15px] text-[var(--app-text)]">
                    {language === 'zh' ? '审批提示演示' : 'Approval Demo'}
                  </span>
                  <div className="ml-auto">
                    <div className={`relative w-[36px] h-[20px] rounded-full transition-colors cursor-pointer ${demoApproval ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-hover-bg-dark)]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${demoApproval ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                </button>

                {/* Language */}
                <button
                  onClick={() => setMobileLangPanel(true)}
                  className="flex items-center gap-3 w-full py-3.5 px-1"
                >
                  <Globe className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                  <span className="font-medium text-[15px] text-[var(--app-text)]">{t('nav.language')}</span>
                  <span className="ml-auto text-[13px] text-[var(--app-text-secondary)] mr-1">{language === 'en' ? 'EN' : '中文'}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--app-text-secondary)]" />
                </button>

                <div className="border-t border-[var(--app-border-medium)] my-3" />

                {/* Sign Out */}
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setMobileLangPanel(false);
                    setMobileSettingsPage(null);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-3 w-full py-3.5 px-1"
                >
                  <LogOut className="w-[18px] h-[18px] text-[var(--app-text)]" strokeWidth={1.5} />
                  <span className="font-medium text-[15px] text-[var(--app-text)]">{t('auth.logout')}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Language picker */}
              <div className="flex items-center justify-between px-4 h-[48px] shrink-0">
                <button
                  onClick={() => setMobileLangPanel(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--app-sidebar-bg)]"
                >
                  <ChevronLeft className="w-[18px] h-[18px] text-[var(--app-text)]" />
                </button>
                <span className="font-semibold text-[16px] text-[var(--app-text)]">{t('nav.language')}</span>
                <div className="w-9" />
              </div>
              <div className="border-b border-[var(--app-border-medium)]" />

              <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
                <button
                  onClick={() => { setLanguage('en'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                  className="flex items-center justify-between w-full py-3.5 px-1 transition-colors hover:bg-[var(--app-hover-accent-bg)] rounded-lg"
                >
                  <span className={`text-[14px] lg:text-[15px] ${language === 'en' ? 'font-medium text-[var(--app-text)]' : 'font-normal text-[var(--app-text-secondary)]'}`}>English</span>
                  {language === 'en' && (
                    <Check className="w-4 h-4 text-[var(--app-accent)]" strokeWidth={2.5} />
                  )}
                </button>
                <button
                  onClick={() => { setLanguage('zh'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                  className="flex items-center justify-between w-full py-3.5 px-1 transition-colors hover:bg-[var(--app-hover-accent-bg)] rounded-lg"
                >
                  <span className={`text-[14px] lg:text-[15px] ${language === 'zh' ? 'font-medium text-[var(--app-text)]' : 'font-normal text-[var(--app-text-secondary)]'}`}>中文</span>
                  {language === 'zh' && (
                    <Check className="w-4 h-4 text-[var(--app-accent)]" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </>
          )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--app-card-bg)] relative">

        {/* Logo bar when sidebar collapsed (desktop) */}
        {/* Spacer: instant height, no animation */}
        <div className={`logo-bar-collapsed hidden lg:block ${sidebarCollapsed ? 'h-[64px]' : 'h-0'}`} />
        {/* Logo + divider: absolute positioned, opacity-only fade */}
        <div className={`logo-bar-collapsed hidden lg:flex items-center h-[64px] pl-[24px] bg-[var(--app-card-bg)] absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <LogoText />
        </div>
        <div className={`logo-bar-collapsed hidden lg:block absolute top-[64px] left-0 right-0 h-px bg-[var(--app-hover-bg-dark)] z-10 transition-opacity duration-300 ease-in-out ${sidebarCollapsed && hasActiveChat ? 'opacity-100' : 'opacity-0'}`} />
        {/* Logo for wide screens (>= 1184px): absolute, no bar */}
        <div className={`logo-bar-wide hidden lg:block absolute top-[23px] left-[24px] z-10 transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <LogoText />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-[var(--app-card-bg)] border-b border-[var(--app-border)] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button className="flex items-center" onClick={() => navigate('/dashboard/chat')}>
            <LogoText />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--app-text)] p-2 -mr-2 hover:bg-[var(--app-hover-bg)] rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
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
            closeSidebar: () => setSidebarOpen(false),
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
        <div className="fixed inset-0 lg:left-[260px] bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-[var(--app-card-bg)] rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-[var(--app-text)] mb-2">{language === 'zh' ? '确认退出' : 'Confirm Logout'}</h3>
            <p className="text-[var(--app-text-secondary)] mb-6">{language === 'zh' ? '确定要退出登录吗？您需要重新登录才能访问您的账户。' : "Are you sure you want to logout? You'll need to sign in again to access your account."}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-[var(--app-hover-bg)] hover:bg-[var(--app-hover-bg-dark)] active:bg-[var(--app-border-medium)] text-[var(--app-text)] font-medium py-3 rounded-xl transition-colors"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] active:bg-[#2d3db9] text-white font-medium py-3 rounded-xl transition-colors"
              >
                {language === 'zh' ? '退出登录' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
