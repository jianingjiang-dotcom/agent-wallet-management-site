import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Copy, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Wallet as WalletType } from '../../hooks/useWalletStore';
import { AssetPosition, formatUsdValue, getFilteredBalance } from '../../data/mockAssets';
import { getChainById } from '../../data/chains';
import { useLanguage } from '../../contexts/LanguageContext';

interface BalanceOverviewProps {
  wallet: WalletType;
  assets: AssetPosition[];
  selectedChain: string | null;
  onChainChange: (chainId: string | null) => void;
  selectedAddress: string | null;
  onAddressChange: (address: string | null) => void;
  onDeposit?: () => void;
  onSend?: () => void;
}

export default function BalanceOverview({
  wallet, assets, selectedChain, onChainChange, selectedAddress, onAddressChange, onDeposit, onSend,
}: BalanceOverviewProps) {
  const { t } = useLanguage();
  const [addrDropdownOpen, setAddrDropdownOpen] = useState(false);
  const addrDropdownRef = useRef<HTMLDivElement>(null);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const chainDropdownRef = useRef<HTMLDivElement>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addrDropdownRef.current && !addrDropdownRef.current.contains(e.target as Node)) {
        setAddrDropdownOpen(false);
      }
      if (chainDropdownRef.current && !chainDropdownRef.current.contains(e.target as Node)) {
        setChainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedWalletAddr = selectedAddress
    ? wallet.addresses.find(a => a.address === selectedAddress)
    : null;

  const chainsWithAssets = [...new Set(assets.map(a => a.chainId))];

  const visibleChains = selectedWalletAddr
    ? chainsWithAssets.filter(chainId => {
        const chain = getChainById(chainId);
        return chain && chain.parentChain === selectedWalletAddr.chain;
      })
    : chainsWithAssets;

  const filteredBalance = getFilteredBalance(assets, selectedChain, selectedAddress, wallet.addresses);

  const getAddrDisplayText = () => {
    if (!selectedAddress) return t('walletDetail.allAddresses');
    return `${selectedAddress.slice(0, 6)}...${selectedAddress.slice(-4)}`;
  };

  const handleCopyAddress = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  };

  const selectedChainInfo = selectedChain ? getChainById(selectedChain) : null;

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 sm:p-6">
      {/* Top row: balance label + filters (right-aligned) */}
      <div className="flex items-start justify-between mb-1">
        <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[var(--app-text-secondary)]">
          {t('walletDetail.totalBalance')}
        </span>

        {/* Filters — top right, small */}
        <div className="flex items-center gap-2">
          {/* Chain dropdown */}
          <div className="relative" ref={chainDropdownRef}>
            <button
              onClick={() => setChainDropdownOpen(!chainDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] border border-[var(--app-border)] hover:bg-[var(--app-hover-bg)] transition-colors"
            >
              {selectedChainInfo ? (
                <>
                  <span
                    className="shrink-0"
                    style={{ width: 12, height: 12 }}
                    dangerouslySetInnerHTML={{ __html: selectedChainInfo.logo.replace(/width="24"/g, 'width="12"').replace(/height="24"/g, 'height="12"') }}
                  />
                  <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[var(--app-text-secondary)]">
                    {selectedChainInfo.shortName}
                  </span>
                </>
              ) : (
                <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[var(--app-text-secondary)]">
                  {t('walletDetail.allChains')}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 text-[var(--app-text-tertiary)] transition-transform ${chainDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {chainDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-[180px] bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[10px] shadow-[var(--app-dropdown-shadow)] z-20 py-1">
                <button
                  onClick={() => { onChainChange(null); setChainDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 transition-colors ${
                    selectedChain === null ? 'bg-[var(--app-accent-soft-hover)]' : 'hover:bg-[var(--app-hover-bg)]'
                  }`}
                >
                  <span className={`font-['Inter',sans-serif] text-[12px] ${
                    selectedChain === null ? 'text-[var(--app-accent)] font-medium' : 'text-[var(--app-text)] font-normal'
                  }`}>
                    {t('walletDetail.allChains')}
                  </span>
                </button>
                {visibleChains.map(chainId => {
                  const chain = getChainById(chainId);
                  if (!chain) return null;
                  const isSelected = selectedChain === chainId;
                  return (
                    <button
                      key={chainId}
                      onClick={() => { onChainChange(chainId); setChainDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 ${
                        isSelected ? 'bg-[var(--app-accent-soft-hover)]' : 'hover:bg-[var(--app-hover-bg)]'
                      }`}
                    >
                      <span
                        className="shrink-0"
                        style={{ width: 14, height: 14 }}
                        dangerouslySetInnerHTML={{ __html: chain.logo.replace(/width="24"/g, 'width="14"').replace(/height="24"/g, 'height="14"') }}
                      />
                      <span className={`font-['Inter',sans-serif] text-[12px] ${
                        isSelected ? 'text-[var(--app-accent)] font-medium' : 'text-[var(--app-text)] font-normal'
                      }`}>
                        {chain.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Address dropdown */}
          <div className="relative" ref={addrDropdownRef}>
            <button
              onClick={() => setAddrDropdownOpen(!addrDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] border border-[var(--app-border)] hover:bg-[var(--app-hover-bg)] transition-colors"
            >
              {selectedWalletAddr && (
                <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-1 py-0.5 rounded-[2px] uppercase tracking-wider">
                  {selectedWalletAddr.chain}
                </span>
              )}
              <code className="font-['JetBrains_Mono',monospace] text-[11px] text-[var(--app-text-secondary)]">
                {getAddrDisplayText()}
              </code>
              <ChevronDown className={`w-3 h-3 text-[var(--app-text-tertiary)] transition-transform ${addrDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {addrDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-[300px] bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[10px] shadow-[var(--app-dropdown-shadow)] z-20 py-1">
                <button
                  onClick={() => { onAddressChange(null); onChainChange(null); setAddrDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 transition-colors ${
                    !selectedAddress ? 'bg-[var(--app-accent-soft-hover)]' : 'hover:bg-[var(--app-hover-bg)]'
                  }`}
                >
                  <span className={`font-['Inter',sans-serif] text-[12px] ${
                    !selectedAddress ? 'text-[var(--app-accent)] font-medium' : 'text-[var(--app-text)] font-normal'
                  }`}>
                    {t('walletDetail.allAddresses')}
                  </span>
                </button>

                {wallet.addresses.map((addr, idx) => {
                  const isSelected = selectedAddress === addr.address;
                  const addrBalance = getFilteredBalance(assets, null, addr.address, wallet.addresses);

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onAddressChange(addr.address);
                        onChainChange(null);
                        setAddrDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 transition-colors ${
                        isSelected ? 'bg-[var(--app-accent-soft-hover)]' : 'hover:bg-[var(--app-hover-bg)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider shrink-0">
                          {addr.chain}
                        </span>
                        <code className={`font-['JetBrains_Mono',monospace] text-[12px] flex-1 ${
                          isSelected ? 'text-[var(--app-accent)]' : 'text-[var(--app-text)]'
                        }`}>
                          {addr.address.slice(0, 6)}...{addr.address.slice(-4)}
                        </code>
                        <button
                          onClick={(e) => handleCopyAddress(e, addr.address)}
                          className="p-1 rounded hover:bg-[var(--app-hover-bg)] transition-colors shrink-0"
                          title={t('walletDetail.copyAddress')}
                        >
                          {copiedAddress === addr.address
                            ? <Check className="w-3 h-3 text-[var(--app-status-approved-text)]" />
                            : <Copy className="w-3 h-3 text-[var(--app-text-tertiary)]" />
                          }
                        </button>
                      </div>
                      <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[var(--app-text-tertiary)] mt-0.5 ml-[42px]">
                        {formatUsdValue(Math.round(addrBalance * 100) / 100)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance amount */}
      <div className="mb-5">
        <span className="font-['Inter',sans-serif] font-semibold text-[24px] sm:text-[32px] leading-[32px] sm:leading-[40px] text-[var(--app-text)]">
          {formatUsdValue(filteredBalance)}
        </span>
      </div>

      {/* Deposit + Send buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onDeposit}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-[var(--app-text-secondary)] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] transition-colors"
        >
          <ArrowDownLeft className="w-4 h-4" />
          {t('wallet.deposit')}
        </button>
        <button
          onClick={onSend}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
          {t('wallet.send')}
        </button>
      </div>
    </div>
  );
}
