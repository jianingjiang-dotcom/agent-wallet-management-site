import { useState, useEffect } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Wallet as WalletType } from '../../hooks/useWalletStore';
import { useLanguage } from '../../contexts/LanguageContext';

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  wallet: WalletType;
}

export default function DepositModal({ open, onClose, wallet }: DepositModalProps) {
  const { t } = useLanguage();
  const chains = [...new Set(wallet.addresses.map(a => a.chain))];
  const [selectedChain, setSelectedChain] = useState(chains[0] || 'EVM');
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const addressesForChain = wallet.addresses.filter(a => a.chain === selectedChain);
  const currentAddress = addressesForChain[selectedAddressIdx] || addressesForChain[0];

  // Reset address index when chain changes
  useEffect(() => {
    setSelectedAddressIdx(0);
    setCopied(false);
  }, [selectedChain]);

  const handleCopy = () => {
    if (!currentAddress) return;
    navigator.clipboard.writeText(currentAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px] bg-[var(--app-card-bg)] border-[var(--app-border-medium)] p-6 sm:p-8">
        <DialogTitle className="font-['Inter',sans-serif] text-[20px] font-semibold text-[var(--app-text)] mb-4">
          {t('deposit.title')}
        </DialogTitle>

        {/* Chain tabs */}
        <div className="flex items-center gap-1 mb-6">
          {chains.map(chain => (
            <button
              key={chain}
              onClick={() => setSelectedChain(chain)}
              className={`px-4 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-colors ${
                selectedChain === chain
                  ? 'bg-[var(--app-text)] text-white'
                  : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-hover-bg)]'
              }`}
            >
              {chain}
            </button>
          ))}
        </div>

        {currentAddress ? (
          <div className="flex flex-col items-center">
            {/* Address selector — only shown when multiple addresses for this chain */}
            {addressesForChain.length > 1 && (
              <div className="w-full mb-4 space-y-1.5">
                <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-text-tertiary)] block">
                  {t('deposit.selectAddress')}
                </span>
                <div className="space-y-1">
                  {addressesForChain.map((addr, idx) => (
                    <button
                      key={addr.address}
                      onClick={() => { setSelectedAddressIdx(idx); setCopied(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] border transition-colors text-left ${
                        idx === selectedAddressIdx
                          ? 'border-[var(--app-accent)] bg-[var(--app-accent-soft)]'
                          : 'border-[var(--app-border)] hover:bg-[var(--app-hover-bg)]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        idx === selectedAddressIdx
                          ? 'border-[var(--app-accent)]'
                          : 'border-[var(--app-text-tertiary)]'
                      }`}>
                        {idx === selectedAddressIdx && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
                        )}
                      </div>
                      <code className={`font-['JetBrains_Mono',monospace] text-[12px] ${
                        idx === selectedAddressIdx ? 'text-[var(--app-accent)]' : 'text-[var(--app-text-secondary)]'
                      }`}>
                        {addr.address.slice(0, 10)}...{addr.address.slice(-6)}
                      </code>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="p-4 bg-[var(--app-card-bg)] rounded-[12px] mb-5">
              <QRCodeSVG
                value={currentAddress.address}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Address */}
            <div className="w-full bg-[var(--app-hover-bg)] rounded-[10px] p-3 mb-4">
              <code className="font-['JetBrains_Mono',monospace] text-[12px] text-[var(--app-text)] break-all leading-[18px] block text-center">
                {currentAddress.address}
              </code>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-colors ${
                copied
                  ? 'bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]'
                  : 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('deposit.addressCopied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('deposit.copyAddress')}
                </>
              )}
            </button>

            {/* Warning */}
            <div className="flex items-start gap-2 mt-4 px-3 py-2.5 bg-[var(--app-status-pending-bg)] rounded-[8px] w-full">
              <AlertTriangle className="w-4 h-4 text-[var(--app-status-pending-text)] shrink-0 mt-0.5" />
              <span className="font-['Inter',sans-serif] text-[12px] text-[var(--app-status-pending-text)] leading-[16px]">
                {t('deposit.warning').replace('{chain}', selectedChain)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-[var(--app-text-tertiary)] text-[13px]">
            No address available for {selectedChain}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
