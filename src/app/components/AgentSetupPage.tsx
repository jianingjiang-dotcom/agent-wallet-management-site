import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import svgPaths from '../../imports/svg-zu39gs7vho';

type SetupPhase = 'idle' | 'connecting' | 'connected' | 'creating' | 'done';

export default function AgentSetupPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [phase, setPhase] = useState<SetupPhase>('idle');
  const startedRef = useRef(false);

  useEffect(() => {
    if (phase === 'done') {
      navigate('/setup-success');
    }
  }, [phase, navigate]);

  const instructionText = t('setupPage.instructionText');

  const startSetupSequence = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    // 3s after copy → show "connecting agent"
    setTimeout(() => setPhase('connecting'), 3000);
    // 3s + 5s = 8s → agent connected
    setTimeout(() => setPhase('connected'), 8000);
    // 8s + brief pause → show "creating wallet"
    setTimeout(() => setPhase('creating'), 8500);
    // 8.5s + 5s = 13.5s → wallet created
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
    setToast(t('setupPage.copied'));
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
    startSetupSequence();
  };

  const showStatus = phase !== 'idle';
  const agentDone = phase === 'connected' || phase === 'creating' || phase === 'done';
  const walletLoading = phase === 'creating';
  const walletDone = phase === 'done';

  return (
    <div className="min-h-screen bg-[#F8F9FC] relative">
      {/* Success toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#F0FDF4] border border-[#BBF7D0] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          onTransitionEnd={() => { if (!toastVisible) setToast(''); }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#22C55E"/><path d="M5.5 8L7 9.5L10.5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[14px] leading-[20px] text-[#166534] font-medium">{toast}</span>
        </div>
      )}
      {/* Logo */}
      <div className="absolute top-0 left-0 px-6 py-[23px]">
        <div className="h-[18px] w-[172px] relative shrink-0">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 188.538 19.9998">
            <g>
              <path d={svgPaths.p12420d80} fill="#1C1C1C" />
              <path d={svgPaths.p19bafe80} fill="#1C1C1C" />
              <path d={svgPaths.p161a0400} fill="#1C1C1C" />
              <path d={svgPaths.p3456db00} fill="#1C1C1C" />
              <path d={svgPaths.p5983200} fill="#1C1C1C" />
              <path d={svgPaths.p35ddbb80} fill="#1C1C1C" />
              <path d={svgPaths.p192f4b80} fill="#4F5EFF" />
              <path d={svgPaths.p2c193100} fill="#4F5EFF" />
              <path d={svgPaths.p357a0d00} fill="#4F5EFF" />
              <path d={svgPaths.p26dee800} fill="#4F5EFF" />
              <path d={svgPaths.pf8ab380} fill="#4F5EFF" />
              <path d={svgPaths.p25b8a100} fill="#4F5EFF" />
              <path d={svgPaths.p1a427e00} fill="#4F5EFF" />
              <path d={svgPaths.p37c6db00} fill="#1C1C1C" />
              <path d={svgPaths.p16c2cc00} fill="#1C1C1C" />
              <path d={svgPaths.p2ed1f700} fill="#1C1C1C" />
              <path d={svgPaths.p123d8680} fill="#1C1C1C" />
            </g>
          </svg>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex justify-center">
        <div className="flex flex-col items-start w-[480px] gap-8 mt-[152px]">
          {/* Title */}
          <h1 className="w-full font-medium text-[28px] leading-[42px] text-left text-[#1C1C1C]">
            {t('setupPage.title')}
          </h1>

          {/* Instruction section */}
          <div className="flex flex-col items-start gap-3 w-full">
            {/* "Tell your Agent:" label */}
            <p className="text-[16px] leading-[26px] text-[#1C1C1C]">
              {t('setupPage.tellAgent')}
            </p>

            {/* Code block + copy button */}
            <div className="flex flex-col items-start gap-6 w-full">
              {/* Dashed code block */}
              <div className="w-full p-4 bg-white border border-dashed border-[#B9BCC5] rounded-[14px]">
                <p className="text-[14px] leading-[20px] text-[#73798B] whitespace-pre-line">
                  {instructionText}
                </p>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="w-full h-[54px] px-6 py-4 bg-[#4F5EFF] hover:bg-[#3d4dd9] rounded-[14px] text-[16px] leading-[22px] font-medium text-white text-center uppercase transition-colors"
              >
                {t('setupPage.copyButton')}
              </button>
            </div>
          </div>

          {/* Help link */}
          <div className="flex items-center gap-1">
            <span className="text-[16px] leading-[26px] text-[#1C1C1C]">
              {t('setupPage.helpPrefix')}
            </span>
            <a
              href="https://www.cobo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[16px] leading-[26px] font-medium text-[#4F5EFF] underline hover:text-[#3d4dd9] transition-colors"
            >
              {t('setupPage.helpLink')}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 2.5H17.5V7.5" stroke="#4F5EFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.333 11.667L17.5 2.5" stroke="#4F5EFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 10.833V15.833C15 16.275 14.824 16.699 14.512 17.012C14.199 17.324 13.775 17.5 13.333 17.5H4.167C3.725 17.5 3.301 17.324 2.988 17.012C2.676 16.699 2.5 16.275 2.5 15.833V6.667C2.5 6.225 2.676 5.801 2.988 5.488C3.301 5.176 3.725 5 4.167 5H9.167" stroke="#4F5EFF" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Divider + Status section — only shown after copy */}
          {showStatus && (
            <div className="flex flex-col items-start gap-4 w-full">
              <div className="w-full h-px bg-[#EDEEF3]" />
              <div className="flex flex-col items-start gap-4 w-full">
                {/* Step 1: Agent connection */}
                <div className="flex items-center gap-2">
                  {agentDone ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" fill="#26C165" stroke="#26C165" strokeWidth="1.25" />
                      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#73798B" strokeWidth="1.25" strokeDasharray="14 42" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className={`text-[16px] leading-[24px] ${agentDone ? 'text-[#2C2F33]' : 'text-[#73798B]'}`}>
                    {agentDone ? t('setupPage.agentConnected') : t('setupPage.connectingAgent')}
                  </span>
                </div>

                {/* Step 2: Wallet creation — only shown after agent is connected */}
                {(walletLoading || walletDone) && (
                  <div className="flex items-center gap-2">
                    {walletDone ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" fill="#26C165" stroke="#26C165" strokeWidth="1.25" />
                        <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="#73798B" strokeWidth="1.25" strokeDasharray="14 42" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={`text-[16px] leading-[24px] ${walletDone ? 'text-[#2C2F33]' : 'text-[#73798B]'}`}>
                      {walletDone ? t('setupPage.walletCreated') : t('setupPage.creatingWallet')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
