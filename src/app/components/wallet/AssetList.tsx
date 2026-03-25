import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
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
}

export default function AssetList({ assets, selectedChain, selectedAddress, walletAddresses }: AssetListProps) {
  const { t } = useLanguage();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
          {t('walletDetail.assets')}
        </h2>
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
          {filtered.length} tokens
        </span>
      </div>

      <div className="divide-y divide-[rgba(10,10,10,0.06)]">
        {filtered.map((asset) => {
          const token = getTokenById(asset.tokenId);
          const chain = getChainById(asset.chainId);
          const rowKey = `${asset.tokenId}-${asset.chainId}`;
          const hasBreakdown = asset.addressBreakdown && asset.addressBreakdown.length > 1;
          const isExpanded = expandedRows.has(rowKey);

          return (
            <div key={rowKey}>
              <div
                className={`flex items-center gap-3 py-3 ${hasBreakdown ? 'cursor-pointer hover:bg-[#fafafa] -mx-2 px-2 rounded-[8px]' : ''}`}
                onClick={hasBreakdown ? () => toggleRow(rowKey) : undefined}
              >
                {/* Expand arrow or spacer */}
                <div className="w-4 shrink-0 flex items-center justify-center">
                  {hasBreakdown && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-[#b0b0b0] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  )}
                </div>

                {/* Token logo with chain badge */}
                <TokenLogo tokenId={asset.tokenId} chainId={asset.chainId} size={32} />

                {/* Token name + symbol */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                      {token?.symbol || asset.tokenId.toUpperCase()}
                    </span>
                    <ChainBadge chainId={asset.chainId} />
                  </div>
                  <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c]">
                    {token?.name || asset.tokenId}
                  </span>
                </div>

                {/* Amount + USD value */}
                <div className="text-right shrink-0">
                  <div className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                    {formatTokenAmount(asset.amount, asset.tokenId)} {token?.symbol}
                  </div>
                  <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c]">
                    {formatUsdValue(asset.usdValue)}
                  </div>
                </div>
              </div>

              {/* Address breakdown (expanded) */}
              {hasBreakdown && isExpanded && (
                <div className="ml-[52px] mb-2 space-y-1">
                  {asset.addressBreakdown!.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-[6px] bg-[#fafafa]"
                    >
                      <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[11px] text-[#7c7c7c]">
                        {item.address.slice(0, 6)}...{item.address.slice(-4)}
                      </code>
                      <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c]">
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
            <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[#b0b0b0]">
              No assets found
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
