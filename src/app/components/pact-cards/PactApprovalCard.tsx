import { useState } from 'react';
import { Shield, Bot, Wallet, CheckCircle, XCircle, Pencil, ChevronDown, ChevronUp, MessageSquare, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PactApproval, PactPolicy } from '../../data/mockPacts';

interface PactApprovalCardProps {
  pact: PactApproval;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  onApprove: (pactId: string) => void;
  onReject: (pactId: string) => void;
  onModify: (pactId: string) => void;
}

// Convert kebab-case to readable
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

function truncateAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

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

// Extract step lines from execution plan (lines starting with "- " or "N. " under headings like Summary, Contract Operations, Schedule)
function extractExecutionSteps(plan: string): string[] {
  const steps: string[] = [];
  const lines = plan.split('\n');
  let inSummary = false;
  let inOperations = false;
  let inSchedule = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# Summary')) { inSummary = true; inOperations = false; inSchedule = false; continue; }
    if (trimmed.startsWith('# Contract Operations')) { inOperations = true; inSummary = false; inSchedule = false; continue; }
    if (trimmed.startsWith('# Schedule')) { inSchedule = true; inSummary = false; inOperations = false; continue; }
    if (trimmed.startsWith('# ')) { inSummary = false; inOperations = false; inSchedule = false; continue; }

    if ((inSummary || inSchedule) && trimmed) {
      steps.push(trimmed);
    }
    if (inOperations && trimmed.startsWith('- ')) {
      steps.push(trimmed.slice(2));
    }
  }
  return steps;
}

// Parse original intent into chat lines
function parseOriginalIntent(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.replace(/^用户:\s*/, ''));
}

// Render rolling limits from usage_limits object
function renderRollingLimits(
  usage_limits: { rolling_24h?: { tx_count_gt?: number; amount_usd_gt?: string }; rolling_7d?: { tx_count_gt?: number; amount_usd_gt?: string }; rolling_30d?: { tx_count_gt?: number; amount_usd_gt?: string } } | undefined,
  lang: string
): string[] {
  const conditions: string[] = [];
  if (!usage_limits) return conditions;

  const periods = [
    { key: 'rolling_24h', label: '24h' },
    { key: 'rolling_7d', label: '7d' },
    { key: 'rolling_30d', label: '30d' },
  ] as const;

  for (const { key, label } of periods) {
    const r = usage_limits[key];
    if (!r) continue;
    if (r.tx_count_gt !== undefined) {
      conditions.push(lang === 'zh' ? `${label} 交易次数 > ${r.tx_count_gt}` : `${label} tx count > ${r.tx_count_gt}`);
    }
    if (r.amount_usd_gt) {
      conditions.push(lang === 'zh' ? `${label} 累计金额 > $${r.amount_usd_gt}` : `${label} total > $${r.amount_usd_gt}`);
    }
  }
  return conditions;
}

function renderDenyConditions(policy: PactPolicy, lang: string): string[] {
  const conditions: string[] = [];
  const denyIf = policy.rules.deny_if;
  if (!denyIf) return conditions;
  if (denyIf.amount_usd_gt) conditions.push(lang === 'zh' ? `金额 > $${denyIf.amount_usd_gt}` : `amount > $${denyIf.amount_usd_gt}`);
  conditions.push(...renderRollingLimits(denyIf.usage_limits, lang));
  return conditions;
}

function renderReviewConditions(policy: PactPolicy, lang: string): string[] {
  const conditions: string[] = [];
  const reviewIf = policy.rules.review_if;
  if (!reviewIf) return conditions;
  if (reviewIf.amount_usd_gt) conditions.push(lang === 'zh' ? `金额 > $${reviewIf.amount_usd_gt}` : `amount > $${reviewIf.amount_usd_gt}`);
  conditions.push(...renderRollingLimits(reviewIf.usage_limits, lang));
  return conditions;
}

// Simple markdown → JSX for execution plan
function renderPlanMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key++} className="h-2" />);
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <div key={key++} className="font-semibold text-[var(--app-text)] mt-2 mb-1">
          {trimmed.replace('# ', '')}
        </div>
      );
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={key++} className="flex gap-1.5 text-[var(--app-text-secondary)]">
          <span className="shrink-0">•</span>
          <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={key++} className="flex gap-1.5 text-[var(--app-text-secondary)]">
            <span className="shrink-0 text-[var(--app-text-tertiary)]">{match[1]}.</span>
            <span>{renderInlineMarkdown(match[2])}</span>
          </div>
        );
      }
    } else {
      elements.push(
        <div key={key++} className="text-[var(--app-text-secondary)]">
          {renderInlineMarkdown(trimmed)}
        </div>
      );
    }
  }
  return elements;
}

