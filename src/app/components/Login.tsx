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
      name: 'Olivia',
      email: 'olivia@cobo.com',
      createdAt: new Date().toISOString(),
      walletPaired: false, // New user needs onboarding
    };
    // Clear previous wallet data for a fresh start
    localStorage.removeItem('agent_wallet_wallets');
    localStorage.removeItem('agent_wallet_invite_verified');
    localStorage.removeItem('agent_wallet_invite_code');
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
      name: 'Olivia',
      email: magicLinkEmail,
      createdAt: new Date().toISOString(),
      walletPaired: false, // New user needs onboarding
    };
    localStorage.removeItem('agent_wallet_invite_verified');
    localStorage.removeItem('agent_wallet_invite_code');
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

      <div className="w-full max-w-[446px] flex flex-col gap-6 sm:gap-[40px] items-center">
        {/* Logo and Header */}
        <div className="content-stretch flex flex-col gap-[16px] items-center w-full mb-4">
          <div
            className="cursor-pointer"
            onClick={handleLogoClick}
          >
            <svg width="194" height="40" viewBox="0 0 280 58" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M86.4809 33.3248C86.485 43.2354 79.4301 51.7466 69.6867 53.5896C59.9404 55.4316 50.2619 50.0849 46.6433 40.8568L54.5068 32.9987V33.3248C54.4987 38.7434 58.3251 43.4116 63.6411 44.4749C68.9592 45.5372 74.2873 42.6967 76.3657 37.6923C78.4441 32.6878 76.693 26.9118 72.1846 23.9012C67.6753 20.8886 61.6671 21.48 57.8326 25.3128L35.2229 47.8885C29.3242 53.7871 20.4493 55.5531 12.7388 52.3633C5.02721 49.1715 0 41.6537 0 33.3157C0 24.9766 5.02721 17.4588 12.7388 14.268C20.4493 11.0782 29.3242 12.8432 35.2229 18.7429C36.3902 19.9205 36.8422 21.6299 36.4044 23.2288C35.9687 24.8288 34.7111 26.0743 33.108 26.4946C31.5029 26.9168 29.7954 26.452 28.628 25.2743C24.1946 20.8593 17.0191 20.8694 12.5969 25.2956C8.17263 29.7208 8.17263 36.8913 12.5969 41.3155C17.0191 45.7427 24.1946 45.7518 28.628 41.3368L51.2195 18.7429C57.1203 12.8422 65.9972 11.0762 73.7087 14.269C81.4203 17.4609 86.4465 24.9827 86.4424 33.3248H86.4809ZM176 33.3248C176.027 43.2547 168.967 51.7942 159.205 53.6393C149.439 55.4833 139.746 50.1123 136.144 40.8568L144.008 32.9987V33.3248C144.017 38.7242 147.841 43.3641 153.14 44.4071C158.441 45.4521 163.741 42.6107 165.801 37.6214C167.861 32.6291 166.107 26.8804 161.611 23.8881C157.114 20.8947 151.129 21.4911 147.314 25.3128L124.819 47.8115C118.937 53.7547 110.049 55.5622 102.312 52.3866C94.5755 49.212 89.523 41.6831 89.5189 33.3248V4.35129C89.676 1.90375 91.7088 0 94.1621 0C96.6154 0 98.6482 1.90375 98.8052 4.35129V16.0908C104.513 12.3309 111.716 11.6433 118.034 14.2579C124.351 16.8705 128.958 22.444 130.336 29.1365L140.759 18.7236C146.66 12.8362 155.528 11.0802 163.232 14.269C170.934 17.4609 175.958 24.9726 175.962 33.3056L176 33.3248ZM121.512 33.3248C121.512 28.7386 118.745 24.604 114.506 22.8501C110.264 21.0982 105.383 22.0704 102.141 25.3169C98.8974 28.5624 97.9327 33.4402 99.6939 37.6771C101.455 41.9109 105.599 44.6683 110.188 44.6602C116.446 44.6491 121.512 39.5788 121.512 33.3248Z" fill="#1F32D6"/>
              <path d="M209.952 28.884C209.952 30.0147 209.685 31.0813 209.152 32.084C208.619 33.0867 207.765 33.908 206.592 34.548C205.419 35.1667 203.915 35.476 202.08 35.476H198.048V44.5H194.4V22.26H202.08C203.787 22.26 205.227 22.5587 206.4 23.156C207.595 23.732 208.48 24.5213 209.056 25.524C209.653 26.5267 209.952 27.6467 209.952 28.884ZM202.08 32.5C203.467 32.5 204.501 32.1907 205.184 31.572C205.867 30.932 206.208 30.036 206.208 28.884C206.208 26.452 204.832 25.236 202.08 25.236H198.048V32.5H202.08ZM227.799 39.956H218.487L216.887 44.5H213.079L221.047 22.228H225.271L233.239 44.5H229.399L227.799 39.956ZM226.775 36.98L223.159 26.644L219.511 36.98H226.775ZM236.448 33.332C236.448 31.156 236.949 29.204 237.952 27.476C238.976 25.748 240.352 24.404 242.08 23.444C243.829 22.4627 245.738 21.972 247.808 21.972C250.176 21.972 252.277 22.5587 254.112 23.732C255.968 24.884 257.312 26.5267 258.144 28.66H253.76C253.184 27.4867 252.384 26.612 251.36 26.036C250.336 25.46 249.152 25.172 247.808 25.172C246.336 25.172 245.024 25.5027 243.872 26.164C242.72 26.8253 241.813 27.7747 241.152 29.012C240.512 30.2493 240.192 31.6893 240.192 33.332C240.192 34.9747 240.512 36.4147 241.152 37.652C241.813 38.8893 242.72 39.8493 243.872 40.532C245.024 41.1933 246.336 41.524 247.808 41.524C249.152 41.524 250.336 41.236 251.36 40.66C252.384 40.084 253.184 39.2093 253.76 38.036H258.144C257.312 40.1693 255.968 41.812 254.112 42.964C252.277 44.116 250.176 44.692 247.808 44.692C245.717 44.692 243.808 44.212 242.08 43.252C240.352 42.2707 238.976 40.916 237.952 39.188C236.949 37.46 236.448 35.508 236.448 33.332ZM277.742 22.26V25.236H271.822V44.5H268.174V25.236H262.222V22.26H277.742Z" fill="#0A0A0A"/>
            </svg>
          </div>
          <p className="font-normal leading-[1.5] text-[16px] text-black text-center w-full">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white relative rounded-[12px] w-full shadow-[0px_8px_64px_0px_rgba(0,0,0,0.08)] border border-[rgba(10,10,10,0.08)]">
          <div className="content-stretch flex flex-col gap-[24px] items-start px-5 py-6 sm:p-[32px] w-full">
            <div className="text-center w-full">
              <h2 className="font-semibold leading-[1.2] text-[24px] text-[#0A0A0A] mb-2">
                {t('auth.login')}
              </h2>
              <p className="font-normal text-[14px] text-[#4F4F4F]">
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
                <span className="font-medium text-[16px] text-[#0A0A0A]">
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
                <span className="font-medium text-[16px] text-[#0A0A0A]">
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
                    className="font-normal text-[14px] text-[#1F32D6] hover:text-[#1828AB] underline cursor-pointer"
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
                    className="w-full h-[48px] rounded-[8px] border border-[rgba(10,10,10,0.08)] px-4 focus:outline-none focus:ring-2 focus:ring-[#1F32D6] focus:border-transparent"
                  />
                  {!magicLinkSent ? (
                    <button
                      onClick={handleSendMagicLink}
                      disabled={!magicLinkEmail}
                      className="bg-[#1F32D6] w-full h-[48px] rounded-[8px] hover:bg-[#1828AB] disabled:bg-[#EBEBEB] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                    >
                      <Mail className="w-5 h-5 text-white" strokeWidth={1.5} />
                      <span className="font-medium text-[16px] text-white">
                        {t('auth.sendMagicLink')}
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-[8px] p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div className="text-sm text-green-800">
                          <p className="font-medium mb-1">{t('auth.sent')}</p>
                          <p>Please check your email and click the login link. For demo purposes, click the button below.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleMagicLinkLogin}
                        className="bg-[#1F32D6] w-full h-[48px] rounded-[8px] hover:bg-[#1828AB] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                      >
                        <CheckCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
                        <span className="font-medium text-[16px] text-white">
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
              <p className="font-normal text-[12px] text-[#7C7C7C] text-center leading-[1.5]">
                {t('auth.privacyNotice')}
              </p>
            </div>
          </div>
        </div>

        <p className="font-normal text-[14px] text-[#4F4F4F] text-center w-full">
          {t('common.copyright')}
        </p>
      </div>
    </div>
  );
}