import { useState } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { PactApproval, PactPermission } from '../../data/mockPacts';

type ModifyStep = 'select-what' | 'input-values' | 'confirm';

interface PactModifyCardProps {
  pact: PactApproval;
  step: ModifyStep;
  cardStatus: 'active' | 'completed';
  // Step 1
  onSelectModifications?: (pactId: string, selections: string[]) => void;
  // Step 2
  onSubmitValues?: (pactId: string, modifications: Record<string, string>) => void;
  // Step 3
  onConfirmModified?: (pactId: string) => void;
  // For step 2: what was selected in step 1
  selections?: string[];
  // For step 3: the modifications from step 2
  modifications?: Record<string, string>;
}

const ALL_PERMISSIONS: PactPermission[] = ['transfer', 'swap', 'stake', 'contract_call'];

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
  const [perTxLimit, setPerTxLimit] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [duration, setDuration] = useState('');
  const [customPerTx, setCustomPerTx] = useState('');
  const [customDaily, setCustomDaily] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<PactPermission>>(
    new Set(spec.permissions)
  );
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toggleCheck = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const togglePermission = (p: PactPermission) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  // Extract current limits from policies for display
  const getCurrentPerTxLimit = () => {
    for (const p of spec.policies) {
      for (const rule of p.deny_if || []) {
        const match = rule.match(/^amount\s*>\s*(\d+)/);
        if (match) return match[1];
      }
    }
    return '—';
  };

  const getCurrentDailyLimit = () => {
    for (const p of spec.policies) {
      for (const rule of p.deny_if || []) {
        const match = rule.match(/^daily_total\s*>\s*(\d+)/);
        if (match) return match[1];
      }
    }
    return '—';
  };

  const currentDays = Math.round(spec.duration_seconds / (24 * 60 * 60));

  const modifyOptions = [
    { key: 'perTxLimit', label: t('pact.modify.adjustPerTxLimit'), detail: `(${language === 'zh' ? '当前' : 'Current'}: $${getCurrentPerTxLimit()})` },
    { key: 'dailyLimit', label: t('pact.modify.adjustDailyLimit'), detail: `(${language === 'zh' ? '当前' : 'Current'}: $${getCurrentDailyLimit()})` },
    { key: 'permissions', label: t('pact.modify.modifyPermissions') },
    { key: 'tokens', label: t('pact.modify.changeTokens') },
    { key: 'duration', label: t('pact.modify.shortenDuration'), detail: `(${language === 'zh' ? '当前' : 'Current'}: ${currentDays} ${language === 'zh' ? '天' : 'days'})` },
    { key: 'freeText', label: t('pact.modify.freeText') },
  ];

  // ─── Completed state ───
  if (cardStatus === 'completed') {
    const stepLabel = step === 'select-what'
      ? (language === 'zh' ? '已选择修改项' : 'Modifications selected')
      : step === 'input-values'
      ? (language === 'zh' ? '修改值已提交' : 'Values submitted')
      : (language === 'zh' ? '修改已确认' : 'Modifications confirmed');

    return (
      <div className="bg-[var(--app-card-bg)] border border-[rgba(34,197,94,0.3)] rounded-[12px] p-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className="font-medium text-[13px] text-[#22c55e]">{stepLabel}</span>
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

        {/* Free text area shown when freeText is checked */}
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
    const getEffectivePerTx = () => perTxLimit === 'custom' ? customPerTx || '0' : perTxLimit;
    const getEffectiveDaily = () => dailyLimit === 'custom' ? customDaily || '0' : dailyLimit;
    const getEffectiveDuration = () => duration === 'custom' ? customDuration || '0' : duration;

    const handleSubmit = () => {
      const mods: Record<string, string> = {};
      if (selections.includes('perTxLimit') && getEffectivePerTx()) mods.perTxLimit = getEffectivePerTx();
      if (selections.includes('dailyLimit') && getEffectiveDaily()) mods.dailyLimit = getEffectiveDaily();
      if (selections.includes('duration') && getEffectiveDuration()) mods.duration = getEffectiveDuration();
      if (selections.includes('permissions')) mods.permissions = Array.from(selectedPermissions).join(',');
      if (additionalNotes.trim()) mods.notes = additionalNotes.trim();
      onSubmitValues?.(pact.id, mods);
    };

    const RadioGroup = ({ name, options, value, onSelect, customValue, onCustomChange, unit }: {
      name: string; options: string[]; value: string;
      onSelect: (v: string) => void; customValue: string; onCustomChange: (v: string) => void;
      unit?: string;
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
            <span className="ml-1.5 font-normal text-[13px] text-[var(--app-text)]">{unit === 'days' ? val + (language === 'zh' ? '天' : 'd') : `$${val}`}</span>
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
          {unit !== 'days' && <span className="font-normal text-[13px] text-[var(--app-text-secondary)] mr-1">$</span>}
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
          {selections.includes('perTxLimit') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.perTxLimit')}
              </div>
              <RadioGroup
                name="perTxLimit" options={['100', '300', '500']} value={perTxLimit}
                onSelect={setPerTxLimit} customValue={customPerTx} onCustomChange={(v) => { setCustomPerTx(v); setPerTxLimit('custom'); }}
              />
            </div>
          )}

          {selections.includes('dailyLimit') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.dailyLimit')}
              </div>
              <RadioGroup
                name="dailyLimit" options={['500', '1000', '2000']} value={dailyLimit}
                onSelect={setDailyLimit} customValue={customDaily} onCustomChange={(v) => { setCustomDaily(v); setDailyLimit('custom'); }}
              />
            </div>
          )}

          {selections.includes('duration') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.durationLabel')}
              </div>
              <RadioGroup
                name="duration" options={['7', '14', '30']} value={duration}
                onSelect={setDuration} customValue={customDuration} onCustomChange={(v) => { setCustomDuration(v); setDuration('custom'); }}
                unit="days"
              />
            </div>
          )}

          {selections.includes('permissions') && (
            <div>
              <div className="font-medium text-[13px] text-[var(--app-text-secondary)] mb-2">
                {t('pact.modify.permissionsLabel')}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((p) => (
                  <label key={p} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border cursor-pointer transition-colors text-[12px] ${
                    selectedPermissions.has(p)
                      ? 'bg-[var(--app-pact-card-highlight)] border-[var(--app-pact-card-border)] text-[var(--app-pact-badge-text)]'
                      : 'border-[var(--app-border)] text-[var(--app-text-secondary)]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(p)}
                      onChange={() => togglePermission(p)}
                      className="w-3.5 h-3.5 text-[var(--app-accent)] border-[var(--app-border-medium)] rounded focus:ring-0 focus:ring-offset-0"
                    />
                    {t(`pact.permission.${p}`)}
                  </label>
                ))}
              </div>
            </div>
          )}

          {selections.some(s => s.startsWith('freeText')) && (
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
      const d = Math.round(seconds / (24 * 60 * 60));
      return `${d} ${language === 'zh' ? '天' : 'days'}`;
    };

    const diffItems: { label: string; before: string; after: string }[] = [];

    if (modifications.perTxLimit) {
      diffItems.push({
        label: t('pact.modify.perTxLimit'),
        before: `$${getCurrentPerTxLimit()}`,
        after: `$${modifications.perTxLimit}`,
      });
    }
    if (modifications.dailyLimit) {
      diffItems.push({
        label: t('pact.modify.dailyLimit'),
        before: `$${getCurrentDailyLimit()}`,
        after: `$${modifications.dailyLimit}`,
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
        before: spec.permissions.map(p => t(`pact.permission.${p}`)).join(', '),
        after: modifications.permissions.split(',').map(p => t(`pact.permission.${p}`)).join(', '),
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
