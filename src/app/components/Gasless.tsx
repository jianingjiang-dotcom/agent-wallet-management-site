import { Fuel } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Gasless() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-1">
          {t('gasAccount.title')}
        </h1>
        <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#7c7c7c]">
          {t('gasAccount.subtitle')}
        </p>
      </div>

      <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[16px] flex flex-col items-center justify-center py-20 px-8">
        <div className="w-[72px] h-[72px] rounded-[20px] bg-[rgba(79,94,255,0.08)] border-2 border-[rgba(79,94,255,0.12)] flex items-center justify-center mb-6">
          <Fuel className="w-9 h-9 text-[#4f5eff]" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(79,94,255,0.08)] mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f5eff] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f5eff]" />
          </span>
          <span className="font-['Inter',sans-serif] font-medium text-[12px] text-[#4f5eff]">
            {t('gasAccount.comingSoonBadge')}
          </span>
        </div>
        <h2 className="font-['Inter',sans-serif] font-semibold text-[20px] text-[#0a0a0a] mb-2">
          {t('gasAccount.comingSoonTitle')}
        </h2>
        <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#7c7c7c] text-center max-w-md leading-relaxed">
          {t('gasAccount.comingSoonDesc')}
        </p>
      </div>
    </div>
  );
}
