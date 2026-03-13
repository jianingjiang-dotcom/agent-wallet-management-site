import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet } from '../hooks/useWalletStore';

interface WalletCardProps {
  wallet: Wallet;
  onSelect: (walletId: string) => void;
}

export default function WalletCard({ wallet, onSelect }: WalletCardProps) {
  const { t } = useLanguage();

  const delegation = wallet.delegation;
  const statusColor = delegation
    ? delegation.status === 'active'
      ? 'bg-[#22c55e]'
      : 'bg-[#eab308]'
    : 'bg-[#d4d4d4]';

  const isFrozen = delegation?.status === 'frozen';
  const borderClass = isFrozen
    ? 'border-[#eab308]/30 hover:border-[#eab308]/50'
    : 'border-[rgba(10,10,10,0.08)] hover:border-[rgba(79,94,255,0.2)]';

  return (
    <button
      onClick={() => onSelect(wallet.id)}
      className={`w-full text-left bg-white border rounded-[12px] p-5 hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] transition-all group ${borderClass}`}
    >
      {/* Top: Name + Status */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#0a0a0a]">
          {wallet.name}
        </span>
        <div className="flex items-center gap-1.5">
          {isFrozen && (
            <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#eab308] uppercase tracking-wider">
              {t('delegation.paused')}
            </span>
          )}
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
        </div>
      </div>

      {/* IDs */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider">
            Wallet ID
          </span>
          <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[12px] text-[#0a0a0a]">
            {wallet.id}
          </code>
        </div>
        {delegation ? (
          <div className="flex items-center justify-between">
            <span className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider">
              Agent ID
            </span>
            <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[12px] text-[#0a0a0a]">
              {delegation.agentId}
            </code>
          </div>
        ) : (
          <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
            {t('walletCard.noAgent')}
          </div>
        )}
      </div>

      {/* Bottom Right: Manage link */}
      <div className="flex justify-end">
        <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4f5eff] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {t('walletCard.manage')}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}
