import { useState, useEffect } from 'react';
import { Copy, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SetupCommandCardProps {
  command: string;
  inviteCode?: string;
  timeRemaining: number;
  onCopy: () => void;
  onRefresh: () => void;
  status: 'active' | 'copied';
}

export default function SetupCommandCard({ command, inviteCode, timeRemaining, onCopy, onRefresh, status }: SetupCommandCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'copied') setCopied(true);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    const onSuccess = () => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(command).then(onSuccess).catch(() => {
        // fallback
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

  // Render command with highlighted invite code
  const renderCommand = () => {
    if (inviteCode) {
      const marker = `--COBO-${inviteCode}`;
      const idx = command.indexOf(marker);
      if (idx !== -1) {
        return (
          <>
            {command.slice(0, idx)}
            <span className="bg-[rgba(245,158,11,0.18)] text-[#b45309] rounded px-0.5">{marker}</span>
            {command.slice(idx + marker.length)}
          </>
        );
      }
    }
    return command;
  };

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[rgba(10,10,10,0.06)]">
        <span className="font-['Inter',sans-serif] text-[12px]">
          <span className="text-[#7c7c7c]">{t('onboarding.validTime')}: </span>
          <span className={`font-semibold tabular-nums text-[13px] ${timeRemaining < 300 ? 'text-[#ef4444]' : 'text-[#4f5eff]'}`}>
            {formatTime(timeRemaining)}
          </span>
        </span>
        {timeRemaining <= 0 && (
          <button onClick={onRefresh} className="flex items-center gap-1 text-[12px] text-[#4f5eff] hover:text-[#3d4dd9]">
            <RefreshCw className="w-3 h-3" />
            {t('onboarding.regenerate')}
          </button>
        )}
      </div>

      {/* Command */}
      <div className="bg-[#f5f5f7] p-4">
        <pre className="font-['Inter',sans-serif] font-normal text-[13px] text-[#333333] leading-[20px] whitespace-pre-wrap break-words">
          {renderCommand()}
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
