import { useState } from 'react';
import { Shield, Bot, Wallet, CheckCircle, XCircle, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PactApproval, PactPolicy } from '../../data/mockPacts';

interface PactApprovalCardProps {
  pact: PactApproval;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  onApprove: (pactId: string) => void;
  onReject: (pactId: string) => void;
  onModify: (pactId: string) => void;
}

// Convert kebab-case to readable: "allow-weth-withdraw" → "Allow WETH Withdraw"
function policyNameToReadable(name: string): string {
  return name
    .split('-')
    .map((word) => {
      if (word.toUpperCase() === word || (word.length <= 5 && /^[a-z]+$/.test(word) === false)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Truncate address
function truncateAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Format duration with smart units
function formatDurationSmart(seconds: number, lang: string): string {
  if (seconds < 3600) {
    const mins = Math.round(seconds / 60);
    return lang === 'zh' ? `${mins} 分钟` : `${mins} min`;
  }
  if (seconds < 86400) {
    const hours = Math.round(seconds / 3600);
    return lang === 'zh' ? `${hours} 小时` : `${hours}h`;
  }
  const days = Math.round(seconds / 86400);
  return lang === 'zh' ? `${days} 天` : `${days} days`;
}

// Render deny_if conditions as readable strings
function renderDenyConditions(policy: PactPolicy, lang: string): string[] {
  const conditions: string[] = [];
  const denyIf = policy.rules.deny_if;
  if (!denyIf) return conditions;
  if (denyIf.amount_usd_gt) conditions.push(lang === 'zh' ? `金额 > $${denyIf.amount_usd_gt}` : `amount > $${denyIf.amount_usd_gt}`);
  if (denyIf.usage_limits?.rolling_24h) {
    const r = denyIf.usage_limits.rolling_24h;
    if (r.tx_count_gt !== undefined) conditions.push(lang === 'zh' ? `24h 交易次数 > ${r.tx_count_gt}` : `24h tx count > ${r.tx_count_gt}`);
    if (r.amount_usd_gt) conditions.push(lang === 'zh' ? `24h 累计金额 > $${r.amount_usd_gt}` : `24h total > $${r.amount_usd_gt}`);
  }
  return conditions;
}

// Render review_if conditions
function renderReviewConditions(policy: PactPolicy, lang: string): string[] {
  const conditions: string[] = [];
  const reviewIf = policy.rules.review_if;
  if (!reviewIf) return conditions;
  if (reviewIf.amount_usd_gt) conditions.push(lang === 'zh' ? `金额 > $${reviewIf.amount_usd_gt}` : `amount > $${reviewIf.amount_usd_gt}`);
  if (reviewIf.usage_limits?.rolling_24h) {
    const r = reviewIf.usage_limits.rolling_24h;
    if (r.tx_count_gt !== undefined) conditions.push(lang === 'zh' ? `24h 交易次数 > ${r.tx_count_gt}` : `24h tx count > ${r.tx_count_gt}`);
    if (r.amount_usd_gt) conditions.push(lang === 'zh' ? `24h 累计金额 > $${r.amount_usd_gt}` : `24h total > $${r.amount_usd_gt}`);
  }
  return conditions;
}

export default function PactApprovalCard({ pact, status, onApprove, onReject, onModify }: PactApprovalCardProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const spec = pact.pactSpec;

  const formatPermission = (p: string) => {
    const translated = t(`pact.permission.${p}`);
    if (translated !== `pact.permission.${p}`) return translated;
    return p.replace(':', ': ').replace(/_/g, ' ');
  };

  const conditionLabel = (type: string) => {
    const key = `pact.condition.${type}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return type.replace(/_/g, ' ');
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

      {/* Agent & Wallet & Duration info */}
      <div className="flex items-center gap-4 mb-3 text-[12px] text-[var(--app-text-secondary)]">
        <span className="flex items-center gap-1">
          <Bot className="w-3 h-3" />
          <span className="text-[var(--app-text-tertiary)]">Agent</span>
          <span className="text-[var(--app-text)]">{pact.agentName}</span>
        </span>
        <span className="flex items-center gap-1">
          <Wallet className="w-3 h-3" />
          <span className="text-[var(--app-text-tertiary)]">Wallet</span>
          <span className="text-[var(--app-text)]">{pact.walletName}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[var(--app-text-tertiary)]">{language === 'zh' ? '有效期' : 'Duration'}</span>
          <span className="text-[var(--app-text)]">{formatDurationSmart(spec.duration_seconds, language)}</span>
        </span>
      </div>

      {/* AI Summary / Intent */}
      <div className="text-[13px] leading-[20px] text-[var(--app-text)] mb-3">
        {pact.summary?.[language as 'en' | 'zh'] || pact.intent}
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
          {/* Permissions */}
          <div>
            <div className="font-medium text-[var(--app-text-secondary)] mb-1.5">{language === 'zh' ? '权限' : 'Permissions'}</div>
            <div className="flex flex-wrap gap-1.5">
              {spec.permissions.map((p) => (
                <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--app-pact-badge-bg)] text-[var(--app-pact-badge-text)]">
                  {formatPermission(p)}
                </span>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <div className="font-medium text-[var(--app-text-secondary)] mb-1.5">{t('pact.policies')}</div>
            <div className="space-y-2">
              {spec.policies.map((policy, idx) => {
                const denyConditions = renderDenyConditions(policy, language);
                const reviewConditions = renderReviewConditions(policy, language);

                return (
                  <div key={idx} className="bg-[var(--app-card-bg)] rounded-[6px] p-2.5 border border-[var(--app-border)]">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        policy.rules.effect === 'allow'
                          ? 'bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]'
                          : 'bg-[var(--app-status-rejected-bg)] text-[var(--app-status-rejected-text)]'
                      }`}>
                        {t(`pact.policy.${policy.rules.effect}`)}
                      </span>
                      <span className="text-[var(--app-text)] font-medium">
                        {policyNameToReadable(policy.name)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--app-hover-bg)] text-[var(--app-text-tertiary)]">
                        {policy.type}
                      </span>
                    </div>

                    {policy.rules.when && (
                      <div className="mt-1 space-y-0.5">
                        {policy.rules.when.chain_in && (
                          <div className="text-[var(--app-text-tertiary)]">
                            <span className="text-[var(--app-text-secondary)]">{t('pact.chains')}:</span>{' '}
                            {policy.rules.when.chain_in.join(', ')}
                          </div>
                        )}
                        {policy.rules.when.target_in && policy.rules.when.target_in.length > 0 && (
                          <div className="text-[var(--app-text-tertiary)]">
                            <span className="text-[var(--app-text-secondary)]">{t('pact.targets')}:</span>{' '}
                            {policy.rules.when.target_in.map((target, i) => (
                              <span key={i} className="font-['JetBrains_Mono',monospace] text-[11px]" title={target.contract_addr}>
                                {i > 0 && ', '}
                                {truncateAddr(target.contract_addr)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {denyConditions.length > 0 && (
                      <div className="text-[var(--app-text-tertiary)] mt-1">
                        <span className="text-[var(--app-status-rejected-text)]">{t('pact.denyIf')}:</span>{' '}
                        {denyConditions.join(', ')}
                      </div>
                    )}

                    {reviewConditions.length > 0 && (
                      <div className="text-[var(--app-text-tertiary)] mt-0.5">
                        <span className="text-[var(--app-status-pending-text)]">{t('pact.reviewIf')}:</span>{' '}
                        {reviewConditions.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="flex justify-between">
            <span className="text-[var(--app-text-secondary)]">{t('pact.duration')}</span>
            <span className="text-[var(--app-text)] font-medium">{formatDurationSmart(spec.duration_seconds, language)}</span>
          </div>

          {/* Completion Conditions */}
          {spec.completion_conditions.length > 0 && (
            <div>
              <div className="text-[var(--app-text-secondary)] mb-1">{t('pact.completionConditions')}</div>
              {spec.completion_conditions.map((cc, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-[var(--app-text-tertiary)]">
                    {conditionLabel(cc.type)}
                  </span>
                  <span className="text-[var(--app-text)] font-medium font-['JetBrains_Mono',monospace]">
                    {cc.threshold}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Resource Scope */}
          <div>
            <div className="text-[var(--app-text-secondary)] mb-1">{t('pact.resourceScope')}</div>
            <div className="flex justify-between gap-2">
              <span className="text-[var(--app-text-tertiary)] shrink-0">{t('pact.walletId')}</span>
              <span className="text-[var(--app-text)] font-['JetBrains_Mono',monospace] text-[11px] break-all text-right">
                {spec.resource_scope.wallet_id}
              </span>
            </div>
            {spec.resource_scope.chains && spec.resource_scope.chains.length > 0 && (
              <div className="flex justify-between mt-0.5">
                <span className="text-[var(--app-text-tertiary)]">{t('pact.chains')}</span>
                <span className="text-[var(--app-text)]">{spec.resource_scope.chains.join(', ')}</span>
              </div>
            )}
            {spec.resource_scope.tokens && spec.resource_scope.tokens.length > 0 && (
              <div className="flex justify-between mt-0.5">
                <span className="text-[var(--app-text-tertiary)]">{t('pact.tokens')}</span>
                <span className="text-[var(--app-text)]">{spec.resource_scope.tokens.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {status === 'pending' ? (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(pact.id)}
            className="flex-1 bg-[var(--app-status-approved-text)] hover:opacity-90 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[13px]"
          >
            <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
            {t('pact.approve')}
          </button>
          <button
            onClick={() => onReject(pact.id)}
            className="flex-1 bg-[var(--app-status-rejected-text)] hover:opacity-90 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-[13px]"
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
