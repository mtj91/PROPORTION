// ============================================================
//  Golden Ratio Panels — Music & Architecture
//
//  MUSIC:   The Fibonacci sequence generates musical intervals
//           that converge toward φ = 1.6180…
//           F_n/F_(n-1) → φ  ↔  intervals: 2:1, 3:2, 5:3, 8:5, 13:8…
//
//  ARCHITECTURE: Fibonacci rectangles map directly to classical
//           architectural spaces. The golden spiral passes
//           through their corners. Current interval overlaid.
// ============================================================

var PHI = 1.6180339887;
var PHI_CENTS = Math.round(1200 * Math.log2(PHI)); // 833 cents

// ─────────────────────────────────────────────────────────────
//  Musical Golden Ratio
// ─────────────────────────────────────────────────────────────
// The Fibonacci music intervals — each row is [Fn, F(n-1)]
var FIB_MUSIC = [
  { n: 2,  d: 1,  name: 'Octave',         cents: 1200, fibLabel: 'F3/F2 = 2/1' },
  { n: 3,  d: 2,  name: 'Perfect Fifth',  cents: 702,  fibLabel: 'F4/F3 = 3/2' },
  { n: 5,  d: 3,  name: 'Major Sixth',    cents: 884,  fibLabel: 'F5/F4 = 5/3' },
  { n: 8,  d: 5,  name: 'Minor Sixth',    cents: 814,  fibLabel: 'F6/F5 = 8/5' },
  { n: 13, d: 8,  name: 'Aug Fifth≈',     cents: 840,  fibLabel: 'F7/F6 = 13/8' },
  { n: 21, d: 13, name: 'Converging…',    cents: 833,  fibLabel: 'F8/F7 = 21/13' },
  { n: 34, d: 21, name: 'φ approached',   cents: 833,  fibLabel: 'F9/F8 = 34/21' },
];

var goldenAnimFrame = null;
var goldenAnimPhase = 0;

function drawGoldenMusic(canvas, interval, allIntervals) {
  if (!canvas) return;
  var W = canvas.width, H = canvas.height;
  if (!W || !H) return;
  var ctx = canvas.getContext('2d');
  var isDark = document.body.dataset.theme !== 'light';
  var color = _fibColor(interval.color);
  var N = interval.ratio[0], D = interval.ratio[1];
  var ratio = N / D;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = isDark ? '#0d0f14' : '#f8f9ff';
  ctx.fillRect(0, 0, W, H);

  // ── LEFT PANEL: Fibonacci convergence table ─────────────────
  var panelW = Math.min(W * 0.42, 190);
  _drawFibTable(ctx, 12, 12, panelW, H - 24, ratio, N, D, isDark);

  // ── RIGHT PANEL: Musical spiral ─────────────────────────────
  var spiralX = panelW + 20 + (W - panelW - 20) / 2;
  var spiralY = H / 2 + 8;
  var spiralR = Math.min((W - panelW - 24) * 0.42, H * 0.38);
  _drawMusicalSpiral(ctx, spiralX, spiralY, spiralR, interval, allIntervals, isDark, 0);
}

function _drawFibTable(ctx, x, y, w, h, curRatio, N, D, isDark) {
  ctx.fillStyle = isDark ? '#13161e' : '#f0f2f8';
  _fibRRect(ctx, x, y, w, h, 6); ctx.fill();
  ctx.strokeStyle = isDark ? '#2d3347' : '#d0d5e8'; ctx.lineWidth = 1;
  _fibRRect(ctx, x, y, w, h, 6); ctx.stroke();

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('FIBONACCI → φ = ' + PHI.toFixed(4), x + 8, y + 14);

  var rowH = Math.min(28, (h - 40) / FIB_MUSIC.length);
  var barMaxW = w - 80;

  FIB_MUSIC.forEach(function(fib, i) {
    var ry = y + 28 + i * rowH;
    var fibRatio = fib.n / fib.d;
    var distToGolden = Math.abs(fibRatio - PHI);
    var barLen = Math.max(4, barMaxW * (1 - Math.min(distToGolden * 3, 1)));

    var isCurrent = (fib.n === N && fib.d === D);
    var rowAlpha = 0.5 + (i / FIB_MUSIC.length) * 0.5;

    // Row highlight
    if (isCurrent) {
      ctx.fillStyle = isDark ? 'rgba(108,142,255,0.18)' : 'rgba(61,92,255,0.12)';
      ctx.fillRect(x + 4, ry - 2, w - 8, rowH - 2);
    }

    // Ratio value
    ctx.fillStyle = isCurrent
      ? '#6c8eff'
      : (isDark ? 'rgba(255,255,255,' + rowAlpha + ')' : 'rgba(0,0,0,' + rowAlpha + ')');
    ctx.font = (isCurrent ? 'bold ' : '') + '9px monospace';
    ctx.fillText(fib.n + ':' + fib.d, x + 8, ry + rowH * 0.55);

    // Decimal value
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
    ctx.font = '8px monospace';
    ctx.fillText('=' + fibRatio.toFixed(4), x + 38, ry + rowH * 0.55);

    // Convergence bar (how close to φ)
    ctx.fillStyle = isDark ? '#1e2235' : '#e8eaf8';
    ctx.fillRect(x + 8, ry + rowH * 0.72, barMaxW, 3);
    // Color: green = close to φ, red = far
    var pct = 1 - Math.min(distToGolden / 0.7, 1);
    var barColor = _lerpColor('#ef4444', '#34d399', pct);
    ctx.fillStyle = barColor;
    ctx.fillRect(x + 8, ry + rowH * 0.72, barLen, 3);
  });

  // Current interval comparison
  var botY = y + h - 38;
  ctx.strokeStyle = isDark ? '#2d3347' : '#d0d5e8'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(x + 8, botY - 4); ctx.lineTo(x + w - 8, botY - 4); ctx.stroke();

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('Your interval:', x + 8, botY + 8);
  ctx.fillStyle = _fibColor('var(--c-fifth)');
  ctx.font = 'bold 11px monospace';
  ctx.fillText(N + ':' + D + ' = ' + curRatio.toFixed(4), x + 8, botY + 22);
  var dist = Math.abs(curRatio - PHI);
  var pctOff = (dist / PHI * 100).toFixed(1);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  ctx.font = '9px monospace';
  ctx.fillText(dist < 0.001 ? '= φ exactly!' : (pctOff + '% from φ'), x + 8, botY + 34);
}

