import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface InviteCodeCardProps {
  status: 'active' | 'completed' | 'error';
  onVerify: (code: string) => Promise<void>;
  error?: string;
  verifiedCode?: string;
}

export default function InviteCodeCard({ status, onVerify, error, verifiedCode }: InviteCodeCardProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setValidating(true);
    await onVerify(code.trim());
    setValidating(false);
  };

  if (status === 'completed') {
    return (
      <div className="bg-white border border-[rgba(34,197,94,0.3)] rounded-[12px] p-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center transition-transform duration-300 scale-100">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#22c55e]">
              {t('onboarding.chat.inviteVerified')}
            </span>
            <code className="ml-2 font-['JetBrains_Mono',monospace] text-[13px] text-[#0a0a0a]">
              COBO-{verifiedCode}
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-4 transition-all duration-300">
      {/* Input */}
      <div className="mb-3">
        <div className={`flex items-center w-full h-[48px] bg-white border rounded-[10px] overflow-hidden transition-colors ${
          error
            ? 'border-[#ef4444] ring-2 ring-[rgba(239,68,68,0.15)]'
            : 'border-[rgba(79,94,255,0.3)] focus-within:ring-2 focus-within:ring-[rgba(79,94,255,0.2)] focus-within:border-[#4f5eff]'
        }`}>
          <span className="font-['JetBrains_Mono',monospace] font-medium text-[15px] text-[#4f5eff] pl-3.5 pr-0.5 flex-shrink-0 select-none">
            COBO-
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
            placeholder="0000-0000"
            className="flex-1 h-full bg-transparent font-['JetBrains_Mono',monospace] font-normal text-[15px] text-[#0a0a0a] placeholder:text-[#c0c0c0] focus:outline-none pr-3"
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-2 px-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0" />
            <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#ef4444]">
              {t(error)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleVerify}
          disabled={!code.trim() || validating}
          className="flex-1 flex items-center justify-center gap-2 h-[40px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-[#4f5eff] hover:bg-[#3d4dd9]"
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
          className="inline-flex items-center gap-0.5 font-['Inter',sans-serif] text-[12px] text-[#4f5eff] hover:text-[#3d4dd9] transition-colors whitespace-nowrap"
        >
          {t('onboarding.getInviteCode')}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
