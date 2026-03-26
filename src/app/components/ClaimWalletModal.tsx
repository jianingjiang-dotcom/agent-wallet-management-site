import { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  Copy,
  Loader2,
  Download,
  Bot,
  Wallet,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

interface ClaimWalletModalProps {
  open: boolean;
  onClose: () => void;
  onWalletClaimed?: (data: {
    walletId: string;
    agentId: string;
    agentName: string;
  }) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

type Phase = "idle" | "waiting" | "transferring" | "confirming" | "success";

export default function ClaimWalletModal({
  open,
  onClose,
  onWalletClaimed,
}: ClaimWalletModalProps) {
  const { t, language } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [walletId, setWalletId] = useState("");
  const [agentId, setAgentId] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setCopied(false);
      setPhase("idle");
      setWalletId("");
      setAgentId("");
    }
  }, [open]);

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      onClose();
    }
  };

  const buildPrompt = () => {
    if (language === "zh") {
      return `请帮我认领一个 Cobo Pact，将钱包所有权转移给我，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install cobo-agent-wallet

2. 运行认领命令：
caw claim`;
    }
    return `Please help me claim a Cobo Pact and transfer ownership to me by following these steps:

1. Install the CLI tool (if not installed):
pip install cobo-agent-wallet

2. Run the claim command:
caw claim`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate: go directly to confirming with generated data (no loading)
  const simulateClaim = () => {
    setWalletId(generateId());
    setAgentId(generateId());
    setPhase("confirming");
  };

  // User confirms claim → loading → success
  const handleConfirmClaim = () => {
    setPhase("waiting");
    const t1 = setTimeout(() => {
      setPhase("transferring");
      const t2 = setTimeout(() => {
        setPhase("success");
      }, 1500);
      timers.current.push(t2);
    }, 2000);
    timers.current.push(t1);
  };

  const handleCancelClaim = () => {
    setPhase("idle");
    setWalletId("");
    setAgentId("");
  };

  const handleDone = () => {
    if (onWalletClaimed && walletId) {
      onWalletClaimed({
        walletId,
        agentId,
        agentName: `Agent #${agentId.slice(-3)}`,
      });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-[calc(100vw-2rem)] sm:!max-w-[640px] p-0 gap-0 bg-[#fafafa] rounded-[16px] border border-[rgba(10,10,10,0.06)] overflow-hidden">
        <DialogTitle className="sr-only">{t("claimWallet.title")}</DialogTitle>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(79,94,255,0.1)] flex items-center justify-center">
              <Download className="w-5 h-5 text-[#1F32D6]" />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] text-[#0A0A0A]">
                {t("claimWallet.title")}
              </h2>
              <p className="font-normal text-[12px] text-[#7C7C7C]">
                {t("claimWallet.subtitle")}
              </p>
            </div>
          </div>

          {/* Tip banner */}
          {phase === "idle" && (
            <div className="bg-[rgba(79,94,255,0.06)] border border-[rgba(79,94,255,0.15)] rounded-[8px] px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                <path d="M10 20C15.51 20 20 15.51 20 10C20 4.49 15.51 3.92528e-07 10 8.74228e-07C4.49 1.35593e-06 -1.35593e-06 4.49 -8.74228e-07 10C-3.92528e-07 15.51 4.49 20 10 20ZM10.75 14C10.75 14.41 10.41 14.75 10 14.75C9.59 14.75 9.25 14.41 9.25 14L9.25 9C9.25 8.59 9.59 8.25 10 8.25C10.41 8.25 10.75 8.59 10.75 9L10.75 14ZM9.08 5.62C9.13 5.49 9.2 5.39 9.29 5.29C9.39 5.2 9.5 5.13 9.62 5.08C9.74 5.03 9.87 5 10 5C10.13 5 10.26 5.03 10.38 5.08C10.5 5.13 10.61 5.2 10.71 5.29C10.8 5.39 10.87 5.49 10.92 5.62C10.97 5.74 11 5.87 11 6C11 6.13 10.97 6.26 10.92 6.38C10.87 6.5 10.8 6.61 10.71 6.71C10.61 6.8 10.5 6.87 10.38 6.92C10.14 7.02 9.86 7.02 9.62 6.92C9.5 6.87 9.39 6.8 9.29 6.71C9.2 6.61 9.13 6.5 9.08 6.38C9.03 6.26 9 6.13 9 6C9 5.87 9.03 5.74 9.08 5.62Z" fill="#1F32D6"/>
              </svg>
              <p className="font-medium text-[14px] text-[#1F32D6] leading-[20px]">
                {t("claimWallet.tip")}
              </p>
            </div>
          )}

          {phase === "confirming" ? (
            <div>
              <h3 className="font-semibold text-[16px] text-[#0A0A0A] mb-1">
                {t("claimWallet.confirmTitle")}
              </h3>
              <p className="font-normal text-[12px] text-[#7C7C7C] mb-4">
                {t("claimWallet.confirmDesc")}
              </p>

              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#1F32D6]" />
                    <span className="font-medium text-[13px] text-[#0A0A0A]">
                      {t("claimWallet.walletId")}
                    </span>
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#4F4F4F]">{walletId}</span>
                </div>
                <div className="border-t border-[rgba(10,10,10,0.06)]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#1F32D6]" />
                    <span className="font-medium text-[13px] text-[#0A0A0A]">
                      {t("claimWallet.agentId")}
                    </span>
                  </div>
                  <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#4F4F4F]">{agentId}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCancelClaim}
                  className="flex-1 bg-[#FAFAFA] hover:bg-[#eee] h-[40px] rounded-[8px] font-medium text-[13px] text-[#4F4F4F] transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleConfirmClaim}
                  className="flex-1 bg-[#1F32D6] hover:bg-[#1828AB] h-[40px] rounded-[8px] font-medium text-[14px] text-white transition-colors"
                >
                  {t("claimWallet.confirmBtn")}
                </button>
              </div>
            </div>
          ) : phase === "success" ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-[#22c55e]" />
              </div>
              <h3 className="font-semibold text-[16px] text-[#0A0A0A] mb-1">
                {t("claimWallet.success")}
              </h3>
              <p className="font-normal text-[12px] text-[#7C7C7C] mb-4">
                {t("claimWallet.successDesc")}
              </p>
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] px-4 py-3 mb-4 text-left space-y-2">
                <div>
                  <span className="font-normal text-[11px] text-[#7C7C7C]">{t("claimWallet.walletId")}</span>
                  <div className="font-['JetBrains_Mono',monospace] text-[11px] text-[#0A0A0A]">{walletId}</div>
                </div>
                <div>
                  <span className="font-normal text-[11px] text-[#7C7C7C]">{t("claimWallet.agentId")}</span>
                  <div className="font-['JetBrains_Mono',monospace] text-[11px] text-[#0A0A0A]">{agentId}</div>
                </div>
              </div>
              <button
                onClick={handleDone}
                className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[40px] rounded-[8px] font-medium text-[14px] text-white transition-colors"
              >
                {t("claimWallet.done")}
              </button>
            </div>
          ) : phase === "waiting" || phase === "transferring" ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-[#1F32D6] animate-spin mx-auto mb-3" />
              <p className="font-medium text-[14px] text-[#4F4F4F]">
                {phase === "waiting" ? t("claimWallet.verifying") : t("claimWallet.transferring")}
              </p>
            </div>
          ) : (
            /* Idle State - Static prompt card */
            <div>
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] mb-4 overflow-hidden">
                {/* Prompt text block */}
                <div className="bg-[#FAFAFA] rounded-[8px]">
                  <div className="p-4">
                    <pre className="font-normal text-[14px] text-[#0A0A0A] leading-[20px] whitespace-pre-wrap break-words">
                      {buildPrompt()}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Copy full prompt button */}
              <button
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-2 h-[40px] rounded-[8px] font-medium text-[14px] text-white transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] ${
                  copied ? "bg-[#22c55e] hover:bg-[#16a34a]" : "bg-[#1F32D6] hover:bg-[#1828AB]"
                }`}
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                )}
                {t("claimWallet.copyPrompt")}
              </button>

              {/* Simulate button (dev) */}
              <button
                onClick={simulateClaim}
                className="w-full mt-2 h-[32px] rounded-[8px] border border-dashed border-[rgba(10,10,10,0.15)] font-normal text-[11px] text-[#7C7C7C] hover:bg-[#FAFAFA] transition-colors"
              >
                ⚡ Simulate Claim
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
