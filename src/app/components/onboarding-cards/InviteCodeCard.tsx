import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InviteCodeCardProps {
  status: 'active' | 'completed' | 'disabled';
  onVerify: (code: string) => Promise<void>;
  error?: string;
  verifiedCode?: string;
}

export default function InviteCodeCard({ status, onVerify, error, verifiedCode }: InviteCodeCardProps) {
  const { t, language } = useLanguage();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);

  const formatCode = (raw: string) => {
    // Strip non-alphanumeric, auto-insert dash after 4 chars
    const clean = raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    if (clean.length > 4) return clean.slice(0, 4) + '-' + clean.slice(4);
    return clean;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(formatCode(e.target.value));
  };

  const isCodeComplete = code.replace(/-/g, '').length === 8;

  const handleVerify = async () => {
    if (!isCodeComplete) return;
    setValidating(true);
    await onVerify(code);
    setValidating(false);
  };

  if (status === 'completed') {
    return (
      <div className="bg-[var(--app-card-bg)] border border-[rgba(34,197,94,0.3)] rounded-[8px] p-4 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center transition-transform duration-300 scale-100">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className="font-medium text-[13px] text-[#22c55e]">
            {t('onboarding.chat.inviteVerified')}
          </span>
        </div>
        <div className="rounded-[8px] bg-[var(--app-bg)] border border-[rgba(10,10,10,0.06)] px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-0.5">
              {language === 'zh' ? '邀请码' : 'Invite Code'}
            </div>
            <code className="font-['JetBrains_Mono',monospace] text-[13px] text-[var(--app-text)] font-medium">
              COBO-{verifiedCode}
            </code>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-0.5">
              {language === 'zh' ? '状态' : 'Status'}
            </div>
            <span className="text-[12px] font-medium text-[#22c55e]">
              {language === 'zh' ? '已验证' : 'Verified'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'disabled') {
    return (
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[8px] p-4 transition-all duration-300 opacity-50">
        <div className="mb-3">
          <div className="flex items-center w-full h-[48px] bg-[var(--app-bg)] border border-[rgba(10,10,10,0.06)] rounded-[8px] overflow-hidden">
            <span className="font-['JetBrains_Mono',monospace] font-medium text-[15px] text-[#999] pl-3.5 pr-0.5 flex-shrink-0 select-none">
              COBO-
            </span>
            <input
              type="text"
              disabled
              placeholder="0000-0000"
              className="flex-1 h-full bg-transparent font-['JetBrains_Mono',monospace] font-normal text-[15px] text-[#999] placeholder:text-[var(--app-text-secondary)] focus:outline-none pr-3 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[12px] text-[#999] font-medium">
            {language === 'zh' ? '已在对话中输入' : 'Code entered in chat'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[8px] p-4 transition-all duration-300">
      {/* Input */}
      <div className="mb-3">
        <div className={`flex items-center w-full h-[44px] bg-[var(--app-card-bg)] border rounded-[8px] overflow-hidden transition-colors ${
          error
            ? 'border-[#ef4444] shadow-[0px_2px_12px_0px_rgba(239,68,68,0.08)]'
            : 'border-[var(--app-border-medium)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)]'
        }`}>
          <span className="font-['JetBrains_Mono',monospace] font-medium text-[13px] lg:text-[15px] text-[var(--app-accent)] pl-3.5 pr-0.5 flex-shrink-0 select-none">
            COBO-
          </span>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
            placeholder="0000-0000"
            maxLength={9}
            className="flex-1 h-full bg-transparent font-['JetBrains_Mono',monospace] font-normal text-[13px] lg:text-[15px] text-[var(--app-text)] placeholder:text-[var(--app-text-secondary)] focus:outline-none pr-3"
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-2 px-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0" />
            <span className="font-normal text-[12px] text-[#ef4444]">
              {t(error)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleVerify}
          disabled={!isCodeComplete || validating}
          className="flex-1 flex items-center justify-center gap-2 h-[44px] rounded-[8px] font-medium text-[14px] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)]"
        >
          {validating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t('onboarding.inviteNext')
          )}
        </button>
        <a
          href="https://cobo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[12px] text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] transition-colors whitespace-nowrap"
        >
          {t('onboarding.getInviteCode')}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