function _drawMusicalSpiral(ctx, cx, cy, R, interval, allIntervals, isDark, phase) {
  var color = _fibColor(interval.color);

  // Draw the true logarithmic golden spiral
  // r = a * e^(b*θ),  where b = ln(φ)/(π/2) so it grows by φ per quarter turn
  var b = Math.log(PHI) / (Math.PI / 2);
  var a = R * 0.08;

  // Spiral from inner to outer
  ctx.beginPath();
  var thetaMax = 4 * Math.PI; // 2 full turns
  for (var t = 0; t <= thetaMax; t += 0.05) {
    var r2 = a * Math.exp(b * (t + phase));
    var sx = cx + r2 * Math.cos(t - Math.PI / 2);
    var sy = cy + r2 * Math.sin(t - Math.PI / 2);
    if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.strokeStyle = isDark ? 'rgba(108,142,255,0.5)' : 'rgba(61,92,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = isDark ? '#6c8eff' : '#3d5cff';
  ctx.shadowBlur = isDark ? 6 : 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Mark each interval on the spiral
  // Each interval's cents maps to an angle: θ = (cents/1200) * 2π (one octave = one revolution)
  // Radius = a * e^(b * θ)
  allIntervals.forEach(function(iv) {
    var theta = (iv.cents / 1200) * 2 * Math.PI;
    var r2 = a * Math.exp(b * theta);
    var sx = cx + r2 * Math.cos(theta - Math.PI/2);
    var sy = cy + r2 * Math.sin(theta - Math.PI/2);
    var isSel = (iv === interval);
    var ivColor = _fibColor(iv.color);

    ctx.beginPath();
    ctx.arc(sx, sy, isSel ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = ivColor;
    if (isSel) {
      ctx.shadowColor = ivColor; ctx.shadowBlur = 10;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    if (isSel) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.stroke();
      // Label
      var labelR = r2 + 14;
      var lx = cx + labelR * Math.cos(theta - Math.PI/2);
      var ly = cy + labelR * Math.sin(theta - Math.PI/2);
      ctx.fillStyle = ivColor;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(iv.name, lx, ly);
      ctx.fillText(iv.ratio[0]+':'+iv.ratio[1], lx, ly + 11);
      ctx.textAlign = 'left';
    }
  });

  // Mark the golden frequency (833 cents, φ from tonic)
  var phiTheta = (PHI_CENTS / 1200) * 2 * Math.PI;
  var phiR = a * Math.exp(b * phiTheta);
  var phiX = cx + phiR * Math.cos(phiTheta - Math.PI/2);
  var phiY = cy + phiR * Math.sin(phiTheta - Math.PI/2);
  ctx.beginPath(); ctx.arc(phiX, phiY, 5, 0, Math.PI*2);
  ctx.fillStyle = isDark ? '#34d399' : '#059669';
  ctx.shadowColor = '#34d399'; ctx.shadowBlur = isDark ? 10 : 3;
  ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = isDark ? '#34d399' : '#059669';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('φ', phiX, phiY - 8);
  ctx.fillText('833¢', phiX, phiY + 17);
  ctx.textAlign = 'left';

  // Center dot (tonic)
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  ctx.fill();
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('1:1', cx, cy + 14);
  ctx.textAlign = 'left';

  // Title labels
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
  ctx.font = '8px system-ui';
  ctx.fillText('← each revolution = 1 octave (2:1)', cx - R, cy + R + 16);
}

function animateGoldenMusic(canvas, interval, allIntervals) {
  if (goldenAnimFrame) {
    cancelAnimationFrame(goldenAnimFrame);
    goldenAnimFrame = null;
    goldenAnimPhase = 0;
    drawGoldenMusic(canvas, interval, allIntervals);
    return;
  }
  function tick() {
    var W = canvas.width, H = canvas.height;
    var ctx = canvas.getContext('2d');
    var isDark = document.body.dataset.theme !== 'light';
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0d0f14' : '#f8f9ff'; ctx.fillRect(0, 0, W, H);
    var panelW = Math.min(W * 0.42, 190);
    _drawFibTable(ctx, 12, 12, panelW, H - 24, interval.ratio[0]/interval.ratio[1], interval.ratio[0], interval.ratio[1], isDark);
    var spiralX = panelW + 20 + (W - panelW - 20) / 2;
    var spiralY = H / 2 + 8;
    var spiralR = Math.min((W - panelW - 24) * 0.42, H * 0.38);
    goldenAnimPhase += 0.012;
    _drawMusicalSpiral(ctx, spiralX, spiralY, spiralR, interval, allIntervals, isDark, goldenAnimPhase);
    goldenAnimFrame = requestAnimationFrame(tick);
  }
  goldenAnimFrame = requestAnimationFrame(tick);
}

// ─────────────────────────────────────────────────────────────
//  Architectural Golden Ratio
// ─────────────────────────────────────────────────────────────
// Fibonacci rectangles with architectural labels
var ARCH_FIBONACCI_ROOMS = [
  { fib: [1,1], label: 'Column base',   sublabel: '1×1 module',          note: 'The atomic unit. All else derives from this square.' },
  { fib: [2,1], label: 'Capital',       sublabel: '2×1 double module',   note: 'Column capital spans two modules (Doric rule).' },
  { fib: [3,2], label: 'Window',        sublabel: '3×2 = 1.5 ratio',     note: 'Perfect Fifth window. Palladio\'s preferred window.' },
  { fib: [5,3], label: 'Bay / Cell',    sublabel: '5×3 = 1.667 ratio',   note: 'Single room bay. Close to φ. Used in monastery cells.' },
  { fib: [8,5], label: 'Living room',   sublabel: '8×5 = 1.600 ≈ φ',     note: 'The golden room. Most comfortable proportioned room.' },
  { fib: [13,8],label: 'Facade',        sublabel: '13×8 = 1.625 ≈ φ',    note: 'A classical facade in Fibonacci proportion.' },
  { fib: [21,13],label:'Villa plan',    sublabel: '21×13 ≈ φ=1.615',     note: 'A Palladian villa plan approaches golden perfection.' },
];

function drawGoldenArchitecture(canvas, interval, mode) {
  if (!canvas) return;
  var W = canvas.width, H = canvas.height;
  if (!W || !H) return;
  var ctx = canvas.getContext('2d');
  var isDark = document.body.dataset.theme !== 'light';

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = isDark ? '#0d0f14' : '#f8f9ff';
  ctx.fillRect(0, 0, W, H);

  if (mode === 'modulor') {
    _drawModulor(ctx, W, H, interval, isDark);
  } else if (mode === 'facade') {
    _drawGoldenFacade(ctx, W, H, interval, isDark);
  } else {
    _drawArchitecturalFloorPlan(ctx, W, H, interval, isDark);
  }
}

// ── Architectural Floor Plan ──────────────────────────────────
//
//  A Fibonacci-proportioned villa floor plan — 21×13 module grid.
//  Each room's dimensions come from Fibonacci ratios.
//  The selected interval highlights rooms with matching proportions.
//
//  Room layout (21×13 units):
//    Row 1 (y=0..8, h=8):
//      Salon   0..13, 0..8   →  13:8  ≈ φ
//      Master 13..21, 0..5   →   8:5  ≈ φ
//      Bath   13..16, 5..8   →   1:1  square
//      Study  16..21, 5..8   →   5:3  major sixth
//    Row 2 (y=8..13, h=5):
//      Kitchen  0..5, 8..13  →   1:1  square
//      Dining   5..13, 8..13 →   8:5  ≈ φ
//      Entry   13..18, 8..13 →   1:1  square
//      Bed 2   18..21, 8..11 →   1:1  square
//      WC      18..21, 11..13→   3:2  perfect fifth
// ─────────────────────────────────────────────────────────────
var _FP_ROOMS = [
  { name:'Salon',   x:0,  y:0,  w:13, h:8, ratioN:13, ratioD:8,  category:'living'  },
  { name:'Master',  x:13, y:0,  w:8,  h:5, ratioN:8,  ratioD:5,  category:'sleeping'},
  { name:'Bath',    x:13, y:5,  w:3,  h:3, ratioN:1,  ratioD:1,  category:'service' },
  { name:'Study',   x:16, y:5,  w:5,  h:3, ratioN:5,  ratioD:3,  category:'work'    },
  { name:'Kitchen', x:0,  y:8,  w:5,  h:5, ratioN:1,  ratioD:1,  category:'service' },
  { name:'Dining',  x:5,  y:8,  w:8,  h:5, ratioN:8,  ratioD:5,  category:'living'  },
  { name:'Entry',   x:13, y:8,  w:5,  h:5, ratioN:1,  ratioD:1,  category:'circ'    },
  { name:'Bed 2',   x:18, y:8,  w:3,  h:3, ratioN:1,  ratioD:1,  category:'sleeping'},
  { name:'WC',      x:18, y:11, w:3,  h:2, ratioN:3,  ratioD:2,  category:'service' },
];

// Doors: [roomA, roomB, wall-axis, position-along-wall, swing-direction]
// wall-axis: 'h' = horizontal (door in y=const wall), 'v' = vertical (door in x=const wall)
var _FP_DOORS = [
  { axis:'h', wallPos:8,  along:9.5, width:1.8, side:1  },  // Salon→Dining (y=8 wall)
  { axis:'h', wallPos:8,  along:2.0, width:1.5, side:1  },  // Salon→Kitchen (y=8 wall)
  { axis:'v', wallPos:13, along:10,  width:1.5, side:1  },  // Dining→Entry (x=13 wall)
  { axis:'h', wallPos:5,  along:14.5,width:1.4, side:-1 },  // Master→Bath (y=5 wall)
  { axis:'h', wallPos:13, along:15.5,width:1.5, side:-1 },  // Entry exterior door
  { axis:'v', wallPos:18, along:9.5, width:1.2, side:1  },  // Entry→Bed2 (x=18 wall)
];

// Windows: [exterior-wall, start-along, end-along]
// Exterior walls: 'north' y=0, 'south' y=13, 'west' x=0, 'east' x=21
var _FP_WINDOWS = [
  { wall:'north', from:2,   to:10  },  // Salon north
  { wall:'north', from:14,  to:20  },  // Master north
  { wall:'west',  from:1.5, to:6   },  // Salon west
  { wall:'east',  from:5.5, to:7.5 },  // Study east
  { wall:'east',  from:8.8, to:10.6},  // Bed2 east
  { wall:'south', from:0.8, to:3.8 },  // Kitchen south
  { wall:'south', from:5.5, to:11.5},  // Dining south
];

function _drawArchitecturalFloorPlan(ctx, W, H, interval, isDark) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var curRatio = N / D;
  var color = _fibColor(interval.color);

  var planUnitsW = 21, planUnitsH = 13;
  var infoH = 50;
  var margin = 22;

  // Scale plan to fit canvas
  var availW = W - margin * 2;
  var availH = H - margin * 2 - infoH;
  var scale  = Math.min(availW / planUnitsW, availH / planUnitsH);
  var planW  = planUnitsW * scale;
  var planH  = planUnitsH * scale;
  var ox     = margin + (availW - planW) / 2;  // origin x
  var oy     = margin + (availH - planH) / 2;  // origin y

  // Coordinate helpers
  function px(u) { return ox + u * scale; }
  function py(v) { return oy + v * scale; }
  function ps(u) { return u * scale; }

  // Wall thicknesses
  var extWT = Math.max(4, scale * 0.35);   // exterior wall
  var intWT = Math.max(2, scale * 0.15);   // interior partition

  // ── Background ──────────────────────────────────────────────
  ctx.fillStyle = isDark ? '#0d0f14' : '#f8f9ff';
  ctx.fillRect(0, 0, W, H);

  // Plan paper background
  ctx.fillStyle = isDark ? '#12151e' : '#fefcf8';
  ctx.fillRect(ox - extWT, oy - extWT, planW + extWT*2, planH + extWT*2);

  // ── Room fills ───────────────────────────────────────────────
  var CAT_COLORS = {
    living:   { dark: 'rgba(245,158,11,0.08)', light: 'rgba(180,120,0,0.06)'  },
    sleeping: { dark: 'rgba(108,142,255,0.10)',light: 'rgba(61,92,255,0.07)'  },
    service:  { dark: 'rgba(52,211,153,0.08)', light: 'rgba(5,150,105,0.06)'  },
    work:     { dark: 'rgba(167,139,250,0.10)',light: 'rgba(109,40,217,0.06)' },
    circ:     { dark: 'rgba(255,255,255,0.04)',light: 'rgba(0,0,0,0.03)'     },
  };

  _FP_ROOMS.forEach(function(room) {
    var rx = px(room.x), ry2 = py(room.y), rw = ps(room.w), rh = ps(room.h);
    var rr = room.ratioN / room.ratioD;
    var isMatch = Math.abs(rr - curRatio) < 0.12;
    var isPhi   = Math.abs(rr - PHI) < 0.04;

    // Fill
    var baseColor = (CAT_COLORS[room.category] || CAT_COLORS.circ)[isDark ? 'dark' : 'light'];
    ctx.fillStyle = isMatch
      ? (isDark ? color + '28' : color + '18')
      : baseColor;
    ctx.fillRect(rx, ry2, rw, rh);

    // Match highlight border
    if (isMatch) {
      ctx.strokeStyle = color + 'aa'; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(rx + 1, ry2 + 1, rw - 2, rh - 2);
      ctx.setLineDash([]);
    }
  });

  // ── Interior partitions ──────────────────────────────────────
  var partitions = [
    // Horizontal (y-constant walls inside plan)
    { axis:'h', pos:8, from:0, to:21 },   // Row 1 / Row 2 divider
    { axis:'h', pos:5, from:13, to:21 },  // Master / Bath+Study divider
    { axis:'h', pos:11, from:18, to:21 }, // Bed2 / WC divider
    // Vertical (x-constant walls inside plan)
    { axis:'v', pos:13, from:0, to:13 },  // Salon right wall
    { axis:'v', pos:13, from:8, to:13 },  // Entry left wall (row 2)
    { axis:'v', pos:16, from:5, to:8  },  // Bath / Study divider
    { axis:'v', pos:5,  from:8, to:13 },  // Kitchen / Dining divider
    { axis:'v', pos:18, from:8, to:13 },  // Entry / Bed2+WC divider
  ];

  ctx.fillStyle = isDark ? '#3d4460' : '#8090a8';
  partitions.forEach(function(p) {
    if (p.axis === 'h') {
      ctx.fillRect(px(p.from), py(p.pos) - intWT/2, ps(p.to - p.from), intWT);
    } else {
      ctx.fillRect(px(p.pos) - intWT/2, py(p.from), intWT, ps(p.to - p.from));
    }
  });

  // ── Exterior walls (thick, hatched) ─────────────────────────
  var extColor = isDark ? '#4a5070' : '#6070a0';
  ctx.fillStyle = extColor;
  // North wall (top)
  ctx.fillRect(ox - extWT, oy - extWT, planW + extWT*2, extWT);
  // South wall (bottom)
  ctx.fillRect(ox - extWT, oy + planH, planW + extWT*2, extWT);
  // West wall (left)
  ctx.fillRect(ox - extWT, oy, extWT, planH);
  // East wall (right)
  ctx.fillRect(ox + planW, oy, extWT, planH);

  // ── Windows ─────────────────────────────────────────────────
  // Window symbol: break in exterior wall + three parallel lines
  var winWT = extWT * 1.05;
  _FP_WINDOWS.forEach(function(win) {
    var startPos = win.from * scale;
    var endPos   = win.to * scale;
    var winLen   = endPos - startPos;

    ctx.fillStyle = isDark ? '#12151e' : '#fefcf8'; // clear the wall
    if (win.wall === 'north') {
      ctx.fillRect(ox + startPos, oy - winWT, winLen, winWT);
      // Window lines
      ctx.strokeStyle = isDark ? '#6080c0' : '#3060a0'; ctx.lineWidth = 1;
      for (var li = 0; li < 3; li++) {
        var lx = ox + startPos + winLen * (li + 0.5) / 3;
        ctx.beginPath(); ctx.moveTo(lx, oy - winWT); ctx.lineTo(lx, oy); ctx.stroke();
      }
    } else if (win.wall === 'south') {
      ctx.fillRect(ox + startPos, oy + planH, winLen, winWT);
      ctx.strokeStyle = isDark ? '#6080c0' : '#3060a0'; ctx.lineWidth = 1;
      for (var li2 = 0; li2 < 3; li2++) {
        var lx2 = ox + startPos + winLen * (li2 + 0.5) / 3;
        ctx.beginPath(); ctx.moveTo(lx2, oy + planH); ctx.lineTo(lx2, oy + planH + winWT); ctx.stroke();
      }
    } else if (win.wall === 'west') {
      ctx.fillRect(ox - winWT, oy + startPos, winWT, winLen);
      ctx.strokeStyle = isDark ? '#6080c0' : '#3060a0'; ctx.lineWidth = 1;
      for (var li3 = 0; li3 < 3; li3++) {
        var ly3 = oy + startPos + winLen * (li3 + 0.5) / 3;
        ctx.beginPath(); ctx.moveTo(ox - winWT, ly3); ctx.lineTo(ox, ly3); ctx.stroke();
      }
    } else if (win.wall === 'east') {
      ctx.fillRect(ox + planW, oy + startPos, winWT, winLen);
      ctx.strokeStyle = isDark ? '#6080c0' : '#3060a0'; ctx.lineWidth = 1;
      for (var li4 = 0; li4 < 3; li4++) {
        var ly4 = oy + startPos + winLen * (li4 + 0.5) / 3;
        ctx.beginPath(); ctx.moveTo(ox + planW, ly4); ctx.lineTo(ox + planW + winWT, ly4); ctx.stroke();
      }
    }
  });

  // ── Doors ────────────────────────────────────────────────────
  // Door symbol: gap in wall + arc (quarter-circle showing swing)
  _FP_DOORS.forEach(function(door) {
    var gapW   = door.width * scale;
    var gapHalf = gapW / 2;
    var thick  = (door.axis === 'h') ? intWT : intWT;

    if (door.axis === 'h') {
      var wx = px(door.along), wy = py(door.wallPos);
      // Clear gap
      ctx.fillStyle = isDark ? '#12151e' : '#fefcf8';
      ctx.fillRect(wx - gapHalf, wy - thick, gapW, thick * 2);
      // Door leaf line
      ctx.strokeStyle = isDark ? '#6c8eff' : '#3050c0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(wx - gapHalf, wy); ctx.lineTo(wx + gapHalf, wy); ctx.stroke();
      // Swing arc
      var arcCx = door.side > 0 ? wx - gapHalf : wx + gapHalf;
      var arcStart = door.side > 0 ? 0 : Math.PI;
      var arcEnd   = door.side > 0 ? Math.PI/2 : Math.PI * 1.5;
      ctx.strokeStyle = isDark ? 'rgba(108,142,255,0.4)' : 'rgba(48,80,192,0.35)';
      ctx.lineWidth = 0.7; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.arc(arcCx, wy, gapW, arcStart, arcEnd); ctx.stroke();
      ctx.setLineDash([]);
    } else {
      var vx = px(door.wallPos), vy = py(door.along);
      // Clear gap
      ctx.fillStyle = isDark ? '#12151e' : '#fefcf8';
      ctx.fillRect(vx - thick, vy - gapHalf, thick * 2, gapW);
      // Door leaf line
      ctx.strokeStyle = isDark ? '#6c8eff' : '#3050c0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(vx, vy - gapHalf); ctx.lineTo(vx, vy + gapHalf); ctx.stroke();
      // Swing arc
      var arcCy2 = door.side > 0 ? vy - gapHalf : vy + gapHalf;
      var aStart2 = door.side > 0 ? Math.PI/2 : -Math.PI/2;
      var aEnd2   = door.side > 0 ? Math.PI   : 0;
      ctx.strokeStyle = isDark ? 'rgba(108,142,255,0.4)' : 'rgba(48,80,192,0.35)';
      ctx.lineWidth = 0.7; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.arc(vx, arcCy2, gapW, aStart2, aEnd2); ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // ── Room labels ──────────────────────────────────────────────
  _FP_ROOMS.forEach(function(room) {
    var rx = px(room.x) + ps(room.w)/2;
    var ry2 = py(room.y) + ps(room.h)/2;
    var rr = room.ratioN / room.ratioD;
    var isMatch = Math.abs(rr - curRatio) < 0.12;
    var isPhi   = Math.abs(rr - PHI) < 0.04;
    var roomW = ps(room.w), roomH = ps(room.h);
    if (roomW < 24 || roomH < 18) return; // too small to label

    ctx.textAlign = 'center';
    ctx.fillStyle = isMatch ? color : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,20,0.6)');
    ctx.font = (isMatch ? 'bold ' : '') + Math.min(10, roomW * 0.14) + 'px system-ui';
    ctx.fillText(room.name, rx, ry2 - 2);

    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,20,0.3)';
    ctx.font = Math.min(8, roomW * 0.12) + 'px monospace';
    ctx.fillText(room.ratioN + ':' + room.ratioD, rx, ry2 + 9);

    if (isPhi) {
      ctx.fillStyle = isDark ? '#34d399' : '#059669';
      ctx.font = '7px monospace';
      ctx.fillText('≈ φ', rx, ry2 + 19);
    }
    ctx.textAlign = 'left';
  });

  // ── Dimension annotations ────────────────────────────────────
  var dimColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  ctx.strokeStyle = dimColor; ctx.lineWidth = 0.6; ctx.setLineDash([2, 3]);
  // Overall width
  ctx.beginPath();
  ctx.moveTo(ox, oy - extWT - 8); ctx.lineTo(ox + planW, oy - extWT - 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox, oy - extWT - 11); ctx.lineTo(ox, oy - extWT - 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox + planW, oy - extWT - 11); ctx.lineTo(ox + planW, oy - extWT - 5); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = dimColor; ctx.font = '8px monospace'; ctx.textAlign = 'center';
  ctx.fillText('21 units (13:8 ≈ φ)', ox + planW/2, oy - extWT - 12);
  // Overall height
  ctx.strokeStyle = dimColor; ctx.lineWidth = 0.6; ctx.setLineDash([2, 3]);
  ctx.beginPath(); ctx.moveTo(ox - extWT - 8, oy); ctx.lineTo(ox - extWT - 8, oy + planH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox - extWT - 11, oy); ctx.lineTo(ox - extWT - 5, oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox - extWT - 11, oy + planH); ctx.lineTo(ox - extWT - 5, oy + planH); ctx.stroke();
  ctx.setLineDash([]);
  ctx.save(); ctx.translate(ox - extWT - 13, oy + planH/2); ctx.rotate(-Math.PI/2);
  ctx.textAlign = 'center';
  ctx.fillText('13 units', 0, 0);
  ctx.restore();
  ctx.textAlign = 'left';

  // North arrow
  var naX = ox + planW + extWT + 10, naY = oy + 22;
  ctx.strokeStyle = dimColor; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(naX, naY); ctx.lineTo(naX, naY - 14); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(naX, naY - 14); ctx.lineTo(naX - 4, naY - 7); ctx.lineTo(naX, naY - 10); ctx.closePath();
  ctx.fillStyle = dimColor; ctx.fill();
  ctx.fillStyle = dimColor; ctx.font = '8px monospace'; ctx.textAlign = 'center';
  ctx.fillText('N', naX, naY + 10);
  ctx.textAlign = 'left';

  // ── Info bar ─────────────────────────────────────────────────
  var infoY = oy + planH + extWT + 14;
  var bestRoom = _FP_ROOMS.reduce(function(a, b) {
    return Math.abs(b.ratioN/b.ratioD - curRatio) < Math.abs(a.ratioN/a.ratioD - curRatio) ? b : a;
  });

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  ctx.font = '9px system-ui';
  ctx.fillText(interval.name + ' (' + N + ':' + D + ') — closest room: ' + bestRoom.name + ' (' + bestRoom.ratioN + ':' + bestRoom.ratioD + ')', ox, infoY);

  ctx.fillStyle = isDark ? '#34d399' : '#059669';
  ctx.font = '8px monospace';
  ctx.fillText('φ = ' + PHI.toFixed(4) + '   |   ' + N + ':' + D + ' = ' + curRatio.toFixed(4) + '   |   Δφ = ' + Math.abs(curRatio - PHI).toFixed(4), ox, infoY + 13);
}

function _drawCurrentIntervalOverlay(ctx, rx, ry, rW, rH, N, D, color, isDark) {
  // Draw a rectangle with the current interval's ratio at scale, overlaid on the grid
  var curRatio = N / D;
  var overlayH = rH * 0.3;
  var overlayW = overlayH * curRatio;
  if (overlayW > rW) { overlayW = rW; overlayH = overlayW / curRatio; }
  var ox = rx + rW - overlayW - 4, oy = ry + rH - overlayH - 4;

  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(ox, oy, overlayW, overlayH);
  ctx.setLineDash([]);
  ctx.fillStyle = color + '22';
  ctx.fillRect(ox, oy, overlayW, overlayH);
  ctx.fillStyle = color;
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(N + ':' + D, ox + overlayW/2, oy + overlayH/2 + 3);
  ctx.textAlign = 'left';

  // φ comparison line
  var phiW = overlayH * PHI;
  if (phiW <= rW) {
    ctx.strokeStyle = isDark ? '#34d399' : '#059669';
    ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(rx + rW - phiW - 4, oy); ctx.lineTo(rx + rW - phiW - 4, oy + overlayH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = isDark ? '#34d399' : '#059669';
    ctx.font = '8px monospace';
    ctx.fillText('φ', rx + rW - phiW - 2, oy - 2);
  }
}

function _drawArchRoomsInfo(ctx, x, y, w, interval, curRatio, isDark, color) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var dist = Math.abs(curRatio - PHI);
  // Find the closest Fibonacci room
  var bestRoom = ARCH_FIBONACCI_ROOMS.reduce(function(a, b) {
    return Math.abs(b.fib[0]/b.fib[1] - curRatio) < Math.abs(a.fib[0]/a.fib[1] - curRatio) ? b : a;
  });

  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  ctx.font = '9px system-ui';
  ctx.fillText(interval.name + ' (' + N + ':' + D + ')', x, y + 10);
  ctx.fillStyle = color;
  ctx.font = 'bold 9px monospace';
  ctx.fillText('Closest: ' + bestRoom.label + ' (' + bestRoom.fib[0] + ':' + bestRoom.fib[1] + ')', x, y + 22);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  ctx.font = '8px monospace';
  ctx.fillText(bestRoom.note, x, y + 34);
  ctx.fillStyle = isDark ? '#34d399' : '#059669';
  ctx.fillText('φ = ' + PHI.toFixed(4) + '  |  ' + (dist < 0.001 ? 'exact match!' : 'distance: ' + dist.toFixed(4)), x, y + 46);
}

// ── Le Corbusier Modulor ─────────────────────────────────────
function _drawModulor(ctx, W, H, interval, isDark) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var curRatio = N / D;
  var color = _fibColor(interval.color);

  // The Modulor: a series of measurements based on human height (183cm) and φ
  // Blue series: 226, 140, 86, 53, 33, 20, 13… (divide by φ each step)
  // Red series: 183, 113, 70, 43, 27, 16, 10… (offset by the navel height 113cm)
  var BASE_BLUE = 183 * PHI;   // 226 cm (man with raised arm)
  var BASE_RED = 183;           // 183 cm (man height)

  var blueSteps = 8, redSteps = 8;
  var blueVals = [], redVals = [];
  var v = BASE_BLUE;
  for (var i = 0; i < blueSteps; i++) { blueVals.push(v); v /= PHI; }
  v = BASE_RED;
  for (var i = 0; i < redSteps; i++) { redVals.push(v); v /= PHI; }

  var maxVal = blueVals[0];
  var barH = (H - 80) / Math.max(blueSteps, redSteps);
  var barAreaW = (W - 80) / 2;

  // Title
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
  ctx.font = 'bold 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Le Corbusier Modulor', W/2, 18);
  ctx.font = '9px monospace';
  ctx.fillText('Based on human height (183cm) × φ', W/2, 30);
  ctx.textAlign = 'left';

  // Draw blue series (left)
  var bx = 30, barW = barAreaW - 20;
  ctx.fillStyle = isDark ? 'rgba(108,142,255,0.6)' : 'rgba(61,92,255,0.5)';
  ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('Blue series ÷ φ', bx + barW/2, 44);
  ctx.textAlign = 'left';

  blueVals.forEach(function(val, i) {
    var w2 = (val / maxVal) * barW;
    var y2 = 52 + i * barH;
    var isCurRatio = Math.abs(val / (blueVals[i+1] || val/PHI) - curRatio) < 0.1;
    ctx.fillStyle = isCurRatio ? color : (isDark ? 'rgba(108,142,255,0.45)' : 'rgba(61,92,255,0.35)');
    ctx.fillRect(bx, y2, w2, barH - 3);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
    ctx.font = '9px monospace';
    ctx.fillText(Math.round(val) + 'cm', bx + w2 + 3, y2 + barH*0.55);
  });

  // Draw red series (right)
  var rx2 = W/2 + 10;
  ctx.fillStyle = isDark ? 'rgba(251,146,60,0.6)' : 'rgba(234,88,12,0.5)';
  ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
  ctx.fillText('Red series ÷ φ', rx2 + barW/2, 44);
  ctx.textAlign = 'left';

  redVals.forEach(function(val, i) {
    var w2 = (val / maxVal) * barW;
    var y2 = 52 + i * barH;
    var isCurRatio = Math.abs(val / (redVals[i+1] || val/PHI) - curRatio) < 0.1;
    ctx.fillStyle = isCurRatio ? color : (isDark ? 'rgba(251,146,60,0.4)' : 'rgba(234,88,12,0.3)');
    ctx.fillRect(rx2, y2, w2, barH - 3);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
    ctx.font = '9px monospace';
    ctx.fillText(Math.round(val) + 'cm', rx2 + w2 + 3, y2 + barH*0.55);
  });

  // φ label and current interval comparison
  var botY = H - 28;
  ctx.fillStyle = isDark ? '#34d399' : '#059669';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('φ = ' + PHI.toFixed(4) + '   Your interval: ' + interval.ratio[0] + ':' + interval.ratio[1] + ' = ' + curRatio.toFixed(4), 12, botY);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
  ctx.font = '9px monospace';
  ctx.fillText('Distance from φ: ' + Math.abs(curRatio - PHI).toFixed(4), 12, botY + 14);
}

