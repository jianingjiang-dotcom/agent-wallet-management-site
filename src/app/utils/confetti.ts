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
  delay: number;
  life: number;
}

const palettes = [
  ["#4f5eff", "#7B8AFF", "#A5AEFF"],
  ["#22c55e", "#4ade80", "#86efac"],
  ["#f59e0b", "#fbbf24", "#fde68a"],
  ["#8b5cf6", "#a78bfa", "#c4b5fd"],
  ["#ec4899", "#f472b6", "#f9a8d4"],
  ["#06b6d4", "#22d3ee", "#67e8f9"],
];

const DURATION = 4500;

export function launchConfetti(container: HTMLElement) {
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
  const particles: Particle[] = [];
  const shapes: Particle["shape"][] = ["rect", "circle", "strip", "star"];

  const createBurst = (
    originX: number, originY: number,
    count: number, angleMin: number, angleMax: number,
    speedMin: number, speedMax: number, delay: number
  ) => {
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

  // Wave 1: Two corner bursts
  createBurst(W * 0.1, H * 0.05, 45, -Math.PI * 0.15, Math.PI * 0.5, 5, 11, 0);
  createBurst(W * 0.9, H * 0.05, 45, Math.PI * 0.5, Math.PI * 1.15, 5, 11, 0);
  // Wave 2: Center fountain
  createBurst(W * 0.5, H * 0.12, 35, -Math.PI * 0.85, -Math.PI * 0.15, 4, 9, 300);
  // Wave 3: Gentle rain
  for (let i = 0; i < 25; i++) {
    createBurst(W * (0.15 + Math.random() * 0.7), -5, 1, Math.PI * 0.3, Math.PI * 0.7, 1, 3, 700 + Math.random() * 600);
  }

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

  let frameId: number;
  let startTime = 0;

  const draw = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    ctx.clearRect(0, 0, W, H);

    let alive = false;
    for (const p of particles) {
      if (elapsed < p.delay) { alive = true; continue; }
      const activeTime = elapsed - p.delay;
      const particleDuration = DURATION - p.delay;
      p.life = Math.min(1, activeTime / particleDuration);

      const fadeIn = Math.min(1, activeTime / 150);
      const fadeOut = p.life > 0.65 ? 1 - (p.life - 0.65) / 0.35 : 1;
      p.opacity = fadeIn * fadeOut;

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
      const scaleX = 0.3 + 0.7 * Math.abs(Math.cos(p.tiltAngle));
      ctx.scale(scaleX, 1);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "strip") {
        const hw = p.w / 2, hh = p.h / 2;
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
        const r = 1.5, hw = p.w / 2, hh = p.h / 2;
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
  setTimeout(() => {
    cancelAnimationFrame(frameId);
    if (canvas.parentNode) canvas.remove();
  }, DURATION + 500);
}
