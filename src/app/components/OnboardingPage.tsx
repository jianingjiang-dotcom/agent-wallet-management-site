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
    <div className="h-[24px] relative w-[226px]">
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
