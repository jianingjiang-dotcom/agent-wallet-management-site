import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pencil, Check, X, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Provider icons ───────────────────────────────────────────────────────────

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#2AABEE"/>
    <path d="M3.87 8.6 13.5 4.93c.44-.16.82.1.68.77L12.55 13.3c-.12.54-.44.67-.9.42l-2.5-1.84-1.2 1.16c-.14.13-.25.24-.51.24l.18-2.56 4.7-4.24c.2-.18-.05-.28-.31-.1L4.97 10.6l-2.47-.77c-.54-.17-.55-.54.22-.82z" fill="white"/>
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M15.25 2.32A14.89 14.89 0 0 0 11.6 1.25a.06.06 0 0 0-.06.03c-.16.28-.34.65-.47.94a13.74 13.74 0 0 0-4.13 0 9.5 9.5 0 0 0-.47-.94.06.06 0 0 0-.06-.03A14.85 14.85 0 0 0 2.75 2.32a.05.05 0 0 0-.03.02C.4 5.9-.24 9.38.07 12.82c.01.02.02.04.04.05a14.96 14.96 0 0 0 4.5 2.28.06.06 0 0 0 .07-.02c.35-.47.66-.97.93-1.49a.06.06 0 0 0-.03-.08 9.85 9.85 0 0 1-1.41-.67.06.06 0 0 1-.01-.1c.09-.07.19-.14.28-.21a.06.06 0 0 1 .06-.01c2.96 1.35 6.16 1.35 9.09 0a.06.06 0 0 1 .06.01c.09.07.19.14.28.22a.06.06 0 0 1-.01.1c-.45.26-.92.48-1.41.67a.06.06 0 0 0-.03.08c.27.52.59 1.02.93 1.49a.06.06 0 0 0 .07.02 14.92 14.92 0 0 0 4.5-2.28.06.06 0 0 0 .04-.05c.38-3.94-.64-7.37-2.7-10.48a.05.05 0 0 0-.03-.02zM6.01 10.74c-.89 0-1.62-.82-1.62-1.82s.72-1.82 1.62-1.82c.9 0 1.63.82 1.62 1.82 0 1-.72 1.82-1.62 1.82zm5.99 0c-.89 0-1.62-.82-1.62-1.82s.72-1.82 1.62-1.82c.9 0 1.63.82 1.62 1.82 0 1-.72 1.82-1.62 1.82z" fill="#5865F2"/>
  </svg>
);

