import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Billing() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-1">{t('billing.title')}</h1>
        <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#7c7c7c]">{t('billing.subtitle')}</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-12 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl mb-6">
          <Calendar className="w-10 h-10 text-amber-700" />
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">{t('billing.comingSoon')}</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-8">
          {t('billing.comingSoonDesc')}
        </p>

        <div className="bg-slate-50 rounded-xl p-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center text-slate-700 mb-4">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">{t('billing.expectedFeatures')}</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600 text-left">
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
