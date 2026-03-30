import { useState } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PactApproval, PactPolicy } from '../../data/mockPacts';

type ModifyStep = 'select-what' | 'input-values' | 'confirm';

interface PactModifyCardProps {
  pact: PactApproval;
  step: ModifyStep;
  cardStatus: 'active' | 'completed';
  onSelectModifications?: (pactId: string, selections: string[]) => void;
  onSubmitValues?: (pactId: string, modifications: Record<string, string>) => void;
  onConfirmModified?: (pactId: string) => void;
  selections?: string[];
  modifications?: Record<string, string>;
}

// ── Helper: extract limits from real policy structures ──

function getAmountUsdLimit(policies: PactPolicy[]): string {
  for (const p of policies) {
    if (p.rules.deny_if?.amount_usd_gt) return p.rules.deny_if.amount_usd_gt;
  }
  return '—';
}

function get24hTxCountLimit(policies: PactPolicy[]): string {
  for (const p of policies) {
    const r24h = p.rules.deny_if?.usage_limits?.rolling_24h;
    if (r24h?.tx_count_gt !== undefined) return String(r24h.tx_count_gt);
  }
  return '—';
}

function get24hAmountLimit(policies: PactPolicy[]): string {
  for (const p of policies) {
    const r24h = p.rules.deny_if?.usage_limits?.rolling_24h;
    if (r24h?.amount_usd_gt) return r24h.amount_usd_gt;
  }
  return '—';
}

function getTxCountThreshold(pact: PactApproval): string {
  const cc = pact.pactSpec.completion_conditions.find(c => c.type === 'tx_count');
  return cc ? cc.threshold : '—';
}

