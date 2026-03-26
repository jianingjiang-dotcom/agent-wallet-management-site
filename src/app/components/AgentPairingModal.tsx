import { useState, useEffect, useRef } from "react";
import {
  Copy,
  CheckCircle,
  RefreshCw,
  Loader2,
  Link2,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

interface AgentPairingModalProps {
  open: boolean;
  onClose: () => void;
  walletId?: string; // If provided, the pairing command includes wallet binding
  onAgentPaired?: (agent: { agentId: string; agentName: string }) => void;
}

const API_URL = "https://api-agent-wallet-core.sandbox.cobo.com";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "caw_tok_";
  for (let i = 0; i < 48; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

type Phase = "idle" | "waiting" | "success";

export default function AgentPairingModal({
  open,
  onClose,
  walletId,
  onAgentPaired,
}: AgentPairingModalProps) {
  const { t, language } = useLanguage();

  const [token, setToken] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [copied, setCopied] = useState<"token" | "prompt" | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [agentId, setAgentId] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setToken(generateToken());
      setTimeRemaining(15 * 60);
      setCopied(null);
      setPhase("idle");
      setAgentId("");
    }
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [open]);

  // Countdown
  useEffect(() => {
    if (!open || phase !== "idle") return;
    const iv = setInterval(() => setTimeRemaining(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [open, phase]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const buildCommand = () => {
    const base = `caw --api-url ${API_URL} pair --token ${token}`;
    return walletId ? `${base} --wallet ${walletId}` : base;
  };

  const buildPrompt = () => {
    if (language === "zh") {
      return walletId
        ? `请帮我配对一个 Cobo Pact Agent 并绑定到指定钱包，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install /path/to/cobo-agent-wallet/sdk

2. 运行配对命令：
${buildCommand()}`
        : `请帮我配对一个 Cobo Pact Agent，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install /path/to/cobo-agent-wallet/sdk

2. 运行配对命令：
${buildCommand()}`;
    }
    return walletId
      ? `Please help me pair a Cobo Pact Agent and bind it to a specific wallet by following these steps:

1. Install the CLI tool (if not installed):
pip install /path/to/cobo-agent-wallet/sdk

2. Run the pairing command:
${buildCommand()}`
      : `Please help me pair a Cobo Pact Agent by following these steps:

1. Install the CLI tool (if not installed):
pip install /path/to/cobo-agent-wallet/sdk

2. Run the pairing command:
${buildCommand()}`;
  };

  const handleCopy = async (type: "token" | "prompt") => {
    const text = type === "token" ? token : buildPrompt();
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = () => {
    setToken(generateToken());
    setTimeRemaining(15 * 60);
    setCopied(null);
  };

  // Simulate agent connecting
  const simulatePairing = () => {
    setPhase("waiting");
    const id = generateId();
    const t1 = setTimeout(() => {
      setAgentId(id);
      setPhase("success");
    }, 3000);
    timers.current.push(t1);
  };

  const handleDone = () => {
    if (onAgentPaired && agentId) {
      onAgentPaired({ agentId, agentName: `Agent #${Date.now().toString(36).slice(-3)}` });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!max-w-[calc(100vw-2rem)] sm:!max-w-[640px] p-0 gap-0 bg-[#fafafa] rounded-[16px] border border-[rgba(10,10,10,0.06)] overflow-hidden">
        <DialogTitle className="sr-only">{t("agentPairing.title")}</DialogTitle>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(79,94,255,0.1)] flex items-center justify-center">
              <Link2 className="w-5 h-5 text-[#1F32D6]" />
            </div>
            <div>
              <h2 className="font-semibold text-[16px] text-[#0a0a0a]">
                {t("agentPairing.title")}
              </h2>
              <p className="font-normal text-[12px] text-[#7c7c7c]">
                {t("agentPairing.subtitle")}
              </p>
            </div>
          </div>

          {phase === "success" ? (
            /* Success State */
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-[#22c55e]" />
              </div>
              <h3 className="font-semibold text-[16px] text-[#0a0a0a] mb-1">
                {t("agentPairing.success")}
              </h3>
              <p className="font-normal text-[12px] text-[#7c7c7c] mb-4">
                {t("agentPairing.successDesc")}
              </p>
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] px-4 py-3 mb-4 inline-block">
                <span className="font-normal text-[11px] text-[#7c7c7c]">{t("agentPairing.agentId")}</span>
                <span className="font-['JetBrains_Mono',monospace] text-[12px] text-[#0a0a0a] ml-2">{agentId}</span>
              </div>
              <div>
                <button
                  onClick={handleDone}
                  className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[40px] rounded-[8px] font-medium text-[14px] text-white transition-colors"
                >
                  {t("agentPairing.done")}
                </button>
              </div>
            </div>
          ) : phase === "waiting" ? (
            /* Waiting State */
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-[#1F32D6] animate-spin mx-auto mb-3" />
              <p className="font-medium text-[14px] text-[#4F4F4F]">
                {t("agentPairing.waiting")}
              </p>
            </div>
          ) : (
            /* Idle State - Prompt card (onboarding style) */
            <div>
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] mb-4 overflow-hidden">
                {/* Header: timer left, actions right */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] leading-[16px]">
                    <span className="text-[#7c7c7c]">{t("agentPairing.expiresIn")} </span>
                    <span className={`font-semibold tabular-nums text-[14px] leading-[16px] ${
                      timeRemaining < 300 ? "text-[#ef4444]" : "text-[#1F32D6]"
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-[6px] font-normal text-[12px] leading-[16px] text-[#7c7c7c] hover:text-[#1F32D6] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t("agentPairing.regenerate")}
                    </button>
                    <div className="w-px h-4 bg-[rgba(10,10,10,0.12)]" />
                    <button
                      onClick={() => handleCopy("token")}
                      className={`flex items-center gap-[6px] font-normal text-[12px] leading-[16px] transition-colors ${
                        copied === "token" ? "text-[#26C165]" : "text-[#7c7c7c] hover:text-[#1F32D6]"
                      }`}
                    >
                      {copied === "token" ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {t("agentPairing.copyToken")}
                    </button>
                  </div>
                </div>

                <div className="border-t border-[rgba(10,10,10,0.08)]" />

                {/* Prompt text block */}
                <div className="bg-[#FAFAFA] rounded-b-[8px]">
                  <div className="p-4">
                    <pre className="font-normal text-[14px] text-[#0A0A0A] leading-[20px] whitespace-pre-wrap break-words">
                      {buildPrompt()}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Copy full prompt button */}
              <button
                onClick={() => handleCopy("prompt")}
                className={`w-full flex items-center justify-center gap-2 h-[40px] rounded-[8px] font-medium text-[14px] text-white transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] ${
                  copied === "prompt" ? "bg-[#22c55e] hover:bg-[#16a34a]" : "bg-[#1F32D6] hover:bg-[#1828AB]"
                }`}
              >
                {copied === "prompt" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                )}
                {t("agentPairing.copyPrompt")}
              </button>

              {/* Simulate button (dev) */}
              <button
                onClick={simulatePairing}
                className="w-full mt-2 h-[32px] rounded-[8px] border border-dashed border-[rgba(10,10,10,0.15)] font-normal text-[11px] text-[#7c7c7c] hover:bg-[#FAFAFA] transition-colors"
              >
                ⚡ Simulate Agent Connection
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
