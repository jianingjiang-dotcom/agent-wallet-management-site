import {
  Shield,
  Plus,
  Pencil,
  Check,
  MoreHorizontal,
  UserPlus,
  ChevronDown,
  Download,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet as WalletType, WalletAddress, Delegation, Agent, Permission, Policy } from '../hooks/useWalletStore';
import { getWalletAssets, getWalletTransactions, formatUsdValue } from '../data/mockAssets';
import DelegationCard from './DelegationCard';
import BalanceOverview from './wallet/BalanceOverview';
import AssetList from './wallet/AssetList';
import TransactionHistory from './wallet/TransactionHistory';
import TokenDetail from './wallet/TokenDetail';
import DepositModal from './wallet/DepositModal';
import SendModal from './wallet/SendModal';

interface WalletDetailProps {
  wallet: WalletType;
  wallets: WalletType[];
  onSwitchWallet: (walletId: string) => void;
  onFreeze: (delegationId: string) => void;
  onUnfreeze: (delegationId: string) => void;
  onRevoke: (delegationId: string) => void;
  onUpdatePermissions: (delegationId: string, permissions: Permission[]) => void;
  onUpdatePolicy: (delegationId: string, policy: Partial<Policy>) => void;
  onDelegateAgent: (walletId: string) => void;
  onUpdateWallet?: (walletId: string, updates: Partial<WalletType>) => void;
  onUpdateAgentName?: (agentId: string, name: string) => void;
  getDelegationsForWallet: (walletId: string) => Delegation[];
  getAgentById: (agentId: string) => Agent | null;
  onSetupWallet?: () => void;
  onClaimWallet?: () => void;
}

