import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Loader2,
  UserPlus,
  ChevronRight,
  Shield,
  ArrowLeftRight,
  Code,
  Settings,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Agent, Permission, Policy, DEFAULT_PERMISSIONS, DEFAULT_POLICY } from "../hooks/useWalletStore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import AgentPairingModal from "./AgentPairingModal";

interface WalletDelegationModalProps {
  open: boolean;
  onClose: () => void;
  walletId: string;
  agents: Agent[];
  existingAgentIds: string[]; // agents already delegated to this wallet
  onDelegate: (data: {
    agentId: string;
    permissions: Permission[];
    policy: Partial<Policy>;
  }) => void;
  onNewAgentPaired?: (agent: { agentId: string; agentName: string }) => void;
}

type Step = "select" | "configure" | "delegating" | "success";

const PERMISSION_ITEMS: { key: Permission; icon: typeof ArrowLeftRight }[] = [
  { key: "transfer", icon: ArrowLeftRight },
  { key: "contractCall", icon: Code },
  { key: "walletManagement", icon: Settings },
];

export default function WalletDelegationModal({
  open,
  onClose,
  walletId,
  agents,
  existingAgentIds,
  onDelegate,
  onNewAgentPaired,
}: WalletDelegationModalProps) {
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("select");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([...DEFAULT_PERMISSIONS]);
  const [policy, setPolicy] = useState<Policy>({ ...DEFAULT_POLICY });
  const [showPairingModal, setShowPairingModal] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (open) {
      setStep("select");
      setSelectedAgentId(null);
      setPermissions([...DEFAULT_PERMISSIONS]);
      setPolicy({ ...DEFAULT_POLICY });
    }
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [open]);

  const availableAgents = agents.filter(a =>
    a.status === "paired" && !existingAgentIds.includes(a.id)
  );

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setStep("configure");
  };

  const togglePermission = (perm: Permission) => {
    setPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleConfirm = () => {
    if (!selectedAgentId) return;
    setStep("delegating");
    const t1 = setTimeout(() => {
      onDelegate({ agentId: selectedAgentId, permissions, policy });
      setStep("success");
    }, 1500);
    timers.current.push(t1);
  };

  const handleNewAgentPaired = (agent: { agentId: string; agentName: string }) => {
    setShowPairingModal(false);
    onNewAgentPaired?.(agent);
    // Auto-select the newly paired agent
    setSelectedAgentId(agent.agentId);
    setStep("configure");
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <>
      <Dialog open={open && !showPairingModal} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 bg-[#fafafa] rounded-[16px] border border-[rgba(10,10,10,0.06)] overflow-hidden">
          <DialogTitle className="sr-only">{t("walletDelegation.title")}</DialogTitle>

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(79,94,255,0.1)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#1F32D6]" />
              </div>
              <div>
                <h2 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
                  {t("walletDelegation.title")}
                </h2>
                <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c]">
                  {t("walletDelegation.subtitle")}
                </p>
              </div>
            </div>

            {step === "success" ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-[#22c55e]" />
                </div>
                <h3 className="font-['Inter',sans-serif] font-semibold text-[16px] text-[#0a0a0a] mb-1">
                  {t("walletDelegation.success")}
                </h3>
                <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] mb-4">
                  {t("walletDelegation.successDesc")}
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[40px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] text-white transition-colors"
                >
                  {t("agentPairing.done")}
                </button>
              </div>
            ) : step === "delegating" ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[#1F32D6] animate-spin mx-auto mb-3" />
                <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[#4F4F4F]">
                  {t("walletDelegation.delegating")}
                </p>
              </div>
            ) : step === "configure" ? (
              /* Configure permissions & policy */
              <div className="space-y-4">
                {selectedAgent && (
                  <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(79,94,255,0.1)] flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-[#1F32D6]" />
                    </div>
                    <div>
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0a0a0a]">{selectedAgent.name}</div>
                      <div className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7c7c7c]">{selectedAgent.id}</div>
                    </div>
                  </div>
                )}

                {/* Permissions */}
                <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] p-4">
                  <h4 className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] mb-3">
                    {t("walletDelegation.configurePermissions")}
                  </h4>
                  <div className="space-y-2">
                    {PERMISSION_ITEMS.map(({ key, icon: Icon }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer py-1.5">
                        <div
                          onClick={() => togglePermission(key)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            permissions.includes(key) ? "bg-[#22c55e]" : "bg-[#EBEBEB]"
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            permissions.includes(key) ? "translate-x-4" : "translate-x-0.5"
                          }`} />
                        </div>
                        <Icon className="w-4 h-4 text-[#7c7c7c]" />
                        <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">
                          {t(`permissions.${key}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Policy */}
                <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] p-4">
                  <h4 className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] mb-3">
                    {t("walletDelegation.configurePolicy")}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="font-['Inter',sans-serif] font-normal text-[11px] text-[#7c7c7c] block mb-1">
                        {t("policy.perTxLimit")}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter',sans-serif] text-[13px] text-[#7c7c7c]">$</span>
                        <input
                          type="number"
                          value={policy.singleTxLimit}
                          onChange={(e) => setPolicy({ ...policy, singleTxLimit: Number(e.target.value) || 0 })}
                          className="w-20 bg-[#fafafa] border border-[rgba(10,10,10,0.12)] rounded-[6px] px-2 py-1.5 font-['Inter',sans-serif] text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#1F32D6]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-['Inter',sans-serif] font-normal text-[11px] text-[#7c7c7c] block mb-1">
                        {t("policy.dailyLimitLabel")}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter',sans-serif] text-[13px] text-[#7c7c7c]">$</span>
                        <input
                          type="number"
                          value={policy.dailyLimit}
                          onChange={(e) => setPolicy({ ...policy, dailyLimit: Number(e.target.value) || 0 })}
                          className="w-20 bg-[#fafafa] border border-[rgba(10,10,10,0.12)] rounded-[6px] px-2 py-1.5 font-['Inter',sans-serif] text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#1F32D6]"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={policy.approvalRequired}
                        onChange={(e) => setPolicy({ ...policy, approvalRequired: e.target.checked })}
                        className="w-4 h-4 text-[#1F32D6] rounded focus:ring-0"
                      />
                      <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#4F4F4F]">
                        {t("policy.approvalRequired")}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={permissions.length === 0}
                  className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[40px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[14px] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("walletDelegation.confirm")}
                </button>
              </div>
            ) : (
              /* Select Agent */
              <div className="space-y-3">
                {availableAgents.length > 0 ? (
                  <>
                    <h4 className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F]">
                      {t("walletDelegation.selectAgent")}
                    </h4>
                    <div className="space-y-2">
                      {availableAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleSelectAgent(agent.id)}
                          className="w-full bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] px-4 py-3 flex items-center gap-3 hover:border-[#1F32D6] hover:bg-[rgba(79,94,255,0.02)] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-[rgba(79,94,255,0.1)] flex items-center justify-center flex-shrink-0">
                            <UserPlus className="w-4 h-4 text-[#1F32D6]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#0a0a0a]">{agent.name}</div>
                            <div className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7c7c7c] truncate">{agent.id}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#7C7C7C] flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] p-4 text-center">
                    <p className="font-['Inter',sans-serif] font-medium text-[13px] text-[#7c7c7c] mb-1">
                      {t("walletDelegation.noAgents")}
                    </p>
                    <p className="font-['Inter',sans-serif] font-normal text-[11px] text-[#7C7C7C]">
                      {t("walletDelegation.noAgentsDesc")}
                    </p>
                  </div>
                )}

                {/* Already delegated agents (disabled) */}
                {agents.filter(a => existingAgentIds.includes(a.id)).map((agent) => (
                  <div
                    key={agent.id}
                    className="w-full bg-[#FAFAFA] border border-[rgba(10,10,10,0.06)] rounded-[8px] px-4 py-3 flex items-center gap-3 opacity-60"
                  >
                    <div className="w-8 h-8 rounded-full bg-[rgba(10,10,10,0.05)] flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4 text-[#7C7C7C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#7c7c7c]">{agent.name}</div>
                      <div className="font-['JetBrains_Mono',monospace] text-[10px] text-[#7C7C7C] truncate">{agent.id}</div>
                    </div>
                    <span className="font-['Inter',sans-serif] font-normal text-[10px] text-[#7C7C7C]">
                      {t("walletDelegation.alreadyDelegated")}
                    </span>
                  </div>
                ))}

                {/* Pair new agent */}
                <div className="border-t border-[rgba(10,10,10,0.08)] pt-3">
                  <button
                    onClick={() => setShowPairingModal(true)}
                    className="w-full border border-dashed border-[rgba(79,94,255,0.3)] rounded-[8px] px-4 py-3 flex items-center gap-3 hover:bg-[rgba(79,94,255,0.02)] transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[rgba(79,94,255,0.08)] flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4 text-[#1F32D6]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#1F32D6]">{t("walletDelegation.pairNew")}</div>
                      <div className="font-['Inter',sans-serif] font-normal text-[11px] text-[#7c7c7c]">{t("walletDelegation.pairNewDesc")}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#1F32D6] flex-shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline Agent Pairing */}
      <AgentPairingModal
        open={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        walletId={walletId}
        onAgentPaired={handleNewAgentPaired}
      />
    </>
  );
}
