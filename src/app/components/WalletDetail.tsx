import {
  Wallet,
  Shield,
  Plus,
  Pencil,
  Check,
  Copy,
  CheckCircle,
  UserPlus,
  ChevronDown,
  Download,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet as WalletType, WalletAddress, Delegation, Agent, Permission, Policy } from '../hooks/useWalletStore';
import { getWalletAssets, getWalletTransactions, getWalletTotalBalance, formatUsdValue } from '../data/mockAssets';
import DelegationCard from './DelegationCard';
import BalanceOverview from './wallet/BalanceOverview';
import AssetList from './wallet/AssetList';
import TransactionHistory from './wallet/TransactionHistory';

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

  // Wallet switcher
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset filters when wallet changes
  useEffect(() => {
    setSelectedChain(null);
    setSelectedAddress(null);
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

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header: wallet name + switcher + action buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Wallet name (editable) */}
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
                className="font-['Inter',sans-serif] font-normal text-[24px] leading-[32px] text-[#0a0a0a] bg-transparent border-b-2 border-[#4f5eff] outline-none py-0 px-0 w-[240px]"
              />
              <button onClick={handleSaveName} className="text-[#4f5eff] hover:text-[#2837d0] transition-colors p-1">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/name">
              <h1 className="font-['Inter',sans-serif] font-normal text-[24px] leading-[32px] text-[#0a0a0a]">
                {wallet.name}
              </h1>
              <button
                onClick={() => { setEditName(wallet.name); setIsEditingName(true); }}
                className="text-[#b0b0b0] hover:text-[#4f5eff] transition-colors p-1"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Agent count badge */}
          {hasDelegations ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-['Inter',sans-serif] font-medium text-[12px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              {walletDelegations.length} {t('walletPage.agents')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4d4d4]/20 text-[#b0b0b0] font-['Inter',sans-serif] font-medium text-[12px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4d4d4]" />
              {t('delegation.noAgent')}
            </span>
          )}

          {/* Wallet switcher — always visible */}
          <div className="relative" ref={switcherRef}>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#7c7c7c] border border-[rgba(10,10,10,0.1)] hover:bg-[#f5f5f5] hover:border-[rgba(10,10,10,0.15)] transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              {t('walletDetail.switchWallet')}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
            </button>
            {switcherOpen && (
              <div className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-[rgba(10,10,10,0.1)] rounded-[10px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] z-20 py-1">
                {wallets.map(w => {
                  const balance = getWalletTotalBalance(w);
                  return (
                    <button
                      key={w.id}
                      onClick={() => { onSwitchWallet(w.id); setSwitcherOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 transition-colors ${
                        w.id === wallet.id
                          ? 'bg-[rgba(79,94,255,0.04)]'
                          : 'hover:bg-[#f5f5f5]'
                      }`}
                    >
                      <div className={`font-['Inter',sans-serif] text-[13px] ${
                        w.id === wallet.id ? 'text-[#4f5eff] font-medium' : 'text-[#0a0a0a] font-normal'
                      }`}>
                        {w.name}
                      </div>
                      <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] mt-0.5">
                        {formatUsdValue(balance)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClaimWallet || noop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#7c7c7c] border border-[rgba(10,10,10,0.1)] hover:bg-[#f5f5f5] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t('walletPage.claimWallet')}
          </button>
          <button
            onClick={onSetupWallet || noop}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white bg-[#4f5eff] hover:bg-[#3d4dd9] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('walletPage.createNew')}
          </button>
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
        />
      </div>

      {/* [Card] Asset List */}
      <div className="mb-6">
        <AssetList
          assets={assets}
          selectedChain={selectedChain}
          selectedAddress={selectedAddress}
          walletAddresses={wallet.addresses}
        />
      </div>

      {/* [Card] Delegated Agents Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#4f5eff]" />
            <span className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
              {t('walletAgent.connectedAgent')}
            </span>
          </div>
          <button
            onClick={() => onDelegateAgent(wallet.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#4f5eff] border border-dashed border-[rgba(79,94,255,0.3)] hover:bg-[rgba(79,94,255,0.04)] transition-colors"
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
          <div className="bg-white border border-dashed border-[rgba(10,10,10,0.12)] rounded-[12px] p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[rgba(79,94,255,0.08)] flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-[#4f5eff]" />
            </div>
            <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[#7c7c7c] mb-1">
              {t('delegation.noAgent')}
            </p>
            <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0] mb-4">
              {t('walletDelegation.noAgentsDesc')}
            </p>
            <button
              onClick={() => onDelegateAgent(wallet.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white bg-[#4f5eff] hover:bg-[#3d4dd9] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('walletDetail.delegateAgent')}
            </button>
          </div>
        )}
      </div>

      {/* [Card] Transaction History */}
      <TransactionHistory
        transactions={transactions}
        selectedChain={selectedChain}
        selectedAddress={selectedAddress}
        walletAddresses={wallet.addresses}
      />
    </div>
  );
}
