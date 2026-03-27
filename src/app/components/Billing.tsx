import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Billing({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="hidden lg:block mb-6">
        <h1 className="font-semibold text-[24px] text-[var(--app-text)] mb-1">{t('billing.title')}</h1>
        <p className="font-normal text-[15px] text-[var(--app-text-secondary)]">{t('billing.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <div className={`${compact ? '' : 'bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-2xl shadow-sm'} p-6 sm:p-12 text-center`}>
        <div className="inline-flex items-center justify-center w-14 h-14 lg:w-20 lg:h-20 bg-[var(--app-suggestion-bg)] rounded-xl lg:rounded-2xl mb-4 lg:mb-6">
          <Calendar className="w-7 h-7 lg:w-10 lg:h-10 text-[var(--app-accent)]" strokeWidth={1.5} />
        </div>

        <h2 className="text-[16px] font-semibold text-[var(--app-text)] mb-3">{t('billing.comingSoon')}</h2>
        <p className="font-normal text-[13px] text-[var(--app-text-secondary)] max-w-md mx-auto mb-6">
          {t('billing.comingSoonDesc')}
        </p>

        <div className="bg-[var(--app-bg)] rounded-xl p-5 max-w-lg mx-auto">
          <div className="flex items-center justify-center text-[var(--app-text-secondary)] mb-3">
            <Clock className="w-4 h-4 mr-2" strokeWidth={1.5} />
            <span className="font-medium text-[14px]">{t('billing.expectedFeatures')}</span>
          </div>
          <ul className="space-y-2 text-[13px] text-[var(--app-text-secondary)] text-left">
            <li className="flex items-start">
              <span className="text-[var(--app-accent)] mr-2">•</span>
              <span>{t('billing.feature1')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--app-accent)] mr-2">•</span>
              <span>{t('billing.feature2')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--app-accent)] mr-2">•</span>
              <span>{t('billing.feature3')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[var(--app-accent)] mr-2">•</span>
              <span>{t('billing.feature4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
