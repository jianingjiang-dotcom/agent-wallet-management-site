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
    <div className="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[446px] flex flex-col gap-[24px] items-center">
        {/* Logo and Header */}
        <div className="content-stretch flex flex-col gap-[16px] items-center w-full">
          <div
            className="cursor-pointer"
            onClick={handleLogoClick}
          >
            <svg className="w-[139px] h-[24px] sm:w-[174px] sm:h-[30px]" viewBox="0 0 312 54" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </div>
          <p className="font-normal leading-[1.5] text-[16px] text-black text-center w-full">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--app-card-bg)] relative rounded-[12px] w-full shadow-[0px_8px_64px_0px_rgba(0,0,0,0.08)] border border-[var(--app-border)]">
          <div className="content-stretch flex flex-col gap-[24px] items-start px-5 py-6 sm:p-[32px] w-full">
            <div className="text-center w-full">
              <h2 className="font-semibold leading-[1.2] text-[24px] text-[var(--app-text)] mb-2">
                {t('auth.login')}
              </h2>
              <p className="font-normal text-[14px] text-[var(--app-text-secondary)]">
                {t('auth.selectProvider')}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="content-stretch flex flex-col gap-[12px] items-start w-full">
              {/* Google */}
              <button
                onClick={() => handleSocialLogin('Google')}
                className="bg-[var(--app-card-bg)] w-full h-[48px] rounded-[8px] border border-[var(--app-border)] hover:bg-[var(--app-bg)] hover:border-[rgba(10,10,10,0.16)] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-[16px] text-[var(--app-text)]">
                  {t('auth.continueWithGoogle')}
                </span>
              </button>

              {/* Apple */}
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="bg-[var(--app-card-bg)] w-full h-[48px] rounded-[8px] border border-[var(--app-border)] hover:bg-[var(--app-bg)] hover:border-[rgba(10,10,10,0.16)] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p27132880} fill="currentColor" />
                </svg>
                <span className="font-medium text-[16px] text-[var(--app-text)]">
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
                    className="font-normal text-[14px] text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] underline cursor-pointer"
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
                    className="w-full h-[48px] rounded-[8px] border border-[var(--app-border)] px-4 focus:outline-none focus:ring-2 focus:ring-[#1F32D6] focus:border-transparent"
                  />
                  {!magicLinkSent ? (
                    <button
                      onClick={handleSendMagicLink}
                      disabled={!magicLinkEmail}
                      className="bg-[var(--app-accent)] w-full h-[48px] rounded-[8px] hover:bg-[var(--app-accent-hover)] disabled:bg-[#EBEBEB] disabled:cursor-not-allowed transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
                        className="bg-[var(--app-accent)] w-full h-[48px] rounded-[8px] hover:bg-[var(--app-accent-hover)] transition-all flex items-center justify-center gap-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
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
              <p className="font-normal text-[12px] text-[var(--app-text-secondary)] text-center leading-[1.5]">
                {t('auth.privacyNotice')}
              </p>
            </div>
          </div>
        </div>

        <p className="font-normal text-[14px] text-[var(--app-text-secondary)] text-center w-full">
          {t('common.copyright')}
        </p>
      </div>
    </div>
  );
}