import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Wallet as WalletType } from '../../hooks/useWalletStore';
import { AssetPosition, formatUsdValue, getFilteredBalance } from '../../data/mockAssets';
import { getChainById, CHAINS } from '../../data/chains';
import { useLanguage } from '../../contexts/LanguageContext';

interface BalanceOverviewProps {
  wallet: WalletType;
  assets: AssetPosition[];
  selectedChain: string | null;
  onChainChange: (chainId: string | null) => void;
  selectedAddress: string | null;
  onAddressChange: (address: string | null) => void;
}

export default function BalanceOverview({
  wallet, assets, selectedChain, onChainChange, selectedAddress, onAddressChange,
}: BalanceOverviewProps) {
  const { t } = useLanguage();
  const [addrDropdownOpen, setAddrDropdownOpen] = useState(false);
  const addrDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addrDropdownRef.current && !addrDropdownRef.current.contains(e.target as Node)) {
        setAddrDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine which chains to show based on selected address
  const selectedWalletAddr = selectedAddress
    ? wallet.addresses.find(a => a.address === selectedAddress)
    : null;

  const chainsWithAssets = [...new Set(assets.map(a => a.chainId))];

  // If an address is selected, only show chains matching its parentChain
  const visibleChains = selectedWalletAddr
    ? chainsWithAssets.filter(chainId => {
        const chain = getChainById(chainId);
        return chain && chain.parentChain === selectedWalletAddr.chain;
      })
    : chainsWithAssets;

  const filteredBalance = getFilteredBalance(assets, selectedChain, selectedAddress, wallet.addresses);

  // Format wallet creation date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Get display text for selected address
  const getAddrDisplayText = () => {
    if (!selectedAddress) return t('walletDetail.allAddresses');
    return `${selectedAddress.slice(0, 6)}...${selectedAddress.slice(-4)}`;
  };

  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6">
      {/* Total balance */}
      <div className="mb-1">
        <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c]">
          {t('walletDetail.totalBalance')}
        </span>
      </div>
      <div className="mb-5">
        <span className="font-['Inter',sans-serif] font-semibold text-[32px] leading-[40px] text-[#0a0a0a]">
          {formatUsdValue(filteredBalance)}
        </span>
      </div>

      {/* Chain filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <button
          onClick={() => onChainChange(null)}
          className={`px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-colors ${
            selectedChain === null
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-[#f5f5f5] text-[#7c7c7c] hover:bg-[#ebebeb]'
          }`}
        >
          {t('walletDetail.allChains')}
        </button>
        {visibleChains.map(chainId => {
          const chain = getChainById(chainId);
          if (!chain) return null;
          return (
            <button
              key={chainId}
              onClick={() => onChainChange(chainId)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-colors ${
                selectedChain === chainId
                  ? 'bg-[#0a0a0a] text-white'
                  : 'bg-[#f5f5f5] text-[#7c7c7c] hover:bg-[#ebebeb]'
              }`}
            >
              <span
                className="shrink-0"
                style={{ width: 14, height: 14 }}
                dangerouslySetInnerHTML={{ __html: chain.logo.replace(/width="24"/g, 'width="14"').replace(/height="24"/g, 'height="14"') }}
              />
              {chain.shortName}
            </button>
          );
        })}
      </div>

      {/* Address selector */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
          {t('walletDetail.addresses')}:
        </span>
        <div className="relative" ref={addrDropdownRef}>
          <button
            onClick={() => setAddrDropdownOpen(!addrDropdownOpen)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] border border-[rgba(10,10,10,0.1)] hover:bg-[#f5f5f5] transition-colors"
          >
            {selectedWalletAddr && (
              <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#4f5eff] bg-[rgba(79,94,255,0.08)] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                {selectedWalletAddr.chain}
              </span>
            )}
            <code className="font-['JetBrains_Mono',monospace] text-[12px] text-[#0a0a0a]">
              {getAddrDisplayText()}
            </code>
            <ChevronDown className={`w-3.5 h-3.5 text-[#7c7c7c] transition-transform ${addrDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {addrDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-[rgba(10,10,10,0.1)] rounded-[10px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] z-20 py-1">
              {/* All Addresses option */}
              <button
                onClick={() => { onAddressChange(null); onChainChange(null); setAddrDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2.5 transition-colors ${
                  !selectedAddress ? 'bg-[rgba(79,94,255,0.04)]' : 'hover:bg-[#f5f5f5]'
                }`}
              >
                <span className={`font-['Inter',sans-serif] text-[13px] ${
                  !selectedAddress ? 'text-[#4f5eff] font-medium' : 'text-[#0a0a0a] font-normal'
                }`}>
                  {t('walletDetail.allAddresses')}
                </span>
              </button>

              {/* Individual addresses */}
              {wallet.addresses.map((addr, idx) => {
                const isSelected = selectedAddress === addr.address;
                // Compute balance for this address
                const parentChainIds = CHAINS.filter(c => c.parentChain === addr.chain).map(c => c.id);
                const addrBalance = assets
                  .filter(a => parentChainIds.includes(a.chainId))
                  .reduce((sum, a) => sum + a.usdValue, 0);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onAddressChange(addr.address);
                      onChainChange(null); // Reset chain filter when switching address
                      setAddrDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      isSelected ? 'bg-[rgba(79,94,255,0.04)]' : 'hover:bg-[#f5f5f5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#4f5eff] bg-[rgba(79,94,255,0.08)] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider shrink-0">
                        {addr.chain}
                      </span>
                      <code className={`font-['JetBrains_Mono',monospace] text-[12px] ${
                        isSelected ? 'text-[#4f5eff]' : 'text-[#0a0a0a]'
                      }`}>
                        {addr.address.slice(0, 6)}...{addr.address.slice(-4)}
                      </code>
                    </div>
                    <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] mt-0.5 ml-[42px]">
                      {formatUsdValue(Math.round(addrBalance * 100) / 100)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Wallet metadata */}
      <div className="border-t border-[rgba(10,10,10,0.06)] pt-3">
        <div className="flex items-center gap-6 text-[12px] font-['Inter',sans-serif] text-[#b0b0b0]">
          <span>ID: <code className="font-['JetBrains_Mono',monospace] text-[11px] text-[#7c7c7c]">{wallet.id}</code></span>
          <span>{t('delegation.createdAt')}: {formatDate(wallet.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
