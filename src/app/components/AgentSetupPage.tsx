import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { launchConfetti } from '../utils/confetti';
import { useWalletStore } from '../hooks/useWalletStore';

type SetupPhase = 'idle' | 'connecting' | 'connected' | 'creating' | 'done';

export default function AgentSetupPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addWalletWithAgent, hasWallets } = useWalletStore();
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [phase, setPhase] = useState<SetupPhase>('idle');
  const [copied, setCopied] = useState(false);
  const [exiting, setExiting] = useState(false);
  const startedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiFiredRef = useRef(false);

  const instructionText = t('setupPage.instructionText');

  // Fire confetti & create wallet when done
  useEffect(() => {
    if (phase === 'done' && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      if (!hasWallets) {
        addWalletWithAgent({
          walletName: 'My Cobo Pact Wallet',
          agentName: 'Agent #1',
        });
      }
      setTimeout(() => {
        if (containerRef.current) launchConfetti(containerRef.current);
      }, 300);
    }
  }, [phase, hasWallets, addWalletWithAgent]);

  const startSetupSequence = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setTimeout(() => setPhase('connecting'), 3000);
    setTimeout(() => setPhase('connected'), 8000);
    setTimeout(() => setPhase('creating'), 8500);
    setTimeout(() => setPhase('done'), 13500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(instructionText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = instructionText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setToast(t('setupPage.copied'));
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    startSetupSequence();
  };

  const handleGetStarted = () => {
    setExiting(true);
  };

  const showOverlay = phase !== 'idle';
  const agentDone = phase === 'connected' || phase === 'creating' || phase === 'done';
  const walletLoading = phase === 'creating';
  const walletDone = phase === 'done';

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#F8F9FC] relative ${exiting ? 'animate-page-exit' : 'animate-page-enter'}`}
      onAnimationEnd={() => { if (exiting) navigate('/dashboard/chat?welcome=wallet-ready'); }}
    >
      {/* Success toast */}
      {toast && (
        <div
          className={`fixed left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#F0FDF4] border border-[#BBF7D0] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${toastVisible ? '' : 'opacity-0 pointer-events-none'}`}
          style={{
            animation: toastVisible ? 'toast-drop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'toast-drop-out 0.3s ease-in forwards',
          }}
          onAnimationEnd={() => { if (!toastVisible) setToast(''); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#22C55E"/><path d="M5.5 8L7 9.5L10.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[14px] leading-[20px] text-[#166534] font-medium">{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes toast-drop-in {
          0% { transform: translateX(-50%) translateY(-80px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; top: 24px; }
        }
        @keyframes toast-drop-out {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; top: 24px; }
          100% { transform: translateX(-50%) translateY(-80px); opacity: 0; top: 24px; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Logo */}
      <div className="absolute top-0 left-0 px-6 py-[23px]">
        <span className="text-[18px] font-semibold leading-none whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="text-[#1C1C1C]">Cobo </span>
          <span className="text-[#4F5EFF]">Pact</span>
        </span>
      </div>

      {/* Centered content */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center w-[480px] gap-8 -mt-[120px]">
          {/* Title + subtitle — always visible, never changes */}
          <div className="flex flex-col items-center gap-3 w-full">
            <h1 className="font-medium text-[28px] leading-[42px] text-center text-[#1C1C1C]">
              {t('setupPage.title')}
            </h1>
            <p className="text-[16px] leading-[26px] text-center text-[#73798B]">
              {t('setupPage.tellAgent')}
            </p>
          </div>

          {/* Instruction section */}
          <div className="flex flex-col items-start gap-6 w-full">
            {/* Dashed code block with overlay */}
            <div className="relative w-full">
              {/* Always-visible instruction text */}
              <div className="w-full p-4 bg-white border border-dashed border-[#B9BCC5] rounded-[16px]">
                <p className="text-[14px] leading-[20px] text-[#73798B] whitespace-pre-line">
                  {instructionText}
                </p>
              </div>

              {/* Status overlay — covers the instruction text */}
              {showOverlay && (
                <div
                  className="absolute inset-0 rounded-[16px] flex flex-col items-center justify-center gap-3 z-10"
                  style={{
                    background: walletDone
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(2px)',
                    animation: 'fadeIn 0.3s ease-out forwards',
                  }}
                >
                  {walletDone ? (
                    /* Success state */
                    <>
                      <div
                        className="w-[64px] h-[64px] rounded-full bg-[#F0FDF4] flex items-center justify-center"
                        style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                      >
                        <svg width="32" height="32" viewBox="0 0 60 60" fill="none">
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
                      <span className="text-[16px] leading-[24px] font-medium text-[#1C1C1C]">
                        {t('setupSuccess.title')}
                      </span>
                    </>
                  ) : (
                    /* Progress states */
                    <>
                      {/* Step 1: Agent connection */}
                      <div className="flex items-center gap-2">
                        {agentDone ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                            <circle cx="12" cy="12" r="9" fill="#26C165" stroke="#26C165" strokeWidth="1.25" />
                            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg className="animate-spin flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#4F5EFF" strokeWidth="1.25" strokeDasharray="14 42" strokeLinecap="round" />
                          </svg>
                        )}
                        <span className={`text-[14px] leading-[20px] ${agentDone ? 'text-[#26C165] font-medium' : 'text-[#73798B]'}`}>
                          {agentDone ? t('setupPage.agentConnected') : t('setupPage.connectingAgent')}
                        </span>
                      </div>

                      {/* Step 2: Wallet creation */}
                      {(walletLoading || walletDone) && (
                        <div className="flex items-center gap-2" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
                          <svg className="animate-spin flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#4F5EFF" strokeWidth="1.25" strokeDasharray="14 42" strokeLinecap="round" />
                          </svg>
                          <span className="text-[14px] leading-[20px] text-[#73798B]">
                            {t('setupPage.creatingWallet')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom area: button + help link, with mask when status is active but not done */}
            <div className="relative w-full flex flex-col items-center gap-6">
              {/* Grey mask over button area during progress (not when done) */}
              {showOverlay && !walletDone && (
                <div className="absolute inset-0 z-10 rounded-[16px]" style={{ background: 'rgba(248,249,252,0.6)' }} />
              )}

              {/* Button */}
              <button
                onClick={walletDone ? handleGetStarted : handleCopy}
                disabled={showOverlay && !walletDone}
                className={`w-full h-[54px] px-6 py-4 rounded-[16px] text-[16px] leading-[22px] font-medium text-white text-center transition-all duration-300 active:scale-[0.98] ${
                  walletDone
                    ? 'bg-[#4F5EFF] hover:bg-[#3d4dd9]'
                    : copied
                      ? 'bg-[#22C55E]'
                      : 'bg-[#4F5EFF] hover:bg-[#3d4dd9] disabled:hover:bg-[#4F5EFF]'
                }`}
              >
                {walletDone
                  ? t('setupSuccess.button')
                  : copied
                    ? '✓ ' + t('setupPage.copied')
                    : t('setupPage.copyButton')
                }
              </button>

              {/* Help link */}
              <a
                href="https://www.cobo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[14px] leading-[20px] font-medium text-[#4F5EFF] underline hover:text-[#3d4dd9] transition-colors"
              >
                {t('setupPage.helpLink')}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 2.5H17.5V7.5" stroke="#4F5EFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.333 11.667L17.5 2.5" stroke="#4F5EFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 10.833V15.833C15 16.275 14.824 16.699 14.512 17.012C14.199 17.324 13.775 17.5 13.333 17.5H4.167C3.725 17.5 3.301 17.324 2.988 17.012C2.676 16.699 2.5 16.275 2.5 15.833V6.667C2.5 6.225 2.676 5.801 2.988 5.488C3.301 5.176 3.725 5 4.167 5H9.167" stroke="#4F5EFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