// ─── Confirmation Modal ───────────────────────────────────────────────────────

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmStyle?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, description, confirmLabel, confirmStyle = 'danger', onConfirm, onCancel }: ConfirmModalProps) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-white rounded-[16px] shadow-[0px_24px_64px_rgba(0,0,0,0.18)] w-full max-w-[360px] p-[28px] flex flex-col gap-[20px]">
        <div className="flex flex-col gap-[6px]">
          <h3 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">{title}</h3>
          <p className="font-['Inter',sans-serif] text-[14px] text-[#7c7c7c] leading-[1.5]">{description}</p>
        </div>
        <div className="flex gap-[8px]">
          <button
            onClick={onCancel}
            className="flex-1 h-[40px] rounded-[8px] border border-[rgba(10,10,10,0.12)] font-['Inter',sans-serif] text-[14px] font-medium text-[#0a0a0a] hover:bg-[rgba(10,10,10,0.04)] transition-colors"
          >
            {t('account.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-[40px] rounded-[8px] font-['Inter',sans-serif] text-[14px] font-medium text-white transition-colors
              ${confirmStyle === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#4f5eff] hover:bg-[#3d4dd9]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccountSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('agent_wallet_current_user');
    return raw ? JSON.parse(raw) : null;
  });

  const isNewUser = (() => {
    const raw = localStorage.getItem('agent_wallet_wallets');
    if (!raw) return true;
    try { return JSON.parse(raw).wallets?.length === 0; } catch { return true; }
  })();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');

  const detectProviders = () => {
    if (!user) return { telegram: false, discord: false };
    // Default: signed in via Telegram; Discord is secondary
    const p = user.provider ?? 'telegram';
    return { telegram: p === 'telegram' || !p, discord: p === 'discord' };
  };
  const [providers, setProviders] = useState(detectProviders);
  const connectedCount = Object.values(providers).filter(Boolean).length;

  // Telegram username derived from name for mock display
  const telegramHandle = '@' + (user?.name ?? 'user').toLowerCase().replace(/\s+/g, '');

  const primaryProvider = user?.provider === 'discord' ? 'discord' : 'telegram';

  const [secureBannerDismissed, setSecureBannerDismissed] = useState(false);
  const [highlightProviders, setHighlightProviders] = useState(false);
  const [unbindTarget, setUnbindTarget] = useState<'telegram' | 'discord' | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (!trimmed) { setNameError('Name cannot be empty'); return; }
    const updated = { ...user, name: trimmed };
    localStorage.setItem('agent_wallet_current_user', JSON.stringify(updated));
    setUser(updated);
    setEditingName(false);
    setNameError('');
  };

  const handleCancelName = () => {
    setNameValue(user.name);
    setEditingName(false);
    setNameError('');
  };

  const handleUnbindConfirm = () => {
    if (!unbindTarget) return;
    setProviders(prev => ({ ...prev, [unbindTarget]: false }));
    setUnbindTarget(null);
  };

  const handleBind = (provider: 'telegram' | 'discord') => {
    setProviders(prev => ({ ...prev, [provider]: true }));
  };

  const handleSignOut = () => {
    localStorage.removeItem('agent_wallet_current_user');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (!user) return null;

  const providerName = unbindTarget === 'telegram' ? 'Telegram' : 'Discord';

  return (
    <>
      <div className="max-w-[640px] mx-auto space-y-[16px]">

        <div className="mb-[4px]">
          <h1 className="font-['Inter',sans-serif] font-semibold text-[24px] text-[#0a0a0a]">{t('account.title')}</h1>
        </div>

        {/* New user: security banner */}
        {isNewUser && connectedCount < 2 && !secureBannerDismissed && (
          <div className="bg-[rgba(79,94,255,0.04)] border border-[rgba(79,94,255,0.2)] rounded-[10px] px-[14px] h-[44px] flex items-center gap-[8px]">
            <ShieldCheck className="w-[15px] h-[15px] text-[#4f5eff] shrink-0" />
            <span className="font-['Inter',sans-serif] text-[13px] text-[#4f4f4f] flex-1 min-w-0 truncate">{t('account.secureDesc')}</span>
            <button
              onClick={() => {
                document.getElementById('connected-accounts')?.scrollIntoView({ behavior: 'smooth' });
                setHighlightProviders(true);
                setTimeout(() => setHighlightProviders(false), 1800);
              }}
              className="shrink-0 flex items-center gap-[3px] font-['Inter',sans-serif] text-[13px] font-medium text-[#4f5eff] hover:underline"
            >
              {t('account.secureAction')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSecureBannerDismissed(true)}
              className="shrink-0 p-[4px] rounded-[4px] text-[#7c7c7c] hover:bg-[rgba(10,10,10,0.06)] transition-colors ml-[2px]"
              aria-label={t('account.secureDismiss')}
            >
              <X className="w-[14px] h-[14px]" />
            </button>
          </div>
        )}

        {/* Profile */}
        <div className="bg-white rounded-[12px] border border-[rgba(10,10,10,0.08)] overflow-hidden">
          <div className="px-[24px] py-[20px] flex items-center gap-[16px]">
            {/* Avatar */}
            <div className="w-[56px] h-[56px] rounded-full bg-[#4F4F4F] flex items-center justify-center shrink-0">
              <span className="font-['Inter',sans-serif] font-semibold text-[18px] text-white">{initials}</span>
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-start gap-[8px]">
                  <div className="flex-1 min-w-0">
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={e => { setNameValue(e.target.value); setNameError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelName(); }}
                      className="w-full px-[10px] py-[6px] rounded-[6px] border border-[#4f5eff] outline-none font-['Inter',sans-serif] text-[14px] text-[#0a0a0a] focus:ring-2 focus:ring-[rgba(79,94,255,0.15)]"
                    />
                    {nameError && <p className="text-[12px] text-red-500 mt-[4px]">{nameError}</p>}
                  </div>
                  <button onClick={handleSaveName} className="h-[34px] px-[12px] rounded-[6px] bg-[#4f5eff] hover:bg-[#3d4dd9] text-white font-['Inter',sans-serif] text-[13px] font-medium flex items-center gap-[4px] transition-colors shrink-0">
                    <Check className="w-3.5 h-3.5" />{t('account.save')}
                  </button>
                  <button onClick={handleCancelName} className="h-[34px] px-[12px] rounded-[6px] border border-[rgba(10,10,10,0.12)] text-[#0a0a0a] font-['Inter',sans-serif] text-[13px] font-medium flex items-center gap-[4px] hover:bg-[rgba(10,10,10,0.04)] transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />{t('account.cancel')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-[8px]">
                  <span className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#0a0a0a] truncate">{user.name}</span>
                  <button
                    onClick={() => { setNameValue(user.name); setEditingName(true); }}
                    className="shrink-0 p-[4px] rounded-[4px] text-[#7c7c7c] hover:text-[#4f5eff] hover:bg-[rgba(79,94,255,0.06)] transition-colors"
                    aria-label={t('account.editName')}
                  >
                    <Pencil className="w-[14px] h-[14px]" />
                  </button>
                </div>
              )}
              {!editingName && (
                <div className="font-['Inter',sans-serif] text-[13px] text-[#7c7c7c] mt-[2px] truncate">{user.email}</div>
              )}
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div
          id="connected-accounts"
          className={`bg-white rounded-[12px] border overflow-hidden transition-all duration-300 ${highlightProviders ? 'border-[#4f5eff] ring-2 ring-[rgba(79,94,255,0.2)]' : 'border-[rgba(10,10,10,0.08)]'}`}
        >
          <div className="px-[24px] py-[16px] border-b border-[rgba(10,10,10,0.06)]">
            <h2 className="font-['Inter',sans-serif] font-semibold text-[15px] text-[#0a0a0a]">{t('account.connectedAccounts')}</h2>
            <p className="font-['Inter',sans-serif] text-[13px] text-[#7c7c7c] mt-[3px]">{t('account.connectedAccountsDesc')}</p>
          </div>

          <ProviderRow
            icon={<TelegramIcon />}
            name="Telegram"
            recommended
            connected={providers.telegram}
            isOnly={providers.telegram && connectedCount <= 1}
            isPrimary={primaryProvider === 'telegram'}
            linkedId={telegramHandle}
            bindLabel={t('account.bind')}
            unbindLabel={t('account.unbind')}
            connectedLabel={t('account.connected')}
            notConnectedLabel={t('account.notConnected')}
            onBind={() => handleBind('telegram')}
            onUnbind={() => setUnbindTarget('telegram')}
            hasBorder
          />

          <ProviderRow
            icon={<DiscordIcon />}
            name="Discord"
            connected={providers.discord}
            isOnly={providers.discord && connectedCount <= 1}
            isPrimary={primaryProvider === 'discord'}
            linkedId={user.name?.toLowerCase().replace(/\s+/g, '') + '#0001'}
            bindLabel={t('account.bind')}
            unbindLabel={t('account.unbind')}
            connectedLabel={t('account.connected')}
            notConnectedLabel={t('account.notConnected')}
            onBind={() => handleBind('discord')}
            onUnbind={() => setUnbindTarget('discord')}
          />
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-[12px] border border-[rgba(10,10,10,0.08)] px-[24px] py-[16px] flex items-center justify-between">
          <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">{t('account.logoutDesc')}</span>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="flex items-center gap-[6px] px-[14px] py-[7px] rounded-full border border-[rgba(10,10,10,0.18)] font-['Inter',sans-serif] text-[13px] font-medium text-[#0a0a0a] hover:bg-[rgba(10,10,10,0.04)] transition-colors shrink-0"
          >
            {t('account.logout')}
            <LogOut className="w-[14px] h-[14px]" />
          </button>
        </div>

      </div>

      {unbindTarget && (
        <ConfirmModal
          title={t('account.unbindTitle')}
          description={t('account.unbindDesc').replace('{provider}', providerName)}
          confirmLabel={t('account.unbindConfirm')}
          confirmStyle="danger"
          onConfirm={handleUnbindConfirm}
          onCancel={() => setUnbindTarget(null)}
        />
      )}

      {showSignOutModal && (
        <ConfirmModal
          title={t('account.signOutTitle')}
          description={t('account.signOutDesc')}
          confirmLabel={t('account.signOutConfirm')}
          confirmStyle="primary"
          onConfirm={handleSignOut}
          onCancel={() => setShowSignOutModal(false)}
        />
      )}
    </>
  );
}

