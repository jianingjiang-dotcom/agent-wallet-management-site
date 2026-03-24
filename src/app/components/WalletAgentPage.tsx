import { Shield, Plus, ArrowRight, Download } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import WalletDetail from './WalletDetail';

interface WalletAgentPageProps {
  onSetupWallet?: () => void;
  onClaimWallet?: () => void;
  onDelegateWallet?: (walletId: string) => void;
}

export default function WalletAgentPage({ onSetupWallet, onClaimWallet, onDelegateWallet }: WalletAgentPageProps) {
  const { t } = useLanguage();
  const {
    wallets,
    hasWallets,
    selectWallet,
    freezeDelegation,
    unfreezeDelegation,
    removeDelegation,
    updateDelegationPermissions,
    updateDelegationPolicy,
    updateWallet,
    updateAgent,
    getDelegationsForWallet,
    getAgentById,
  } = useWalletStore();

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('wallet-store-updated', handler);
    return () => window.removeEventListener('wallet-store-updated', handler);
  }, []);

  // Auto-select first wallet when wallets exist but none selected
  useEffect(() => {
    if (hasWallets && (!selectedWalletId || !wallets.find(w => w.id === selectedWalletId))) {
      const firstId = wallets[0].id;
      setSelectedWalletId(firstId);
      selectWallet(firstId);
    }
  }, [hasWallets, wallets, selectedWalletId, selectWallet]);

  const handleSelectWallet = useCallback((walletId: string) => {
    setSelectedWalletId(walletId);
    selectWallet(walletId);
  }, [selectWallet]);

  const detailWallet = selectedWalletId
    ? wallets.find(w => w.id === selectedWalletId) || null
    : null;

  const noop = () => {};

  return (
    <div className="max-w-[768px] mx-auto">
      {detailWallet ? (
        <WalletDetail
          wallet={detailWallet}
          wallets={wallets}
          onSwitchWallet={handleSelectWallet}
          onFreeze={freezeDelegation}
          onUnfreeze={unfreezeDelegation}
          onRevoke={removeDelegation}
          onUpdatePermissions={updateDelegationPermissions}
          onUpdatePolicy={updateDelegationPolicy}
          onDelegateAgent={() => (onDelegateWallet || noop)(detailWallet.id)}
          onUpdateWallet={updateWallet}
          onUpdateAgentName={(agentId, name) => updateAgent(agentId, { name })}
          getDelegationsForWallet={getDelegationsForWallet}
          getAgentById={getAgentById}
          onSetupWallet={onSetupWallet}
          onClaimWallet={onClaimWallet}
        />
      ) : !hasWallets ? (
        /* ─── Welcome — no wallets ─── */
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-lg bg-white border border-[rgba(10,10,10,0.08)] rounded-[16px] p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-[72px] h-[72px] bg-gradient-to-br from-[rgba(79,94,255,0.12)] to-[rgba(79,94,255,0.04)] border-2 border-[rgba(79,94,255,0.15)] rounded-[20px] mb-6">
              <Shield className="w-9 h-9 text-[#4f5eff]" />
            </div>
            <h1 className="font-['Inter',sans-serif] font-bold text-[28px] md:text-[32px] text-[#0a0a0a] mb-3 leading-tight">
              {t('welcome.greeting')}
            </h1>
            <p className="font-['Inter',sans-serif] font-normal text-[15px] md:text-[16px] text-[#7c7c7c] mb-8 max-w-xl mx-auto leading-relaxed">
              {t('welcome.subtitle')}
            </p>
            <button
              onClick={onSetupWallet || noop}
              className="bg-[#4f5eff] hover:bg-[#3d4dd9] active:bg-[#2d3db9] text-white font-['Inter',sans-serif] font-semibold text-[15px] px-8 py-3.5 rounded-[12px] transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_4px_12px_0px_rgba(79,94,255,0.2)] inline-flex items-center gap-2.5 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_6px_20px_0px_rgba(79,94,255,0.28)]"
            >
              {t('welcome.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="mt-4">
              <button
                onClick={onClaimWallet || noop}
                className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] hover:text-[#4f5eff] transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {t('welcome.claimWallet')} <span className="underline">{t('welcome.claimAction')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
