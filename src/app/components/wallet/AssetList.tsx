import { useState } from 'react';
import { ChevronRight, Copy, Check, ArrowUpRight } from 'lucide-react';
import { AssetPosition, formatUsdValue, formatTokenAmount, filterAssetsByAddress } from '../../data/mockAssets';
import { getTokenById } from '../../data/tokens';
import { getChainById } from '../../data/chains';
import TokenLogo from './TokenLogo';
import ChainBadge from './ChainBadge';
import { useLanguage } from '../../contexts/LanguageContext';

interface AssetListProps {
  assets: AssetPosition[];
  selectedChain: string | null;
  selectedAddress: string | null;
  walletAddresses: { chain: string; address: string }[];
  headless?: boolean;
  onSelectToken?: (tokenId: string, chainId: string) => void;
  onSendToken?: (tokenId: string, chainId: string) => void;
}

export default function AssetList({ assets, selectedChain, selectedAddress, walletAddresses, headless, onSelectToken, onSendToken }: AssetListProps) {
  const { t } = useLanguage();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  let filtered = filterAssetsByAddress(assets, selectedAddress, walletAddresses);
  if (selectedChain) filtered = filtered.filter(a => a.chainId === selectedChain);

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCopyAddress = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  };

  const content = (
    <>
      <div className="divide-y divide-[var(--app-border)]">
        {filtered.map((asset) => {
          const token = getTokenById(asset.tokenId);
          const chain = getChainById(asset.chainId);
          const rowKey = `${asset.tokenId}-${asset.chainId}`;
          const hasBreakdown = asset.addressBreakdown && asset.addressBreakdown.length > 1;
          const isExpanded = expandedRows.has(rowKey);

          return (
            <div key={rowKey}>
              <div
                className={`flex items-center gap-3 py-3 group/row cursor-pointer hover:bg-[var(--app-hover-bg)] -mx-2 px-2 rounded-[8px]`}
                onClick={() => {
                  if (onSelectToken) {
                    onSelectToken(asset.tokenId, asset.chainId);
                  } else if (hasBreakdown) {
                    toggleRow(rowKey);
                  }
                }}
              >
                {/* Expand arrow or spacer */}
                <div className="w-4 shrink-0 flex items-center justify-center">
                  {hasBreakdown && !onSelectToken && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-[var(--app-text-tertiary)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  )}
                </div>

                {/* Token logo with chain badge */}
                <TokenLogo tokenId={asset.tokenId} chainId={asset.chainId} size={32} />

                {/* Token name + symbol */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                      {token?.symbol || asset.tokenId.toUpperCase()}
                    </span>
                    <span className="hidden sm:inline"><ChainBadge chainId={asset.chainId} /></span>
                  </div>
                  <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-secondary)]">
                    {token?.name || asset.tokenId}
                  </span>
                </div>

                {/* Amount + USD value */}
                <div className="text-right shrink-0">
                  <div className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                    {formatTokenAmount(asset.amount, asset.tokenId)} {token?.symbol}
                  </div>
                  <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-secondary)]">
                    {formatUsdValue(asset.usdValue)}
                  </div>
                </div>

                {/* Send button (hover visible) */}
                {onSendToken && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSendToken(asset.tokenId, asset.chainId); }}
                    className="shrink-0 p-1.5 rounded-[6px] text-[var(--app-text-tertiary)] opacity-0 group-hover/row:opacity-100 hover:text-[var(--app-accent)] hover:bg-[var(--app-accent-soft)] transition-all"
                    title={t('wallet.send')}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Address breakdown (expanded) */}
              {hasBreakdown && isExpanded && (
                <div className="ml-[52px] mb-2 space-y-1">
                  {asset.addressBreakdown!.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[var(--app-hover-bg)]"
                    >
                      <div className="flex items-center gap-1.5">
                        <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[11px] text-[var(--app-text-secondary)]">
                          {item.address.slice(0, 6)}...{item.address.slice(-4)}
                        </code>
                        <button
                          onClick={(e) => handleCopyAddress(e, item.address)}
                          className="p-0.5 rounded hover:bg-[var(--app-hover-bg-dark)] transition-colors"
                          title={t('walletDetail.copyAddress')}
                        >
                          {copiedAddress === item.address
                            ? <Check className="w-3 h-3 text-[var(--app-status-approved-text)]" />
                            : <Copy className="w-3 h-3 text-[var(--app-text-tertiary)]" />
                          }
                        </button>
                      </div>
                      <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-secondary)]">
                        {formatTokenAmount(item.amount, asset.tokenId)} {token?.symbol}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[var(--app-text-tertiary)]">
              No assets found
            </span>
          </div>
        )}
      </div>
    </>
  );

  if (headless) return content;

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[var(--app-text)]">
          {t('walletDetail.assets')}
        </h2>
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-tertiary)]">
          {filtered.length} tokens
        </span>
      </div>
      {content}
    </div>
  );
}
