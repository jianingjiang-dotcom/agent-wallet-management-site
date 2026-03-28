import { useState } from 'react';
import { Shield, Bot, Wallet, CheckCircle, XCircle, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PactApproval, PactPermission } from '../../data/mockPacts';

interface PactApprovalCardProps {
  pact: PactApproval;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  onApprove: (pactId: string) => void;
  onReject: (pactId: string) => void;
  onModify: (pactId: string) => void;
}

export default function PactApprovalCard({ pact, status, onApprove, onReject, onModify }: PactApprovalCardProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const spec = pact.pactSpec;

  const permissionLabel = (p: PactPermission) => t(`pact.permission.${p}`);

  const formatDuration = (seconds: number) => {
    const days = Math.round(seconds / (24 * 60 * 60));
    return language === 'zh' ? `${days} 天` : `${days} days`;
  };

  return (
    <div className={`bg-[var(--app-card-bg)] border-2 rounded-[8px] p-4 w-full shadow-sm transition-all duration-300 ${
      status === 'approved' || status === 'modified'
        ? 'border-[var(--app-status-approved-text)]'
        : status === 'rejected'
        ? 'border-[var(--app-status-rejected-text)]'
        : 'border-[var(--app-pact-card-border)]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Shield className="w-[18px] h-[18px] text-[var(--app-pact-badge-text)] mr-2" strokeWidth={1.5} />
          <h4 className="font-semibold text-[var(--app-text)]">{t('pact.approvalRequest')}</h4>
        </div>
        {status === 'pending' && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-pact-badge-bg)] text-[var(--app-pact-badge-text)] animate-pulse">
            {t('pact.pending')}
          </span>
        )}
        {status === 'approved' && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]">
            {t('pact.approved')}
          </span>
        )}
        {status === 'rejected' && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-status-rejected-bg)] text-[var(--app-status-rejected-text)]">
            {t('pact.rejected')}
          </span>
        )}
        {status === 'modified' && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]">
            {t('pact.modified')}
          </span>
        )}
      </div>

      {/* Agent & Wallet info */}
      <div className="flex items-center gap-3 mb-3 text-[12px] text-[var(--app-text-secondary)]">
        <span className="flex items-center gap-1">
          <Bot className="w-3 h-3" /> {pact.agentName}
        </span>
        <span className="flex items-center gap-1">
          <Wallet className="w-3 h-3" /> {pact.walletName}
        </span>
      </div>

      {/* AI Summary */}
      <div className="text-[13px] leading-[20px] text-[var(--app-text)] mb-3">
        {pact.summary[language]}
      </div>

      {/* Permissions badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {spec.permissions.map((p) => (
          <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-pact-badge-bg)] text-[var(--app-pact-badge-text)]">
            {permissionLabel(p)}
          </span>
        ))}
      </div>

      {/* Expandable PactSpec Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[12px] text-[var(--app-text-secondary)] hover:text-[var(--app-text)] transition-colors mb-3 cursor-pointer"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {t('pact.specDetails')}
      </button>

      {expanded && (
        <div className="bg-[var(--app-pact-card-highlight)] rounded-[8px] p-3 mb-3 space-y-3 text-[12px] animate-[phase-fade_0.2s_ease-out]">
          {/* Policies */}
          <div>
            <div className="font-medium text-[var(--app-text-secondary)] mb-1.5">{t('pact.policies')}</div>
            <div className="space-y-2">
              {spec.policies.map((policy, idx) => (
                <div key={idx} className="bg-[var(--app-card-bg)] rounded-[6px] p-2.5 border border-[var(--app-border)]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      policy.effect === 'allow'
                        ? 'bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]'
                        : 'bg-[var(--app-status-rejected-bg)] text-[var(--app-status-rejected-text)]'
                    }`}>
                      {t(`pact.policy.${policy.effect}`)}
                    </span>
                    <span className="text-[var(--app-text)] font-medium">{policy.action}</span>
                  </div>
                  {policy.deny_if && policy.deny_if.length > 0 && (
                    <div className="text-[var(--app-text-tertiary)] mt-1">
                      <span className="text-[var(--app-status-rejected-text)]">{t('pact.denyIf')}:</span>{' '}
                      {policy.deny_if.join(', ')}
                    </div>
                  )}
                  {policy.review_if && policy.review_if.length > 0 && (
                    <div className="text-[var(--app-text-tertiary)] mt-0.5">
                      <span className="text-[var(--app-status-pending-text)]">{t('pact.reviewIf')}:</span>{' '}
                      {policy.review_if.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="flex justify-between">
            <span className="text-[var(--app-text-secondary)]">{t('pact.duration')}</span>
            <span className="text-[var(--app-text)] font-medium">{formatDuration(spec.duration_seconds)}</span>
          </div>

          {/* Completion Conditions */}
          {spec.completion_conditions.length > 0 && (
            <div>
              <div className="text-[var(--app-text-secondary)] mb-1">{t('pact.completionConditions')}</div>
              {spec.completion_conditions.map((cc, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-[var(--app-text-tertiary)]">
                    {cc.type === 'max_transactions' ? t('pact.maxTransactions') : t('pact.totalAmount')}
                  </span>
                  <span className="text-[var(--app-text)] font-medium font-['JetBrains_Mono',monospace]">
                    {cc.value}{cc.unit ? ` ${cc.unit}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Resource Scope */}
          <div>
            <div className="text-[var(--app-text-secondary)] mb-1">{t('pact.resourceScope')}</div>
            <div className="flex justify-between">
              <span className="text-[var(--app-text-tertiary)]">{t('pact.chains')}</span>
              <span className="text-[var(--app-text)]">{spec.resource_scope.chains.join(', ')}</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[var(--app-text-tertiary)]">{t('pact.tokens')}</span>
              <span className="text-[var(--app-text)]">{spec.resource_scope.tokens.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {status === 'pending' ? (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(pact.id)}
            className="flex-1 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[13px]"
          >
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            {t('pact.approve')}
          </button>
          <button
            onClick={() => onReject(pact.id)}
            className="flex-1 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] text-[var(--app-text)] font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[13px]"
          >
            <XCircle className="w-4 h-4" strokeWidth={1.5} />
            {t('pact.reject')}
          </button>
          <button
            onClick={() => onModify(pact.id)}
            className="flex-1 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] text-[var(--app-text)] font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[13px]"
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
            {t('pact.modify')}
          </button>
        </div>
      ) : (
        <div className={`text-center py-2 px-4 rounded-lg ${
          status === 'approved' || status === 'modified'
            ? 'bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]'
            : 'bg-[var(--app-status-rejected-bg)] text-[var(--app-status-rejected-text)]'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {status === 'approved' || status === 'modified'
              ? <><CheckCircle className="w-4 h-4" strokeWidth={1.5} /><span className="font-medium">{status === 'modified' ? t('pact.modified') : t('pact.approved')}</span></>
              : <><XCircle className="w-4 h-4" strokeWidth={1.5} /><span className="font-medium">{t('pact.rejected')}</span></>
            }
          </div>
        </div>
      )}
    </div>
  );
}
