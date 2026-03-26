import { Shield, ArrowRight, MapPin, Coins, Clock, Fuel, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { Policy } from '../hooks/useWalletStore';

interface PolicyPanelProps {
  policy: Policy;
  disabled?: boolean;
}

export default function PolicyPanel({ policy, disabled }: PolicyPanelProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const advancedItems = [
    { icon: MapPin, key: 'policy.advancedItem1' },
    { icon: Coins, key: 'policy.advancedItem2' },
    { icon: Clock, key: 'policy.advancedItem3' },
    { icon: Fuel, key: 'policy.advancedItem4' },
    { icon: FileCode, key: 'policy.advancedItem5' },
  ] as const;

  if (disabled) {
    return (
      <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6 mb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#b0b0b0]" />
          <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
            {t('policyPanel.title')}
          </h2>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-12 h-12 rounded-full bg-[#fafafa] flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#d4d4d4]" />
          </div>
          <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#7c7c7c] mb-1">
            {t('permissions.needAgent')}
          </span>
          <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
            {t('policy.emptyStateDesc')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-[#1F32D6]" />
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
          {t('policyPanel.title')}
        </h2>
      </div>
      <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] mb-5">
        {t('policy.currentConfig')}
      </p>

      {/* Area A: Read-only metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Per-tx limit */}
        <div className="bg-[#fafafa] rounded-[8px] p-4 text-center">
          <div className="font-['Inter',sans-serif] font-semibold text-[22px] text-[#0a0a0a] mb-1">
            ${policy.singleTxLimit}
          </div>
          <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider">
            {t('policy.perTxLimit')}
          </div>
        </div>

        {/* Daily limit */}
        <div className="bg-[#fafafa] rounded-[8px] p-4 text-center">
          <div className="font-['Inter',sans-serif] font-semibold text-[22px] text-[#0a0a0a] mb-1">
            ${policy.dailyLimit}
          </div>
          <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider">
            {t('policy.dailyLimitLabel')}
          </div>
        </div>

        {/* Approval status */}
        <div className="bg-[#fafafa] rounded-[8px] p-4 text-center">
          <div className={`font-['Inter',sans-serif] font-semibold text-[16px] mb-1 ${
            policy.approvalRequired ? 'text-[#22c55e]' : 'text-[#b0b0b0]'
          }`}>
            {policy.approvalRequired ? t('policy.approvalOn') : t('policy.approvalOff')}
          </div>
          <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider">
            {t('policy.approvalLabel')}
          </div>
        </div>
      </div>

      {/* Area B: Advanced config guide */}
      <div className="rounded-[8px] bg-gradient-to-br from-[rgba(79,94,255,0.04)] to-[rgba(79,94,255,0.08)] border border-[rgba(79,94,255,0.1)] p-5">
        <h3 className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#0a0a0a] mb-2">
          {t('policy.advancedTitle')}
        </h3>
        <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] mb-3 leading-relaxed">
          {t('policy.advancedDesc')}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          {advancedItems.map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-[#1F32D6] shrink-0" />
              <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#4F4F4F]">
                {t(key)}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard/chat')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#1F32D6] hover:bg-[#2837d0] text-white font-['Inter',sans-serif] font-medium text-[13px] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
        >
          {t('policy.goToChat')}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
