import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Pencil, Check, X, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/* ── Inline SVG icons ── */
function TelegramIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.486-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/* ── Confirm Modal ── */
function ConfirmModal({
  open,
  title,
  desc,
  confirmLabel,
  onConfirm,
  onCancel,
  variant = 'danger',
}: {
  open: boolean;
  title: string;
  desc: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}) {
  if (!open) return null;

  const btnColor =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-[#F5A623] hover:bg-[#e0951c] text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* card */}
      <div className="relative bg-white rounded-2xl p-6 w-[340px] shadow-xl space-y-4">
        <h3 className="text-[18px] font-semibold text-[#0a0a0a]">{title}</h3>
        <p className="text-[14px] text-[#7c7c7c] leading-relaxed">{desc}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-[44px] rounded-xl border border-[#EBEBEB] text-[14px] font-medium text-[#0a0a0a] hover:bg-[#FAFAFA] transition-colors"
          >
            {/* Cancel */}
            {onCancel && 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-[44px] rounded-xl text-[14px] font-medium transition-colors ${btnColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function AccountSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [user] = useState(() => {
    const userData = localStorage.getItem('agent_wallet_current_user');
    return userData ? JSON.parse(userData) : null;
  });

  // Inline name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Connected providers
  const [providers, setProviders] = useState<{ telegram: boolean; discord: boolean }>({
    telegram: false,
    discord: false,
  });

  // Security banner
  const [secureBannerDismissed, setSecureBannerDismissed] = useState(false);
  const [highlightProviders, setHighlightProviders] = useState(false);

  // Unbind confirmation
  const [unbindTarget, setUnbindTarget] = useState<string | null>(null);

  // Sign-out confirmation
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  // Remove highlight after animation
  useEffect(() => {
    if (highlightProviders) {
      const timer = setTimeout(() => setHighlightProviders(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightProviders]);

  const handleSaveName = () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError('Name cannot be empty');
      return;
    }
    // Persist
    const userData = localStorage.getItem('agent_wallet_current_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      parsed.name = trimmed;
      localStorage.setItem('agent_wallet_current_user', JSON.stringify(parsed));
    }
    setNameError('');
    setEditingName(false);
  };

  const handleCancelName = () => {
    setNameValue(user?.name ?? '');
    setNameError('');
    setEditingName(false);
  };

  const handleConnectBackup = () => {
    setSecureBannerDismissed(true);
    setHighlightProviders(true);
  };

  const handleToggleProvider = (key: 'telegram' | 'discord') => {
    if (providers[key]) {
      // Show unbind confirmation
      setUnbindTarget(key);
    } else {
      setProviders((prev) => ({ ...prev, [key]: true }));
    }
  };

  const confirmUnbind = () => {
    if (unbindTarget) {
      setProviders((prev) => ({ ...prev, [unbindTarget as 'telegram' | 'discord']: false }));
      setUnbindTarget(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agent_wallet_current_user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) return null;

  const providerLabel = unbindTarget
    ? unbindTarget.charAt(0).toUpperCase() + unbindTarget.slice(1)
    : '';

  return (
    <div className="max-w-[640px] mx-auto space-y-[16px]">
      {/* Page header */}
      <h1 className="font-semibold text-[24px] text-[#0a0a0a]">
        {t('account.title')}
      </h1>

      {/* Security banner */}
      {!secureBannerDismissed && (
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#0a0a0a]">{t('account.secureTitle')}</p>
            <p className="text-[13px] text-[#7c7c7c] mt-0.5">{t('account.secureDesc')}</p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleConnectBackup}
                className="text-[13px] font-medium text-[#F5A623] hover:underline flex items-center gap-1"
              >
                {t('account.secureAction')}
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSecureBannerDismissed(true)}
                className="text-[13px] text-[#7C7C7C] hover:text-[#7c7c7c]"
              >
                {t('account.secureDismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-[16px] font-semibold text-[#0a0a0a]">{t('account.profile')}</h2>

        {/* Avatar + name row */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center text-[22px] font-bold text-amber-700 flex-shrink-0">
            {(user.name as string).charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameInputRef}
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    setNameError('');
                  }}
                  className={`h-[36px] px-3 rounded-lg border text-[14px] flex-1 min-w-0 outline-none ${
                    nameError ? 'border-red-400' : 'border-[#EBEBEB] focus:border-[#F5A623]'
                  }`}
                />
                <button
                  onClick={handleSaveName}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F5A623] text-white hover:bg-[#e0951c] transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelName}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#EBEBEB] text-[#7c7c7c] hover:bg-[#FAFAFA] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-[#0a0a0a] truncate">
                  {nameValue}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#FAFAFA] text-[#7C7C7C] hover:text-[#7c7c7c] transition-colors"
                  title={t('account.editName')}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {nameError && (
              <p className="text-[12px] text-red-500 mt-1">{nameError}</p>
            )}
            <p className="text-[13px] text-[#7c7c7c] mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Member since */}
        <div className="text-[13px] text-[#7C7C7C] pt-1">
          {t('account.memberSince')} {formatDate(user.createdAt)}
        </div>
      </div>

      {/* Connected Accounts */}
      <div
        className={`bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
          highlightProviders ? 'animate-pulse ring-2 ring-[#F5A623]/40' : ''
        }`}
      >
        <div>
          <h2 className="text-[16px] font-semibold text-[#0a0a0a]">
            {t('account.connectedAccounts')}
          </h2>
          <p className="text-[13px] text-[#7c7c7c] mt-0.5">
            {t('account.connectedAccountsDesc')}
          </p>
        </div>

        {/* Login method (read-only) */}
        <div className="flex items-center justify-between py-3 border-t border-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#0a0a0a]">{t('account.loginMethod')}</p>
              <p className="text-[12px] text-[#7C7C7C]">{user.email}</p>
            </div>
          </div>
          <span className="text-[12px] text-[#34A853] font-medium bg-[#E8F5E9] px-2 py-0.5 rounded-full">
            {t('account.connected')}
          </span>
        </div>

        {/* Telegram row */}
        <div className="flex items-center justify-between py-3 border-t border-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E3F2FD] flex items-center justify-center">
              <TelegramIcon className="w-5 h-5 text-[#0088cc]" />
            </div>
            <p className="text-[14px] font-medium text-[#0a0a0a]">Telegram</p>
          </div>
          <button
            onClick={() => handleToggleProvider('telegram')}
            className={`text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors ${
              providers.telegram
                ? 'text-red-500 border border-red-200 hover:bg-red-50'
                : 'text-[#F5A623] border border-[#F5A623]/30 hover:bg-[#FFF8E1]'
            }`}
          >
            {providers.telegram ? t('account.unbind') : t('account.bind')}
          </button>
        </div>

        {/* Discord row */}
        <div className="flex items-center justify-between py-3 border-t border-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EDE7F6] flex items-center justify-center">
              <DiscordIcon className="w-5 h-5 text-[#5865F2]" />
            </div>
            <p className="text-[14px] font-medium text-[#0a0a0a]">Discord</p>
          </div>
          <button
            onClick={() => handleToggleProvider('discord')}
            className={`text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors ${
              providers.discord
                ? 'text-red-500 border border-red-200 hover:bg-red-50'
                : 'text-[#F5A623] border border-[#F5A623]/30 hover:bg-[#FFF8E1]'
            }`}
          >
            {providers.discord ? t('account.unbind') : t('account.bind')}
          </button>
        </div>
      </div>

      {/* Sign Out section */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0a0a0a]">{t('account.dangerZone')}</h2>
          </div>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="flex items-center gap-2 text-[14px] font-medium text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('account.logout')}
          </button>
        </div>
      </div>

      {/* Unbind confirmation modal */}
      <ConfirmModal
        open={!!unbindTarget}
        title={t('account.unbindTitle').replace('{provider}', providerLabel)}
        desc={t('account.unbindDesc').replace('{provider}', providerLabel)}
        confirmLabel={t('account.unbindConfirm')}
        onConfirm={confirmUnbind}
        onCancel={() => setUnbindTarget(null)}
        variant="danger"
      />

      {/* Sign out confirmation modal */}
      <ConfirmModal
        open={showSignOutModal}
        title={t('account.signOutTitle')}
        desc={t('account.signOutDesc')}
        confirmLabel={t('account.signOutConfirm')}
        onConfirm={handleLogout}
        onCancel={() => setShowSignOutModal(false)}
        variant="danger"
      />
    </div>
  );
}
