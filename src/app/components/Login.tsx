import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import svgPaths from "../../imports/svg-53z9qh6vjt";
import { Mail, CheckCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [clickCount, setClickCount] = useState(0);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    const socialUser = {
      id: Date.now().toString(),
      name: 'Account',
      email: `user@${provider.toLowerCase()}.com`,
      createdAt: new Date().toISOString(),
      walletPaired: false, // New user needs onboarding
    };
    // Clear previous wallet data for a fresh start
    localStorage.removeItem('agent_wallet_wallets');
    localStorage.setItem('agent_wallet_current_user', JSON.stringify(socialUser));

    // Always navigate to dashboard; onboarding modal auto-opens if walletPaired is false
    navigate('/dashboard');
  };

  const handleSendMagicLink = () => {
    if (magicLinkEmail) {
      setMagicLinkSent(true);
    }
  };

  const handleMagicLinkLogin = () => {
    const magicLinkUser = {
      id: Date.now().toString(),
      name: 'Account',
      email: magicLinkEmail,
      createdAt: new Date().toISOString(),
      walletPaired: false, // New user needs onboarding
    };
    localStorage.setItem('agent_wallet_current_user', JSON.stringify(magicLinkUser));
    navigate('/dashboard');
  };

  // Secret test account access - click logo 5 times
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      const defaultUser = {
        id: 'default',
        name: 'Demo User',
        email: '111',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('agent_wallet_current_user', JSON.stringify(defaultUser));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[446px] flex flex-col gap-[40px] items-center">
        {/* Logo and Header */}
        <div className="content-stretch flex flex-col gap-[8px] items-center w-full">
          <div 
            className="h-[32px] relative w-[301.665px] cursor-pointer"
            onClick={handleLogoClick}
          >
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 301.665 32">
              <g>
                <path d={svgPaths.pc0264f0} fill="#0A0A0A" />
                <path d={svgPaths.p3047e200} fill="#0A0A0A" />
                <path d={svgPaths.p2ae8cf80} fill="#0A0A0A" />
                <path d={svgPaths.p2f540240} fill="#0A0A0A" />
                <path d={svgPaths.p34feb700} fill="#0A0A0A" />
                <path d={svgPaths.p19bb4d00} fill="#0A0A0A" />
                <path d={svgPaths.p1d862d80} fill="#4F5EFF" />
                <path d={svgPaths.pc8a4d00} fill="#4F5EFF" />
                <path d={svgPaths.p3dee7e70} fill="#4F5EFF" />
                <path d={svgPaths.p4c54400} fill="#4F5EFF" />
                <path d={svgPaths.pea8ab00} fill="#4F5EFF" />
                <path d={svgPaths.p1af1ca00} fill="#4F5EFF" />
                <path d={svgPaths.p273dfb80} fill="#4F5EFF" />
                <path d={svgPaths.p3f114880} fill="#0A0A0A" />
                <path d={svgPaths.p32df7100} fill="#0A0A0A" />
                <path d={svgPaths.p3b768700} fill="#0A0A0A" />
                <path d={svgPaths.p908dd80} fill="#0A0A0A" />
              </g>
            </svg>
          </div>
          <p className="font-['Inter',sans-serif] font-normal leading-[1.5] text-[16px] text-black text-center w-full">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white relative rounded-[12px] w-full shadow-[0px_8px_64px_0px_rgba(0,0,0,0.08)] border border-[rgba(10,10,10,0.08)]">
          <div className="content-stretch flex flex-col gap-[24px] items-start p-[32px] w-full">
            <div className="text-center w-full">
              <h2 className="font-['Inter',sans-serif] font-semibold leading-[1.2] text-[24px] text-[#0a0a0a] mb-2">
                {t('auth.login')}
              </h2>
              <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#4f4f4f]">
                {t('auth.selectProvider')}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="content-stretch flex flex-col gap-[12px] items-start w-full">
              {/* Google */}
              <button
                onClick={() => handleSocialLogin('Google')}
                className="bg-white w-full h-[48px] rounded-[8px] border border-[rgba(10,10,10,0.08)] hover:bg-[#fafafa] hover:border-[rgba(10,10,10,0.16)] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-['Inter',sans-serif] font-medium text-[16px] text-[#0a0a0a]">
                  {t('auth.continueWithGoogle')}
                </span>
              </button>

              {/* Apple */}
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="bg-white w-full h-[48px] rounded-[8px] border border-[rgba(10,10,10,0.08)] hover:bg-[#fafafa] hover:border-[rgba(10,10,10,0.16)] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p27132880} fill="#0A0A0A" />
                </svg>
                <span className="font-['Inter',sans-serif] font-medium text-[16px] text-[#0a0a0a]">
                  {t('auth.continueWithApple')}
                </span>
              </button>
            </div>

            {/* Magic Link */}
            <div className="w-full">
              {!showMagicLink ? (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setShowMagicLink(true)}
                    className="font-['Inter',sans-serif] font-normal text-[14px] text-[#4f5eff] hover:text-[#3d4dd9] underline cursor-pointer"
                  >
                    {t('auth.useMagicLink')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    placeholder={t('auth.enterEmail')}
                    className="w-full h-[48px] rounded-[8px] border border-[rgba(10,10,10,0.08)] px-4 focus:outline-none focus:ring-2 focus:ring-[#4f5eff] focus:border-transparent"
                  />
                  {!magicLinkSent ? (
                    <button
                      onClick={handleSendMagicLink}
                      disabled={!magicLinkEmail}
                      className="bg-[#4F5EFF] w-full h-[48px] rounded-[8px] hover:bg-[#3d4dd9] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                    >
                      <Mail className="w-5 h-5 text-white" />
                      <span className="font-['Inter',sans-serif] font-medium text-[16px] text-white">
                        {t('auth.sendMagicLink')}
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-[8px] p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">{t('auth.sent')}</p>
                          <p>Please check your email and click the login link. For demo purposes, click the button below.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleMagicLinkLogin}
                        className="bg-[#4F5EFF] w-full h-[48px] rounded-[8px] hover:bg-[#3d4dd9] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                        <span className="font-['Inter',sans-serif] font-medium text-[16px] text-white">
                          {t('auth.loginWithMagicLink')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="w-full">
              <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] text-center leading-[1.5]">
                {t('auth.privacyNotice')}
              </p>
            </div>
          </div>
        </div>

        <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#4f4f4f] text-center w-full">
          {t('common.copyright')}
        </p>
      </div>
    </div>
  );
}