import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { launchConfetti } from '../utils/confetti';
import { useWalletStore } from '../hooks/useWalletStore';

export default function SetupSuccessPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { addWalletWithAgent, hasWallets } = useWalletStore();
  const [exiting, setExiting] = useState(false);

  const resultRef = useRef<{ walletId: string; agentId: string } | null>(null);

  // Create wallet on mount so we can display the IDs
  if (!resultRef.current) {
    if (!hasWallets) {
      const result = addWalletWithAgent({
        walletName: 'My Cobo Pact Wallet',
        agentName: 'Agent #1',
      });
      resultRef.current = { walletId: result.wallet.id, agentId: result.agent.id };
    } else {
      resultRef.current = { walletId: '-', agentId: '-' };
    }
  }

  const handleGetStarted = () => {
    setExiting(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) launchConfetti(containerRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[var(--app-bg)] relative ${exiting ? 'animate-page-exit' : 'animate-page-enter'}`}
      onAnimationEnd={() => { if (exiting) navigate('/dashboard/chat?welcome=wallet-ready'); }}
    >
      {/* Logo */}
      <div className="absolute top-0 left-0 px-6 py-[23px]">
        <span className="text-[18px] font-semibold leading-none whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="text-[var(--app-text)]">Cobo </span>
          <span className="text-[var(--app-accent)]">Pact</span>
        </span>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-[80px]">
        {/* Animated success icon — placeholder for future Lottie animation */}
        <div className="mb-8">
          <div className="w-[120px] h-[120px] rounded-full bg-[#F0FDF4] flex items-center justify-center animate-[scaleIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="28" fill="#26C165" />
              <path
                d="M18 30L26 38L42 22"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-[drawCheck_0.4s_0.3s_ease-out_forwards]"
                style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-medium text-[28px] leading-[42px] text-[var(--app-text)] text-center mb-6">
          {t('setupSuccess.title')}
        </h1>

        {/* Wallet & Agent ID card */}
        {resultRef.current && (
          <div className="w-[480px] max-w-full mb-10 p-5 bg-[var(--app-card-bg)] rounded-[16px] border border-[var(--app-border-medium)] shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] leading-[20px] text-[var(--app-text-secondary)]">Wallet ID</span>
                <span className="text-[14px] leading-[20px] text-[var(--app-text)] font-mono font-medium">{resultRef.current.walletId}</span>
              </div>
              <div className="w-full h-px bg-[var(--app-border-medium)]" />
              <div className="flex items-center justify-between">
                <span className="text-[14px] leading-[20px] text-[var(--app-text-secondary)]">Agent ID</span>
                <span className="text-[14px] leading-[20px] text-[var(--app-text)] font-mono font-medium">{resultRef.current.agentId}</span>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="w-[480px] max-w-full h-[54px] px-6 py-4 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] rounded-[16px] text-[16px] leading-[22px] font-medium text-white text-center transition-all duration-150 active:scale-[0.98]"
        >
          {t('setupSuccess.button')}
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
