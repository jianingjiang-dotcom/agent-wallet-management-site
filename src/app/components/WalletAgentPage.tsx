import { Shield, Plus, ArrowRight, Zap, Eye, ShieldCheck, Download } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import WalletCard from './WalletCard';
import WalletDetail from './WalletDetail';

interface DashboardContext {
  onSetupWallet: () => void;
  onClaimWallet: () => void;
  onDelegateWallet: (walletId: string) => void;
}

export default function WalletAgentPage() {
  const { onSetupWallet, onClaimWallet, onDelegateWallet } = useOutletContext<DashboardContext>();
  const { t } = useLanguage();
  const {
    wallets,
    agents,
    delegations,
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

  useEffect(() => {
    if (!hasWallets) {
      onSetupWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectWallet = useCallback((walletId: string) => {
    setSelectedWalletId(walletId);
    selectWallet(walletId);
  }, [selectWallet]);

  const handleBack = useCallback(() => {
    setSelectedWalletId(null);
    selectWallet(null);
  }, [selectWallet]);

  const detailWallet = selectedWalletId
    ? wallets.find(w => w.id === selectedWalletId) || null
    : null;

  const features = [
    { icon: Zap, title: t('welcome.feat1.title'), desc: t('welcome.feat1.desc') },
    { icon: ShieldCheck, title: t('welcome.feat2.title'), desc: t('welcome.feat2.desc') },
    { icon: Eye, title: t('welcome.feat3.title'), desc: t('welcome.feat3.desc') },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {detailWallet ? (
        <WalletDetail
          wallet={detailWallet}
          onBack={handleBack}
          onFreeze={freezeDelegation}
          onUnfreeze={unfreezeDelegation}
          onRevoke={removeDelegation}
          onUpdatePermissions={updateDelegationPermissions}
          onUpdatePolicy={updateDelegationPolicy}
          onDelegateAgent={() => onDelegateWallet(detailWallet.id)}
          onUpdateWallet={updateWallet}
          onUpdateAgentName={(agentId, name) => updateAgent(agentId, { name })}
          getDelegationsForWallet={getDelegationsForWallet}
          getAgentById={getAgentById}
        />
      ) : !hasWallets ? (
        /* ─── State A: Welcome — no wallets ─── */
        <div className="flex flex-col items-center">
          <div className="w-full bg-white border border-[rgba(10,10,10,0.08)] rounded-[16px] p-8 md:p-12 text-center mb-6">
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
              onClick={onSetupWallet}
              className="bg-[#4f5eff] hover:bg-[#3d4dd9] active:bg-[#2d3db9] text-white font-['Inter',sans-serif] font-semibold text-[15px] px-8 py-3.5 rounded-[12px] transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_4px_12px_0px_rgba(79,94,255,0.2)] inline-flex items-center gap-2.5 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_6px_20px_0px_rgba(79,94,255,0.28)]"
            >
              {t('welcome.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
            {/* Claim wallet secondary entry */}
            <div className="mt-4">
              <button
                onClick={onClaimWallet}
                className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] hover:text-[#4f5eff] transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {t('welcome.claimWallet')} <span className="underline">{t('welcome.claimAction')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[rgba(79,94,255,0.08)] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#4f5eff]" />
                  </div>
                  <h3 className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#0a0a0a]">{feat.title}</h3>
                  <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ─── State B: Wallet grid ─── */
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-1">
                {t('walletPage.title')}
              </h1>
              <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#7c7c7c]">
                {t('walletPage.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClaimWallet}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#7c7c7c] border border-[rgba(10,10,10,0.1)] hover:bg-[#f5f5f5] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {t('walletPage.claimWallet')}
              </button>
              <button
                onClick={onSetupWallet}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white bg-[#4f5eff] hover:bg-[#3d4dd9] transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('walletPage.createNew')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                delegationCount={getDelegationsForWallet(wallet.id).length}
                onSelect={handleSelectWallet}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
