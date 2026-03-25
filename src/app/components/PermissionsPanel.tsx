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
    <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[12px] p-6 mb-6 relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-[#4f5eff]" />
        <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
          {t('permissions.title')}
        </h2>
      </div>
      <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] mb-5">
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
              className="flex items-center justify-between p-3 rounded-[8px] border border-[rgba(10,10,10,0.06)] bg-[#fafafa]"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#4f5eff]" />
                <div>
                  <div className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                    {t(item.labelKey)}
                  </div>
                  <div className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c]">
                    {t(item.descKey)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => togglePermission(item.key)}
                disabled={disabled}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ease-in-out ${
                  isEnabled ? 'bg-[#22c55e]' : 'bg-[#d4d4d4]'
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
        <div className="absolute inset-0 bg-white/60 rounded-[12px] flex items-center justify-center z-10">
          <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] px-5 py-3 shadow-sm">
            <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#7c7c7c]">
              {t('permissions.needAgent')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
