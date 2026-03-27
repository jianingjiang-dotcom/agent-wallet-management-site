import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Wallet as WalletType } from '../../hooks/useWalletStore';
import { AssetPosition, Transaction, formatUsdValue, formatTokenAmount, getTokenPrice } from '../../data/mockAssets';
import { getTokenById } from '../../data/tokens';
import { getChainById } from '../../data/chains';
import { useLanguage } from '../../contexts/LanguageContext';
import TokenLogo from './TokenLogo';
import TransactionHistory from './TransactionHistory';

interface TokenDetailProps {
  wallet: WalletType;
  tokenId: string;
  chainId: string;
  assets: AssetPosition[];
  transactions: Transaction[];
  onBack: () => void;
  onDeposit: () => void;
  onSend: (tokenId: string, chainId: string) => void;
}

export default function TokenDetail({
  wallet, tokenId, chainId, assets, transactions, onBack, onDeposit, onSend,
}: TokenDetailProps) {
  const { t } = useLanguage();
  const token = getTokenById(tokenId);
  const chain = getChainById(chainId);
  const price = getTokenPrice(tokenId);

  // Find the specific asset
  const asset = assets.find(a => a.tokenId === tokenId && a.chainId === chainId);

  // Filter transactions for this token
  const tokenTransactions = transactions.filter(tx => tx.tokenId === tokenId && tx.chainId === chainId);

  if (!token || !asset) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-0">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 mb-5 text-[var(--app-text-secondary)] hover:text-[var(--app-text)] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-['Inter',sans-serif] text-[13px]">
          {t('tokenDetail.back')}
        </span>
      </button>

      {/* Token info header */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <TokenLogo tokenId={tokenId} chainId={chainId} size={48} />
            <div>
              <h1 className="font-['Inter',sans-serif] font-semibold text-[20px] text-[var(--app-text)]">
                {token.name}
              </h1>
              <span className="font-['Inter',sans-serif] text-[14px] text-[var(--app-text-secondary)]">
                {token.symbol} · {chain?.name}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-['Inter',sans-serif] font-semibold text-[18px] text-[var(--app-text)]">
              {formatUsdValue(price)}
            </div>
            <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)]">
              {t('tokenDetail.price')}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-[var(--app-hover-bg)] rounded-[10px] p-4 mb-5">
          <div className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] mb-1">
            {t('tokenDetail.balance')}
          </div>
          <div className="font-['Inter',sans-serif] font-semibold text-[24px] text-[var(--app-text)] mb-0.5">
            {formatTokenAmount(asset.amount, tokenId)} {token.symbol}
          </div>
          <div className="font-['Inter',sans-serif] text-[14px] text-[var(--app-text-secondary)]">
            ≈ {formatUsdValue(asset.usdValue)}
          </div>

          {/* Address breakdown */}
          {asset.addressBreakdown && asset.addressBreakdown.length > 1 && (
            <div className="mt-3 pt-3 border-t border-[var(--app-border)] space-y-1.5">
              {asset.addressBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <code className="font-['JetBrains_Mono',monospace] text-[11px] text-[var(--app-text-secondary)]">
                    {item.address.slice(0, 6)}...{item.address.slice(-4)}
                  </code>
                  <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-secondary)]">
                    {formatTokenAmount(item.amount, tokenId)} {token.symbol}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDeposit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-[var(--app-text-secondary)] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            {t('wallet.deposit')}
          </button>
          <button
            onClick={() => onSend(tokenId, chainId)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            {t('wallet.send')}
          </button>
        </div>
      </div>

      {/* Transaction history for this token */}
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 sm:p-5">
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[var(--app-text)] mb-3">
          {t('tokenDetail.txHistory')}
        </h2>
        <div className="max-h-[400px] overflow-y-auto">
          <TransactionHistory
            transactions={tokenTransactions}
            selectedChain={null}
            selectedAddress={null}
            walletAddresses={wallet.addresses}
            headless
          />
        </div>
      </div>
    </div>
  );
}
