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
        <Globe className="w-3 h-3 text-[var(--app-text-secondary)]" />
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text)]">
          {language === 'zh' ? 'ZH' : 'EN'}
        </span>
      </span>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[6px] px-3 py-2 hover:bg-[var(--app-hover-bg)] transition-colors"
    >
      <Globe className="w-4 h-4 text-[var(--app-text-secondary)] mr-2" />
      <span className="text-sm font-medium text-[var(--app-text)]">
        {language === 'zh' ? '中文' : 'English'}
      </span>
    </button>
  );
}