export default function WalletDetail({
  wallet,
  wallets,
  onSwitchWallet,
  onFreeze,
  onUnfreeze,
  onRevoke,
  onUpdatePermissions,
  onUpdatePolicy,
  onDelegateAgent,
  onUpdateWallet,
  onUpdateAgentName,
  getDelegationsForWallet,
  getAgentById,
  onSetupWallet,
  onClaimWallet,
}: WalletDetailProps) {
  const { t } = useLanguage();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(wallet.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  // Wallet switcher (merged with name)
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // More menu ("..." button)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Tabbed panel
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');

  // Token detail view
  const [selectedToken, setSelectedToken] = useState<{ tokenId: string; chainId: string } | null>(null);

  // Modals
  const [depositOpen, setDepositOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendPreselect, setSendPreselect] = useState<{ tokenId: string; chainId: string } | undefined>(undefined);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset filters when wallet changes
  useEffect(() => {
    setSelectedChain(null);
    setSelectedAddress(null);
    setSelectedToken(null);
  }, [wallet.id]);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== wallet.name && onUpdateWallet) {
      onUpdateWallet(wallet.id, { name: trimmed });
    } else {
      setEditName(wallet.name);
    }
    setIsEditingName(false);
  };

  // Mock data (deterministic per wallet)
  const assets = useMemo(() => getWalletAssets(wallet), [wallet.id]);
  const transactions = useMemo(() => getWalletTransactions(wallet), [wallet.id]);

  const walletDelegations = getDelegationsForWallet(wallet.id);
  const hasDelegations = walletDelegations.length > 0;

  const noop = () => {};

  const handleOpenSend = (tokenId?: string, chainId?: string) => {
    if (tokenId && chainId) {
      setSendPreselect({ tokenId, chainId });
    } else {
      setSendPreselect(undefined);
    }
    setSendOpen(true);
  };

  // Token detail view
  if (selectedToken) {
    return (
      <>
        <TokenDetail
          wallet={wallet}
          tokenId={selectedToken.tokenId}
          chainId={selectedToken.chainId}
          assets={assets}
          transactions={transactions}
          onBack={() => setSelectedToken(null)}
          onDeposit={() => setDepositOpen(true)}
          onSend={(tokenId, chainId) => handleOpenSend(tokenId, chainId)}
        />
        <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} wallet={wallet} />
        <SendModal
          open={sendOpen}
          onClose={() => setSendOpen(false)}
          wallet={wallet}
          assets={assets}
          preselectedToken={sendPreselect}
        />
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-0">
      {/* Header: wallet name/switcher + agent badge + more menu + action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
          {/* Wallet name = switcher trigger / inline edit */}
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') { setEditName(wallet.name); setIsEditingName(false); }
                }}
                className="font-['Inter',sans-serif] font-normal text-[24px] leading-[32px] text-[var(--app-text)] bg-transparent border-b-2 border-[var(--app-accent)] outline-none py-0 px-0 w-[240px]"
              />
              <button onClick={handleSaveName} className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] transition-colors p-1">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-1.5 group/switcher"
              >
                <h1 className="font-['Inter',sans-serif] font-normal text-[20px] sm:text-[24px] leading-[28px] sm:leading-[32px] text-[var(--app-text)]">
                  {wallet.name}
                </h1>
                <ChevronDown className={`w-4 h-4 text-[var(--app-text-tertiary)] group-hover/switcher:text-[var(--app-text-secondary)] transition-all ${switcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {switcherOpen && (
                <div className="absolute top-full left-0 mt-2 w-[300px] bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[10px] shadow-[var(--app-dropdown-shadow)] z-20 py-1">
                  {wallets.map(w => (
                    <button
                      key={w.id}
                      onClick={() => { onSwitchWallet(w.id); setSwitcherOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 transition-colors ${
                        w.id === wallet.id
                          ? 'bg-[var(--app-accent-soft-hover)]'
                          : 'hover:bg-[var(--app-hover-bg)]'
                      }`}
                    >
                      <div className={`font-['Inter',sans-serif] text-[13px] ${
                        w.id === wallet.id ? 'text-[var(--app-accent)] font-medium' : 'text-[var(--app-text)] font-normal'
                      }`}>
                        {w.name}
                      </div>
                      <div className="font-['JetBrains_Mono',monospace] font-normal text-[11px] text-[var(--app-text-tertiary)] mt-0.5">
                        {t('walletDetail.walletId')}: {w.id}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Agent count badge */}
          {hasDelegations ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--app-success-soft)] text-[var(--app-success)] font-['Inter',sans-serif] font-medium text-[12px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--app-success)]" />
              {walletDelegations.length} {t('walletPage.agents')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--app-badge-inactive-bg)] text-[var(--app-text-tertiary)] font-['Inter',sans-serif] font-medium text-[12px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--app-badge-inactive-dot)]" />
              {t('delegation.noAgent')}
            </span>
          )}

          {/* More menu "..." */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-1.5 rounded-[6px] text-[var(--app-text-tertiary)] hover:text-[var(--app-text-secondary)] hover:bg-[var(--app-hover-bg)] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {moreMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-[180px] bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[10px] shadow-[var(--app-dropdown-shadow)] z-20 py-1">
                <button
                  onClick={() => {
                    setEditName(wallet.name);
                    setIsEditingName(true);
                    setMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--app-hover-bg)] transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-[var(--app-text-tertiary)]" />
                  <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text)]">
                    {t('walletDetail.rename')}
                  </span>
                </button>
                <button
                  onClick={() => { onClaimWallet?.(); setMoreMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--app-hover-bg)] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--app-text-tertiary)]" />
                  <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text)]">
                    {t('walletPage.claimWallet')}
                  </span>
                </button>
                <button
                  onClick={() => { onSetupWallet?.(); setMoreMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--app-hover-bg)] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--app-text-tertiary)]" />
                  <span className="font-['Inter',sans-serif] text-[13px] text-[var(--app-text)]">
                    {t('walletPage.createNew')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* [Card] Balance Overview */}
      <div className="mb-6">
        <BalanceOverview
          wallet={wallet}
          assets={assets}
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
          selectedAddress={selectedAddress}
          onAddressChange={setSelectedAddress}
          onDeposit={() => setDepositOpen(true)}
          onSend={() => handleOpenSend()}
        />
      </div>

      {/* [Card] Tabbed Panel: Assets + Transactions */}
      <div className="mb-6">
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 sm:p-5">
          {/* Tab header */}
          <div className="flex items-center gap-1 mb-4">
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-colors ${
                activeTab === 'assets'
                  ? 'bg-[var(--app-text)] text-white'
                  : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-hover-bg)]'
              }`}
            >
              {t('walletDetail.assets')}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-[var(--app-text)] text-white'
                  : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-hover-bg)]'
              }`}
            >
              {t('walletDetail.transactions')}
            </button>
          </div>

          {/* Tab content with max height + scroll */}
          <div className="max-h-[480px] overflow-y-auto">
            {activeTab === 'assets' ? (
              <AssetList
                assets={assets}
                selectedChain={selectedChain}
                selectedAddress={selectedAddress}
                walletAddresses={wallet.addresses}
                headless
                onSelectToken={(tokenId, chainId) => setSelectedToken({ tokenId, chainId })}
                onSendToken={(tokenId, chainId) => handleOpenSend(tokenId, chainId)}
              />
            ) : (
              <TransactionHistory
                transactions={transactions}
                selectedChain={selectedChain}
                selectedAddress={selectedAddress}
                walletAddresses={wallet.addresses}
                headless
              />
            )}
          </div>
        </div>
      </div>

      {/* [Card] Delegated Agents Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--app-accent)]" />
            <span className="font-['Inter',sans-serif] font-semibold text-[16px] text-[var(--app-text)]">
              {t('walletAgent.connectedAgent')}
            </span>
          </div>
          <button
            onClick={() => onDelegateAgent(wallet.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[var(--app-accent)] border border-dashed border-[var(--app-border-dashed)] hover:bg-[var(--app-accent-soft-hover)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('walletDetail.delegateAgent')}
          </button>
        </div>

        {hasDelegations ? (
          <div className="space-y-3">
            {walletDelegations.map((delegation) => (
              <DelegationCard
                key={delegation.id}
                delegation={delegation}
                agent={getAgentById(delegation.agentId)}
                isOriginAgent={wallet.originAgentId === delegation.agentId}
                onFreeze={onFreeze}
                onUnfreeze={onUnfreeze}
                onRevoke={onRevoke}
                onUpdatePermissions={onUpdatePermissions}
                onUpdatePolicy={onUpdatePolicy}
                onUpdateAgentName={onUpdateAgentName}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--app-card-bg)] border border-dashed border-[var(--app-border-dashed)] rounded-[12px] p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--app-accent-soft)] flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-[var(--app-accent)]" />
            </div>
            <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text-secondary)] mb-1">
              {t('delegation.noAgent')}
            </p>
            <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-tertiary)] mb-4">
              {t('walletDelegation.noAgentsDesc')}
            </p>
            <button
              onClick={() => onDelegateAgent(wallet.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('walletDetail.delegateAgent')}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} wallet={wallet} />
      <SendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        wallet={wallet}
        assets={assets}
        preselectedToken={sendPreselect}
      />
    </div>
  );
}
