import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  if (compact) {
    return (
      <span className="flex items-center gap-[4px]">
        <Globe className="w-3 h-3 text-[#4f4f4f]" />
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#0a0a0a]">
          {language === 'zh' ? 'ZH' : 'EN'}
        </span>
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center bg-white border border-[rgba(10,10,10,0.08)] rounded-[6px] px-3 py-2 hover:bg-[#fafafa] transition-colors"
    >
      <Globe className="w-4 h-4 text-[#4f4f4f] mr-2" />
      <span className="text-sm font-medium text-[#0a0a0a]">
        {language === 'zh' ? '中文' : 'English'}
      </span>
    </button>
  );
}