function renderInlineMarkdown(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch: { index: number; length: number; type: 'bold' | 'code'; content: string } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = { index: boldMatch.index, length: boldMatch[0].length, type: 'bold', content: boldMatch[1] };
    }
    if (codeMatch && codeMatch.index !== undefined) {
      if (!firstMatch || codeMatch.index < firstMatch.index) {
        firstMatch = { index: codeMatch.index, length: codeMatch[0].length, type: 'code', content: codeMatch[1] };
      }
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    if (firstMatch.index > 0) parts.push(remaining.slice(0, firstMatch.index));

    if (firstMatch.type === 'bold') {
      parts.push(<strong key={key++} className="font-semibold text-[var(--app-text)]">{firstMatch.content}</strong>);
    } else {
      parts.push(
        <code key={key++} className="px-1 py-0.5 bg-[var(--app-hover-bg)] rounded text-[11px] font-['JetBrains_Mono',monospace] text-[var(--app-text)]">
          {firstMatch.content}
        </code>
      );
    }

    remaining = remaining.slice(firstMatch.index + firstMatch.length);
  }

  return parts;
}

// Channel display name
function channelDisplayName(channel: string): string {
  const map: Record<string, string> = { telegram: 'Telegram', slack: 'Slack', discord: 'Discord', web: 'Web' };
  return map[channel.toLowerCase()] || channel;
}

export default function PactApprovalCard({ pact, status, onApprove, onReject, onModify }: PactApprovalCardProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [rawCopied, setRawCopied] = useState(false);
  const spec = pact.pactSpec;

  const hasOriginalIntent = !!pact.originalIntent;
  const executionPlan = spec.execution_plan || spec.program;

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

  const handleCopyRaw = () => {
    const raw = JSON.stringify(spec, null, 2);
    navigator.clipboard?.writeText(raw).then(() => {
      setRawCopied(true);
      setTimeout(() => setRawCopied(false), 2000);
    });
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
        <div className="flex items-center gap-2">
          <Shield className="w-[18px] h-[18px] text-[var(--app-pact-badge-text)]" strokeWidth={1.5} />
          <h4 className="font-semibold text-[var(--app-text)]">{t('pact.approvalRequest')}</h4>
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
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[12px] text-[var(--app-text-secondary)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {t('pact.specDetails')}
        </button>
      </div>

      {/* Metadata: Agent / Wallet / Duration / Source */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[12px] text-[var(--app-text-secondary)]">
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
        {pact.context && (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[var(--app-text-tertiary)]">{t('pact.source')}</span>
            <span className="text-[var(--app-text)]">{channelDisplayName(pact.context.channel)}</span>
          </span>
        )}
      </div>

      {/* Original intent as quote */}
      {pact.originalIntent && (
        <div className="mb-2">
          <div className="border-l-2 border-[var(--app-text-tertiary)] pl-3">
            {parseOriginalIntent(pact.originalIntent).map((line, i) => (
              <div key={i} className="text-[12px] leading-[18px] text-[var(--app-text-tertiary)]">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution intent */}
      <div className="text-[13px] leading-[20px] text-[var(--app-text)] italic mb-3">
        {pact.summary?.[language as 'en' | 'zh'] || pact.intent}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="bg-[var(--app-pact-card-highlight)] rounded-[8px] p-3 mb-3 text-[12px] animate-[phase-fade_0.2s_ease-out] space-y-3">
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

          {/* Execution Steps */}
          {executionPlan && (() => {
            const steps = extractExecutionSteps(executionPlan);
            if (steps.length === 0) return null;
            return (
              <div>
                <div className="font-medium text-[var(--app-text-secondary)] mb-1.5">{language === 'zh' ? '执行步骤' : 'Execution Steps'}</div>
                <div className="space-y-1">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-1.5 text-[var(--app-text-secondary)]">
                      <span className="shrink-0 text-[var(--app-text-tertiary)]">{i + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Risk Controls */}
          <div>
            <div className="font-medium text-[var(--app-text-secondary)] mb-1.5">{language === 'zh' ? '风控规则' : 'Risk Controls'}</div>
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

          {/* ── Raw Data ── */}
          <div className="border-t border-[var(--app-border)] pt-3">
            <div className="font-medium text-[var(--app-text-secondary)] mb-2">{t('pact.rawData')}</div>
            <div className="relative">
              <button
                onClick={handleCopyRaw}
                className="absolute top-2 right-2 flex items-center gap-1 text-[11px] px-2 py-1 rounded-[5px] bg-[var(--app-hover-bg)] hover:bg-[var(--app-border)] text-[var(--app-text-secondary)] transition-colors z-10"
              >
                {rawCopied ? <><Check className="w-3 h-3" />{t('pact.copied')}</> : <><Copy className="w-3 h-3" />{t('pact.copyRaw')}</>}
              </button>
              <pre className="bg-[var(--app-card-bg)] rounded-[6px] p-3 border border-[var(--app-border)] text-[11px] leading-[16px] font-['JetBrains_Mono',monospace] text-[var(--app-text-secondary)] overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap break-all">
                {JSON.stringify(spec, null, 2)}
              </pre>
            </div>
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
