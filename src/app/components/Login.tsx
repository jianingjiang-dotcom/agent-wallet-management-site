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
            <svg width="247" height="40" viewBox="0 0 333 54" fill="none" xmlns="http://www.w3.org/2000/svg">
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