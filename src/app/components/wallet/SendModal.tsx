import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle, Loader2, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Wallet as WalletType } from '../../hooks/useWalletStore';
import { AssetPosition, formatUsdValue, formatTokenAmount, getTokenPrice } from '../../data/mockAssets';
import { getTokenById } from '../../data/tokens';
import { getChainById } from '../../data/chains';
import { useLanguage } from '../../contexts/LanguageContext';
import TokenLogo from './TokenLogo';

interface SendModalProps {
  open: boolean;
  onClose: () => void;
  wallet: WalletType;
  assets: AssetPosition[];
  preselectedToken?: { tokenId: string; chainId: string };
}

type Step = 'select' | 'address' | 'confirm' | 'sending' | 'success';

export default function SendModal({ open, onClose, wallet, assets, preselectedToken }: SendModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('select');
  const [selectedAsset, setSelectedAsset] = useState<AssetPosition | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [senderAddress, setSenderAddress] = useState<string | null>(null);
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const [txHash] = useState(() => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
  const [copied, setCopied] = useState(false);

  const token = selectedAsset ? getTokenById(selectedAsset.tokenId) : null;
  const chain = selectedAsset ? getChainById(selectedAsset.chainId) : null;
  const expectedParentChain = chain ? chain.parentChain : null;

  // Addresses matching the selected asset's chain type
  const matchingAddresses = expectedParentChain
    ? wallet.addresses.filter(a => a.chain === expectedParentChain)
    : [];

  // Auto-select sender address when token changes
  useEffect(() => {
    if (matchingAddresses.length === 1) {
      setSenderAddress(matchingAddresses[0].address);
    } else if (matchingAddresses.length === 0) {
      setSenderAddress(null);
    }
    // When multiple addresses, keep current selection if valid, otherwise reset
    if (matchingAddresses.length > 1 && senderAddress) {
      if (!matchingAddresses.find(a => a.address === senderAddress)) {
        setSenderAddress(matchingAddresses[0].address);
      }
    } else if (matchingAddresses.length > 1 && !senderAddress) {
      setSenderAddress(matchingAddresses[0].address);
    }
  }, [selectedAsset?.tokenId, selectedAsset?.chainId]);

  // Calculate available balance for the selected sender address
  const getAvailableAmount = (): number => {
    if (!selectedAsset) return 0;
    if (!senderAddress || !selectedAsset.addressBreakdown || selectedAsset.addressBreakdown.length <= 1) {
      return selectedAsset.amount;
    }
    const entry = selectedAsset.addressBreakdown.find(b => b.address === senderAddress);
    return entry ? entry.amount : 0;
  };

  const availableAmount = getAvailableAmount();
  const price = selectedAsset ? getTokenPrice(selectedAsset.tokenId) : 0;
  const usdValue = amount ? parseFloat(amount) * price : 0;
  const isInsufficientBalance = selectedAsset && parseFloat(amount || '0') > availableAmount;

  // Reset on open
  useEffect(() => {
    if (open) {
      if (preselectedToken) {
        const found = assets.find(a => a.tokenId === preselectedToken.tokenId && a.chainId === preselectedToken.chainId);
        setSelectedAsset(found || null);
      } else {
        setSelectedAsset(null);
      }
      setStep('select');
      setAmount('');
      setRecipient('');
      setSenderAddress(null);
      setCopied(false);
    }
  }, [open, preselectedToken, assets]);

  // Outside click for dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(e.target as Node)) {
        setTokenDropdownOpen(false);
      }
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(e.target as Node)) {
        setFromDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isValidAddress = () => {
    if (!recipient) return true;
    if (expectedParentChain === 'EVM') return /^0x[a-fA-F0-9]{40}$/.test(recipient);
    if (expectedParentChain === 'SOL') return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(recipient);
    return recipient.length > 10;
  };

  const canContinueToAddress = selectedAsset && senderAddress && parseFloat(amount || '0') > 0 && !isInsufficientBalance;
  const canContinueToConfirm = canContinueToAddress && recipient && isValidAddress();

  const estimatedGas = expectedParentChain === 'SOL' ? '0.000005 SOL' : '0.002 ETH';

  const handleConfirmSend = () => {
    setStep('sending');
    setTimeout(() => setStep('success'), 1500);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectAsset = (asset: AssetPosition) => {
    setSelectedAsset(asset);
    setTokenDropdownOpen(false);
    setAmount('');
    // Sender address will be auto-set by the useEffect
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[460px] bg-[var(--app-card-bg)] border-[var(--app-border-medium)] p-6 sm:p-8">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          {step !== 'select' && step !== 'sending' && step !== 'success' && (
            <button
              onClick={() => setStep(step === 'confirm' ? 'address' : 'select')}
              className="p-1 rounded-[6px] text-[var(--app-text-tertiary)] hover:text-[var(--app-text)] hover:bg-[var(--app-hover-bg)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <DialogTitle className="font-['Inter',sans-serif] text-[20px] font-semibold text-[var(--app-text)]">
            {step === 'success' ? t('send.success') : t('send.title')}
          </DialogTitle>
        </div>

        {/* Step 1: Select token + amount */}
        {step === 'select' && (
          <div className="space-y-4">
            {/* Token selector */}
            <div>
              <label className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] mb-1.5 block">
                {t('send.selectToken')}
              </label>
              <div className="relative" ref={tokenDropdownRef}>
                <button
                  onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] transition-colors text-left"
                >
                  {selectedAsset && token ? (
                    <>
                      <TokenLogo tokenId={selectedAsset.tokenId} chainId={selectedAsset.chainId} size={28} />
                      <div className="flex-1">
                        <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                          {token.symbol}
                        </span>
                        <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] ml-2">
                          {chain?.shortName}
                        </span>
                      </div>
                      <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-secondary)]">
                        {formatTokenAmount(selectedAsset.amount, selectedAsset.tokenId)} {token.symbol}
                      </span>
                    </>
                  ) : (
                    <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-tertiary)] flex-1">
                      {t('send.selectToken')}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-[var(--app-text-tertiary)] transition-transform ${tokenDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {tokenDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[10px] shadow-[var(--app-dropdown-shadow)] z-20 py-1 max-h-[240px] overflow-y-auto">
                    {assets.map((asset) => {
                      const tk = getTokenById(asset.tokenId);
                      const ch = getChainById(asset.chainId);
                      return (
                        <button
                          key={`${asset.tokenId}-${asset.chainId}`}
                          onClick={() => handleSelectAsset(asset)}
                          className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                            selectedAsset?.tokenId === asset.tokenId && selectedAsset?.chainId === asset.chainId
                              ? 'bg-[var(--app-accent-soft-hover)]'
                              : 'hover:bg-[var(--app-hover-bg)]'
                          }`}
                        >
                          <TokenLogo tokenId={asset.tokenId} chainId={asset.chainId} size={24} />
                          <div className="flex-1 min-w-0">
                            <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[var(--app-text)]">
                              {tk?.symbol || asset.tokenId}
                            </span>
                            <span className="font-['Inter',sans-serif] text-[11px] text-[var(--app-text-tertiary)] ml-1.5">
                              {ch?.shortName}
                            </span>
                          </div>
                          <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-secondary)]">
                            {formatTokenAmount(asset.amount, asset.tokenId)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* From address selector — only shown when multiple addresses match */}
            {selectedAsset && matchingAddresses.length > 1 && (
              <div>
                <label className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] mb-1.5 block">
                  {t('send.from')}
                </label>
                <div className="relative" ref={fromDropdownRef}>
                  <button
                    onClick={() => setFromDropdownOpen(!fromDropdownOpen)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] transition-colors text-left"
                  >
                    {senderAddress ? (
                      <>
                        <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider shrink-0">
                          {expectedParentChain}
                        </span>
                        <code className="font-['JetBrains_Mono',monospace] text-[12px] text-[var(--app-text)] flex-1">
                          {senderAddress.slice(0, 8)}...{senderAddress.slice(-6)}
                        </code>
                        <span className="font-['Inter',sans-serif] text-[11px] text-[var(--app-text-tertiary)]">
                          {formatTokenAmount(availableAmount, selectedAsset.tokenId)} {token?.symbol}
                        </span>
                      </>
                    ) : (
                      <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-tertiary)] flex-1">
                        {t('send.selectFrom')}
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-[var(--app-text-tertiary)] transition-transform ${fromDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {fromDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[10px] shadow-[var(--app-dropdown-shadow)] z-20 py-1">
                      {matchingAddresses.map((addr) => {
                        const isSelected = senderAddress === addr.address;
                        // Calculate this address's balance for the selected asset
                        let addrAmount = selectedAsset.amount;
                        if (selectedAsset.addressBreakdown && selectedAsset.addressBreakdown.length > 1) {
                          const entry = selectedAsset.addressBreakdown.find(b => b.address === addr.address);
                          addrAmount = entry ? entry.amount : 0;
                        }
                        return (
                          <button
                            key={addr.address}
                            onClick={() => { setSenderAddress(addr.address); setFromDropdownOpen(false); setAmount(''); }}
                            className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                              isSelected ? 'bg-[var(--app-accent-soft-hover)]' : 'hover:bg-[var(--app-hover-bg)]'
                            }`}
                          >
                            <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[var(--app-accent)] bg-[var(--app-accent-soft)] px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider shrink-0">
                              {addr.chain}
                            </span>
                            <code className={`font-['JetBrains_Mono',monospace] text-[12px] flex-1 ${
                              isSelected ? 'text-[var(--app-accent)]' : 'text-[var(--app-text)]'
                            }`}>
                              {addr.address.slice(0, 8)}...{addr.address.slice(-6)}
                            </code>
                            <span className="font-['Inter',sans-serif] text-[11px] text-[var(--app-text-secondary)]">
                              {formatTokenAmount(addrAmount, selectedAsset.tokenId)} {token?.symbol}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amount input */}
            <div>
              <label className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] mb-1.5 block">
                {t('send.amount')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 pr-16 rounded-[8px] border border-[var(--app-border-medium)] bg-transparent font-['Inter',sans-serif] text-[16px] text-[var(--app-text)] outline-none focus:border-[var(--app-accent)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => selectedAsset && setAmount(String(availableAmount))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-[4px] font-['Inter',sans-serif] font-semibold text-[11px] text-[var(--app-accent)] bg-[var(--app-accent-soft)] hover:bg-[var(--app-accent-soft-hover)] transition-colors"
                >
                  {t('send.max')}
                </button>
              </div>

              {/* USD value + validation */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)]">
                  {amount && parseFloat(amount) > 0 ? `≈ ${formatUsdValue(usdValue)}` : ''}
                </span>
                {isInsufficientBalance && (
                  <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-status-rejected-text)]">
                    {t('send.insufficientBalance')}
                  </span>
                )}
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={() => canContinueToAddress && setStep('address')}
              disabled={!canContinueToAddress}
              className="w-full py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('send.continue')}
            </button>
          </div>
        )}

        {/* Step 2: Recipient address */}
        {step === 'address' && (
          <div className="space-y-4">
            {/* Selected token summary */}
            {selectedAsset && token && (
              <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--app-hover-bg)] rounded-[8px]">
                <TokenLogo tokenId={selectedAsset.tokenId} chainId={selectedAsset.chainId} size={28} />
                <div className="flex-1">
                  <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                    {amount} {token.symbol}
                  </span>
                  <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] ml-2">
                    ≈ {formatUsdValue(usdValue)}
                  </span>
                </div>
              </div>
            )}

            {/* Recipient input */}
            <div>
              <label className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] mb-1.5 block">
                {t('send.recipient')}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t('send.recipientPlaceholder')}
                className="w-full px-3 py-2.5 rounded-[8px] border border-[var(--app-border-medium)] bg-transparent font-['JetBrains_Mono',monospace] text-[13px] text-[var(--app-text)] outline-none focus:border-[var(--app-accent)] transition-colors placeholder:text-[var(--app-text-tertiary)]"
              />
              {recipient && !isValidAddress() && (
                <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-status-rejected-text)] mt-1 block">
                  {t('send.invalidAddress')}
                </span>
              )}
            </div>

            {/* Continue button */}
            <button
              onClick={() => canContinueToConfirm && setStep('confirm')}
              disabled={!canContinueToConfirm}
              className="w-full py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('send.continue')}
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedAsset && token && (
          <div className="space-y-4">
            <div className="bg-[var(--app-hover-bg)] rounded-[10px] p-4 space-y-3">
              {/* Token + amount */}
              <div className="flex items-center justify-between">
                <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-secondary)]">
                  {t('send.amount')}
                </span>
                <div className="flex items-center gap-2">
                  <TokenLogo tokenId={selectedAsset.tokenId} chainId={selectedAsset.chainId} size={20} />
                  <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                    {amount} {token.symbol}
                  </span>
                </div>
              </div>

              {/* USD value */}
              <div className="flex items-center justify-between">
                <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-secondary)]">USD</span>
                <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text)]">
                  ≈ {formatUsdValue(usdValue)}
                </span>
              </div>

              <div className="border-t border-[var(--app-border)]" />

              {/* From address */}
              {senderAddress && (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-secondary)] shrink-0">
                    {t('send.from')}
                  </span>
                  <code className="font-['JetBrains_Mono',monospace] text-[11px] text-[var(--app-text)] truncate">
                    {senderAddress.slice(0, 8)}...{senderAddress.slice(-6)}
                  </code>
                </div>
              )}

              {/* Recipient */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-secondary)] shrink-0">
                  {t('send.recipient')}
                </span>
                <code className="font-['JetBrains_Mono',monospace] text-[11px] text-[var(--app-text)] truncate">
                  {recipient}
                </code>
              </div>

              {/* Gas */}
              <div className="flex items-center justify-between">
                <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-secondary)]">
                  {t('send.estimatedGas')}
                </span>
                <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text)]">
                  ~{estimatedGas}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmSend}
              className="w-full py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] transition-colors"
            >
              {t('send.confirm')}
            </button>
          </div>
        )}

        {/* Sending state */}
        {step === 'sending' && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-10 h-10 text-[var(--app-accent)] animate-spin mb-4" />
            <span className="font-['Inter',sans-serif] text-[14px] text-[var(--app-text-secondary)]">
              Processing...
            </span>
          </div>
        )}

        {/* Success state */}
        {step === 'success' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-14 h-14 rounded-full bg-[var(--app-status-approved-bg)] flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-[var(--app-status-approved-text)]" />
            </div>

            {selectedAsset && token && (
              <span className="font-['Inter',sans-serif] font-semibold text-[18px] text-[var(--app-text)] mb-1">
                {amount} {token.symbol}
              </span>
            )}
            <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text-secondary)] mb-5">
              {t('send.success')}
            </span>

            {/* Tx hash */}
            <div className="w-full bg-[var(--app-hover-bg)] rounded-[8px] p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-['Inter',sans-serif] text-[11px] text-[var(--app-text-tertiary)]">
                  {t('send.txHash')}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1 rounded hover:bg-[var(--app-hover-bg-dark)] transition-colors"
                >
                  {copied
                    ? <Check className="w-3 h-3 text-[var(--app-status-approved-text)]" />
                    : <Copy className="w-3 h-3 text-[var(--app-text-tertiary)]" />
                  }
                </button>
              </div>
              <code className="font-['JetBrains_Mono',monospace] text-[11px] text-[var(--app-text-secondary)] break-all block">
                {txHash}
              </code>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
