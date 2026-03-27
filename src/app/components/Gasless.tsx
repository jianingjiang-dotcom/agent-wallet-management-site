import { Fuel } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Gasless({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="hidden lg:block mb-6">
        <h1 className="font-semibold text-[24px] text-[var(--app-text)] mb-1">
          {t('gasAccount.title')}
        </h1>
        <p className="font-normal text-[15px] text-[var(--app-text-secondary)]">
          {t('gasAccount.subtitle')}
        </p>
      </div>

      <div className={`${compact ? '' : 'bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[16px] shadow-sm'} flex flex-col items-center justify-center py-8 lg:py-16 px-6`}>
        <div className="w-[56px] h-[56px] lg:w-[72px] lg:h-[72px] rounded-[14px] bg-[var(--app-suggestion-bg)] flex items-center justify-center mb-5">
          <Fuel className="w-7 h-7 lg:w-9 lg:h-9 text-[var(--app-accent)]" strokeWidth={1.5} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(79,94,255,0.08)] mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--app-accent)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--app-accent)]" />
          </span>
          <span className="font-medium text-[12px] text-[var(--app-accent)]">
            {t('gasAccount.comingSoonBadge')}
          </span>
        </div>
        <h2 className="font-semibold text-[16px] text-[var(--app-text)] mb-2">
          {t('gasAccount.comingSoonTitle')}
        </h2>
        <p className="font-normal text-[13px] text-[var(--app-text-secondary)] text-center max-w-md leading-relaxed">
          {t('gasAccount.comingSoonDesc')}
        </p>
      </div>
    </div>
  );
}
