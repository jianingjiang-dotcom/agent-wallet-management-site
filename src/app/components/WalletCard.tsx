import { ArrowRight, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet } from '../hooks/useWalletStore';

interface WalletCardProps {
  wallet: Wallet;
  delegationCount: number;
  onSelect: (walletId: string) => void;
}

export default function WalletCard({ wallet, delegationCount, onSelect }: WalletCardProps) {
  const { t } = useLanguage();

  const hasAgents = delegationCount > 0;
  const statusColor = hasAgents ? 'bg-[#22c55e]' : 'bg-[#d4d4d4]';
  const borderClass = 'border-[rgba(10,10,10,0.08)] hover:border-[rgba(79,94,255,0.2)]';

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
        <div className="flex items-center justify-between">
          <span className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider">
            Agents
          </span>
          {hasAgents ? (
            <span className="flex items-center gap-1 font-['Inter',sans-serif] font-medium text-[12px] text-[#4f5eff]">
              <Users className="w-3 h-3" />
              {delegationCount} {t('walletPage.agents')}
            </span>
          ) : (
            <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
              {t('walletPage.noAgents')}
            </span>
          )}
        </div>
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
