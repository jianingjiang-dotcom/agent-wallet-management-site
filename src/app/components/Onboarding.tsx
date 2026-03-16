import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Loader2,
  Zap,
  Link2,
  Info,
} from "lucide-react";
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
    address: string;
    policy: { singleTxLimit: number; dailyLimit: number };
    walletId: string;
    agentId: string;
  }) => void;
}

type WaitingPhase = "idle" | "waiting" | "connected" | "configuring" | "success";

const API_URL = "https://api-agent-wallet-core.sandbox.cobo.com";
const DOC_URL = "https://agent-wallet-doc-preview.cobo.com/quickstart/set-up-agentic-wallet";

export default function OnboardingModal({
  open,
  onClose,
  onWalletCreated,
}: OnboardingModalProps) {
  const { t, language } = useLanguage();

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
  const [limitsChanged, setLimitsChanged] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [waitingPhase, setWaitingPhase] = useState<WaitingPhase>("idle");
  const [walletId, setWalletId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAnimated, setSuccessAnimated] = useState(false);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [showPairingToast, setShowPairingToast] = useState<"pairing" | "done" | null>(null);
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
      setLimitsChanged(false);
      setRegenerating(false);
      setWaitingPhase("idle");
      setWalletId("");
      setAgentId("");
      setShowSuccess(false);
      setSuccessAnimated(false);
      setCreatedAt(null);
      setShowPairingToast(null);
      waitingTimers.current.forEach(clearTimeout);
      waitingTimers.current = [];
    }
  }, [open]);

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

  // ─── Prompt builder ───
  const buildPromptText = useCallback(() => {
    if (language === "zh") {
      return `请帮我配置 Cobo Agentic Wallet，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install /path/to/cobo-agent-wallet/sdk

2. 运行配对命令：
caw --api-url ${API_URL} onboard provision --token ${setupToken}`;
    }
    return `Please help me set up Cobo Agentic Wallet by following these steps:

1. Install the CLI tool (if not installed):
pip install /path/to/cobo-agent-wallet/sdk

2. Run the pairing command:
caw --api-url ${API_URL} onboard provision --token ${setupToken}`;
  }, [language, setupToken]);

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

  const handleCopyPrompt = () => copyToClipboard(buildPromptText(), "prompt");
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
    setLimitsChanged(true);
  };

  const handleCustomChange = (type: "perTx" | "daily", value: string) => {
    if (type === "perTx") { setCustomPerTx(value); setPerTxLimit("custom"); }
    else { setCustomDaily(value); setDailyLimit("custom"); }
    setLimitsChanged(true);
  };

  const handleConfirmLimits = () => {
    setRegenerating(true);
    setTimeout(() => {
      setSetupToken(generateSetupToken());
      setTimeRemaining(15 * 60);
      setLimitsChanged(false);
      setRegenerating(false);
      setCopiedType(null);
      setLimitsExpanded(false);
    }, 600);
  };

  // ─── Async waiting flow (simulated) ───
  const startWaitingFlow = () => {
    setWaitingPhase("waiting");
    setShowPairingToast("pairing");
    // Step 1: After 3s, show "已完成配对"
    const t1 = setTimeout(() => {
      setWalletAddress(generateAddress());
      setWalletId(generateShortId());
      setAgentId(generateShortId());
      setCreatedAt(new Date());
      setWaitingPhase("success");
      setShowPairingToast("done");
      // Step 2: After 1.5s more, close dialog and trigger callback
      const t2 = setTimeout(() => {
        if (onWalletCreated) {
          onWalletCreated({
            address: walletAddress || generateAddress(),
            walletId: walletId || generateShortId(),
            agentId: agentId || generateShortId(),
            policy: {
              singleTxLimit: Number(getEffectivePerTx()),
              dailyLimit: Number(getEffectiveDaily()),
            },
          });
        }
        onClose();
      }, 1500);
      waitingTimers.current.push(t2);
    }, 3000);
    waitingTimers.current.push(t1);
  };

  // ─── Complete ───
  const handleComplete = () => {
    if (onWalletCreated) {
      onWalletCreated({
        address: walletAddress,
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

  // (Success is now handled directly in startWaitingFlow)

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
      ["#4f5eff", "#7B8AFF", "#A5AEFF"], // brand blue
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
    <Dialog open={open} onOpenChange={(val) => { if (!val && !showPairingToast) onClose(); }}>
      <DialogContent className="!max-w-[calc(100vw-2rem)] sm:!max-w-[640px] max-h-[90vh] overflow-hidden p-0 gap-0 rounded-xl sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97] data-[state=open]:slide-in-from-bottom-3 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:duration-300 data-[state=closed]:duration-200">
        <DialogTitle className="sr-only">{t("onboarding.title")}</DialogTitle>

        {/* ═══════════ SETUP VIEW ═══════════ */}
          <div className="p-5 sm:p-8 w-full min-w-0 max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-hidden relative">
            {/* ─── 1. Header ─── */}
            <div className="mb-4 pr-6 sm:pr-0">
              <h2
                className="font-['Inter',sans-serif] font-semibold text-[24px] leading-[32px] text-[#0a0a0a] cursor-pointer"
                onClick={startWaitingFlow}
              >
                {t("onboarding.title")}
              </h2>
            </div>
            <div className="bg-[rgba(79,94,255,0.06)] border border-[rgba(79,94,255,0.15)] rounded-[10px] px-4 py-3 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#4f5eff] flex-shrink-0" />
              <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[#4f5eff] leading-[20px]">
                复制下方指令并发送给 AI Agent，将自动完成 Agent Wallet 钱包配置。
              </p>
            </div>

            {/* ─── 2. Prompt Card ─── */}
            <div>
              <div className="bg-white border border-[rgba(10,10,10,0.08)] rounded-[10px] mb-4 overflow-hidden">
                {/* Header: timer left, actions right */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-['Inter',sans-serif] text-[12px] leading-[16px]">
                    <span className="text-[#7c7c7c]">指令剩余有效时间: </span>
                    <span className={`font-semibold tabular-nums ${
                      timeRemaining < 300 ? "text-[#ef4444]" : "text-[#4f5eff]"
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        setRegenerating(true);
                        setTimeout(() => {
                          handleRefreshToken();
                          setRegenerating(false);
                        }, 400);
                      }}
                      disabled={!!showPairingToast}
                      className="flex items-center gap-1 font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] text-[#7c7c7c] hover:text-[#4f5eff] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {t("onboarding.regenerate")}
                    </button>
                    <div className="w-px h-4 bg-[rgba(10,10,10,0.12)]" />
                    <button
                      onClick={handleCopyToken}
                      disabled={!!showPairingToast}
                      className={`flex items-center gap-1 font-['Inter',sans-serif] font-normal text-[12px] leading-[16px] transition-colors disabled:opacity-50 disabled:pointer-events-none ${
                        copiedType === "token"
                          ? "text-[#22c55e]"
                          : "text-[#7c7c7c] hover:text-[#4f5eff]"
                      }`}
                    >
                      {copiedType === "token"
                        ? t("onboarding.copyTokenDone")
                        : t("onboarding.copyTokenOnly")}
                    </button>
                  </div>
                </div>

                {/* Code block */}
                <div
                  className={`relative bg-[#1a1a2e] rounded-b-[10px] transition-all duration-300 ${
                    regenerating ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <div className="p-4">
                    <pre className="font-['JetBrains_Mono','SF_Mono','Consolas',monospace] text-[11px] sm:text-[12px] text-[#e0e0e0] leading-relaxed whitespace-pre-wrap break-words">
                      {buildPromptText()}
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
                    : "bg-[#4f5eff] hover:bg-[#3d4dd9]"
                }`}
              >
                {copiedType === "prompt" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t("onboarding.copyPromptDone")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t("onboarding.copyPrompt")}
                  </>
                )}
              </button>
            </div>

            {/* ─── 3. Footer: Risk Control + Doc Link ─── */}
            <div className="border-t border-[rgba(10,10,10,0.08)] pt-4 mt-4">
              <Collapsible open={limitsExpanded} onOpenChange={setLimitsExpanded}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left">
                    <Shield className="w-4 h-4 text-[#7c7c7c] flex-shrink-0" />
                    <span className="font-['Inter',sans-serif] font-medium text-[14px] leading-[20px] text-[#4f4f4f]">
                      {t("onboarding.limits.title")}
                    </span>
                    <span className="font-['Inter',sans-serif] font-normal text-[14px] leading-[20px] text-[#7c7c7c]">
                      ${getEffectivePerTx()}/tx · ${getEffectiveDaily()}/day
                    </span>
                    {limitsExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#7c7c7c]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#7c7c7c]" />
                    )}
                  </CollapsibleTrigger>
                  <a
                    href={DOC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-['Inter',sans-serif] font-medium text-[14px] leading-[20px] text-[#4f5eff] hover:text-[#3d4dd9] transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("onboarding.docLink")}
                  </a>
                </div>
                <CollapsibleContent>
                  <div className="mt-3 bg-white border border-[rgba(10,10,10,0.08)] rounded-[10px] px-4 pb-4 pt-3">
                    <p className="font-['Inter',sans-serif] font-normal text-[12px] text-[#7c7c7c] mb-3">
                      {t("onboarding.limits.desc")}
                    </p>

                    {/* Per-Transaction Limit */}
                    <div className="mb-3">
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4f4f4f] mb-2">
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
                              className="w-4 h-4 text-[#4f5eff] border-[#d1d1d1] focus:ring-[#4f5eff] focus:ring-2"
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
                            className="w-4 h-4 text-[#4f5eff] border-[#d1d1d1] focus:ring-[#4f5eff] focus:ring-2"
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
                            onFocus={() => { setPerTxLimit("custom"); setLimitsChanged(true); }}
                            placeholder="0"
                            className="w-16 bg-white border border-[rgba(10,10,10,0.15)] rounded-[6px] px-2 py-1 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#4f5eff] focus:ring-1 focus:ring-[#4f5eff]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Daily Spending Limit */}
                    <div className="mb-3">
                      <div className="font-['Inter',sans-serif] font-medium text-[13px] text-[#4f4f4f] mb-2">
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
                              className="w-4 h-4 text-[#4f5eff] border-[#d1d1d1] focus:ring-[#4f5eff] focus:ring-2"
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
                            className="w-4 h-4 text-[#4f5eff] border-[#d1d1d1] focus:ring-[#4f5eff] focus:ring-2"
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
                            onFocus={() => { setDailyLimit("custom"); setLimitsChanged(true); }}
                            placeholder="0"
                            className="w-16 bg-white border border-[rgba(10,10,10,0.15)] rounded-[6px] px-2 py-1 font-['Inter',sans-serif] font-normal text-[13px] text-[#0a0a0a] focus:outline-none focus:border-[#4f5eff] focus:ring-1 focus:ring-[#4f5eff]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Warning + Confirm */}
                    {limitsChanged && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                          <span className="font-['Inter',sans-serif] font-normal text-[12px] text-[#92400e]">
                            {t("onboarding.limits.warning")}
                          </span>
                        </div>
                        <button
                          onClick={handleConfirmLimits}
                          disabled={regenerating}
                          className="w-full bg-[#4f5eff] hover:bg-[#3d4dd9] h-[36px] rounded-[8px] transition-colors font-['Inter',sans-serif] font-medium text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-70"
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
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* ─── Pairing overlay toast ─── */}
            {showPairingToast && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl pointer-events-none bg-white/40">
                <div className="flex items-center gap-3 bg-white border border-[rgba(10,10,10,0.1)] rounded-[12px] px-5 py-3 shadow-lg pointer-events-auto">
                  {showPairingToast === "done" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-[#22c55e]" />
                      <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                        已完成配对
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-5 h-5 text-[#4f5eff] animate-spin" />
                      <span className="font-['Inter',sans-serif] font-medium text-[14px] text-[#0a0a0a]">
                        配对中...
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

      </DialogContent>
    </Dialog>
    </>
  );
}