// ── Golden Facade ─────────────────────────────────────────────
function _drawGoldenFacade(ctx, W, H, interval, isDark) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var curRatio = N / D;
  var color = _fibColor(interval.color);

  // Draw a facade where ALL proportional divisions use φ
  // Show the current interval's ratio alongside for comparison
  var maxW = W * 0.78, maxH = H * 0.6;
  var fW = maxW, fH = maxW / PHI;
  if (fH > maxH) { fH = maxH; fW = fH * PHI; }
  var fx = (W - fW) / 2, fy = H * 0.1;

  // Sky
  var sky = ctx.createLinearGradient(0,0,0,H*0.7);
  if (isDark) { sky.addColorStop(0,'#080c18'); sky.addColorStop(1,'#141828'); }
  else { sky.addColorStop(0,'#c8deff'); sky.addColorStop(1,'#e8f0ff'); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // Golden facade body
  ctx.fillStyle = isDark ? '#22263a' : '#f4f0e4';
  ctx.strokeStyle = isDark ? '#3d4460' : '#c8c0a8'; ctx.lineWidth = 1.5;
  ctx.fillRect(fx, fy, fW, fH); ctx.strokeRect(fx, fy, fW, fH);

  // φ square (left portion = fH × fH)
  var sqW = fH;
  ctx.fillStyle = isDark ? 'rgba(245,158,11,0.1)' : 'rgba(180,120,0,0.08)';
  ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
  ctx.fillRect(fx, fy, sqW, fH); ctx.strokeRect(fx, fy, sqW, fH); ctx.setLineDash([]);
  ctx.fillStyle = isDark ? '#f59e0b' : '#d97706'; ctx.font = '9px monospace';
  ctx.fillText('D×D square', fx + 4, fy + 12);

  // Remainder rectangle (right portion = (fW - fH) × fH = fH/φ × fH)
  ctx.fillStyle = isDark ? 'rgba(52,211,153,0.08)' : 'rgba(5,150,105,0.06)';
  ctx.strokeStyle = isDark ? '#34d399' : '#059669'; ctx.setLineDash([3,3]);
  ctx.fillRect(fx + sqW, fy, fW - sqW, fH); ctx.strokeRect(fx + sqW, fy, fW - sqW, fH); ctx.setLineDash([]);
  ctx.fillStyle = isDark ? '#34d399' : '#059669'; ctx.font = '9px monospace';
  ctx.fillText('1/φ rect', fx + sqW + 4, fy + 12);

  // Windows (golden ratio proportioned)
  var numBays = 5;
  var bayW2 = fW / numBays;
  var winW2 = bayW2 * 0.5;
  var winH2 = winW2 * PHI; // golden windows
  var winY2 = fy + fH * 0.3;
  ctx.strokeStyle = isDark ? '#3d4460' : '#b0a898'; ctx.lineWidth = 1;
  for (var b = 0; b < numBays; b++) {
    var wx2 = fx + b * bayW2 + (bayW2 - winW2) / 2;
    ctx.fillStyle = isDark ? 'rgba(108,142,255,0.12)' : 'rgba(180,200,255,0.2)';
    ctx.fillRect(wx2, winY2, winW2, winH2);
    ctx.strokeRect(wx2, winY2, winW2, winH2);
    ctx.fillStyle = isDark ? '#f59e0b' : '#d97706'; ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('φ', wx2 + winW2/2, winY2 - 2);
    ctx.textAlign = 'left';
  }

  // Current interval's rectangle outline (for comparison)
  var curW2 = fH * curRatio, curH2 = fH;
  if (curW2 > fW) { curW2 = fW; }
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
  ctx.strokeRect(fx, fy + fH + 12, curW2, curH2 * 0.25);
  ctx.setLineDash([]);
  ctx.fillStyle = color; ctx.font = 'bold 9px monospace';
  ctx.fillText(N + ':' + D + ' = ' + curRatio.toFixed(3), fx, fy + fH + 12 + curH2*0.25 + 12);
  ctx.fillStyle = isDark ? '#f59e0b' : '#d97706'; ctx.font = '9px monospace';
  ctx.fillText('φ = ' + PHI.toFixed(3), fx + curW2 + 8, fy + fH + 12 + curH2*0.13);

  // Labels
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)';
  ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('True Golden Facade (W:H = φ:1 = ' + PHI.toFixed(3) + ')', W/2, H - 8);
  ctx.textAlign = 'left';
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function _fibRRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

