import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  Trash2,
  UserPlus,
  Star,
  Pencil,
  Check,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Delegation, Agent, Permission, Policy } from "../hooks/useWalletStore";
import PermissionsPanel from "./PermissionsPanel";
import PolicyPanel from "./PolicyPanel";

interface DelegationCardProps {
  delegation: Delegation;
  agent: Agent | null;
  isOriginAgent: boolean;
  onFreeze: (delegationId: string) => void;
  onUnfreeze: (delegationId: string) => void;
  onRevoke: (delegationId: string) => void;
  onUpdatePermissions: (delegationId: string, permissions: Permission[]) => void;
  onUpdatePolicy: (delegationId: string, policy: Partial<Policy>) => void;
  onUpdateAgentName?: (agentId: string, name: string) => void;
}

export default function DelegationCard({
  delegation,
  agent,
  isOriginAgent,
  onFreeze,
  onUnfreeze,
  onRevoke,
  onUpdatePermissions,
  onUpdatePolicy,
  onUpdateAgentName,
}: DelegationCardProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(agent?.name || "");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== agent?.name && onUpdateAgentName && agent) {
      onUpdateAgentName(agent.id, trimmed);
    } else {
      setEditName(agent?.name || "");
    }
    setIsEditingName(false);
  };

  const isFrozen = delegation.status === "frozen";

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch { return dateStr; }
  };

  return (
    <div className={`bg-white border rounded-[8px] transition-colors ${
      isFrozen ? "border-[#eab308] bg-[rgba(234,179,8,0.02)]" : "border-[rgba(10,10,10,0.08)]"
    }`}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[rgba(10,10,10,0.01)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isFrozen ? "bg-[rgba(234,179,8,0.1)]" : "bg-[rgba(79,94,255,0.1)]"
        }`}>
          <UserPlus className={`w-4 h-4 ${isFrozen ? "text-[#eab308]" : "text-[#4f5eff]"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 group/agentname">
            {isEditingName ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={nameInputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") { setEditName(agent?.name || ""); setIsEditingName(false); }
                  }}
                  className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0a0a0a] bg-transparent border-b border-[#4f5eff] outline-none py-0 px-0 w-[120px]"
                />
                <button onClick={handleSaveName} className="text-[#4f5eff] hover:text-[#2837d0] transition-colors p-0.5">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0a0a0a]">
                  {agent?.name || delegation.agentId}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditName(agent?.name || "");
                    setIsEditingName(true);
                  }}
                  className="text-[#b0b0b0] hover:text-[#4f5eff] transition-colors p-0.5 opacity-0 group-hover/agentname:opacity-100"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </>
            )}
            {isOriginAgent && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[rgba(79,94,255,0.08)] text-[#4f5eff]">
                <Star className="w-2.5 h-2.5" />
                <span className="font-['Inter',sans-serif] font-normal text-[9px]">{t("delegationCard.signer")}</span>
              </span>
            )}
            {isFrozen && (
              <span className="px-1.5 py-0.5 rounded-full font-['Inter',sans-serif] font-normal text-[9px] bg-[rgba(234,179,8,0.1)] text-[#92400e]">
                {t("delegationCard.frozen")}
              </span>
            )}
          </div>
          <div className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7c7c7c] truncate">
            {delegation.agentId}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-['Inter',sans-serif] font-normal text-[10px] text-[#b0b0b0]">
            {delegation.permissions.length} {t("delegationCard.permissions")}
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[#7c7c7c]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#7c7c7c]" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[rgba(10,10,10,0.06)] px-4 py-4 space-y-4">
          {/* Frozen banner */}
          {isFrozen && (
            <div className="bg-[rgba(234,179,8,0.08)] border border-[rgba(234,179,8,0.2)] rounded-[8px] px-3 py-2">
              <p className="font-['Inter',sans-serif] font-normal text-[11px] text-[#92400e]">
                {t("delegation.frozenBanner")}
              </p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4">
            <div>
              <span className="font-['Inter',sans-serif] font-normal text-[10px] text-[#b0b0b0] block">{t("delegationCard.delegatedAt")}</span>
              <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#4F4F4F]">{formatDate(delegation.delegatedAt)}</span>
            </div>
          </div>

          {/* Permissions */}
          <PermissionsPanel
            permissions={delegation.permissions}
            onUpdate={(perms) => onUpdatePermissions(delegation.id, perms)}
          />

          {/* Policy */}
          <PolicyPanel policy={delegation.policy} />

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-[rgba(10,10,10,0.06)]">
            {isFrozen ? (
              <button
                onClick={() => onUnfreeze(delegation.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[rgba(34,197,94,0.08)] hover:bg-[rgba(34,197,94,0.15)] transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-[#22c55e]" />
                <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#166534]">{t("delegation.resumeAction")}</span>
              </button>
            ) : (
              <button
                onClick={() => onFreeze(delegation.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[rgba(234,179,8,0.08)] hover:bg-[rgba(234,179,8,0.15)] transition-colors"
              >
                <Pause className="w-3.5 h-3.5 text-[#eab308]" />
                <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#92400e]">{t("delegation.pauseAction")}</span>
              </button>
            )}
            <button
              onClick={() => setShowRevokeConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />
              <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#dc2626]">{t("delegation.revokeAction")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a] mb-2">
              {t("delegation.revokeConfirmTitle")}
            </h3>
            <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] mb-1">
              {t("delegation.revokeConfirmDesc")}
            </p>
            <p className="font-['JetBrains_Mono',monospace] text-[11px] text-[#4F4F4F] mb-4">
              Agent: {agent?.name || delegation.agentId}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRevokeConfirm(false)}
                className="flex-1 bg-[#f5f5f5] hover:bg-[#eee] h-[36px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => { setShowRevokeConfirm(false); onRevoke(delegation.id); }}
                className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] h-[36px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] text-white transition-colors"
              >
                {t("delegation.revokeConfirmBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
