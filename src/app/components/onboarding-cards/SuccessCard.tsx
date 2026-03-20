import { useRef, useEffect, useState } from 'react';
import { CheckCircle, Shield, Zap, Link2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { launchConfetti } from '../../utils/confetti';

interface SuccessCardProps {
  walletId: string;
  agentId: string;
  onComplete: () => void;
  completed?: boolean;
}

export default function SuccessCard({ walletId, agentId, onComplete, completed }: SuccessCardProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimated(true), 100);
    const t2 = setTimeout(() => {
      if (containerRef.current) launchConfetti(containerRef.current);
    }, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div ref={containerRef} className="bg-white border border-[rgba(34,197,94,0.2)] rounded-[12px] p-5 relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <div
          className={`inline-flex items-center justify-center w-12 h-12 bg-[rgba(34,197,94,0.1)] border-2 border-[rgba(34,197,94,0.2)] rounded-2xl mb-3 transition-transform duration-500 ${
            animated ? 'scale-100' : 'scale-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <CheckCircle className="w-6 h-6 text-[#22c55e]" />
        </div>
        <h3 className="font-['Inter',sans-serif] font-semibold text-[18px] text-[#0a0a0a]">
          {t('onboarding.success.title')}
        </h3>
      </div>

      {/* Wallet ↔ Agent */}
      <div className="rounded-[10px] border border-[rgba(10,10,10,0.08)] bg-[#FAFAFA] overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="w-8 h-8 rounded-[8px] bg-[rgba(79,94,255,0.08)] flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-[#4f5eff]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#9a9a9a] uppercase tracking-wider block mb-0.5">
              {t('onboarding.success.walletId')}
            </span>
            <code className="font-['JetBrains_Mono',monospace] text-[12px] text-[#0a0a0a] break-words leading-snug">
              {walletId}
            </code>
          </div>
        </div>
        <div className="flex items-center px-3.5">
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
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="w-8 h-8 rounded-[8px] bg-[rgba(245,158,11,0.08)] flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#9a9a9a] uppercase tracking-wider block mb-0.5">
              {t('onboarding.success.agentId')}
            </span>
            <code className="font-['JetBrains_Mono',monospace] text-[12px] text-[#0a0a0a] break-words leading-snug">
              {agentId}
            </code>
          </div>
        </div>
      </div>

      {/* CTA — hidden after completion */}
      {!completed && (
        <button
          onClick={onComplete}
          className="w-full bg-[#4f5eff] hover:bg-[#3d4dd9] h-[40px] rounded-[8px] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] relative overflow-hidden group"
        >
          <span className="font-['Inter',sans-serif] font-medium text-[13px] text-white relative z-10">
            {t('onboarding.chat.startChatting')}
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </button>
      )}
    </div>
  );
}
