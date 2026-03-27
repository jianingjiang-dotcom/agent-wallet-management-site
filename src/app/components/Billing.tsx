import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Billing() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-semibold text-[18px] lg:text-[24px] text-[#0A0A0A] mb-1">{t('billing.title')}</h1>
        <p className="font-normal text-[13px] lg:text-[15px] text-[#7C7C7C]">{t('billing.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 sm:p-12 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl lg:rounded-2xl mb-4 lg:mb-6">
          <Calendar className="w-7 h-7 lg:w-10 lg:h-10 text-[#F5A623]" strokeWidth={1.5} />
        </div>

        <h2 className="text-[16px] font-semibold text-[#0A0A0A] mb-3">{t('billing.comingSoon')}</h2>
        <p className="text-[#7C7C7C] max-w-md mx-auto mb-8">
          {t('billing.comingSoonDesc')}
        </p>

        <div className="bg-slate-50 rounded-xl p-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center text-[#4F4F4F] mb-4">
            <Clock className="w-5 h-5 mr-2" strokeWidth={1.5} />
            <span className="font-medium">{t('billing.expectedFeatures')}</span>
          </div>
          <ul className="space-y-2 text-[14px] text-[#7C7C7C] text-left">
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>{t('billing.feature1')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>{t('billing.feature2')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>{t('billing.feature3')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-600 mr-2">•</span>
              <span>{t('billing.feature4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