function _fibColor(cssVar) {
  var map = {
    'var(--c-unison)':'#6c8eff','var(--c-octave)':'#34d399','var(--c-fifth)':'#f59e0b',
    'var(--c-fourth)':'#a78bfa','var(--c-third)':'#f472b6','var(--c-minor)':'#fb923c',
    'var(--c-tritone)':'#ef4444','var(--accent-2)':'#a78bfa',
  };
  return map[cssVar] || '#6c8eff';
}

function _lerpColor(a, b, t) {
  var ah = parseInt(a.slice(1), 16);
  var bh = parseInt(b.slice(1), 16);
  var ar = ah>>16, ag = (ah>>8)&0xff, ab2 = ah&0xff;
  var br = bh>>16, bg = (bh>>8)&0xff, bb2 = bh&0xff;
  var r = Math.round(ar + (br-ar)*t);
  var g2 = Math.round(ag + (bg-ag)*t);
  var b2 = Math.round(ab2 + (bb2-ab2)*t);
  return '#' + ((r<<16)|(g2<<8)|b2).toString(16).padStart(6,'0');
}

// Legacy compatibility (still called from app.js for the animate button)
function animateFibonacci(canvas, interval) {
  animateGoldenMusic(canvas, interval, typeof INTERVALS !== 'undefined' ? INTERVALS : []);
}
