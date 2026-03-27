import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, CheckCircle, Loader2, ExternalLink, Copy, RefreshCw, Shield, Zap, Link2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import { useOnboardingFlow, type PairingPhase } from '../hooks/useOnboardingFlow';
import { launchConfetti } from '../utils/confetti';
import LanguageSwitcher from './LanguageSwitcher';
import svgPaths from '../../imports/svg-53z9qh6vjt';

type Step = 'invite-code' | 'setup-command' | 'success';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { hasWallets, addWalletWithAgent } = useWalletStore();
  const flow = useOnboardingFlow();

  const [step, setStep] = useState<Step>('invite-code');
  const [transitioning, setTransitioning] = useState(false);
  const [animClass, setAnimClass] = useState('animate-page-enter');

  // Invite code local state
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Setup command local state
  const [copied, setCopied] = useState(false);
  const [pairingStarted, setPairingStarted] = useState(false);

  // Success state
  const confettiRef = useRef<HTMLDivElement>(null);
  const [confettiFired, setConfettiFired] = useState(false);

  // If user already has wallets, redirect to dashboard
  useEffect(() => {
    if (hasWallets) {
      navigate('/dashboard/chat', { replace: true });
    }
  }, [hasWallets, navigate]);

  // Auto-transition to success when pairing completes
  useEffect(() => {
    if (flow.pairingPhase === 'success' && step === 'setup-command') {
      const tid = setTimeout(() => goToStep('success'), 800);
      return () => clearTimeout(tid);
    }
  }, [flow.pairingPhase, step]);

  // Fire confetti on success page
  useEffect(() => {
    if (step === 'success' && !confettiFired) {
      const tid = setTimeout(() => {
        if (confettiRef.current) {
          launchConfetti(confettiRef.current);
          setConfettiFired(true);
        }
      }, 400);
      return () => clearTimeout(tid);
    }
  }, [step, confettiFired]);

  const goToStep = useCallback((nextStep: Step) => {
    setTransitioning(true);
    setAnimClass('animate-page-exit');
    setTimeout(() => {
      setStep(nextStep);
      setAnimClass('animate-page-enter');
      setTransitioning(false);
    }, 250);
  }, []);

  const handleSkip = () => {
    navigate('/dashboard/chat', { replace: true });
  };

  // ─── Invite Code Helpers ───
  const formatCode = (raw: string) => {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    if (clean.length > 4) return clean.slice(0, 4) + '-' + clean.slice(4);
    return clean;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteError('');
    setCode(formatCode(e.target.value));
  };

  const isCodeComplete = code.replace(/-/g, '').length === 8;

  const handleVerify = async () => {
    if (!isCodeComplete || validating) return;
    setValidating(true);
    setInviteError('');
    const result = await flow.validateInviteCode(code);
    setValidating(false);
    if (result === 'invalid') {
      setInviteError(t('onboarding.inviteCodeInvalid'));
    } else if (result === 'used') {
      setInviteError(t('onboarding.inviteCodeUsed'));
    } else {
      flow.activateTimer();
      goToStep('setup-command');
    }
  };

  // ─── Setup Command Helpers ───
  const handleCopy = () => {
    const onSuccess = () => {
      setCopied(true);
      // Start pairing after a delay
      setTimeout(() => {
        setPairingStarted(true);
        flow.startPairing();
      }, 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(flow.command).then(onSuccess).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = flow.command;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); onSuccess(); } catch { /* noop */ }
        document.body.removeChild(ta);
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Success Handler ───
  const handleTryCta = () => {
    addWalletWithAgent({
      walletId: flow.walletId,
      agentId: flow.agentId,
      policy: { singleTxLimit: 10, dailyLimit: 50 },
    });
    navigate('/dashboard/chat?autoGuide=true', { replace: true });
  };

  // ─── Logo Component ───
  const Logo = () => (
    <svg width="174" height="30" viewBox="0 0 312 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M86.4809 33.3248C86.485 43.2354 79.4301 51.7466 69.6867 53.5896C59.9404 55.4316 50.2619 50.0849 46.6433 40.8568L54.5068 32.9987V33.3248C54.4987 38.7434 58.3251 43.4116 63.6411 44.4749C68.9592 45.5372 74.2873 42.6967 76.3657 37.6923C78.4441 32.6878 76.693 26.9118 72.1846 23.9012C67.6753 20.8886 61.6671 21.48 57.8326 25.3128L35.2229 47.8885C29.3242 53.7871 20.4493 55.5531 12.7388 52.3633C5.02721 49.1715 0 41.6537 0 33.3157C0 24.9766 5.02721 17.4588 12.7388 14.268C20.4493 11.0782 29.3242 12.8432 35.2229 18.7429C36.3902 19.9205 36.8422 21.6299 36.4044 23.2288C35.9687 24.8288 34.7111 26.0743 33.108 26.4946C31.5029 26.9168 29.7954 26.452 28.628 25.2743C24.1946 20.8593 17.0191 20.8694 12.5969 25.2956C8.17263 29.7208 8.17263 36.8913 12.5969 41.3155C17.0191 45.7427 24.1946 45.7518 28.628 41.3368L51.2195 18.7429C57.1202 12.8422 65.9972 11.0762 73.7087 14.269C81.4203 17.4609 86.4465 24.9827 86.4424 33.3248H86.4809ZM176 33.3248C176.027 43.2547 168.967 51.7942 159.205 53.6393C149.439 55.4833 139.746 50.1123 136.144 40.8568L144.008 32.9987V33.3248C144.017 38.7242 147.841 43.3641 153.14 44.4071C158.441 45.4521 163.741 42.6107 165.801 37.6214C167.861 32.6291 166.107 26.8804 161.611 23.8881C157.114 20.8947 151.129 21.4911 147.314 25.3128L124.819 47.8115C118.937 53.7547 110.049 55.5622 102.312 52.3866C94.5755 49.212 89.523 41.6831 89.5189 33.3248V4.35129C89.676 1.90375 91.7088 0 94.1621 0C96.6154 0 98.6482 1.90375 98.8052 4.35129V16.0908C104.513 12.3309 111.716 11.6433 118.034 14.2579C124.351 16.8705 128.958 22.444 130.336 29.1365L140.759 18.7236C146.66 12.8362 155.528 11.0802 163.232 14.269C170.934 17.4609 175.958 24.9726 175.962 33.3056L176 33.3248ZM121.512 33.3248C121.512 28.7386 118.745 24.604 114.506 22.8501C110.264 21.0982 105.383 22.0704 102.141 25.3169C98.8974 28.5624 97.9327 33.4402 99.6939 37.6771C101.455 41.9109 105.599 44.6683 110.188 44.6602C116.446 44.6491 121.512 39.5788 121.512 33.3248Z" fill="#1F32D6"/>
      <path d="M294.169 31.2223V33.7314H289.178V49.973H286.102V33.7314H281.084V31.2223H294.169Z" fill="#0A0A0A"/>
      <path d="M270.173 33.7042V39.208H276.648V41.7171H270.173V47.4637H277.457V49.9728H267.097V31.1952H277.457V33.7042H270.173Z" fill="#0A0A0A"/>
      <path d="M257.375 47.4909H263.715V49.973H254.299V31.2223H257.375V47.4909Z" fill="#0A0A0A"/>
      <path d="M244.578 47.4909H250.919V49.973H241.503V31.2223H244.578V47.4909Z" fill="#0A0A0A"/>
      <path d="M233.186 46.1418H225.335L223.986 49.9728H220.776L227.494 31.1952H231.055L237.773 49.9728H234.535L233.186 46.1418ZM232.323 43.6327L229.274 34.9183L226.199 43.6327H232.323Z" fill="#0A0A0A"/>
      <path d="M218.535 31.2223L212.977 49.973H209.497L205.558 35.7818L201.376 49.973L197.922 50L192.607 31.2223H195.872L199.757 46.4926L203.966 31.2223H207.419L211.331 46.4117L215.243 31.2223H218.535Z" fill="#0A0A0A"/>
      <path d="M293.563 13.5777C293.563 11.7431 293.986 10.0974 294.831 8.64046C295.694 7.18357 296.854 6.05044 298.311 5.24105C299.786 4.41368 301.396 4 303.141 4C305.137 4 306.909 4.49462 308.456 5.48387C310.02 6.45513 311.153 7.84007 311.855 9.6387H308.159C307.673 8.64946 306.999 7.91202 306.135 7.42639C305.272 6.94076 304.274 6.69794 303.141 6.69794C301.9 6.69794 300.793 6.97673 299.822 7.53431C298.851 8.09188 298.086 8.89227 297.529 9.93547C296.989 10.9787 296.719 12.1928 296.719 13.5777C296.719 14.9626 296.989 16.1767 297.529 17.2199C298.086 18.2631 298.851 19.0725 299.822 19.6481C300.793 20.2056 301.9 20.4844 303.141 20.4844C304.274 20.4844 305.272 20.2416 306.135 19.756C306.999 19.2704 307.673 18.5329 308.159 17.5437H311.855C311.153 19.3423 310.02 20.7272 308.456 21.6985C306.909 22.6698 305.137 23.1554 303.141 23.1554C301.378 23.1554 299.768 22.7507 298.311 21.9413C296.854 21.114 295.694 19.9718 294.831 18.5149C293.986 17.058 293.563 15.4123 293.563 13.5777Z" fill="#0A0A0A"/>
      <path d="M289.741 4.24291V22.9936H286.665V4.24291H289.741Z" fill="#0A0A0A"/>
      <path d="M282.741 4.24291V6.752H277.75V22.9936H274.674V6.752H269.656V4.24291H282.741Z" fill="#0A0A0A"/>
      <path d="M265.779 22.9934H262.703L253.449 8.99108V22.9934H250.373V4.21572H253.449L262.703 18.1911V4.21572H265.779V22.9934Z" fill="#0A0A0A"/>
      <path d="M238.492 6.7248V12.2286H244.967V14.7377H238.492V20.4843H245.777V22.9934H235.417V4.21572H245.777V6.7248H238.492Z" fill="#0A0A0A"/>
      <path d="M227.311 9.6387C226.825 8.70341 226.151 8.00195 225.288 7.53431C224.424 7.04868 223.426 6.80586 222.293 6.80586C221.052 6.80586 219.946 7.08465 218.974 7.64222C218.003 8.1998 217.239 8.99119 216.681 10.0164C216.142 11.0416 215.872 12.2287 215.872 13.5777C215.872 14.9267 216.142 16.1228 216.681 17.166C217.239 18.1912 218.003 18.9826 218.974 19.5401C219.946 20.0977 221.052 20.3765 222.293 20.3765C223.966 20.3765 225.324 19.9089 226.367 18.9736C227.41 18.0383 228.048 16.7703 228.282 15.1695H221.241V12.7144H231.574V15.1155C231.376 16.5724 230.854 17.9124 230.009 19.1355C229.182 20.3585 228.093 21.3388 226.744 22.0762C225.413 22.7957 223.93 23.1554 222.293 23.1554C220.53 23.1554 218.92 22.7507 217.464 21.9413C216.007 21.114 214.847 19.9718 213.983 18.5149C213.138 17.058 212.715 15.4123 212.715 13.5777C212.715 11.7431 213.138 10.0974 213.983 8.64046C214.847 7.18357 216.007 6.05044 217.464 5.24105C218.938 4.41368 220.548 4 222.293 4C224.289 4 226.061 4.49462 227.608 5.48387C229.173 6.45513 230.306 7.84007 231.007 9.6387H227.311Z" fill="#0A0A0A"/>
      <path d="M205.423 19.1623H197.572L196.223 22.9934H193.013L199.73 4.21572H203.292L210.01 22.9934H206.772L205.423 19.1623ZM204.56 16.6532L201.511 7.93888L198.435 16.6532H204.56Z" fill="#0A0A0A"/>
    </svg>
  );

  // ─── Progress Item ───
  const ProgressItem = ({ phase, targetPhase, label, isLast }: {
    phase: PairingPhase;
    targetPhase: PairingPhase;
    label: string;
    isLast?: boolean;
  }) => {
    const phases: PairingPhase[] = ['waiting', 'connected', 'configuring', 'success'];
    const currentIdx = phases.indexOf(phase);
    const targetIdx = phases.indexOf(targetPhase);
    const isActive = currentIdx >= targetIdx;
    const isComplete = currentIdx > targetIdx;

    if (!isActive) return null;

    return (
      <div className="flex items-center gap-3 animate-reveal-up" style={{ animationDelay: `${targetIdx * 100}ms` }}>
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
        ) : (
          <Loader2 className="w-5 h-5 text-[#4f5eff] animate-spin flex-shrink-0" />
        )}
        <span className={`font-['Inter',sans-serif] text-[14px] ${isComplete ? 'text-[#22c55e]' : 'text-[#0a0a0a]'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {step !== 'success' && (
            <button
              onClick={handleSkip}
              className="font-['Inter',sans-serif] text-[13px] text-[#999] hover:text-[#666] transition-colors"
            >
              {t('onboarding.page.skip')}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className={`w-full max-w-[520px] ${animClass}`} key={step}>

          {/* ═══════ Step 1: Invite Code ═══════ */}
          {step === 'invite-code' && (
            <div className="flex flex-col items-center">
              <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-3 text-center">
                {t('onboarding.page.inviteTitle')}
              </h1>
              <p className="font-['Inter',sans-serif] text-[15px] text-[#999] mb-10 text-center max-w-[400px]">
                {t('onboarding.page.inviteSubtitle')}
              </p>

              {/* Input */}
              <div className="w-full max-w-[420px] mb-4">
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                  placeholder={t('onboarding.page.invitePlaceholder')}
                  maxLength={9}
                  className={`w-full h-[52px] bg-white border rounded-[12px] px-4 font-['Inter',sans-serif] text-[15px] text-[#0a0a0a] text-center placeholder:text-[#c0c0c0] focus:outline-none transition-all ${
                    inviteError
                      ? 'border-[#ef4444] ring-2 ring-[rgba(239,68,68,0.15)]'
                      : 'border-[rgba(10,10,10,0.12)] focus:border-[#4f5eff] focus:ring-2 focus:ring-[rgba(79,94,255,0.15)]'
                  }`}
                />
                {inviteError && (
                  <div className="flex items-center justify-center gap-1.5 mt-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0" />
                    <span className="font-['Inter',sans-serif] text-[13px] text-[#ef4444]">
                      {inviteError}
                    </span>
                  </div>
                )}
              </div>

              {/* Continue button */}
              <button
                onClick={handleVerify}
                disabled={!isCodeComplete || validating || transitioning}
                className="w-full max-w-[420px] h-[48px] rounded-[12px] font-['Inter',sans-serif] font-medium text-[15px] text-white bg-[#4f5eff] hover:bg-[#3d4dd9] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {validating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('onboarding.page.continue')
                )}
              </button>

              {/* Get invite code link */}
              <p className="mt-6 font-['Inter',sans-serif] text-[13px] text-[#999]">
                {t('onboarding.page.noCode')}{' '}
                <a
                  href="https://cobo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4f5eff] hover:text-[#3d4dd9] transition-colors"
                >
                  {t('onboarding.page.applyCode')}
                </a>
              </p>
            </div>
          )}

          {/* ═══════ Step 2: Setup Command ═══════ */}
          {step === 'setup-command' && (
            <div className="flex flex-col">
              <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-3">
                {t('onboarding.page.createTitle')}
              </h1>
              <p className="font-['Inter',sans-serif] text-[15px] text-[#73798B] mb-6">
                {t('onboarding.page.createSubtitle')}
              </p>

              {/* Command box */}
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] overflow-hidden mb-4">
                {/* Timer header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(10,10,10,0.06)]">
                  <span className="font-['Inter',sans-serif] text-[12px]">
                    <span className="text-[#7c7c7c]">{t('onboarding.validTime')}: </span>
                    <span className={`font-semibold tabular-nums text-[13px] ${flow.timeRemaining < 300 ? 'text-[#ef4444]' : 'text-[#4f5eff]'}`}>
                      {formatTime(flow.timeRemaining)}
                    </span>
                  </span>
                  {flow.timeRemaining <= 0 && (
                    <button onClick={flow.refreshToken} className="flex items-center gap-1 text-[12px] text-[#4f5eff] hover:text-[#3d4dd9]">
                      <RefreshCw className="w-3 h-3" />
                      {t('onboarding.regenerate')}
                    </button>
                  )}
                </div>

                {/* Command text */}
                <div className="bg-[#f5f5f7] p-5">
                  <pre className="font-['Inter',sans-serif] text-[13px] text-[#333] leading-[22px] whitespace-pre-wrap break-words">
                    {flow.command}
                  </pre>
                </div>

                {/* Copy button */}
                <div className="p-3">
                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className={`w-full flex items-center justify-center gap-2 h-[44px] rounded-[10px] font-['Inter',sans-serif] font-medium text-[14px] transition-all text-white ${
                      copied ? 'bg-[#22c55e]' : 'bg-[#4f5eff] hover:bg-[#3d4dd9]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t('onboarding.copyPromptDone')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('onboarding.copyPrompt')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Help doc link */}
              <div className="flex justify-center mb-6">
                <a
                  href="https://cobo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-['Inter',sans-serif] text-[13px] text-[#4f5eff] hover:text-[#3d4dd9] transition-colors"
                >
                  {t('onboarding.page.helpDoc')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Pairing progress */}
              {pairingStarted && flow.pairingPhase !== 'idle' && (
                <div className="border-t border-[rgba(10,10,10,0.06)] pt-5 space-y-3">
                  <ProgressItem
                    phase={flow.pairingPhase}
                    targetPhase="connected"
                    label={t('onboarding.page.agentConnected')}
                  />
                  <ProgressItem
                    phase={flow.pairingPhase}
                    targetPhase="configuring"
                    label={t('onboarding.page.creatingWallet')}
                  />
                  <ProgressItem
                    phase={flow.pairingPhase}
                    targetPhase="success"
                    label={t('onboarding.page.walletCreated')}
                    isLast
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══════ Step 3: Success ═══════ */}
          {step === 'success' && (
            <div ref={confettiRef} className="flex flex-col items-center relative">
              {/* Check icon */}
              <div className="w-16 h-16 rounded-2xl bg-[rgba(34,197,94,0.1)] border-2 border-[rgba(34,197,94,0.2)] flex items-center justify-center mb-5 animate-scale-in">
                <CheckCircle className="w-8 h-8 text-[#22c55e]" />
              </div>

              <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-3 text-center">
                {t('onboarding.page.successTitle')}
              </h1>
              <p className="font-['Inter',sans-serif] text-[15px] text-[#999] mb-8 text-center max-w-[400px]">
                {t('onboarding.page.successSubtitle')}
              </p>

              {/* Wallet ↔ Agent info */}
              <div className="w-full max-w-[420px] rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-white overflow-hidden mb-8">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(79,94,255,0.08)] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-[#4f5eff]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#9a9a9a] uppercase tracking-wider block mb-0.5">
                      {t('onboarding.success.walletId')}
                    </span>
                    <code className="font-['JetBrains_Mono',monospace] text-[13px] text-[#0a0a0a] break-words leading-snug">
                      {flow.walletId}
                    </code>
                  </div>
                </div>
                <div className="flex items-center px-4">
                  <div className="flex-1 h-px bg-[rgba(10,10,10,0.06)]" />
                  <div className="flex items-center gap-1.5 px-3">
                    <div className="w-4 h-4 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                      <Link2 className="w-2.5 h-2.5 text-[#22c55e]" />
                    </div>
                    <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#22c55e]">
                      {t('onboarding.success.linked')}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-[rgba(10,10,10,0.06)]" />
                </div>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(245,158,11,0.08)] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-[#f59e0b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#9a9a9a] uppercase tracking-wider block mb-0.5">
                      {t('onboarding.success.agentId')}
                    </span>
                    <code className="font-['JetBrains_Mono',monospace] text-[13px] text-[#0a0a0a] break-words leading-snug">
                      {flow.agentId}
                    </code>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleTryCta}
                className="w-full max-w-[420px] h-[48px] rounded-[12px] font-['Inter',sans-serif] font-medium text-[15px] text-white bg-[#4f5eff] hover:bg-[#3d4dd9] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <span className="relative z-10">{t('onboarding.page.tryCta')}</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
