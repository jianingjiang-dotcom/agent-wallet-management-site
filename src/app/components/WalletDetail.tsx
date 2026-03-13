import {
  ArrowLeft,
  Wallet,
  Shield,
  Pause,
  Play,
  Ban,
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
  XCircle,
  UserPlus,
  ToggleRight,
  Settings,
  Snowflake,
  type LucideIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Wallet as WalletType, Permission, Policy } from '../hooks/useWalletStore';
import PermissionsPanel from './PermissionsPanel';
import PolicyPanel from './PolicyPanel';

interface WalletDetailProps {
  wallet: WalletType;
  onBack: () => void;
  onFreeze: (walletId: string) => void;
  onUnfreeze: (walletId: string) => void;
  onRevoke: (walletId: string) => void;
  onUpdatePermissions: (walletId: string, permissions: Permission[]) => void;
  onUpdatePolicy: (walletId: string, policy: Partial<Policy>) => void;
  onDelegateAgent: (walletId: string) => void;
  onUpdateWallet?: (walletId: string, updates: Partial<WalletType>) => void;
}

export default function WalletDetail({
  wallet,
  onBack,
  onFreeze,
  onUnfreeze,
  onRevoke,
  onUpdatePermissions,
  onUpdatePolicy,
  onDelegateAgent,
  onUpdateWallet,
}: WalletDetailProps) {
  const { t } = useLanguage();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(wallet.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const delegation = wallet.delegation;
  const hasDelegation = delegation !== null;

  const handleFreeze = () => {
    onFreeze(wallet.id);
  };

  const handleUnfreeze = () => {
    onUnfreeze(wallet.id);
  };

  const handleRevoke = () => {
    setShowRevokeConfirm(true);
  };

  const handleConfirmRevoke = () => {
    onRevoke(wallet.id);
    setShowRevokeConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-['Inter',sans-serif] font-medium text-[14px] text-[#4f5eff] hover:text-[#2837d0] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('walletDetail.back')}
      </button>

      {/* Wallet Name Header + Status + Action Buttons */}
      <div className="flex items-center gap-3 mb-6">
        {/* Left: Name + Edit + Badge */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
                className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] bg-transparent border-b-2 border-[#4f5eff] outline-none py-0 px-0 w-[240px]"
              />
              <button
                onClick={handleSaveName}
                className="text-[#4f5eff] hover:text-[#2837d0] transition-colors p-1"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/name">
              <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a]">
                {wallet.name}
              </h1>
              <button
                onClick={() => { setEditName(wallet.name); setIsEditingName(true); }}
                className="text-[#b0b0b0] hover:text-[#4f5eff] transition-colors p-1 opacity-0 group-hover/name:opacity-100"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          {hasDelegation ? (
            delegation.status === 'active' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-['Inter',sans-serif] font-medium text-[12px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eab308]/10 text-[#eab308] font-['Inter',sans-serif] font-medium text-[12px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                {t('delegation.paused')}
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4d4d4]/20 text-[#b0b0b0] font-['Inter',sans-serif] font-medium text-[12px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4d4d4]" />
              {t('delegation.noAgent')}
            </span>
          )}
        </div>

        {/* Right: Action Buttons */}
        {hasDelegation && (
          <div className="flex items-center gap-2 shrink-0">
            {delegation.status === 'active' ? (
              <button
                onClick={handleFreeze}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#eab308] border border-[#eab308]/30 hover:bg-[#eab308]/5 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                {t('delegation.pauseAction')}
              </button>
            ) : (
              <button
                onClick={handleUnfreeze}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#22c55e]/5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {t('delegation.resumeAction')}
              </button>
            )}
            <button
              onClick={handleRevoke}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[12px] text-[#ef4444] border border-[#ef4444]/20 hover:bg-[#ef4444]/5 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" />
              {t('delegation.revokeAction')}
            </button>
          </div>
        )}
      </div>

      {/* Frozen Banner */}
      {hasDelegation && delegation.status === 'frozen' && (
        <div className="flex items-center bg-[#eab308]/5 border-l-4 border-[#eab308] rounded-r-[8px] px-4 py-3 mb-6">
          <Pause className="w-4 h-4 text-[#eab308]" />
          <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#92400e] ml-2">
            {t('delegation.frozenBanner')}
          </span>
        </div>
      )}

      {/* Top Section: Wallet & Agent Overview */}
      <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Wallet Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-[#4f5eff]" />
              <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#7c7c7c] uppercase tracking-wide">
                {t('walletAgent.yourWallet')}
              </span>
            </div>
            <div className="space-y-3">
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
          </div>

          {/* Right: Agent Info */}
          <div className="md:border-l md:border-[rgba(10,10,10,0.08)] md:pl-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#4f5eff]" />
              <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#7c7c7c] uppercase tracking-wide">
                {t('walletAgent.connectedAgent')}
              </span>
            </div>
            {hasDelegation ? (
              <div className="space-y-3">
                <div>
                  <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0] mb-0.5">
                    {t('onboarding.success.agentId')}
                  </div>
                  <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[13px] text-[#0a0a0a]">
                    {delegation.agentId}
                  </code>
                </div>
                <div>
                  <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#b0b0b0] mb-0.5">
                    {t('walletAgent.connectedSince')}
                  </div>
                  <div className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c]">
                    {formatDate(delegation.connectedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="font-['Inter',sans-serif] font-normal text-[14px] text-[#b0b0b0] mb-3">
                  {t('delegation.noAgent')}
                </div>
                <button
                  onClick={() => onDelegateAgent(wallet.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-[#4f5eff] border border-dashed border-[rgba(79,94,255,0.3)] hover:bg-[rgba(79,94,255,0.04)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('walletDetail.delegateAgent')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permissions Panel */}
      <PermissionsPanel
        permissions={hasDelegation ? delegation.permissions : []}
        onUpdate={(perms) => onUpdatePermissions(wallet.id, perms)}
        disabled={!hasDelegation}
      />

      {/* Policy Panel */}
      <PolicyPanel
        policy={hasDelegation ? delegation.policy : { singleTxLimit: 10, dailyLimit: 50, approvalRequired: true }}
        disabled={!hasDelegation}
      />

      {/* Activity Log */}
      <ActivityLog t={t} walletCreatedAt={wallet.createdAt} />

      {/* Revoke Confirmation Modal */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[16px] p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-[#ef4444]" />
              </div>
              <h3 className="font-['Inter',sans-serif] font-semibold text-[18px] text-[#0a0a0a]">
                {t('delegation.revokeConfirmTitle')}
              </h3>
            </div>
            <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#7c7c7c] mb-4 leading-relaxed">
              {t('delegation.revokeConfirmDesc')}
            </p>
            {delegation && (
              <div className="bg-[#fafafa] rounded-[8px] px-4 py-3 mb-5">
                <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#b0b0b0] uppercase tracking-wider mb-1">
                  Agent ID
                </div>
                <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[13px] text-[#0a0a0a]">
                  {delegation.agentId}
                </code>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRevokeConfirm(false)}
                className="flex-1 bg-[#f5f5f5] hover:bg-[#ebebeb] text-[#0a0a0a] font-['Inter',sans-serif] font-medium text-[14px] py-3 rounded-[10px] transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white font-['Inter',sans-serif] font-medium text-[14px] py-3 rounded-[10px] transition-colors flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                {t('delegation.revokeConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
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
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${log.iconColor}14` }}
              >
                <Icon className="w-4 h-4" style={{ color: log.iconColor }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0a0a0a]">
                    {t(log.labelKey)}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] font-['Inter',sans-serif] font-medium text-[10px] ${actorStyle.bg} ${actorStyle.text}`}>
                    {t(`log.actor.${log.actor}`)}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] font-['Inter',sans-serif] font-medium text-[10px] ${statusStyle.bg} ${statusStyle.text}`}>
                    {t(`log.status.${log.status}`)}
                  </span>
                </div>
                <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] mt-0.5 truncate">
                  {t(log.detailKey)}
                </p>
              </div>

              {/* Timestamp */}
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
