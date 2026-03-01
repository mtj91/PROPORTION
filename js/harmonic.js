// ============================================================
//  Harmonic Series Canvas Visualizer
// ============================================================

let animFrameId = null;
let animPhase = 0;

function drawHarmonic(canvas, interval, baseFreq, animated) {
  if (!canvas) return;
  const W = canvas.width, H = canvas.height;
  if (!W || !H) return;
  const ctx = canvas.getContext('2d');
  const isDark = document.body.dataset.theme !== 'light';

  ctx.clearRect(0, 0, W, H);

  const [n, d] = interval.ratio;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, isDark ? '#13161e' : '#f8f9ff');
  bg.addColorStop(1, isDark ? '#0d0f14' : '#f0f2f8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let y = 0; y <= H; y += H / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const phase = animated ? animPhase : 0;
  const cycles = Math.max(2, Math.min(n, 8));
  const waveScale = H / 4.5;

  // Combined waveform (bottom)
  const combinedY = H * 0.82;
  ctx.beginPath();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = isDark ? 'rgba(108,142,255,0.3)' : 'rgba(61,92,255,0.2)';
  for (let x = 0; x < W; x++) {
    const t = (x / W) * cycles * 2 * Math.PI + phase;
    const combined = (Math.sin(t) + Math.sin(t * n / d)) / 2 * (waveScale * 0.5);
    if (x === 0) ctx.moveTo(x, combinedY + combined);
    else ctx.lineTo(x, combinedY + combined);
  }
  ctx.stroke();

  // Center baseline
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H * 0.3); ctx.lineTo(W, H * 0.3); ctx.stroke();

  // Wave 1 — Root
  _drawWave(ctx, W, H * 0.3, waveScale, cycles, 1, phase, '#6c8eff', 2.5, isDark);

  // Wave 2 — Interval
  const iColor = resolveHarmonicColor(interval.color);
  _drawWave(ctx, W, H * 0.3, waveScale, cycles, n / d, phase, iColor, 2.5, isDark);

  // Wavelength divider
  ctx.setLineDash([3, 5]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
  const mid = W / 2;
  ctx.beginPath(); ctx.moveTo(mid, 0); ctx.lineTo(mid, H * 0.6); ctx.stroke();
  ctx.setLineDash([]);

  // Labels
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(n + ' : ' + d, 12, 20);

  // Consonance bar
  const score = Math.max(0.05, 1 - (Math.log2(n + d) - 1) / 5);
  const barW = 110, barH2 = 6;
  const bx = W - barW - 12, by = H - 18;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';
  _roundRect(ctx, bx, by, barW, barH2, 3); ctx.fill();
  const grad = ctx.createLinearGradient(bx, 0, bx + barW, 0);
  grad.addColorStop(0, '#ef4444'); grad.addColorStop(0.5, '#f59e0b'); grad.addColorStop(1, '#34d399');
  ctx.fillStyle = grad;
  _roundRect(ctx, bx, by, barW * score, barH2, 3); ctx.fill();
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  ctx.font = '9px system-ui';
  ctx.fillText('Consonance', bx, by - 4);
}

function _drawWave(ctx, W, centerY, scale, cycles, freqMult, phase, color, lineWidth, isDark) {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  for (let x = 0; x < W; x++) {
    const t = (x / W) * cycles * 2 * Math.PI * freqMult + phase * freqMult;
    const y = centerY + Math.sin(t) * scale;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.shadowColor = color;
  ctx.shadowBlur = isDark ? 6 : 2;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function resolveHarmonicColor(cssVar) {
  const map = {
    'var(--c-unison)': '#6c8eff', 'var(--c-octave)': '#34d399',
    'var(--c-fifth)': '#f59e0b', 'var(--c-fourth)': '#a78bfa',
    'var(--c-third)': '#f472b6', 'var(--c-minor)': '#fb923c',
    'var(--c-tritone)': '#ef4444', 'var(--accent-2)': '#a78bfa',
  };
  return map[cssVar] || '#6c8eff';
}

function startWaveAnimation(canvas, state) {
  stopWaveAnimation();
  function tick() {
    animPhase += 0.05;
    drawHarmonic(canvas, state.selectedInterval, state.baseFreq, true);
    animFrameId = requestAnimationFrame(tick);
  }
  animFrameId = requestAnimationFrame(tick);
}

function stopWaveAnimation() {
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  animPhase = 0;
}
