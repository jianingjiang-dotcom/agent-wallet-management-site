import { Loader2, CheckCircle, Wifi, Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

type Phase = 'waiting' | 'connected' | 'configuring' | 'success';

interface PairingStatusCardProps {
  phase: Phase;
}

const phaseConfig: Record<Phase, { icon: 'spinner' | 'wifi' | 'settings' | 'check'; colorClass: string }> = {
  waiting:     { icon: 'spinner',  colorClass: 'text-[#1F32D6]' },
  connected:   { icon: 'wifi',     colorClass: 'text-[#1F32D6]' },
  configuring: { icon: 'settings', colorClass: 'text-[#1F32D6]' },
  success:     { icon: 'check',    colorClass: 'text-[#22c55e]' },
};

export default function PairingStatusCard({ phase }: PairingStatusCardProps) {
  const { t } = useLanguage();
  const config = phaseConfig[phase];

  const renderIcon = () => {
    switch (config.icon) {
      case 'spinner': return <Loader2 className={`w-5 h-5 ${config.colorClass} animate-spin`} />;
      case 'wifi': return <Wifi className={`w-5 h-5 ${config.colorClass}`} />;
      case 'settings': return <Settings className={`w-5 h-5 ${config.colorClass} animate-spin`} style={{ animationDuration: '3s' }} />;
      case 'check': return <CheckCircle className={`w-5 h-5 ${config.colorClass}`} />;
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'waiting': return t('onboarding.waiting.waiting');
      case 'connected': return t('onboarding.waiting.connected');
      case 'configuring': return t('onboarding.waiting.configuring');
      case 'success': return t('onboarding.chat.pairingSuccess');
    }
  };

  return (
    <div className={`bg-white border rounded-[12px] p-4 transition-all duration-500 ${
      phase === 'success' ? 'border-[rgba(34,197,94,0.3)]' : 'border-[rgba(79,94,255,0.2)]'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
          phase === 'success' ? 'bg-[rgba(34,197,94,0.1)]' : 'bg-[rgba(79,94,255,0.08)]'
        }`}>
          {renderIcon()}
        </div>
        <span className="font-medium text-[14px] text-[#0A0A0A] transition-opacity duration-300">
          {getPhaseText()}
        </span>
      </div>

      {/* Progress dots */}
      {phase !== 'success' && (
        <div className="flex items-center gap-1.5 mt-3 pl-[52px]">
          {(['waiting', 'connected', 'configuring'] as const).map((p, i) => {
            const phases = ['waiting', 'connected', 'configuring'];
            const currentIdx = phases.indexOf(phase);
            return (
              <div
                key={p}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i <= currentIdx ? 'bg-[#1F32D6] w-6' : 'bg-[#EBEBEB] w-4'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
