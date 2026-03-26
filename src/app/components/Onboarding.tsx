import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Loader2,
  Zap,
  Link2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onWalletCreated?: (wallet: {
    policy: { singleTxLimit: number; dailyLimit: number };
    walletId: string;
    agentId: string;
  }) => void;
  onClaimWallet?: () => void;
  isFirstWallet?: boolean;
}

type WaitingPhase = "idle" | "waiting" | "connected" | "configuring" | "success";

const API_URL = "https://api-agent-wallet-core.sandbox.cobo.com";
const DOC_URL = "https://agent-wallet-doc-preview.cobo.com/quickstart/set-up-agentic-wallet";

export default function OnboardingModal({
  open,
  onClose,
  onWalletCreated,
  onClaimWallet,
  isFirstWallet = false,
}: OnboardingModalProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // ─── State ───
  const [setupToken, setSetupToken] = useState("");
  const [copiedType, setCopiedType] = useState<"prompt" | "token" | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [perTxLimit, setPerTxLimit] = useState("10");
  const [dailyLimit, setDailyLimit] = useState("50");
  const [customPerTx, setCustomPerTx] = useState("");
  const [customDaily, setCustomDaily] = useState("");
  const [limitsExpanded, setLimitsExpanded] = useState(false);
  const [confirmedPerTx, setConfirmedPerTx] = useState("10");
  const [confirmedDaily, setConfirmedDaily] = useState("50");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerated, setRegenerated] = useState(false);
  const [waitingPhase, setWaitingPhase] = useState<WaitingPhase>("idle");
  const [walletId, setWalletId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAnimated, setSuccessAnimated] = useState(false);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [showPairingToast, setShowPairingToast] = useState<"pairing" | "done" | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<"invite" | "command">("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteValidating, setInviteValidating] = useState(false);
  const waitingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const confettiRef = useRef<HTMLDivElement>(null);

  const isPaired = waitingPhase === "success";

  // ─── Reset on open ───
  useEffect(() => {
    if (open) {
      setSetupToken(generateSetupToken());
      setTimeRemaining(15 * 60);
      setWalletAddress("");
      setCopiedType(null);
      setPerTxLimit("10");
      setDailyLimit("50");
      setCustomPerTx("");
      setCustomDaily("");
      setLimitsExpanded(false);
      setConfirmedPerTx("10");
      setConfirmedDaily("50");
      setRegenerating(false);
      setWaitingPhase("idle");
      setWalletId("");
      setAgentId("");
      setShowSuccess(false);
      setSuccessAnimated(false);
      setCreatedAt(null);
      setShowPairingToast(null);
      setOnboardingStep(isFirstWallet ? "invite" : "command");
      setInviteCode("");
      setInviteError("");
      setInviteValidating(false);
      waitingTimers.current.forEach(clearTimeout);
      waitingTimers.current = [];
    }
  }, [open, isFirstWallet]);

  // ─── Timer with auto-refresh ───
  useEffect(() => {
    if (!open || waitingPhase !== "idle") return;
    if (timeRemaining <= 0) {
      handleRefreshToken();
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, timeRemaining, waitingPhase]);

  // ─── Helpers ───
  const generateSetupToken = () =>
    "caw_tok_" +
    Array.from({ length: 64 }, () =>
      Math.random().toString(36)[2] || "0",
    ).join("");

  const generateAddress = () =>
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");

  const generateShortId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getEffectivePerTx = () =>
    perTxLimit === "custom" ? customPerTx || "0" : perTxLimit;
  const getEffectiveDaily = () =>
    dailyLimit === "custom" ? customDaily || "0" : dailyLimit;

  // ─── Mock invite code validation ───
  const validateInviteCode = async (code: string): Promise<{ valid: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    if (code === "1111-1111") return { valid: false, error: "onboarding.inviteCodeInvalid" };
    if (code === "2222-2222") return { valid: false, error: "onboarding.inviteCodeUsed" };
    return { valid: true };
  };

  const handleInviteNext = async () => {
    if (!inviteCode.trim()) return;
    setInviteError("");
    setInviteValidating(true);
    const result = await validateInviteCode(inviteCode.trim());
    setInviteValidating(false);
    if (result.valid) {
      setOnboardingStep("command");
    } else {
      setInviteError(result.error || "onboarding.inviteCodeInvalid");
    }
  };

  // ─── Prompt builder ───
  const buildPromptText = useCallback(() => {
    const cmdSuffix = isFirstWallet && inviteCode ? ` --COBO-${inviteCode}` : "";
    if (language === "zh") {
      return `请帮我配置 Cobo Pact，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install /path/to/cobo-agent-wallet/sdk

2. 运行配对命令：
caw --api-url ${API_URL} onboard provision${cmdSuffix} --token ${setupToken}`;
    }
    return `Please help me set up Cobo Pact by following these steps:

1. Install the CLI tool (if not installed):
pip install /path/to/cobo-agent-wallet/sdk

2. Run the pairing command:
caw --api-url ${API_URL} onboard provision${cmdSuffix} --token ${setupToken}`;
  }, [language, setupToken, isFirstWallet, inviteCode]);

  // ─── Clipboard ───
  const copyToClipboard = (text: string, type: "prompt" | "token") => {
    const onSuccess = () => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } catch { /* noop */ }
    document.body.removeChild(ta);
  };

  const handleCopyPrompt = () => {
    copyToClipboard(buildPromptText(), "prompt");
    // Auto-trigger pairing flow 2 seconds after copy
    setTimeout(() => {
      startWaitingFlow();
    }, 2000);
  };
  const handleCopyToken = () => copyToClipboard(setupToken, "token");

  // ─── Token refresh ───
  const handleRefreshToken = () => {
    setSetupToken(generateSetupToken());
    setTimeRemaining(15 * 60);
    setCopiedType(null);
  };

  // ─── Limits ───
  const handleLimitChange = (type: "perTx" | "daily", value: string) => {
    if (type === "perTx") { setPerTxLimit(value); setCustomPerTx(""); }
    else { setDailyLimit(value); setCustomDaily(""); }
  };

  const handleCustomChange = (type: "perTx" | "daily", value: string) => {
    if (type === "perTx") { setCustomPerTx(value); setPerTxLimit("custom"); }
    else { setCustomDaily(value); setDailyLimit("custom"); }
  };

  const hasActualChange =
    getEffectivePerTx() !== confirmedPerTx || getEffectiveDaily() !== confirmedDaily;

  const handleConfirmLimits = () => {
    setRegenerating(true);
    setTimeout(() => {
      setConfirmedPerTx(getEffectivePerTx());
      setConfirmedDaily(getEffectiveDaily());
      setSetupToken(generateSetupToken());
      setTimeRemaining(15 * 60);
      setRegenerating(false);
      setCopiedType(null);
      setLimitsExpanded(false);
    }, 600);
  };

  // ─── Async waiting flow (simulated) ───
  const startWaitingFlow = () => {
    setWaitingPhase("waiting");
    setShowPairingToast("pairing");
    // Step 1: After 3s, generate data and transition to success
    const t1 = setTimeout(() => {
      const addr = generateAddress();
      const wId = generateShortId();
      const aId = generateShortId();
      setWalletAddress(addr);
      setWalletId(wId);
      setAgentId(aId);
      setCreatedAt(new Date());
      setWaitingPhase("success");
      setShowPairingToast(null);
    }, 3000);
    waitingTimers.current.push(t1);
  };

  // ─── Complete ───
  const handleComplete = () => {
    if (onWalletCreated) {
      onWalletCreated({
        walletId,
        agentId,
        policy: {
          singleTxLimit: Number(getEffectivePerTx()),
          dailyLimit: Number(getEffectiveDaily()),
        },
      });
    }
    onClose();
  };

  const cancelWaitingFlow = () => {
    waitingTimers.current.forEach(clearTimeout);
    waitingTimers.current = [];
    setWaitingPhase("idle");
  };

  const isWaiting = waitingPhase !== "idle" && waitingPhase !== "success";

  // ─── Success transition + confetti ───
  useEffect(() => {
    if (isPaired) {
      const t1 = setTimeout(() => setShowSuccess(true), 100);
      const t2 = setTimeout(() => setSuccessAnimated(true), 200);
      const t3 = setTimeout(() => {
        if (confettiRef.current) launchConfetti(confettiRef.current);
      }, 400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaired]);

  // ─── Canvas Confetti (multi-wave celebration) ───
  const launchConfetti = (container: HTMLDivElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.cssText = `position:absolute;top:0;left:0;width:${rect.width}px;height:${rect.height}px;pointer-events:none;z-index:100;`;
    ctx.scale(dpr, dpr);
    container.appendChild(canvas);

    const W = rect.width;
    const H = rect.height;

    // Refined palette — harmonious, celebratory, not garish
    const palettes = [
      ["#1F32D6", "#7B8AFF", "#A5AEFF"], // brand blue
      ["#22c55e", "#4ade80", "#86efac"], // success green
      ["#f59e0b", "#fbbf24", "#fde68a"], // warm gold
      ["#8b5cf6", "#a78bfa", "#c4b5fd"], // purple
      ["#ec4899", "#f472b6", "#f9a8d4"], // pink
      ["#06b6d4", "#22d3ee", "#67e8f9"], // cyan
    ];
    const colors = palettes.flat();

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      w: number; h: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      tiltAngle: number;
      tiltSpeed: number;
      wobble: number;
      wobbleSpeed: number;
      wobbleRadius: number;
      opacity: number;
      gravity: number;
      drag: number;
      shape: "rect" | "circle" | "strip" | "star";
      delay: number; // ms before particle becomes active
      life: number; // 0..1 progress through lifetime
    }

    const particles: Particle[] = [];

    // Create a burst of particles from a given origin
    const createBurst = (
      originX: number, originY: number,
      count: number, angleMin: number, angleMax: number,
      speedMin: number, speedMax: number, delay: number
    ) => {
      const shapes: Particle["shape"][] = ["rect", "circle", "strip", "star"];
      for (let i = 0; i < count; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const palette = palettes[Math.floor(Math.random() * palettes.length)];
        const color = palette[Math.floor(Math.random() * palette.length)];

        particles.push({
          x: originX + (Math.random() - 0.5) * 16,
          y: originY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5 - Math.random() * 2,
          w: shape === "strip" ? 2.5 + Math.random() * 2 : shape === "star" ? 4 + Math.random() * 3 : 4 + Math.random() * 5,
          h: shape === "strip" ? 12 + Math.random() * 16 : 4 + Math.random() * 5,
          color,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          tiltAngle: Math.random() * Math.PI * 2,
          tiltSpeed: 0.015 + Math.random() * 0.04,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.02 + Math.random() * 0.04,
          wobbleRadius: 0.5 + Math.random() * 1.5,
          opacity: 0,
          gravity: 0.08 + Math.random() * 0.05,
          drag: 0.975 + Math.random() * 0.015,
          shape,
          delay,
          life: 0,
        });
      }
    };

    // Wave 1: Two corner bursts (immediate)
    createBurst(W * 0.1, H * 0.05, 45, -Math.PI * 0.15, Math.PI * 0.5, 5, 11, 0);
    createBurst(W * 0.9, H * 0.05, 45, Math.PI * 0.5, Math.PI * 1.15, 5, 11, 0);

    // Wave 2: Center fountain burst (delayed 300ms)
    createBurst(W * 0.5, H * 0.12, 35, -Math.PI * 0.85, -Math.PI * 0.15, 4, 9, 300);

    // Wave 3: Gentle rain from wider spread (delayed 700ms)
    for (let i = 0; i < 25; i++) {
      createBurst(
        W * (0.15 + Math.random() * 0.7),
        -5,
        1,
        Math.PI * 0.3, Math.PI * 0.7,
        1, 3,
        700 + Math.random() * 600
      );
    }

    let frameId: number;
    let startTime = 0;
    const DURATION = 4500;

    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? "moveTo" : "lineTo";
        ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
    };

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, W, H);

      let alive = false;
      for (const p of particles) {
        // Skip if not yet active
        if (elapsed < p.delay) { alive = true; continue; }

        const activeTime = elapsed - p.delay;
        const particleDuration = DURATION - p.delay;
        p.life = Math.min(1, activeTime / particleDuration);

        // Fade in quickly at start
        const fadeIn = Math.min(1, activeTime / 150);
        // Fade out smoothly in last 35%
        const fadeOut = p.life > 0.65 ? 1 - (p.life - 0.65) / 0.35 : 1;
        p.opacity = fadeIn * fadeOut;

        // Physics
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleRadius;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tiltAngle += p.tiltSpeed;
        p.wobble += p.wobbleSpeed;

        if (p.opacity <= 0.01 || p.y > H + 30) continue;
        alive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // 3D tilt illusion
        const scaleX = 0.3 + 0.7 * Math.abs(Math.cos(p.tiltAngle));
        ctx.scale(scaleX, 1);

        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "strip") {
          // Ribbon with subtle curve
          const hw = p.w / 2;
          const hh = p.h / 2;
          ctx.beginPath();
          ctx.moveTo(-hw, -hh);
          ctx.quadraticCurveTo(hw * 2, -hh * 0.3, hw, 0);
          ctx.quadraticCurveTo(-hw * 2, hh * 0.3, -hw + 1, hh);
          ctx.lineTo(hw, hh);
          ctx.quadraticCurveTo(-hw * 2, hh * 0.6, hw, 0);
          ctx.quadraticCurveTo(hw * 2, -hh * 0.6, -hw, -hh);
          ctx.fill();
        } else if (p.shape === "star") {
          drawStar(0, 0, p.w / 2);
        } else {
          // Rounded rectangle
          const r = 1.5;
          const hw = p.w / 2, hh = p.h / 2;
          ctx.beginPath();
          ctx.moveTo(-hw + r, -hh);
          ctx.lineTo(hw - r, -hh);
          ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
          ctx.lineTo(hw, hh - r);
          ctx.quadraticCurveTo(hw, hh, hw - r, hh);
          ctx.lineTo(-hw + r, hh);
          ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
          ctx.lineTo(-hw, -hh + r);
          ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
          ctx.fill();
        }
        ctx.restore();
      }

      if (alive && elapsed < DURATION) {
        frameId = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    };

    frameId = requestAnimationFrame(draw);

    // Safety cleanup
    setTimeout(() => {
      cancelAnimationFrame(frameId);
      if (canvas.parentNode) canvas.remove();
    }, DURATION + 500);
  };

  // ─── Waiting phase config ───
  const phaseConfig: Record<string, { dots: number; key: string }> = {
    waiting: { dots: 1, key: "onboarding.waiting.waiting" },
    connected: { dots: 2, key: "onboarding.waiting.connected" },
    configuring: { dots: 3, key: "onboarding.waiting.configuring" },
  };

  return (
    <>
    <Dialog open={open} onOpenChange={(val) => { if (!val && !showPairingToast) { if (isPaired) handleComplete(); else onClose(); } }}>
      <DialogContent className="!max-w-[calc(100vw-2rem)] sm:!max-w-[640px] max-h-[90vh] overflow-hidden p-0 gap-0 rounded-xl sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97] data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:duration-300 data-[state=closed]:duration-200">
        <DialogTitle className="sr-only">{t("onboarding.title")}</DialogTitle>

        {isPaired ? (
          /* ═══════════ SUCCESS VIEW ═══════════ */
          <div
            ref={confettiRef}
            className={`p-5 sm:p-8 w-full min-w-0 relative max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hidden transition-all duration-500 ease-out ${
              showSuccess ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Header with bounce-in icon */}
            <div className="text-center mb-6 sm:mb-8 pr-6 sm:pr-0">
              <div
                className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[rgba(34,197,94,0.1)] border-2 border-[rgba(34,197,94,0.2)] rounded-2xl mb-3 sm:mb-4 transition-transform duration-500 ease-out ${
                  successAnimated ? "scale-100" : "scale-0"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#22c55e]" />
              </div>
              <h2 className="font-['Inter',sans-serif] font-semibold text-[20px] sm:text-[24px] leading-tight text-[#0a0a0a]">
                {t("onboarding.success.title")}
              </h2>
            </div>

            {/* Wallet ID ↔ Agent ID relationship */}
            <div className="mb-6 sm:mb-8">
              <div className="rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-[rgba(79,94,255,0.08)] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1F32D6]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#7C7C7C] uppercase tracking-wider block mb-0.5">
                      {t("onboarding.success.walletId")}
                    </span>
                    <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[12px] sm:text-[13px] text-[#0a0a0a] break-words leading-snug">
                      {walletId}
                    </code>
                  </div>
                </div>
                <div className="flex items-center px-3.5 sm:px-4">
                  <div className="flex-1 h-px bg-[rgba(10,10,10,0.06)]" />
                  <div className="flex items-center gap-1.5 px-3">
                    <div className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                      <Link2 className="w-2.5 h-2.5 text-[#22c55e]" />
                    </div>
                    <span className="font-['Inter',sans-serif] font-medium text-[10px] text-[#22c55e]">
                      {t("onboarding.success.linked")}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-[rgba(10,10,10,0.06)]" />
                </div>
                <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] bg-[rgba(245,158,11,0.08)] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f59e0b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-['Inter',sans-serif] font-medium text-[11px] text-[#7C7C7C] uppercase tracking-wider block mb-0.5">
                      {t("onboarding.success.agentId")}
                    </span>
                    <code className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[12px] sm:text-[13px] text-[#0a0a0a] break-words leading-snug">
                      {agentId}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Try in Assistant button */}
            <button
              onClick={() => {
                const prefill = language === "zh"
                  ? "请介绍一下我的钱包状态，并告诉我支持的能力。"
                  : "Please describe my wallet status and tell me what capabilities are supported.";
                navigate(`/dashboard/chat?prefill=${encodeURIComponent(prefill)}&welcome=first-wallet`);
                // Delay handleComplete so navigation settles first
                setTimeout(() => handleComplete(), 100);
              }}
              className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[42px] sm:h-[44px] rounded-[8px] transition-colors shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] relative overflow-hidden group"
            >
              <span className="font-['Inter',sans-serif] font-medium text-[13px] sm:text-[14px] text-white relative z-10">
                Try in Assistant
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </button>
          </div>
        ) : (
          /* ═══════════ SETUP VIEW ═══════════ */
          <div className="px-5 py-6 sm:px-8 sm:py-6 w-full min-w-0 max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hidden relative">

            {isFirstWallet && onboardingStep === "invite" ? (
              /* ─── Step 1: Invitation Code Input ─── */
              <div className="flex flex-col items-center">
                {/* Ticket icon */}
                <div className="w-16 h-16 rounded-2xl bg-[rgba(79,94,255,0.08)] border border-[rgba(79,94,255,0.12)] flex items-center justify-center mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 9V7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V9C20.8954 9 20 9.89543 20 11C20 12.1046 20.8954 13 22 13V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V13C3.10457 13 4 12.1046 4 11C4 9.89543 3.10457 9 2 9Z" stroke="#1F32D6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 5V17" stroke="#1F32D6" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2.5 2.5"/>
                  </svg>
                </div>

                {/* Title & subtitle */}
                <h2 className="font-['Inter',sans-serif] font-semibold text-[22px] leading-[28px] text-[#0a0a0a] mb-2 text-center">
                  {t("onboarding.inviteTitle")}
                </h2>
                <p className="font-['Inter',sans-serif] font-normal text-[14px] text-[#7C7C7C] mb-8 text-center">
                  {t("onboarding.inviteDesc")}
                </p>

                {/* Input with COBO- prefix */}
                <div className="w-full mb-2">
                  <div className={`flex items-center w-full h-[52px] bg-white border rounded-[12px] overflow-hidden transition-colors ${
                    inviteError
                      ? "border-[#ef4444] ring-2 ring-[rgba(239,68,68,0.15)]"
                      : "border-[rgba(79,94,255,0.3)] focus-within:ring-2 focus-within:ring-[rgba(79,94,255,0.2)] focus-within:border-[#1F32D6]"
                  }`}>
                    <span className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] font-medium text-[16px] text-[#1F32D6] pl-4 pr-0.5 flex-shrink-0 select-none">
                      COBO-
                    </span>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => { setInviteCode(e.target.value); setInviteError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleInviteNext(); }}
                      placeholder="0000-0000"
                      className="flex-1 h-full bg-transparent font-['JetBrains_Mono','SF_Mono','Consolas',monospace] font-normal text-[16px] text-[#0a0a0a] placeholder:text-[#7C7C7C] focus:outline-none pr-4"
                    />
                  </div>
                  {inviteError && (
                    <div className="flex items-center gap-1.5 mt-2 px-1">
                      <AlertCircle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0" />
                      <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#ef4444]">
                        {t(inviteError)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Verify button */}
                <button
                  onClick={handleInviteNext}
                  disabled={!inviteCode.trim() || inviteValidating}
                  className="w-full flex items-center justify-center gap-2 h-[48px] rounded-[12px] font-['Inter',sans-serif] font-semibold text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white bg-[#1F32D6] hover:bg-[#1828AB] mt-4"
                >
                  {inviteValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t("onboarding.inviteNext")
                  )}
                </button>

                {/* Get invitation code link */}
                <div className="mt-4 text-center">
                  <span className="font-['Inter',sans-serif] text-[13px] text-[#999]">
                    {t("onboarding.noInviteCode")}{" "}
                  </span>
                  <a
                    href="https://cobo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-['Inter',sans-serif] text-[13px] text-[#1F32D6] hover:text-[#1828AB] transition-colors"
                  >
                    {t("onboarding.getInviteCode")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            ) : (
            /* ─── Step 2: Command View ─── */
            <>
            {/* ─── 1. Header ─── */}
            <div className="mb-6 pr-6 sm:pr-0">
              <h2
                className="font-['Inter',sans-serif] font-semibold text-[24px] leading-[32px] text-[#0a0a0a]"
              >
                {t("onboarding.title")}
              </h2>
            </div>
            <div className="bg-[rgba(79,94,255,0.06)] border border-[rgba(79,94,255,0.15)] rounded-[8px] px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0">
                <path d="M10 20C15.51 20 20 15.51 20 10C20 4.49 15.51 3.92528e-07 10 8.74228e-07C4.49 1.35593e-06 -1.35593e-06 4.49 -8.74228e-07 10C-3.92528e-07 15.51 4.49 20 10 20ZM10.75 14C10.75 14.41 10.41 14.75 10 14.75C9.59 14.75 9.25 14.41 9.25 14L9.25 9C9.25 8.59 9.59 8.25 10 8.25C10.41 8.25 10.75 8.59 10.75 9L10.75 14ZM9.08 5.62C9.13 5.49 9.2 5.39 9.29 5.29C9.39 5.2 9.5 5.13 9.62 5.08C9.74 5.03 9.87 5 10 5C10.13 5 10.26 5.03 10.38 5.08C10.5 5.13 10.61 5.2 10.71 5.29C10.8 5.39 10.87 5.49 10.92 5.62C10.97 5.74 11 5.87 11 6C11 6.13 10.97 6.26 10.92 6.38C10.87 6.5 10.8 6.61 10.71 6.71C10.61 6.8 10.5 6.87 10.38 6.92C10.14 7.02 9.86 7.02 9.62 6.92C9.5 6.87 9.39 6.8 9.29 6.71C9.2 6.61 9.13 6.5 9.08 6.38C9.03 6.26 9 6.13 9 6C9 5.87 9.03 5.74 9.08 5.62Z" fill="#1F32D6"/>
              </svg>
              <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[#1F32D6] leading-[20px]">
                {t("onboarding.infoBanner")}{" "}
                <a
                  href={DOC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[#1828AB] transition-colors"
                >
                  {t("onboarding.docLink")}
                </a>
              </p>
            </div>

            {/* ─── 2. Prompt Card ─── */}
            <Collapsible open={limitsExpanded} onOpenChange={setLimitsExpanded}>
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[8px] mb-4 overflow-hidden">
                {/* Header: timer left, wallet limits right */}
                <div className="flex items-center justify-between px-4 py-3 bg-white">
                  <span className="font-['Inter',sans-serif] text-[12px] leading-[16px]">
                    <span className="text-[#7c7c7c]">{t("onboarding.validTime")}: </span>
                    <span className={`font-semibold tabular-nums text-[14px] leading-[16px] ${
                      timeRemaining < 300 ? "text-[#ef4444]" : "text-[#1F32D6]"
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </span>
                  <CollapsibleTrigger className="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-left">
                    <Shield className="w-3.5 h-3.5 text-[#7c7c7c] flex-shrink-0" />
                    <span className="font-['Inter',sans-serif] font-medium text-[12px] leading-[16px] text-[#4F4F4F]">
                      {t("onboarding.limits.walletTitle")}
                    </span>
                    <span className="font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] text-[#7c7c7c]">
                      ${confirmedPerTx}/tx · ${confirmedDaily}/day
                    </span>
                    {limitsExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[#7c7c7c]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#7c7c7c]" />
                    )}
                  </CollapsibleTrigger>
                </div>

                {/* Limits expansion panel */}
                <CollapsibleContent>
                  <div className="border-t border-[rgba(10,10,10,0.08)]" />
                  <div className="px-4 pb-4 pt-3 bg-[rgba(79,94,255,0.02)]">
                    <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] mb-3">
                      {t("onboarding.limits.desc")}
                    </p>

                    {/* Per-Transaction Limit */}
                    <div className="mb-3">
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] mb-2">
                        {t("onboarding.limits.perTx")}
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {["2", "5", "10"].map((val) => (
                          <label key={val} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="perTxLimit"
                              value={val}
                              checked={perTxLimit === val}
                              onChange={() => handleLimitChange("perTx", val)}
                              className="w-4 h-4 text-[#1F32D6] border-[#EBEBEB] focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="ml-1.5 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">
                              ${val}
                            </span>
                          </label>
                        ))}
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="perTxLimit"
                            value="custom"
                            checked={perTxLimit === "custom"}
                            onChange={() => handleLimitChange("perTx", "custom")}
                            className="w-4 h-4 text-[#1F32D6] border-[#EBEBEB] focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="ml-1.5 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">
                            {t("onboarding.limits.others")}:
                          </span>
                        </label>
                        <div className="flex items-center">
                          <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] mr-1">
                            $
                          </span>
                          <input
                            type="number"
                            value={customPerTx}
                            onChange={(e) => handleCustomChange("perTx", e.target.value)}
                            onFocus={() => { setPerTxLimit("custom"); }}
                            placeholder="0"
                            className="w-16 bg-white border border-[#EBEBEB] rounded-[6px] px-2 py-1 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#1F32D6] focus:ring-1 focus:ring-[#1F32D6]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Daily Spending Limit */}
                    <div className="mb-3">
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4F4F4F] mb-2">
                        {t("onboarding.limits.daily")}
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {["20", "50", "100"].map((val) => (
                          <label key={val} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="dailyLimit"
                              value={val}
                              checked={dailyLimit === val}
                              onChange={() => handleLimitChange("daily", val)}
                              className="w-4 h-4 text-[#1F32D6] border-[#EBEBEB] focus:ring-0 focus:ring-offset-0"
                            />
                            <span className="ml-1.5 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">
                              ${val}
                            </span>
                          </label>
                        ))}
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="dailyLimit"
                            value="custom"
                            checked={dailyLimit === "custom"}
                            onChange={() => handleLimitChange("daily", "custom")}
                            className="w-4 h-4 text-[#1F32D6] border-[#EBEBEB] focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="ml-1.5 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a]">
                            {t("onboarding.limits.others")}:
                          </span>
                        </label>
                        <div className="flex items-center">
                          <span className="font-['Inter',sans-serif] font-normal text-[13px] text-[#7c7c7c] mr-1">
                            $
                          </span>
                          <input
                            type="number"
                            value={customDaily}
                            onChange={(e) => handleCustomChange("daily", e.target.value)}
                            onFocus={() => { setDailyLimit("custom"); }}
                            placeholder="0"
                            className="w-16 bg-white border border-[#EBEBEB] rounded-[6px] px-2 py-1 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#1F32D6] focus:ring-1 focus:ring-[#1F32D6]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Confirm */}
                    <div className="mt-2">
                      <button
                        onClick={handleConfirmLimits}
                        disabled={regenerating || !hasActualChange}
                        className="w-full bg-[#1F32D6] hover:bg-[#1828AB] h-[36px] rounded-[8px] transition-colors font-['Inter',sans-serif] font-medium text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {regenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            {t("onboarding.limits.regenerating")}
                          </>
                        ) : (
                          t("onboarding.limits.confirm")
                        )}
                      </button>
                    </div>
                  </div>
                </CollapsibleContent>

                <div className="border-t border-[rgba(10,10,10,0.08)]" />
                {/* Code block */}
                <div
                  className={`relative bg-[#FAFAFA] rounded-b-[8px] transition-all duration-300 ${
                    regenerating ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <div className="p-4">
                    <pre className="font-['Inter',sans-serif] font-normal text-[14px] text-[#0A0A0A] leading-[20px] whitespace-pre-wrap break-words">
                      {isFirstWallet && inviteCode ? (
                        (() => {
                          const text = buildPromptText();
                          const marker = `--COBO-${inviteCode}`;
                          const idx = text.indexOf(marker);
                          if (idx === -1) return text;
                          return (
                            <>
                              {text.slice(0, idx)}
                              <span className="bg-[rgba(245,158,11,0.18)] text-[#b45309] rounded px-0.5">{marker}</span>
                              {text.slice(idx + marker.length)}
                            </>
                          );
                        })()
                      ) : (
                        buildPromptText()
                      )}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Copy Instructions button */}
              <button
                onClick={handleCopyPrompt}
                disabled={regenerating || !!showPairingToast}
                className={`w-full flex items-center justify-center gap-2 h-[38px] sm:h-[40px] rounded-[8px] font-['Inter',sans-serif] font-medium text-[13px] sm:text-[14px] transition-all shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] disabled:opacity-50 text-white ${
                  copiedType === "prompt"
                    ? "bg-[#22c55e] hover:bg-[#16a34a]"
                    : "bg-[#1F32D6] hover:bg-[#1828AB]"
                }`}
              >
                {copiedType === "prompt" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                )}
                {t("onboarding.copyPrompt")}
              </button>
            </Collapsible>

            {/* ─── Pairing overlay toast ─── */}
            {showPairingToast && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl pointer-events-none bg-white/40">
                <div className="flex items-center gap-3 bg-white border border-[rgba(10,10,10,0.1)] rounded-[12px] px-5 py-3 shadow-lg pointer-events-auto">
                  {showPairingToast === "done" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-[#26C165]" />
                      <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                        已完成配对
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-5 h-5 text-[#1F32D6] animate-spin" />
                      <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                        配对中...
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
            </>
            )}
          </div>
        )}

      </DialogContent>
    </Dialog>
    </>
  );
}
