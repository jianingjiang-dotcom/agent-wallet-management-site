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
  const statusColor = hasAgents ? 'bg-[#22c55e]' : 'bg-[#EBEBEB]';
  const borderClass = 'border-[var(--app-border)] hover:border-[rgba(79,94,255,0.2)]';

  return (
    <button
      onClick={() => onSelect(wallet.id)}
      className={`w-full text-left bg-[var(--app-card-bg)] border rounded-[12px] p-5 hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] transition-all group ${borderClass}`}
    >
      {/* Top: Name + Status */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[15px] text-[var(--app-text)]">
          {wallet.name}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
        </div>
      </div>

      {/* IDs */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-normal text-[11px] text-[var(--app-text-secondary)] uppercase tracking-wider">
            Wallet ID
          </span>
          <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[12px] text-[var(--app-text)] truncate">
            {wallet.id}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-normal text-[11px] text-[var(--app-text-secondary)] uppercase tracking-wider">
            Agents
          </span>
          {hasAgents ? (
            <span className="flex items-center gap-1 font-medium text-[12px] text-[var(--app-accent)]">
              <Users className="w-3 h-3" strokeWidth={1.5} />
              {delegationCount} {t('walletPage.agents')}
            </span>
          ) : (
            <span className="font-normal text-[12px] text-[var(--app-text-secondary)]">
              {t('walletPage.noAgents')}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Right: Manage link */}
      <div className="flex justify-end">
        <span className="font-medium text-[13px] text-[var(--app-accent)] flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {t('walletCard.manage')}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </span>
      </div>
    </button>
  );
}
