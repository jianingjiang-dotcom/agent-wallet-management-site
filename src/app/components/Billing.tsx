import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Billing() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="hidden lg:block mb-6">
        <h1 className="font-semibold text-[24px] text-[#0A0A0A] mb-1">{t('billing.title')}</h1>
        <p className="font-normal text-[15px] text-[#7C7C7C]">{t('billing.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 sm:p-12 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 lg:w-20 lg:h-20 bg-[#EEF0FF] rounded-xl lg:rounded-2xl mb-4 lg:mb-6">
          <Calendar className="w-7 h-7 lg:w-10 lg:h-10 text-[#1F32D6]" strokeWidth={1.5} />
        </div>

        <h2 className="text-[16px] font-semibold text-[#0A0A0A] mb-3">{t('billing.comingSoon')}</h2>
        <p className="text-[13px] text-[#7C7C7C] max-w-md mx-auto mb-6">
          {t('billing.comingSoonDesc')}
        </p>

        <div className="bg-[#FAFAFA] rounded-xl p-5 max-w-lg mx-auto">
          <div className="flex items-center justify-center text-[#4F4F4F] mb-3">
            <Clock className="w-4 h-4 mr-2" strokeWidth={1.5} />
            <span className="font-medium text-[14px]">{t('billing.expectedFeatures')}</span>
          </div>
          <ul className="space-y-2 text-[13px] text-[#7C7C7C] text-left">
            <li className="flex items-start">
              <span className="text-[#1F32D6] mr-2">•</span>
              <span>{t('billing.feature1')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#1F32D6] mr-2">•</span>
              <span>{t('billing.feature2')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#1F32D6] mr-2">•</span>
              <span>{t('billing.feature3')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-[#1F32D6] mr-2">•</span>
              <span>{t('billing.feature4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
