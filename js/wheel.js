// ============================================================
//  Proportion Wheel (Circle of Intervals)
// ============================================================

function drawProportionWheel(canvas, selectedInterval, allIntervals) {
  if (!canvas) return;
  const W = canvas.width, H = canvas.height;
  if (!W || !H) return;
  const ctx = canvas.getContext('2d');
  const isDark = document.body.dataset.theme !== 'light';

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = isDark ? '#0d0f14' : '#f8f9ff';
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const outerR = Math.min(W, H) * 0.42;
  const innerR = outerR * 0.38;

  // Outer ring
  ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#1a1e2a' : '#eef0f8'; ctx.fill();
  ctx.strokeStyle = isDark ? '#2d3347' : '#d0d5e8'; ctx.lineWidth = 1; ctx.stroke();

  const total = allIntervals.length;
  allIntervals.forEach(function(iv, i) {
    const startAngle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const endAngle = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;
    const isSelected = iv === selectedInterval;
    const color = _resolveWheelColor(iv.color);
    const alpha = isSelected ? 0.85 : 0.25;

    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, isSelected ? outerR + 4 : outerR, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fill();
    if (isSelected) { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }

    // Separator
    ctx.strokeStyle = isDark ? 'rgba(13,15,20,0.5)' : 'rgba(208,213,232,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(startAngle), cy + innerR * Math.sin(startAngle));
    ctx.lineTo(cx + outerR * Math.cos(startAngle), cy + outerR * Math.sin(startAngle));
    ctx.stroke();

    // Label for wider segments
    if (endAngle - startAngle > 0.35) {
      const labelR = (innerR + outerR) / 2;
      ctx.save();
      ctx.translate(cx + labelR * Math.cos(midAngle), cy + labelR * Math.sin(midAngle));
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillStyle = isSelected ? (isDark ? '#fff' : '#000') : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)');
      ctx.font = (isSelected ? 'bold ' : '') + '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(iv.name.replace('Perfect ', 'P.').replace('Major ', 'Maj.').replace('Minor ', 'Min.'), 0, 0);
      ctx.restore();
    }
  });

  // Inner circle overlay
  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#13161e' : '#f8f9ff'; ctx.fill();
  ctx.strokeStyle = isDark ? '#2d3347' : '#d0d5e8'; ctx.lineWidth = 1; ctx.stroke();

  // Center label
  const [n, d] = selectedInterval.ratio;
  const selColor = _resolveWheelColor(selectedInterval.color);
  ctx.fillStyle = selColor;
  ctx.font = 'bold ' + Math.round(innerR * 0.35) + 'px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(n + ':' + d, cx, cy + 5);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';
  ctx.font = Math.round(innerR * 0.17) + 'px system-ui';
  ctx.fillText(selectedInterval.name, cx, cy + innerR * 0.35);
  ctx.textAlign = 'left';
}

function _resolveWheelColor(cssVar) {
  const map = {
    'var(--c-unison)': '#6c8eff', 'var(--c-octave)': '#34d399',
    'var(--c-fifth)': '#f59e0b', 'var(--c-fourth)': '#a78bfa',
    'var(--c-third)': '#f472b6', 'var(--c-minor)': '#fb923c',
    'var(--c-tritone)': '#ef4444', 'var(--accent-2)': '#a78bfa',
  };
  return map[cssVar] || '#6c8eff';
}