// ─── Provider Row ─────────────────────────────────────────────────────────────

interface ProviderRowProps {
  icon: React.ReactNode;
  name: string;
  recommended?: boolean;
  connected: boolean;
  isOnly: boolean;
  isPrimary: boolean;
  linkedId: string;
  bindLabel: string;
  unbindLabel: string;
  connectedLabel: string;
  notConnectedLabel: string;
  onBind: () => void;
  onUnbind: () => void;
  hasBorder?: boolean;
}

function ProviderRow({ icon, name, recommended, connected, isOnly, isPrimary, linkedId, bindLabel, unbindLabel, connectedLabel, notConnectedLabel, onBind, onUnbind, hasBorder }: ProviderRowProps) {
  return (
    <div className={`px-[24px] py-[14px] flex items-center gap-[14px] ${hasBorder ? 'border-b border-[rgba(10,10,10,0.06)]' : ''}`}>
      <div className="w-[36px] h-[36px] rounded-full bg-[rgba(10,10,10,0.04)] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[6px]">
          <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">{name}</span>
          {recommended && (
            <span className="font-['Inter',sans-serif] text-[10px] font-medium text-[#2AABEE] bg-[rgba(42,171,238,0.1)] px-[6px] py-[2px] rounded-full leading-none">
              Recommended
            </span>
          )}
        </div>
        <div className="flex items-center gap-[5px] mt-[2px]">
          <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${connected ? 'bg-emerald-400' : 'bg-[#d0d0d0]'}`} />
          <span className="font-['Inter',sans-serif] text-[12px] text-[#7c7c7c]">
            {connected && isPrimary ? linkedId : connected ? connectedLabel : notConnectedLabel}
          </span>
        </div>
      </div>
      {connected ? (
        <button
          onClick={onUnbind}
          disabled={isOnly}
          title={isOnly ? 'At least one sign-in method must remain connected' : undefined}
          className={`px-[14px] py-[6px] rounded-[6px] font-['Inter',sans-serif] text-[13px] font-medium transition-colors shrink-0
            ${isOnly ? 'text-[#c0c0c0] bg-[rgba(10,10,10,0.03)] cursor-not-allowed' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
        >
          {unbindLabel}
        </button>
      ) : (
        <button
          onClick={onBind}
          className="px-[14px] py-[6px] rounded-[6px] font-['Inter',sans-serif] text-[13px] font-medium text-[#4f5eff] bg-[rgba(79,94,255,0.08)] hover:bg-[rgba(79,94,255,0.14)] transition-colors shrink-0"
        >
          {bindLabel}
        </button>
      )}
    </div>
  );
}
