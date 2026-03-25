import {
  Wallet,
  Shield,
  Clock,
  Plus,
  Pencil,
  Check,
  Send,
  FileCode,
  RefreshCw,
  Lock,
  AlertTriangle,
  CheckCircle,
  Copy,
  XCircle,
  UserPlus,
  ToggleRight,
  Settings,
  Snowflake,
  Ban,
  Play,
  Pause,
  ChevronDown,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet as WalletType, WalletAddress, Delegation, Agent, Permission, Policy } from '../hooks/useWalletStore';
import DelegationCard from './DelegationCard';

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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== wallet.name && onUpdateWallet) {
      onUpdateWallet(wallet.id, { name: trimmed });
    } else {
      setEditName(wallet.name);
    }
    setIsEditingName(false);
  };

  const walletDelegations = getDelegationsForWallet(wallet.id);
  const hasDelegations = walletDelegations.length > 0;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const noop = () => {};

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header: wallet switcher + action buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Wallet name / switcher */}
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
          {/* Wallet switcher button */}
          {wallets.length > 1 && (
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
                <div className="absolute top-full left-0 mt-1 w-[220px] bg-white border border-[rgba(10,10,10,0.1)] rounded-[10px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] z-20 py-1">
                  {wallets.map(w => (
                    <button
                      key={w.id}
                      onClick={() => { onSwitchWallet(w.id); setSwitcherOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-[13px] font-['Inter',sans-serif] transition-colors ${
                        w.id === wallet.id
                          ? 'text-[#4f5eff] bg-[rgba(79,94,255,0.04)] font-medium'
                          : 'text-[#0a0a0a] hover:bg-[#f5f5f5] font-normal'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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

      {/* Wallet Overview */}
      <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-[#4f5eff]" />
          <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#7c7c7c] uppercase tracking-wide">
            {t('walletAgent.yourWallet')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0] mb-0.5">
              {t('onboarding.success.walletId')}
            </div>
            <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[13px] text-[#0a0a0a]">
              {wallet.id}
            </code>
          </div>
          <div>
            <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0] mb-0.5">
              {t('delegation.createdAt')}
            </div>
            <div className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c]">
              {formatDate(wallet.createdAt)}
            </div>
          </div>
        </div>

        {/* Addresses by chain */}
        <div>
          <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0] mb-2">
            {t('walletDetail.addresses')}
          </div>
          {wallet.addresses.length > 0 ? (
            <div className="space-y-2">
              {wallet.addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] bg-[#fafafa] border border-[rgba(10,10,10,0.06)] group/addr"
                >
                  <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#4f5eff] bg-[rgba(79,94,255,0.08)] px-2 py-0.5 rounded-[6px] uppercase tracking-wider shrink-0 min-w-[44px] text-center">
                    {addr.chain}
                  </span>
                  <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[12px] text-[#0a0a0a] break-all flex-1">
                    {addr.address}
                  </code>
                  <button
                    onClick={() => handleCopyAddress(addr.address)}
                    className={`shrink-0 p-1 rounded-[6px] transition-colors ${
                      copiedAddress === addr.address
                        ? 'text-[#22c55e]'
                        : 'text-[#b0b0b0] hover:text-[#4f5eff] opacity-0 group-hover/addr:opacity-100'
                    }`}
                    title={t('walletDetail.copyAddress')}
                  >
                    {copiedAddress === addr.address ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2.5 rounded-[8px] bg-[#fafafa] border border-dashed border-[rgba(10,10,10,0.1)]">
              <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
                {t('walletDetail.noAddresses')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delegated Agents Section */}
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

      {/* Activity Log */}
      <ActivityLog t={t} walletCreatedAt={wallet.createdAt} />
    </div>
  );
}

// --- Activity Log Component ---

interface LogEntry {
  id: string;
  actionType: string;
  actor: 'user' | 'agent' | 'system';
  labelKey: string;
  detailKey: string;
  status: 'success' | 'failed' | 'pending';
  icon: LucideIcon;
  iconColor: string;
  minutesAgo: number;
}

const MOCK_LOGS: LogEntry[] = [
  { id: '1',  actionType: 'wallet_created',      actor: 'system', labelKey: 'log.walletCreated',      detailKey: 'log.detail.walletCreated',      status: 'success', icon: Wallet,        iconColor: '#4f5eff', minutesAgo: 4320 },
  { id: '2',  actionType: 'agent_delegated',      actor: 'user',   labelKey: 'log.agentDelegated',      detailKey: 'log.detail.agentDelegated',      status: 'success', icon: UserPlus,      iconColor: '#4f5eff', minutesAgo: 4310 },
  { id: '3',  actionType: 'transfer_executed',    actor: 'agent',  labelKey: 'log.transferExecuted',    detailKey: 'log.detail.transferExecuted',    status: 'success', icon: Send,          iconColor: '#22c55e', minutesAgo: 3600 },
  { id: '4',  actionType: 'contract_called',      actor: 'agent',  labelKey: 'log.contractCalled',      detailKey: 'log.detail.contractCalled',      status: 'success', icon: FileCode,      iconColor: '#22c55e', minutesAgo: 3000 },
  { id: '5',  actionType: 'permission_updated',   actor: 'user',   labelKey: 'log.permissionUpdated',   detailKey: 'log.detail.permissionEnabled',   status: 'success', icon: ToggleRight,   iconColor: '#4f5eff', minutesAgo: 2800 },
  { id: '6',  actionType: 'swap_executed',         actor: 'agent',  labelKey: 'log.swapExecuted',        detailKey: 'log.detail.swapExecuted',        status: 'success', icon: RefreshCw,     iconColor: '#22c55e', minutesAgo: 2400 },
  { id: '7',  actionType: 'policy_updated',        actor: 'user',   labelKey: 'log.policyUpdated',       detailKey: 'log.detail.policyLimitUpdated',  status: 'success', icon: Settings,      iconColor: '#4f5eff', minutesAgo: 2000 },
  { id: '8',  actionType: 'policy_updated',        actor: 'user',   labelKey: 'log.policyUpdated',       detailKey: 'log.detail.dailyLimitUpdated',   status: 'success', icon: Settings,      iconColor: '#4f5eff', minutesAgo: 1999 },
  { id: '9',  actionType: 'transfer_rejected',     actor: 'system', labelKey: 'log.transferRejected',    detailKey: 'log.detail.transferRejected',    status: 'failed',  icon: AlertTriangle, iconColor: '#ef4444', minutesAgo: 1500 },
  { id: '10', actionType: 'approval_requested',    actor: 'agent',  labelKey: 'log.approvalRequested',   detailKey: 'log.detail.approvalRequested',   status: 'pending', icon: Clock,         iconColor: '#f59e0b', minutesAgo: 1200 },
  { id: '11', actionType: 'approval_granted',      actor: 'user',   labelKey: 'log.approvalGranted',     detailKey: 'log.detail.approvalGranted',     status: 'success', icon: CheckCircle,   iconColor: '#22c55e', minutesAgo: 1180 },
  { id: '12', actionType: 'stake_executed',         actor: 'agent',  labelKey: 'log.stakeExecuted',       detailKey: 'log.detail.stakeExecuted',       status: 'success', icon: Lock,          iconColor: '#22c55e', minutesAgo: 900  },
  { id: '13', actionType: 'wallet_renamed',         actor: 'user',   labelKey: 'log.walletRenamed',       detailKey: 'log.detail.walletRenamed',       status: 'success', icon: Pencil,        iconColor: '#7c7c7c', minutesAgo: 600  },
  { id: '14', actionType: 'delegation_frozen',      actor: 'user',   labelKey: 'log.delegationFrozen',    detailKey: 'log.detail.delegationFrozen',    status: 'success', icon: Snowflake,     iconColor: '#eab308', minutesAgo: 300  },
  { id: '15', actionType: 'delegation_resumed',     actor: 'user',   labelKey: 'log.delegationResumed',   detailKey: 'log.detail.delegationResumed',   status: 'success', icon: Play,          iconColor: '#22c55e', minutesAgo: 120  },
  { id: '16', actionType: 'permission_updated',    actor: 'user',   labelKey: 'log.permissionUpdated',   detailKey: 'log.detail.permissionDisabled',  status: 'success', icon: ToggleRight,   iconColor: '#4f5eff', minutesAgo: 60   },
  { id: '17', actionType: 'approval_requested',    actor: 'agent',  labelKey: 'log.approvalRequested',   detailKey: 'log.detail.approvalRequested',   status: 'pending', icon: Clock,         iconColor: '#f59e0b', minutesAgo: 30   },
  { id: '18', actionType: 'approval_denied',        actor: 'user',   labelKey: 'log.approvalDenied',      detailKey: 'log.detail.approvalDenied',      status: 'success', icon: XCircle,       iconColor: '#ef4444', minutesAgo: 25   },
  { id: '19', actionType: 'delegation_revoked',     actor: 'user',   labelKey: 'log.delegationRevoked',   detailKey: 'log.detail.delegationRevoked',   status: 'success', icon: Ban,           iconColor: '#ef4444', minutesAgo: 10   },
];

function formatTimeAgo(minutesAgo: number, baseDate: string): string {
  const base = new Date(baseDate).getTime();
  const ts = new Date(base + (4320 - minutesAgo) * 60000);
  const month = String(ts.getMonth() + 1).padStart(2, '0');
  const day = String(ts.getDate()).padStart(2, '0');
  const hours = String(ts.getHours()).padStart(2, '0');
  const mins = String(ts.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${mins}`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  success: { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
  failed:  { bg: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
  pending: { bg: 'bg-[#f59e0b]/10', text: 'text-[#f59e0b]' },
};

const ACTOR_STYLES: Record<string, { bg: string; text: string }> = {
  user:   { bg: 'bg-[#4f5eff]/10', text: 'text-[#4f5eff]' },
  agent:  { bg: 'bg-[#22c55e]/10', text: 'text-[#22c55e]' },
  system: { bg: 'bg-[#7c7c7c]/10', text: 'text-[#7c7c7c]' },
};

function ActivityLog({ t, walletCreatedAt }: { t: (key: string) => string; walletCreatedAt: string }) {
  return (
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
          {t('walletAgent.activityLog')}
        </h2>
        <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0]">
          {MOCK_LOGS.length} entries
        </span>
      </div>
      <div className="divide-y divide-[rgba(10,10,10,0.06)]">
        {[...MOCK_LOGS].reverse().map((log) => {
          const Icon = log.icon;
          const statusStyle = STATUS_STYLES[log.status];
          const actorStyle = ACTOR_STYLES[log.actor];
          return (
            <div key={log.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${log.iconColor}14` }}
              >
                <Icon className="w-4 h-4" style={{ color: log.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0a0a0a]">
                    {t(log.labelKey)}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-[6px] font-['Inter',sans-serif] font-medium text-[10px] ${actorStyle.bg} ${actorStyle.text}`}>
                    {t(`log.actor.${log.actor}`)}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-[6px] font-['Inter',sans-serif] font-medium text-[10px] ${statusStyle.bg} ${statusStyle.text}`}>
                    {t(`log.status.${log.status}`)}
                  </span>
                </div>
                <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] mt-0.5 truncate">
                  {t(log.detailKey)}
                </p>
              </div>
              <span className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[11px] text-[#b0b0b0] shrink-0 mt-1">
                {formatTimeAgo(log.minutesAgo, walletCreatedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
