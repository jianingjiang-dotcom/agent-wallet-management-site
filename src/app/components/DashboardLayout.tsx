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
    <svg width="148" height="24" viewBox="0 0 333 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M86.4809 33.3248C86.485 43.2354 79.4301 51.7466 69.6867 53.5896C59.9404 55.4316 50.2619 50.0849 46.6433 40.8568L54.5068 32.9987V33.3248C54.4987 38.7434 58.3251 43.4116 63.6411 44.4749C68.9592 45.5372 74.2873 42.6967 76.3657 37.6923C78.4441 32.6878 76.693 26.9118 72.1846 23.9012C67.6753 20.8886 61.6671 21.48 57.8326 25.3128L35.2229 47.8885C29.3242 53.7871 20.4493 55.5531 12.7388 52.3633C5.02721 49.1715 0 41.6537 0 33.3157C0 24.9766 5.02721 17.4588 12.7388 14.268C20.4493 11.0782 29.3242 12.8432 35.2229 18.7429C36.3902 19.9205 36.8422 21.6299 36.4044 23.2288C35.9687 24.8288 34.7111 26.0743 33.108 26.4946C31.5029 26.9168 29.7954 26.452 28.628 25.2743C24.1946 20.8593 17.0191 20.8694 12.5969 25.2956C8.17263 29.7208 8.17263 36.8913 12.5969 41.3155C17.0191 45.7427 24.1946 45.7518 28.628 41.3368L51.2195 18.7429C57.1202 12.8422 65.9972 11.0762 73.7087 14.269C81.4203 17.4609 86.4465 24.9827 86.4424 33.3248H86.4809ZM176 33.3248C176.027 43.2547 168.967 51.7942 159.205 53.6393C149.439 55.4833 139.746 50.1123 136.144 40.8568L144.008 32.9987V33.3248C144.017 38.7242 147.841 43.3641 153.14 44.4071C158.441 45.4521 163.741 42.6107 165.801 37.6214C167.861 32.6291 166.107 26.8804 161.611 23.8881C157.114 20.8947 151.129 21.4911 147.314 25.3128L124.819 47.8115C118.937 53.7547 110.049 55.5622 102.312 52.3866C94.5755 49.212 89.523 41.6831 89.5189 33.3248V4.35129C89.676 1.90375 91.7088 0 94.1621 0C96.6154 0 98.6482 1.90375 98.8052 4.35129V16.0908C104.513 12.3309 111.716 11.6433 118.034 14.2579C124.351 16.8705 128.958 22.444 130.336 29.1365L140.759 18.7236C146.66 12.8362 155.528 11.0802 163.232 14.269C170.934 17.4609 175.958 24.9726 175.962 33.3056L176 33.3248ZM121.512 33.3248C121.512 28.7386 118.745 24.604 114.506 22.8501C110.264 21.0982 105.383 22.0704 102.141 25.3169C98.8974 28.5624 97.9327 33.4402 99.6939 37.6771C101.455 41.9109 105.599 44.6683 110.188 44.6602C116.446 44.6491 121.512 39.5788 121.512 33.3248Z" fill="#1F32D6"/>
      <path d="M311.831 31.957V34.9025H305.972V53.9687H302.362V34.9025H296.471V31.957H311.831Z" fill="#0A0A0A"/>
      <path d="M283.663 34.8703V41.3312H291.264V44.2767H283.663V51.0227H292.215V53.9682H280.053V31.9248H292.215V34.8703H283.663Z" fill="#0A0A0A"/>
      <path d="M268.638 51.0549H276.081V53.9687H265.027V31.957H268.638V51.0549Z" fill="#0A0A0A"/>
      <path d="M253.616 51.0549H261.059V53.9687H250.006V31.957H253.616V51.0549Z" fill="#0A0A0A"/>
      <path d="M240.243 49.4708H231.026L229.443 53.9682H225.674L233.56 31.9248H237.741L245.627 53.9682H241.826L240.243 49.4708ZM239.229 46.5254L235.65 36.2955L232.04 46.5254H239.229Z" fill="#0A0A0A"/>
      <path d="M223.044 31.957L216.519 53.9687H212.434L207.81 37.3095L202.901 53.9687L198.847 54.0004L192.607 31.957H196.44L201 49.8831L205.941 31.957H209.995L214.587 49.7881L219.18 31.957H223.044Z" fill="#0A0A0A"/>
      <path d="M311.121 11.2434C311.121 9.08972 311.617 7.15776 312.61 5.4475C313.623 3.73724 314.985 2.40703 316.695 1.45689C318.427 0.48563 320.316 0 322.364 0C324.708 0 326.788 0.580644 328.604 1.74193C330.441 2.88211 331.771 4.50791 332.594 6.61934H328.255C327.685 5.45806 326.894 4.59237 325.88 4.02228C324.867 3.45219 323.695 3.16715 322.364 3.16715C320.908 3.16715 319.609 3.49442 318.469 4.14897C317.329 4.80351 316.431 5.7431 315.777 6.96773C315.143 8.19236 314.827 9.61758 314.827 11.2434C314.827 12.8692 315.143 14.2944 315.777 15.519C316.431 16.7437 317.329 17.6938 318.469 18.3695C319.609 19.024 320.908 19.3513 322.364 19.3513C323.695 19.3513 324.867 19.0662 325.88 18.4962C326.894 17.9261 327.685 17.0604 328.255 15.8991H332.594C331.771 18.0105 330.441 19.6363 328.604 20.7765C326.788 21.9167 324.708 22.4868 322.364 22.4868C320.295 22.4868 318.406 22.0117 316.695 21.0616C314.985 20.0903 313.623 18.7495 312.61 17.0393C311.617 15.329 311.121 13.397 311.121 11.2434Z" fill="#0A0A0A"/>
      <path d="M306.634 0.285156V22.2969H303.023V0.285156H306.634Z" fill="#0A0A0A"/>
      <path d="M298.417 0.285156V3.23061H292.558V22.2969H288.948V3.23061H283.057V0.285156H298.417Z" fill="#0A0A0A"/>
      <path d="M278.504 22.2963H274.894L264.03 5.85879V22.2963H260.42V0.25293H264.03L274.894 16.6588V0.25293H278.504V22.2963Z" fill="#0A0A0A"/>
      <path d="M246.472 3.19838V9.65937H254.073V12.6048H246.472V19.3508H255.023V22.2963H242.861V0.25293H255.023V3.19838H246.472Z" fill="#0A0A0A"/>
      <path d="M233.347 6.61934C232.777 5.5214 231.985 4.69794 230.972 4.14897C229.958 3.57888 228.786 3.29384 227.456 3.29384C225.999 3.29384 224.701 3.62111 223.561 4.27565C222.421 4.9302 221.523 5.85923 220.869 7.06275C220.235 8.26626 219.918 9.65981 219.918 11.2434C219.918 12.827 220.235 14.2311 220.869 15.4557C221.523 16.6592 222.421 17.5882 223.561 18.2428C224.701 18.8973 225.999 19.2246 227.456 19.2246C229.42 19.2246 231.014 18.6756 232.239 17.5777C233.463 16.4797 234.213 14.9912 234.487 13.112H226.221V10.2299H238.351V13.0487C238.119 14.7589 237.507 16.3319 236.514 17.7677C235.543 19.2035 234.266 20.3542 232.682 21.2199C231.12 22.0645 229.378 22.4868 227.456 22.4868C225.387 22.4868 223.497 22.0117 221.787 21.0616C220.077 20.0903 218.715 18.7495 217.701 17.0393C216.709 15.329 216.213 13.397 216.213 11.2434C216.213 9.08972 216.709 7.15776 217.701 5.4475C218.715 3.73724 220.077 2.40703 221.787 1.45689C223.518 0.48563 225.408 0 227.456 0C229.8 0 231.88 0.580644 233.696 1.74193C235.533 2.88211 236.863 4.50791 237.686 6.61934H233.347Z" fill="#0A0A0A"/>
      <path d="M207.651 17.7989H198.435L196.851 22.2963H193.082L200.968 0.25293H205.149L213.035 22.2963H209.234L207.651 17.7989ZM206.637 14.8535L203.059 4.6236L199.448 14.8535H206.637Z" fill="#0A0A0A"/>
    </svg>
  );

  return (
    <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-[#FAFAFA] flex flex-col z-[60] border-r border-[#EBEBEB]
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
            <X className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
          </button>
        </div>
        {/* Chat sessions portal area - AIAssistant will render here */}
        <div id="sidebar-chat-area" className="overflow-hidden flex flex-col min-h-0 [&:not(:empty)]:flex-1" />

        {/* User Profile */}
        <div className={`relative transition-[border-color] duration-300 ease-in-out ${sidebarCollapsed ? 'border-t border-transparent' : 'border-t border-[#EBEBEB]'}`} ref={accountMenuRef}>
          <button
            ref={avatarBtnRef}
            onClick={() => { setAvatarTooltip(false); setAccountMenuOpen(!accountMenuOpen); setMobileLangPanel(false); }}
            onMouseEnter={() => { if (sidebarCollapsed && !accountMenuOpen) setAvatarTooltip(true); }}
            onMouseLeave={() => setAvatarTooltip(false)}
            className={`w-full flex items-center gap-[12px] transition-all duration-300 ease-in-out rounded-none overflow-hidden py-[16px] ${sidebarCollapsed ? 'px-[8px]' : 'px-[16px] hover:bg-[#F0F2FF]'}`}
          >
            <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'rounded-none p-[8px] -m-[8px] hover:bg-[#F0F2FF] transition-colors' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-[#1F32D6] flex items-center justify-center shrink-0">
                <span className="text-white text-[13px] font-semibold leading-none">{(user.name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
              </div>
            </div>
            <div className={`flex-1 min-w-0 text-left whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <div className="font-semibold text-[14px] leading-[20px] text-[#0A0A0A] truncate">{user.name}</div>
              <div className="font-normal text-[12px] leading-[16px] text-[#7C7C7C] truncate">{user.email}</div>
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
                      className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#F0F2FF] transition-colors w-full text-[#0A0A0A]"
                    >
                      <Icon className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                      <span className="font-medium text-[13px]">
                        {item.label}
                      </span>
                    </button>
                  );
                })}

                <div className="border-t border-[rgba(10,10,10,0.06)] my-[2px]" />

                {/* Demo Approval Toggle */}
                <button
                  onClick={() => setDemoApproval(!demoApproval)}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#F0F2FF] transition-colors w-full"
                >
                  <Play className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                  <span className="font-medium text-[13px] text-[#0A0A0A]">
                    {language === 'zh' ? '审批提示演示' : 'Approval Demo'}
                  </span>
                  <div className="ml-auto">
                    <div className={`relative w-[36px] h-[20px] rounded-full transition-colors cursor-pointer ${demoApproval ? 'bg-[#1F32D6]' : 'bg-[#EBEBEB]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${demoApproval ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                </button>

                {/* Language */}
                <button
                  onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#F0F2FF] transition-colors w-full"
                >
                  <Globe className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                  <span className="font-medium text-[13px] text-[#0A0A0A]">
                    {t('nav.language')}
                  </span>
                  <span className="ml-auto text-[12px] text-[#7C7C7C]">{language === 'en' ? 'EN' : '中文'}</span>
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] hover:bg-[#F0F2FF] transition-colors w-full"
                >
                  <LogOut className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                  <span className="font-medium text-[13px] text-[#0A0A0A]">
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
          className="hidden lg:flex w-[28px] h-[28px] items-center justify-center rounded-[6px] hover:bg-[#F0F2FF] transition-colors text-[#7C7C7C] absolute top-[18px] z-10"
          style={{ left: sidebarCollapsed ? 'calc(50% - 14px)' : 'calc(100% - 44px)', transition: 'left 0.3s ease-in-out' }}
        >
          <svg width="16" height="13" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.625" y="0.625" width="18.75" height="14.75" rx="2.5" stroke="currentColor" strokeWidth="1.25"/><line x1="7" y1="0.625" x2="7" y2="15.375" stroke="currentColor" strokeWidth="1.25"/></svg>
        </button>
        {toggleTooltip && createPortal(
          <div
            className="fixed z-[200] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none"
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
          <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-[20px] flex flex-col shadow-2xl animate-slide-up max-h-[85vh]">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-9 h-[5px] rounded-full bg-[#EBEBEB]" />
          </div>
          {/* Sub-page: Gas / Billing / Settings */}
          {mobileSettingsPage ? (
            <>
              <div className="flex items-center justify-between px-4 h-[48px] shrink-0">
                <button
                  onClick={() => setMobileSettingsPage(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAFAFA]"
                >
                  <ChevronLeft className="w-[18px] h-[18px] text-[#0A0A0A]" />
                </button>
                <span className="font-semibold text-[16px] text-[#0A0A0A]">
                  {mobileSettingsPage === 'gas' ? t('nav.gasAccount') : mobileSettingsPage === 'billing' ? t('nav.billing') : t('nav.settings')}
                </span>
                <div className="w-9" />
              </div>
              <div className="border-b border-[#EBEBEB]" />
              <div className="flex-1 overflow-y-auto p-5">
                {mobileSettingsPage === 'gas' && <Gasless />}
                {mobileSettingsPage === 'billing' && <Billing />}
                {mobileSettingsPage === 'settings' && <AccountSettings />}
              </div>
            </>
          ) : !mobileLangPanel ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 h-[48px] shrink-0">
                <button
                  onClick={() => { setAccountMenuOpen(false); setMobileLangPanel(false); setMobileSettingsPage(null); }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAFAFA]"
                >
                  <X className="w-[18px] h-[18px] text-[#0A0A0A]" />
                </button>
                <span className="font-semibold text-[16px] text-[#0A0A0A]">{language === 'zh' ? '菜单' : 'Menu'}</span>
                <div className="w-9" />
              </div>
              <div className="border-b border-[#EBEBEB]" />

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
                        className="flex items-center gap-3 w-full py-3.5 px-1 text-[#0A0A0A]"
                      >
                        <Icon className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                        <span className="font-medium text-[15px]">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#7C7C7C] ml-auto" />
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#EBEBEB] my-3" />

                {/* Approval Demo Toggle */}
                <button
                  onClick={() => setDemoApproval(!demoApproval)}
                  className="flex items-center gap-3 w-full py-3.5 px-1"
                >
                  <Play className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                  <span className="font-medium text-[15px] text-[#0A0A0A]">
                    {language === 'zh' ? '审批提示演示' : 'Approval Demo'}
                  </span>
                  <div className="ml-auto">
                    <div className={`relative w-[36px] h-[20px] rounded-full transition-colors cursor-pointer ${demoApproval ? 'bg-[#1F32D6]' : 'bg-[#EBEBEB]'}`}>
                      <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${demoApproval ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                </button>

                {/* Language */}
                <button
                  onClick={() => setMobileLangPanel(true)}
                  className="flex items-center gap-3 w-full py-3.5 px-1"
                >
                  <Globe className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                  <span className="font-medium text-[15px] text-[#0A0A0A]">{t('nav.language')}</span>
                  <span className="ml-auto text-[13px] text-[#7C7C7C] mr-1">{language === 'en' ? 'EN' : '中文'}</span>
                  <ChevronRight className="w-4 h-4 text-[#7C7C7C]" />
                </button>

                <div className="border-t border-[#EBEBEB] my-3" />

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
                  <LogOut className="w-[18px] h-[18px] text-[#0A0A0A]" strokeWidth={1.5} />
                  <span className="font-medium text-[15px] text-[#0A0A0A]">{t('auth.logout')}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Language picker */}
              <div className="flex items-center justify-between px-4 h-[48px] shrink-0">
                <button
                  onClick={() => setMobileLangPanel(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAFAFA]"
                >
                  <ChevronLeft className="w-[18px] h-[18px] text-[#0A0A0A]" />
                </button>
                <span className="font-semibold text-[16px] text-[#0A0A0A]">{t('nav.language')}</span>
                <div className="w-9" />
              </div>
              <div className="border-b border-[#EBEBEB]" />

              <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
                <button
                  onClick={() => { setLanguage('en'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                  className="flex items-center justify-between w-full py-3.5 px-1 transition-colors hover:bg-[#F0F2FF] rounded-lg"
                >
                  <span className={`text-[15px] ${language === 'en' ? 'font-medium text-[#0A0A0A]' : 'font-normal text-[#7C7C7C]'}`}>English</span>
                  {language === 'en' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F32D6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
                <button
                  onClick={() => { setLanguage('zh'); setMobileLangPanel(false); setAccountMenuOpen(false); }}
                  className="flex items-center justify-between w-full py-3.5 px-1 transition-colors hover:bg-[#F0F2FF] rounded-lg"
                >
                  <span className={`text-[15px] ${language === 'zh' ? 'font-medium text-[#0A0A0A]' : 'font-normal text-[#7C7C7C]'}`}>中文</span>
                  {language === 'zh' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F32D6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              </div>
            </>
          )}
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
        <div className={`logo-bar-collapsed hidden lg:block absolute top-[64px] left-0 right-0 h-px bg-[#EBEBEB] z-10 transition-opacity duration-300 ease-in-out ${sidebarCollapsed && hasActiveChat ? 'opacity-100' : 'opacity-0'}`} />

        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-[rgba(10,10,10,0.08)] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button className="flex items-center" onClick={() => navigate('/dashboard/chat')}>
            <LogoText />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#0A0A0A] p-2 -mr-2 hover:bg-slate-100 rounded-lg transition-colors"
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
        <div className="fixed inset-0 lg:left-[260px] bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">{language === 'zh' ? '确认退出' : 'Confirm Logout'}</h3>
            <p className="text-[#7C7C7C] mb-6">{language === 'zh' ? '确定要退出登录吗？您需要重新登录才能访问您的账户。' : "Are you sure you want to logout? You'll need to sign in again to access your account."}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 font-medium py-3 rounded-xl transition-colors"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-[#1F32D6] hover:bg-[#1828AB] active:bg-[#2d3db9] text-white font-medium py-3 rounded-xl transition-colors"
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
