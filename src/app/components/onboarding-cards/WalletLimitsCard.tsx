import { useState } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WalletLimitsCardProps {
  status: 'active' | 'completed';
  onConfirm: (perTx: string, daily: string) => void;
  confirmedPerTx?: string;
  confirmedDaily?: string;
}

export default function WalletLimitsCard({ status, onConfirm, confirmedPerTx, confirmedDaily }: WalletLimitsCardProps) {
  const { t, language } = useLanguage();
  const [perTxLimit, setPerTxLimit] = useState('10');
  const [dailyLimit, setDailyLimit] = useState('50');
  const [customPerTx, setCustomPerTx] = useState('');
  const [customDaily, setCustomDaily] = useState('');

  const getEffectivePerTx = () => perTxLimit === 'custom' ? customPerTx || '0' : perTxLimit;
  const getEffectiveDaily = () => dailyLimit === 'custom' ? customDaily || '0' : dailyLimit;

  const handleLimitChange = (type: 'perTx' | 'daily', value: string) => {
    if (type === 'perTx') { setPerTxLimit(value); setCustomPerTx(''); }
    else { setDailyLimit(value); setCustomDaily(''); }
  };

  const handleCustomChange = (type: 'perTx' | 'daily', value: string) => {
    if (type === 'perTx') { setCustomPerTx(value); setPerTxLimit('custom'); }
    else { setCustomDaily(value); setDailyLimit('custom'); }
  };

  if (status === 'completed') {
    return (
      <div className="bg-white border border-[rgba(34,197,94,0.3)] rounded-[12px] p-4 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#22c55e]">
            {language === 'zh' ? '风控策略已配置' : 'Risk policies configured'}
          </span>
        </div>
        <div className="rounded-[12px] bg-[#FAFAFA] border border-[rgba(10,10,10,0.06)] px-3.5 py-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#1F32D6]" />
              <span className="text-[12px] text-[#4F4F4F]">
                {language === 'zh' ? '单笔交易限额' : 'Per-Transaction Limit'}
              </span>
            </div>
            <span className="font-['JetBrains_Mono',monospace] text-[13px] font-medium text-[#0a0a0a]">
              ${confirmedPerTx}
            </span>
          </div>
          <div className="h-px bg-[rgba(10,10,10,0.06)]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#1F32D6]" />
              <span className="text-[12px] text-[#4F4F4F]">
                {language === 'zh' ? '每日支出限额' : 'Daily Spending Limit'}
              </span>
            </div>
            <span className="font-['JetBrains_Mono',monospace] text-[13px] font-medium text-[#0a0a0a]">
              ${confirmedDaily}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const RadioGroup = ({ name, options, value, onSelect, customValue, onCustomChange }: {
    name: string; options: string[]; value: string;
    onSelect: (v: string) => void; customValue: string; onCustomChange: (v: string) => void;
  }) => (
    <div className="flex items-center gap-2.5 flex-wrap">
      {options.map((val) => (
        <label key={val} className="flex items-center cursor-pointer">
          <input
            type="radio" name={name} value={val}
            checked={value === val}
            onChange={() => onSelect(val)}
            className="w-4 h-4 text-[#1F32D6] border-[#EBEBEB] focus:ring-0 focus:ring-offset-0"
          />
          <span className="ml-1.5 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">${val}</span>
        </label>
      ))}
      <label className="flex items-center cursor-pointer">
        <input
          type="radio" name={name} value="custom"
          checked={value === 'custom'}
          onChange={() => onSelect('custom')}
          className="w-4 h-4 text-[#1F32D6] border-[#EBEBEB] focus:ring-0 focus:ring-offset-0"
        />
        <span className="ml-1.5 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">
          {t('onboarding.limits.others')}:
        </span>
      </label>
      <div className="flex items-center">
        <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] mr-1">$</span>
        <input
          type="number" value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          onFocus={() => onSelect('custom')}
          placeholder="0"
          className="w-16 bg-white border border-[#EBEBEB] rounded-[6px] px-2 py-1 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#1F32D6] focus:ring-1 focus:ring-[#1F32D6]"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-4 transition-all duration-300">
      {/* Per-Transaction */}
      <div className="mb-3">
        <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] mb-2">
          {t('onboarding.limits.perTx')}
        </div>
        <RadioGroup
          name="perTxLimit" options={['2', '5', '10']} value={perTxLimit}
          onSelect={(v) => handleLimitChange('perTx', v)}
          customValue={customPerTx} onCustomChange={(v) => handleCustomChange('perTx', v)}
        />
      </div>

      {/* Daily */}
      <div className="mb-3">
        <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] mb-2">
          {t('onboarding.limits.daily')}
        </div>
        <RadioGroup
          name="dailyLimit" options={['20', '50', '100']} value={dailyLimit}
          onSelect={(v) => handleLimitChange('daily', v)}
          customValue={customDaily} onCustomChange={(v) => handleCustomChange('daily', v)}
        />
      </div>

      {/* Confirm */}
      <button
        onClick={() => onConfirm(getEffectivePerTx(), getEffectiveDaily())}
        className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[38px] rounded-[8px] transition-colors font-['Inter',sans-serif] font-medium text-[13px] text-white flex items-center justify-center"
      >
        {t('onboarding.limits.confirm')}
      </button>
    </div>
  );
}
