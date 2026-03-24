import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { launchConfetti } from '../utils/confetti';
import { useWalletStore } from '../hooks/useWalletStore';
import svgPaths from '../../imports/svg-zu39gs7vho';

export default function SetupSuccessPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { addWalletWithAgent, hasWallets } = useWalletStore();

  const handleGetStarted = () => {
    if (!hasWallets) {
      addWalletWithAgent({
        walletName: 'My Agentic Wallet',
        agentName: 'Agent #1',
      });
    }
    navigate('/dashboard/chat?welcome=wallet-ready');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) launchConfetti(containerRef.current);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8F9FC] relative">
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
        <h1 className="font-medium text-[28px] leading-[42px] text-[#1C1C1C] text-center mb-10">
          {t('setupSuccess.title')}
        </h1>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="w-[480px] max-w-full h-[54px] px-6 py-4 bg-[#4F5EFF] hover:bg-[#3d4dd9] rounded-[14px] text-[16px] leading-[22px] font-medium text-white text-center transition-colors"
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