export default function PactModifyCard({
  pact, step, cardStatus,
  onSelectModifications, onSubmitValues, onConfirmModified,
  selections = [], modifications = {},
}: PactModifyCardProps) {
  const { t, language } = useLanguage();
  const spec = pact.pactSpec;

  // Step 1 state
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState('');

  // Step 2 state
  const [amountLimit, setAmountLimit] = useState('');
  const [txCountLimit24h, setTxCountLimit24h] = useState('');
  const [amountLimit24h, setAmountLimit24h] = useState('');
  const [txCountMax, setTxCountMax] = useState('');
  const [duration, setDuration] = useState('');
  const [customAmountLimit, setCustomAmountLimit] = useState('');
  const [customTxCount24h, setCustomTxCount24h] = useState('');
  const [customAmountLimit24h, setCustomAmountLimit24h] = useState('');
  const [customTxCountMax, setCustomTxCountMax] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleCheck = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const currentAmountLimit = getAmountUsdLimit(spec.policies);
  const currentTxCount24h = get24hTxCountLimit(spec.policies);
  const currentAmountLimit24h = get24hAmountLimit(spec.policies);
  const currentTxCountMax = getTxCountThreshold(pact);
  const currentDays = Math.round(spec.duration_seconds / (24 * 60 * 60));
  const currentDurationDisplay = spec.duration_seconds < 86400
    ? (language === 'zh' ? `${Math.round(spec.duration_seconds / 3600)} 小时` : `${Math.round(spec.duration_seconds / 3600)}h`)
    : (language === 'zh' ? `${currentDays} 天` : `${currentDays} days`);

  const modifyOptions = [
    { key: 'amountLimit', label: t('pact.modify.adjustAmountLimit'), detail: `(${language === 'zh' ? '当前' : 'Current'}: $${currentAmountLimit})`, show: currentAmountLimit !== '—' },
    { key: 'txCount24h', label: t('pact.modify.adjust24hTxCount'), detail: `(${language === 'zh' ? '当前' : 'Current'}: ${currentTxCount24h})`, show: currentTxCount24h !== '—' },
    { key: 'amountLimit24h', label: t('pact.modify.adjust24hAmount'), detail: `(${language === 'zh' ? '当前' : 'Current'}: $${currentAmountLimit24h})`, show: currentAmountLimit24h !== '—' },
    { key: 'permissions', label: t('pact.modify.modifyPermissions'), show: true },
    { key: 'targets', label: t('pact.modify.changeTargets'), show: true },
    { key: 'duration', label: t('pact.modify.shortenDuration'), detail: `(${language === 'zh' ? '当前' : 'Current'}: ${currentDurationDisplay})`, show: true },
    { key: 'txCountMax', label: t('pact.modify.adjustMaxTxCount'), detail: `(${language === 'zh' ? '当前' : 'Current'}: ${currentTxCountMax})`, show: currentTxCountMax !== '—' },
    { key: 'freeText', label: t('pact.modify.freeText'), show: true },
  ].filter(o => o.show);

  // ─── Completed state ───
  if (cardStatus === 'completed') {
    if (step === 'select-what' && selections.length > 0) {
      const selectedLabels = selections
        .filter(s => !s.startsWith('freeText:'))
        .map(s => {
          const opt = modifyOptions.find(o => o.key === s);
          return opt?.label || s;
        });
      const freeTextEntry = selections.find(s => s.startsWith('freeText:'));
      const freeTextContent = freeTextEntry ? freeTextEntry.replace('freeText:', '') : '';

      return (
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 transition-all duration-300">
          <div className="text-[13px] leading-[20px] text-[var(--app-text)]">
            {language === 'zh' ? '用户希望修改以下内容：' : 'User wants to modify:'}
          </div>
          <ul className="mt-2 space-y-1">
            {selectedLabels.map((label, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px] text-[var(--app-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)] shrink-0" />
                {label}
              </li>
            ))}
            {freeTextContent && (
              <li className="flex items-start gap-2 text-[13px] text-[var(--app-text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)] shrink-0 mt-1.5" />
                {freeTextContent}
              </li>
            )}
          </ul>
        </div>
      );
    }

    if (step === 'input-values' && modifications && Object.keys(modifications).length > 0) {
      const items: { label: string; value: string }[] = [];
      if (modifications.amountLimit) items.push({ label: t('pact.modify.amountLimitLabel'), value: `$${modifications.amountLimit}` });
      if (modifications.txCount24h) items.push({ label: t('pact.modify.txCount24hLabel'), value: modifications.txCount24h });
      if (modifications.amountLimit24h) items.push({ label: t('pact.modify.amountLimit24hLabel'), value: `$${modifications.amountLimit24h}` });
      if (modifications.txCountMax) items.push({ label: t('pact.modify.txCountMaxLabel'), value: modifications.txCountMax });
      if (modifications.duration) items.push({ label: t('pact.modify.durationLabel'), value: `${modifications.duration} ${language === 'zh' ? '天' : 'days'}` });
      if (modifications.permissions) items.push({ label: t('pact.modify.permissionsLabel'), value: modifications.permissions });
      if (modifications.notes) items.push({ label: t('pact.modify.freeTextLabel'), value: modifications.notes });

      return (
        <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 transition-all duration-300">
          <div className="text-[13px] leading-[20px] text-[var(--app-text)] mb-2">
            {language === 'zh' ? '用户提交的修改建议：' : 'User submitted modifications:'}
          </div>
          <div className="space-y-1.5">
            {items.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--app-text-secondary)]">{label}</span>
                <span className="text-[var(--app-text)] font-medium font-['JetBrains_Mono',monospace]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[var(--app-card-bg)] border border-[rgba(34,197,94,0.3)] rounded-[12px] p-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className="font-medium text-[13px] text-[#22c55e]">
            {language === 'zh' ? '修改已确认并批准' : 'Modifications confirmed and approved'}
          </span>
        </div>
      </div>
    );
  }

  // ─── Step 1: Select what to modify ───
  if (step === 'select-what') {
    return (
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 transition-all duration-300">
        <div className="font-medium text-[14px] text-[var(--app-text)] mb-3">
          {t('pact.modify.selectTitle')}
        </div>

        <div className="space-y-2 mb-4">
          {modifyOptions.map(({ key, label, detail }, idx) => (
            <label
              key={key}
              className={`flex items-center justify-between px-3 py-2.5 rounded-[8px] border cursor-pointer transition-colors ${
                checked.has(key)
                  ? 'bg-[var(--app-pact-card-highlight)] border-[var(--app-pact-card-border)]'
                  : 'border-[var(--app-border)] hover:bg-[var(--app-hover-bg)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked.has(key)}
                  onChange={() => toggleCheck(key)}
                  className="w-4 h-4 text-[var(--app-accent)] border-[var(--app-border-medium)] rounded focus:ring-0 focus:ring-offset-0"
                />
                <div>
                  <span className="text-[13px] text-[var(--app-text)]">{label}</span>
                  {detail && <span className="text-[12px] text-[var(--app-text-tertiary)] ml-1.5">{detail}</span>}
                </div>
              </div>
              <span className="text-[12px] text-[var(--app-text-tertiary)] font-medium w-5 h-5 flex items-center justify-center rounded bg-[var(--app-hover-bg)]">
                {idx + 1}
              </span>
            </label>
          ))}
        </div>

        {checked.has('freeText') && (
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder={language === 'zh' ? '请描述你想修改的内容...' : 'Describe what you want to modify...'}
            className="w-full mb-3 px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-tertiary)] resize-none focus:outline-none focus:border-[var(--app-accent)] focus:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)]"
            rows={3}
          />
        )}

        <button
          onClick={() => {
            if (checked.size === 0) return;
            const sels = Array.from(checked);
            if (checked.has('freeText') && freeText.trim()) {
              sels.push(`freeText:${freeText.trim()}`);
            }
            onSelectModifications?.(pact.id, sels);
          }}
          disabled={checked.size === 0}
          className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed h-[38px] rounded-[8px] transition-colors font-medium text-[13px] text-white flex items-center justify-center"
        >
          {t('pact.modify.next')}
        </button>
      </div>
    );
  }

  // ─── Step 2: Input values ───
  if (step === 'input-values') {
    const getEffective = (value: string, custom: string) => value === 'custom' ? custom || '0' : value;

    const handleSubmit = () => {
      const mods: Record<string, string> = {};
      if (selections.includes('amountLimit') && getEffective(amountLimit, customAmountLimit)) mods.amountLimit = getEffective(amountLimit, customAmountLimit);
      if (selections.includes('txCount24h') && getEffective(txCountLimit24h, customTxCount24h)) mods.txCount24h = getEffective(txCountLimit24h, customTxCount24h);
      if (selections.includes('amountLimit24h') && getEffective(amountLimit24h, customAmountLimit24h)) mods.amountLimit24h = getEffective(amountLimit24h, customAmountLimit24h);
      if (selections.includes('txCountMax') && getEffective(txCountMax, customTxCountMax)) mods.txCountMax = getEffective(txCountMax, customTxCountMax);
      if (selections.includes('duration') && getEffective(duration, customDuration)) mods.duration = getEffective(duration, customDuration);
      if (selections.includes('permissions')) mods.permissions = spec.permissions.join(', ');
      if (additionalNotes.trim()) mods.notes = additionalNotes.trim();
      onSubmitValues?.(pact.id, mods);
    };

    const RadioGroup = ({ name, options, value, onSelect, customValue, onCustomChange, unit, prefix }: {
      name: string; options: string[]; value: string;
      onSelect: (v: string) => void; customValue: string; onCustomChange: (v: string) => void;
      unit?: string; prefix?: string;
    }) => (
      <div className="flex items-center gap-2.5 flex-wrap">
        {options.map((val) => (
          <label key={val} className="flex items-center cursor-pointer">
            <input
              type="radio" name={name} value={val}
              checked={value === val}
              onChange={() => onSelect(val)}
              className="w-4 h-4 text-[var(--app-accent)] border-[var(--app-border-medium)] focus:ring-0 focus:ring-offset-0"
            />
            <span className="ml-1.5 font-normal text-[13px] text-[var(--app-text)]">
              {prefix || ''}{unit === 'days' ? val + (language === 'zh' ? '天' : 'd') : val}
            </span>
          </label>
        ))}
        <label className="flex items-center cursor-pointer">
          <input
            type="radio" name={name} value="custom"
            checked={value === 'custom'}
            onChange={() => onSelect('custom')}
            className="w-4 h-4 text-[var(--app-accent)] border-[var(--app-border-medium)] focus:ring-0 focus:ring-offset-0"
          />
          <span className="ml-1.5 font-normal text-[13px] text-[var(--app-text)]">
            {language === 'zh' ? '其他' : 'Other'}:
          </span>
        </label>
        <div className="flex items-center">
          {prefix && <span className="font-normal text-[13px] text-[var(--app-text-secondary)] mr-1">{prefix}</span>}
          <input
            type="number" value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            onFocus={() => onSelect('custom')}
            placeholder="0"
            className="w-16 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[6px] px-2 py-1 font-normal text-[13px] text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] focus:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)]"
          />
          {unit === 'days' && <span className="font-normal text-[13px] text-[var(--app-text-secondary)] ml-1">{language === 'zh' ? '天' : 'days'}</span>}
        </div>
      </div>
    );

    return (
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 transition-all duration-300">
        <div className="font-medium text-[14px] text-[var(--app-text)] mb-3">
          {t('pact.modify.inputTitle')}
        </div>

        <div className="space-y-4 mb-4">
          {selections.includes('amountLimit') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.amountLimitLabel')}
              </div>
              <RadioGroup
                name="amountLimit" options={['100', '200', '500']} value={amountLimit}
                onSelect={setAmountLimit} customValue={customAmountLimit}
                onCustomChange={(v) => { setCustomAmountLimit(v); setAmountLimit('custom'); }}
                prefix="$"
              />
            </div>
          )}

          {selections.includes('txCount24h') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.txCount24hLabel')}
              </div>
              <RadioGroup
                name="txCount24h" options={['1', '3', '5', '10']} value={txCountLimit24h}
                onSelect={setTxCountLimit24h} customValue={customTxCount24h}
                onCustomChange={(v) => { setCustomTxCount24h(v); setTxCountLimit24h('custom'); }}
              />
            </div>
          )}

          {selections.includes('amountLimit24h') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.amountLimit24hLabel')}
              </div>
              <RadioGroup
                name="amountLimit24h" options={['1000', '5000', '10000']} value={amountLimit24h}
                onSelect={setAmountLimit24h} customValue={customAmountLimit24h}
                onCustomChange={(v) => { setCustomAmountLimit24h(v); setAmountLimit24h('custom'); }}
                prefix="$"
              />
            </div>
          )}

          {selections.includes('txCountMax') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.txCountMaxLabel')}
              </div>
              <RadioGroup
                name="txCountMax" options={['1', '2', '5', '10']} value={txCountMax}
                onSelect={setTxCountMax} customValue={customTxCountMax}
                onCustomChange={(v) => { setCustomTxCountMax(v); setTxCountMax('custom'); }}
              />
            </div>
          )}

          {selections.includes('duration') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.durationLabel')}
              </div>
              <RadioGroup
                name="duration" options={['1', '7', '14', '30']} value={duration}
                onSelect={setDuration} customValue={customDuration}
                onCustomChange={(v) => { setCustomDuration(v); setDuration('custom'); }}
                unit="days"
              />
            </div>
          )}

          {selections.includes('permissions') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.permissionsLabel')}
              </div>
              <div className="text-[12px] text-[var(--app-text-tertiary)] mb-2">
                {language === 'zh' ? '当前权限：' : 'Current permissions: '}{spec.permissions.join(', ')}
              </div>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={language === 'zh' ? '描述你希望的权限变更...' : 'Describe desired permission changes...'}
                className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-tertiary)] resize-none focus:outline-none focus:border-[var(--app-accent)] focus:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)]"
                rows={2}
              />
            </div>
          )}

          {selections.includes('targets') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.targetsLabel')}
              </div>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={language === 'zh' ? '描述你希望的合约/链范围变更...' : 'Describe desired contract/chain scope changes...'}
                className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-tertiary)] resize-none focus:outline-none focus:border-[var(--app-accent)] focus:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)]"
                rows={2}
              />
            </div>
          )}

          {selections.some(s => s.startsWith('freeText')) && !selections.includes('permissions') && !selections.includes('targets') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.freeTextLabel')}
              </div>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={language === 'zh' ? '请补充说明...' : 'Additional notes...'}
                className="w-full px-3 py-2 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] text-[13px] text-[var(--app-text)] placeholder:text-[var(--app-text-tertiary)] resize-none focus:outline-none focus:border-[var(--app-accent)] focus:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)]"
                rows={3}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] h-[38px] rounded-[8px] transition-colors font-medium text-[13px] text-white flex items-center justify-center"
        >
          {t('pact.modify.submitValues')}
        </button>
      </div>
    );
  }

  // ─── Step 3: Confirm modifications ───
  if (step === 'confirm') {
    const formatDuration = (seconds: number) => {
      if (seconds < 86400) {
        const h = Math.round(seconds / 3600);
        return `${h} ${language === 'zh' ? '小时' : 'hours'}`;
      }
      const d = Math.round(seconds / 86400);
      return `${d} ${language === 'zh' ? '天' : 'days'}`;
    };

    const diffItems: { label: string; before: string; after: string }[] = [];

    if (modifications.amountLimit) {
      diffItems.push({
        label: t('pact.modify.amountLimitLabel'),
        before: `$${currentAmountLimit}`,
        after: `$${modifications.amountLimit}`,
      });
    }
    if (modifications.txCount24h) {
      diffItems.push({
        label: t('pact.modify.txCount24hLabel'),
        before: currentTxCount24h,
        after: modifications.txCount24h,
      });
    }
    if (modifications.amountLimit24h) {
      diffItems.push({
        label: t('pact.modify.amountLimit24hLabel'),
        before: `$${currentAmountLimit24h}`,
        after: `$${modifications.amountLimit24h}`,
      });
    }
    if (modifications.txCountMax) {
      diffItems.push({
        label: t('pact.modify.txCountMaxLabel'),
        before: currentTxCountMax,
        after: modifications.txCountMax,
      });
    }
    if (modifications.duration) {
      diffItems.push({
        label: t('pact.modify.durationLabel'),
        before: formatDuration(spec.duration_seconds),
        after: `${modifications.duration} ${language === 'zh' ? '天' : 'days'}`,
      });
    }
    if (modifications.permissions) {
      diffItems.push({
        label: t('pact.modify.permissionsLabel'),
        before: spec.permissions.join(', '),
        after: modifications.permissions,
      });
    }
    if (modifications.notes) {
      diffItems.push({
        label: t('pact.modify.freeTextLabel'),
        before: '—',
        after: modifications.notes,
      });
    }

    return (
      <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[12px] p-4 transition-all duration-300">
        <div className="font-medium text-[14px] text-[var(--app-text)] mb-3">
          {t('pact.modify.confirmTitle')}
        </div>

        <div className="space-y-2 mb-4">
          {diffItems.map(({ label, before, after }) => (
            <div key={label} className="rounded-[8px] border border-[var(--app-border)] p-3">
              <div className="text-[12px] font-medium text-[var(--app-text-secondary)] mb-1.5">{label}</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--app-text-tertiary)] mb-0.5">{t('pact.modify.before')}</div>
                  <div className="text-[13px] text-[var(--app-status-rejected-text)] line-through">{before}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--app-text-tertiary)] mb-0.5">{t('pact.modify.after')}</div>
                  <div className="text-[13px] text-[var(--app-status-approved-text)] font-medium">{after}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onConfirmModified?.(pact.id)}
          className="w-full bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] h-[38px] rounded-[8px] transition-colors font-medium text-[13px] text-white flex items-center justify-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('pact.modify.confirmApprove')}
        </button>
      </div>
    );
  }

  return null;
}
