import { useState, useEffect } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SetupCommandCardProps {
  command: string;
  onCopy: () => void;
  status: 'active' | 'copied';
}

export default function SetupCommandCard({ command, onCopy, status }: SetupCommandCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'copied') setCopied(true);
  }, [status]);

  const handleCopy = () => {
    const onSuccess = () => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(command).then(onSuccess).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = command;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); onSuccess(); } catch { /* noop */ }
        document.body.removeChild(ta);
      });
    }
  };

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] overflow-hidden transition-all duration-300">
      {/* Command */}
      <div className="bg-[#f5f5f7] p-4">
        <pre className="font-['Inter',sans-serif] font-normal text-[13px] text-[#333333] leading-[20px] whitespace-pre-wrap break-words">
          {command}
        </pre>
      </div>

      {/* Copy button */}
      <div className="p-3 bg-white">
        <button
          onClick={handleCopy}
          disabled={copied}
          className={`w-full flex items-center justify-center gap-2 h-[38px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] text-white ${
            copied ? 'bg-[#22c55e]' : 'bg-[#4f5eff] hover:bg-[#3d4dd9]'
          }`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              {t('onboarding.copyPromptDone')}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {t('onboarding.copyPrompt')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
