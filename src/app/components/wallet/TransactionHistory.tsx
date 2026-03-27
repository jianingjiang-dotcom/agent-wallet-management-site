import { ArrowUpRight, ArrowDownLeft, RefreshCw, ShieldCheck, ExternalLink } from 'lucide-react';
import { Transaction, formatUsdValue, formatTokenAmount } from '../../data/mockAssets';
import { getTokenById } from '../../data/tokens';
import { getChainById, CHAINS } from '../../data/chains';
import { useLanguage } from '../../contexts/LanguageContext';

interface TransactionHistoryProps {
  transactions: Transaction[];
  selectedChain: string | null;
  selectedAddress: string | null;
  walletAddresses: { chain: string; address: string }[];
  headless?: boolean;
}

const TX_CONFIG: Record<string, { icon: typeof ArrowUpRight; color: string; sign: string }> = {
  Send:    { icon: ArrowUpRight,  color: '#ef4444', sign: '-' },
  Receive: { icon: ArrowDownLeft, color: '#22c55e', sign: '+' },
  Swap:    { icon: RefreshCw,     color: '#4f5eff', sign: '' },
  Approve: { icon: ShieldCheck,   color: '#f59e0b', sign: '' },
};

const STATUS_DOT: Record<string, string> = {
  pending: '#f59e0b',
  failed: '#ef4444',
};

function formatTxTime(timestamp: string): string {
  const d = new Date(timestamp);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day}, ${hours}:${mins}`;
}

export default function TransactionHistory({ transactions, selectedChain, selectedAddress, walletAddresses, headless }: TransactionHistoryProps) {
  const { t } = useLanguage();

  // Filter transactions by chain and address
  let filteredTxs = transactions;
  if (selectedAddress) {
    const walletAddr = walletAddresses.find(a => a.address === selectedAddress);
    if (walletAddr) {
      const validChainIds = CHAINS.filter(c => c.parentChain === walletAddr.chain).map(c => c.id);
      filteredTxs = filteredTxs.filter(tx => validChainIds.includes(tx.chainId));
    }
  }
  if (selectedChain) {
    filteredTxs = filteredTxs.filter(tx => tx.chainId === selectedChain);
  }

  const content = (
    <div className="divide-y divide-[var(--app-border)]">
      {filteredTxs.map((tx) => {
        const token = getTokenById(tx.tokenId);
        const chain = getChainById(tx.chainId);
        const config = TX_CONFIG[tx.type] || TX_CONFIG.Send;
        const Icon = config.icon;
        const statusDot = STATUS_DOT[tx.status];

        return (
          <div key={tx.id} className="flex items-center gap-2 sm:gap-3 py-3">
            {/* Type icon */}
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${config.color}14` }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: config.color, width: 18, height: 18 }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                  {t(`tx.${tx.type.toLowerCase()}`)} {token?.symbol || tx.tokenId.toUpperCase()}
                </span>
                {statusDot && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusDot }}
                    title={tx.status}
                  />
                )}
              </div>
              <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-secondary)]">
                {chain?.name || tx.chainId} · {formatTxTime(tx.timestamp)}
              </span>
            </div>

            {/* Amount + value */}
            <div className="text-right shrink-0">
              <div className="font-['Inter',sans-serif] font-medium text-[14px]" style={{ color: config.color }}>
                {config.sign}{formatTokenAmount(tx.amount, tx.tokenId)} {token?.symbol}
              </div>
              <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-secondary)]">
                {formatUsdValue(tx.usdValue)}
              </div>
            </div>

            {/* Explorer link */}
            <a
              href={tx.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block shrink-0 p-1.5 rounded-[6px] text-[var(--app-text-tertiary)] hover:text-[var(--app-accent)] hover:bg-[var(--app-accent-soft)] transition-colors"
              title={t('walletDetail.viewOnExplorer')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );
      })}

      {filteredTxs.length === 0 && (
        <div className="py-8 text-center">
          <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[var(--app-text-tertiary)]">
            No transactions yet
          </span>
        </div>
      )}
    </div>
  );

  if (headless) return content;

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[var(--app-text)]">
          {t('walletDetail.transactions')}
        </h2>
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-tertiary)]">
          {filteredTxs.length} txns
        </span>
      </div>
      {content}
    </div>
  );
}
