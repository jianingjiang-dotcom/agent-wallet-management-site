import { Shield, ArrowLeftRight, Code, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Permission } from '../hooks/useWalletStore';
import { useState, useEffect } from 'react';

interface PermissionsPanelProps {
  permissions: Permission[];
  onUpdate: (permissions: Permission[]) => void;
  disabled?: boolean;
}

const PERMISSION_ITEMS: {
  key: Permission;
  icon: typeof ArrowLeftRight;
  labelKey: string;
  descKey: string;
}[] = [
  { key: 'transfer', icon: ArrowLeftRight, labelKey: 'permissions.transfer', descKey: 'permissions.transferDesc' },
  { key: 'contractCall', icon: Code, labelKey: 'permissions.contractCall', descKey: 'permissions.contractCallDesc' },
  { key: 'walletManagement', icon: Settings, labelKey: 'permissions.walletManagement', descKey: 'permissions.walletManagementDesc' },
];

export default function PermissionsPanel({ permissions, onUpdate, disabled }: PermissionsPanelProps) {
  const { t } = useLanguage();
  const [localPermissions, setLocalPermissions] = useState<Permission[]>(permissions);

  useEffect(() => {
    setLocalPermissions(permissions);
  }, [permissions]);

  const togglePermission = (perm: Permission) => {
    if (disabled) return;
    const updated = localPermissions.includes(perm)
      ? localPermissions.filter(p => p !== perm)
      : [...localPermissions, perm];
    setLocalPermissions(updated);
    onUpdate(updated);
  };

  return (
    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[8px] p-6 mb-6 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-[var(--app-accent)]" strokeWidth={1.5} />
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[var(--app-text)]">
          {t('permissions.title')}
        </h2>
      </div>
      <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[var(--app-text-secondary)] mb-5">
        {t('permissions.desc')}
      </p>

      {/* Permission Items */}
      <div className="space-y-3">
        {PERMISSION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isEnabled = localPermissions.includes(item.key);

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--app-border)] bg-[var(--app-hover-bg)]"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[var(--app-accent)]" strokeWidth={1.5} />
                <div>
                  <div className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text)]">
                    {t(item.labelKey)}
                  </div>
                  <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[var(--app-text-secondary)]">
                    {t(item.descKey)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => togglePermission(item.key)}
                disabled={disabled}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out ${
                  isEnabled ? 'bg-[var(--app-success)]' : 'bg-[var(--app-badge-inactive-dot)]'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out ${
                    isEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                  } left-1`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-white/60 rounded-[8px] flex items-center justify-center z-10">
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-[8px] px-5 py-3 shadow-sm">
            <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[var(--app-text-secondary)]">
              {t('permissions.needAgent')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
