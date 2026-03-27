import { useState, useEffect } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { launchConfetti } from '../../utils/confetti';

export type PairingPhase = 'waiting' | 'connected' | 'configuring' | 'done';

interface SetupCommandCardProps {
  command: string;
  onCopy: () => void;
  status: 'active' | 'copied';
  pairingPhase?: PairingPhase | null;
}

export default function SetupCommandCard({ command, onCopy, status, pairingPhase }: SetupCommandCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'copied') setCopied(true);
  }, [status]);

  // Launch confetti on done
  useEffect(() => {
    if (pairingPhase === 'done') {
      const tid = setTimeout(() => {
        const el = document.querySelector('[data-setup-card]');
        if (el) launchConfetti(el as HTMLElement);
      }, 400);
      return () => clearTimeout(tid);
    }
  }, [pairingPhase]);

  const handleCopy = () => {
    const onSuccess = () => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(command).then(onSuccess).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = command;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); onSuccess(); } catch { /* noop */ }
        document.body.removeChild(ta);
      });
    }
  };

  const showOverlay = !!pairingPhase;
  const agentDone = pairingPhase === 'configuring' || pairingPhase === 'done';
  const walletLoading = pairingPhase === 'configuring';
  const walletDone = pairingPhase === 'done';

  return (
    <div data-setup-card className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] overflow-hidden transition-all duration-300">
      {/* Command area with overlay */}
      <div className="relative">
        <div className="bg-[var(--app-bg)] p-4">
          <pre className="font-normal text-[13px] text-[var(--app-text)] leading-[20px] whitespace-pre-wrap break-words">
            {command}
          </pre>
        </div>

        {/* Pairing status overlay */}
        {showOverlay && (
          <div
            className="absolute inset-0 rounded-t-[12px] flex flex-col items-center justify-center gap-3 z-10"
            style={{
              background: walletDone ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(2px)',
              animation: 'fadeIn 0.3s ease-out forwards',
            }}
          >
            {walletDone ? (
              <>
                <div
                  className="w-[48px] h-[48px] rounded-full bg-[#F0FDF4] flex items-center justify-center"
                  style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                >
                  <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
                    <circle cx="30" cy="30" r="28" fill="#26C165" />
                    <path
                      d="M18 30L26 38L42 22"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'drawCheck 0.4s 0.3s ease-out forwards' }}
                    />
                  </svg>
                </div>
                <span className="text-[14px] leading-[20px] font-medium text-[var(--app-text)]">
                  {t('setupSuccess.title')}
                </span>
              </>
            ) : (
              <>
                {/* Step 1: Agent connection */}
                <div className="flex items-center gap-2">
                  {agentDone ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="9" fill="#26C165" stroke="#26C165" strokeWidth="1.25" />
                      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="animate-spin flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#1F32D6" strokeWidth="1.25" strokeDasharray="14 42" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className={`text-[13px] leading-[18px] ${agentDone ? 'text-[#26C165] font-medium' : 'text-[#4F4F4F]'}`}>
                    {agentDone ? t('setupPage.agentConnected') : t('setupPage.connectingAgent')}
                  </span>
                </div>

                {/* Step 2: Wallet creation */}
                {(walletLoading || walletDone) && (
                  <div className="flex items-center gap-2" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
                    <svg className="animate-spin flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#1F32D6" strokeWidth="1.25" strokeDasharray="14 42" strokeLinecap="round" />
                    </svg>
                    <span className="text-[13px] leading-[18px] text-[#4F4F4F]">
                      {t('setupPage.creatingWallet')}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Copy button — hidden when done */}
      {!walletDone && (
        <div className="relative p-3 bg-[var(--app-card-bg)]">
          {showOverlay && (
            <div className="absolute inset-0 z-10" style={{ background: 'rgba(255,255,255,0.6)' }} />
          )}
          <button
            onClick={handleCopy}
            disabled={copied || showOverlay}
            className={`w-full flex items-center justify-center gap-2 h-[38px] rounded-[8px] font-medium text-[13px] transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] text-white ${
              copied ? 'bg-[#22c55e]' : 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-50'
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
      )}
    </div>
  );
}
