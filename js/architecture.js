// ============================================================
//  Architecture Visualizer — Proportional Module System
//
//  DESIGN PRINCIPLE: the interval ratio N:D directly governs
//  every dimension in the building:
//    • Facade W:H = N:D
//    • Window W:H = N:D   (self-similar)
//    • Bay width = M × N/D  (module × ratio)
//    • Column H = M × order_mult  (classical canon)
//    • Entablature = colH / (N+D)  (Vitruvian)
//    • Regulating lines prove the proportional derivation
// ============================================================

function drawArchitecture(canvas, interval, facadeStyle, domain, archState) {
  if (!canvas) return;
  var W = canvas.width, H = canvas.height;
  if (!W || !H) return;
  var ctx = canvas.getContext('2d');
  var isDark = document.body.dataset.theme !== 'light';

  ctx.clearRect(0, 0, W, H);

  if (domain === 'architecture' || domain === 'design') {
    _drawProportionalFacade(ctx, W, H, interval, facadeStyle, isDark, archState);
  } else if (domain === 'nature') {
    _drawNature(ctx, W, H, interval.ratio[0] / interval.ratio[1], interval, isDark);
  } else if (domain === 'typography') {
    _drawTypography(ctx, W, H, interval.ratio[0] / interval.ratio[1], interval, isDark);
  }
}

// ─────────────────────────────────────────────────────────────
//  PROPORTIONAL FACADE — the core engine
// ─────────────────────────────────────────────────────────────
function _drawProportionalFacade(ctx, W, H, interval, style, isDark, as) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var r = N / D;
  var color = _archColor(interval.color);

  // ── Dispatch to modernist renderer ─────────────────────────
  if (style === 'modernist') {
    _drawModernistFacade(ctx, W, H, interval, isDark, as);
    return;
  }

  // ── Derive parameters from new system (scale / treatment / analysis)
  //    Also supports old format (bays / floors / order / showLines / showGrid)
  var _SP = { intimate:{bays:3,floors:1}, standard:{bays:5,floors:2}, grand:{bays:7,floors:3} };
  var _classicTreat = { doric:1, ionic:1, corinthian:1, none:1 };
  var bays      = as.scale ? (_SP[as.scale]||_SP.standard).bays         : (as.bays   || 5);
  var floors    = as.scale ? (_SP[as.scale]||_SP.standard).floors       : (as.floors || 2);
  var order     = as.scale
                    ? (_classicTreat[as.treatment] ? (as.treatment||'ionic') : 'none')
                    : (as.order || 'ionic');
  var showLines = as.scale ? (as.analysis==='lines'||as.analysis==='full') : (as.showLines!==false);
  var showGrid  = as.scale ? (as.analysis==='grid' ||as.analysis==='full') : !!as.showGrid;

  // ── 1. Building dimensions — facade W:H = N:D ──────────────
  var maxW = W * 0.80, maxH = H * 0.64;
  var bldgW, bldgH;
  if (r >= maxW / maxH) {
    bldgW = maxW;
    bldgH = bldgW / r;
  } else {
    bldgH = maxH;
    bldgW = bldgH * r;
  }
  bldgW = Math.min(bldgW, maxW);
  bldgH = Math.min(bldgH, maxH);
  var bx = (W - bldgW) / 2;
  var by = H * 0.78 - bldgH;

  // ── 2. Module system ────────────────────────────────────────
  // M = column diameter (1 module)
  // Bay width = M × N/D  →  M = bayWidth × D/N
  var bayW = bldgW / bays;
  var M = bayW * D / N;         // 1 module = column diameter

  // ── 3. Column canon (Vitruvius) ─────────────────────────────
  var orderMult = { none: 0, doric: 6, ionic: 8, corinthian: 10 };
  var colMult = orderMult[order] || 0;
  var colDiam = M;
  var colW = Math.max(5, Math.min(colDiam * 0.85, bayW * 0.18));
  var colH = (colMult > 0) ? Math.min(M * colMult, bldgH * 0.86) : 0;

  // ── 4. Entablature = colH / (N+D)  (Vitruvian sub-division) ─
  var entH = (colH > 0) ? colH / (N + D) : bldgH * 0.08;
  entH = Math.max(10, Math.min(entH, bldgH * 0.15));

  // ── 5. Pediment ─────────────────────────────────────────────
  var hasPediment = (style === 'classical') && (order !== 'none');
  var pedH = hasPediment ? entH * r * 0.55 : 0;

  // ── 6. Floors ───────────────────────────────────────────────
  var bodyH = bldgH - entH - pedH;
  var floorH = bodyH / floors;

  // ── 7. Window dimensions — W:H = N:D ────────────────────────
  var winW = bayW * 0.46;
  var winH = Math.min(winW * r, floorH * 0.58);
  // Upper floors: windows shrink harmonically (D/N per floor above ground)
  var winScale = [1];
  for (var f = 1; f < floors; f++) winScale.push(Math.pow(D / N, f * 0.4));

  // ─────────────────────────────────────────────────────────────
  //  DRAWING
  // ─────────────────────────────────────────────────────────────

  _drawSkyGround(ctx, W, H, isDark);

  // Building shadow
  if (isDark) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(bx + 8, by + 8, bldgW, bldgH);
  }

  // ── Module grid (optional) ───────────────────────────────────
  if (showGrid) {
    _drawModuleGrid(ctx, bx, by, bldgW, bldgH, M, isDark);
  }

  // ── Pediment ─────────────────────────────────────────────────
  if (hasPediment) {
    ctx.beginPath();
    ctx.moveTo(bx - 8, by + pedH);
    ctx.lineTo(bx + bldgW / 2, by);
    ctx.lineTo(bx + bldgW + 8, by + pedH);
    ctx.closePath();
    ctx.fillStyle = isDark ? '#24263a' : '#ede8dc';
    ctx.strokeStyle = isDark ? '#3d4460' : '#c0b898';
    ctx.lineWidth = 1.5;
    ctx.fill(); ctx.stroke();

    // Tympanum accent
    ctx.beginPath();
    ctx.moveTo(bx + bldgW * 0.25, by + pedH);
    ctx.lineTo(bx + bldgW / 2, by + pedH * 0.25);
    ctx.lineTo(bx + bldgW * 0.75, by + pedH);
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ── Entablature ───────────────────────────────────────────────
  var entY = by + pedH;
  ctx.fillStyle = isDark ? '#2d3047' : '#e4dfcf';
  ctx.strokeStyle = isDark ? '#3d4460' : '#c0b898';
  ctx.lineWidth = 1;
  ctx.fillRect(bx, entY, bldgW, entH);
  ctx.strokeRect(bx, entY, bldgW, entH);

  // Triglyphs (Doric) or dentils (Ionic/Corinthian)
  if (order === 'doric') {
    _drawTriglyphs(ctx, bx, entY, bldgW, entH, bays, isDark, color);
  } else if (order === 'ionic' || order === 'corinthian') {
    _drawDentils(ctx, bx, entY, bldgW, entH, isDark, color);
  }

  // ── Main wall ─────────────────────────────────────────────────
  var wallY = entY + entH;
  var wallH = bodyH;

  if (style === 'classical') {
    var wallGrad = ctx.createLinearGradient(bx, 0, bx + bldgW, 0);
    if (isDark) {
      wallGrad.addColorStop(0, '#1e2238'); wallGrad.addColorStop(0.5, '#272d42'); wallGrad.addColorStop(1, '#1e2238');
    } else {
      wallGrad.addColorStop(0, '#f0ede2'); wallGrad.addColorStop(0.5, '#faf8f0'); wallGrad.addColorStop(1, '#f0ede2');
    }
    ctx.fillStyle = wallGrad;
    ctx.strokeStyle = isDark ? '#3d4460' : '#c8c0a8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx, wallY, bldgW, wallH);
    ctx.strokeRect(bx, wallY, bldgW, wallH);
  } else {
    // Gothic: stone texture
    ctx.fillStyle = isDark ? '#1e1c2c' : '#f0ece4';
    ctx.strokeStyle = isDark ? '#3d3560' : '#c8c0b0';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bx, wallY, bldgW, wallH);
    ctx.strokeRect(bx, wallY, bldgW, wallH);
  }

  // ── Columns ───────────────────────────────────────────────────
  if (order !== 'none' && colH > 0) {
    var numCols = bays + 1;
    for (var c = 0; c <= bays; c++) {
      var cx2 = bx + c * bayW;
      var cBase = wallY + wallH;
      _drawColumn(ctx, cx2, cBase, colW, colH, order, isDark);
    }
  }

  // ── Windows ───────────────────────────────────────────────────
  for (var fl = 0; fl < floors; fl++) {
    var fy = wallY + fl * floorH;
    var fWinH = winH * (winScale[fl] || 0.6);
    var fWinW = fWinH / r; // maintain ratio
    var winY = fy + (floorH - fWinH) / 2;

    for (var b = 0; b < bays; b++) {
      var winX = bx + b * bayW + (bayW - fWinW) / 2;
      _drawWindow(ctx, winX, winY, fWinW, fWinH, style, isDark, color, fl === 0 && b === 0, r);
    }

    // Floor line
    if (fl < floors - 1) {
      ctx.strokeStyle = isDark ? '#3d4460' : '#c8c0a8';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(bx, fy + floorH); ctx.lineTo(bx + bldgW, fy + floorH); ctx.stroke();
    }
  }

  // ── Regulating lines ──────────────────────────────────────────
  if (showLines) {
    _drawRegulatingLines(ctx, bx, by, bldgW, bldgH, pedH, entH, N, D, r, color, isDark);
  }

  // ── Proportion annotations ────────────────────────────────────
  _drawAnnotations(ctx, bx, by, bldgW, bldgH, bayW, winW, winH, entH, M, interval, color, isDark);

  // ── Proportion label ──────────────────────────────────────────
  _drawProportionLabel(ctx, W, H, interval, color);
}

// ─────────────────────────────────────────────────────────────
//  MODERNIST FACADE — International Style / Bauhaus / Le Corbusier
//
//  Core proportional principle (same as classical):
//    • Facade W:H = N:D
//    • Module M = bayW × D/N
//    • Floor height derived from M
//    • Ribbon window W:H = N:D (self-similar)
//
//  Treatments:
//    frame    — exposed concrete structural grid, ribbon windows
//    curtain  — full-height glass curtain wall with spandrel panels
//    brise    — frame + projecting horizontal brise-soleil fins
//
//  Pilotis: ground floor open colonnade (frame + brise treatments)
// ─────────────────────────────────────────────────────────────
function _drawModernistFacade(ctx, W, H, interval, isDark, as) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var r = N / D;
  var color = _archColor(interval.color);

  // Derive parameters
  var _SP = { intimate:{bays:3,floors:2}, standard:{bays:5,floors:3}, grand:{bays:7,floors:4} };
  var preset = _SP[as.scale] || _SP.standard;
  var bays    = preset.bays;
  var floors  = preset.floors;
  var treatment = as.treatment || 'curtain'; // frame | curtain | brise
  var showLines = as.analysis === 'lines' || as.analysis === 'full';
  var showGrid  = as.analysis === 'grid'  || as.analysis === 'full';

  // Building dimensions — facade W:H = N:D
  var maxW = W * 0.80, maxH = H * 0.60;
  var bldgW, bldgH;
  if (r >= maxW / maxH) { bldgW = maxW; bldgH = bldgW / r; }
  else { bldgH = maxH; bldgW = bldgH * r; }
  bldgW = Math.min(bldgW, maxW);
  bldgH = Math.min(bldgH, maxH);

  var bx = (W - bldgW) / 2;
  var groundY = H * 0.78;

  // Module system (same principle as classical)
  var bayW = bldgW / bays;
  var M = bayW * D / N;

  // Pilotis: frame and brise lift the building off the ground
  var hasPilotis = (treatment !== 'curtain');
  var pilotiH = hasPilotis ? Math.max(22, bldgH * 0.20) : 0;
  var massH   = bldgH - pilotiH;      // height of enclosed floors
  var massY   = groundY - bldgH;      // top of building
  var pilotiTopY = massY + massH;     // top of piloti zone

  // Floor geometry
  var floorH    = massH / floors;
  var slabH     = Math.max(3, M * 0.10);
  var parapetH  = Math.max(5, M * 0.35);
  var spandrelH = slabH + Math.max(6, floorH * 0.24);
  var glazingH  = floorH - spandrelH;

  // Frame column width
  var frameW = Math.max(6, bayW * 0.12);

  _drawSkyGround(ctx, W, H, isDark);

  // Shadow
  if (isDark) {
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(bx + 7, massY + 7, bldgW, massH);
  }

  if (showGrid) {
    _drawModuleGrid(ctx, bx, massY, bldgW, massH, M, isDark);
  }

  // ── CURTAIN WALL ────────────────────────────────────────────
  if (treatment === 'curtain') {
    // Base fill
    ctx.fillStyle = isDark ? '#181e2e' : '#dce4f0';
    ctx.fillRect(bx, massY, bldgW, massH);

    for (var fl = 0; fl < floors; fl++) {
      var fy = massY + fl * floorH;

      // Spandrel panel (opaque horizontal band)
      ctx.fillStyle = isDark ? '#252d42' : '#c8d0e0';
      ctx.fillRect(bx, fy, bldgW, spandrelH);
      ctx.strokeStyle = isDark ? '#2d3850' : '#b0bcd0'; ctx.lineWidth = 0.8;
      ctx.strokeRect(bx, fy, bldgW, spandrelH);

      // Glazing band
      var glassY = fy + spandrelH;
      var gGrad = ctx.createLinearGradient(bx, 0, bx + bldgW, 0);
      if (isDark) {
        gGrad.addColorStop(0, 'rgba(80,120,200,0.20)');
        gGrad.addColorStop(0.5,'rgba(108,142,255,0.32)');
        gGrad.addColorStop(1, 'rgba(80,120,200,0.20)');
      } else {
        gGrad.addColorStop(0, 'rgba(160,200,255,0.28)');
        gGrad.addColorStop(0.5,'rgba(200,225,255,0.45)');
        gGrad.addColorStop(1, 'rgba(160,200,255,0.28)');
      }
      ctx.fillStyle = gGrad;
      ctx.fillRect(bx, glassY, bldgW, glazingH);

      // Reflection streak in glass
      ctx.strokeStyle = isDark ? 'rgba(200,220,255,0.10)' : 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(bx, glassY + glazingH * 0.38);
      ctx.lineTo(bx + bldgW, glassY + glazingH * 0.38);
      ctx.stroke();

      // Vertical mullions at bay spacings
      ctx.strokeStyle = isDark ? 'rgba(80,100,160,0.55)' : 'rgba(140,160,200,0.65)';
      ctx.lineWidth = 1.5;
      for (var b = 0; b <= bays; b++) {
        var mx = bx + b * bayW;
        ctx.beginPath(); ctx.moveTo(mx, fy); ctx.lineTo(mx, fy + floorH); ctx.stroke();
      }
    }

    // Bottom slab
    ctx.fillStyle = isDark ? '#252d42' : '#c8d0e0';
    ctx.fillRect(bx, massY + massH - slabH, bldgW, slabH);

  // ── FRAME or BRISE-SOLEIL ───────────────────────────────────
  } else {
    // Wall fill
    ctx.fillStyle = isDark ? '#181e2e' : '#e8edf5';
    ctx.fillRect(bx, massY, bldgW, massH);
    ctx.strokeStyle = isDark ? '#2d3850' : '#b0bcd0'; ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, massY, bldgW, massH);

    for (var fl = 0; fl < floors; fl++) {
      var fy = massY + fl * floorH;

      // Ribbon windows per bay (punched openings)
      for (var b = 0; b < bays; b++) {
        var bLeft  = bx + b * bayW + frameW;
        var bRight = bx + (b + 1) * bayW - frameW;
        var winBW  = bRight - bLeft;
        var winY   = fy + spandrelH;

        // Window glass
        var wGrad = ctx.createLinearGradient(bLeft, 0, bRight, 0);
        if (isDark) {
          wGrad.addColorStop(0, 'rgba(80,120,200,0.18)');
          wGrad.addColorStop(0.5,'rgba(108,142,255,0.28)');
          wGrad.addColorStop(1, 'rgba(80,120,200,0.18)');
        } else {
          wGrad.addColorStop(0, 'rgba(160,200,255,0.22)');
          wGrad.addColorStop(0.5,'rgba(200,225,255,0.38)');
          wGrad.addColorStop(1, 'rgba(160,200,255,0.22)');
        }
        ctx.fillStyle = wGrad;
        ctx.fillRect(bLeft, winY, winBW, glazingH);
        ctx.strokeStyle = isDark ? '#3d4a70' : '#a8b8cc'; ctx.lineWidth = 1;
        ctx.strokeRect(bLeft, winY, winBW, glazingH);

        // Horizontal rail in window (at N:D proportion within the window)
        ctx.strokeStyle = isDark ? 'rgba(200,220,255,0.12)' : 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(bLeft, winY + glazingH * D / N);
        ctx.lineTo(bRight, winY + glazingH * D / N);
        ctx.stroke();

        // Ratio annotation on first window of first floor
        if (fl === 0 && b === 0) {
          ctx.strokeStyle = color + '70'; ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.moveTo(bLeft, winY - 6); ctx.lineTo(bRight, winY - 6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bLeft, winY - 9); ctx.lineTo(bLeft, winY - 3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bRight, winY - 9); ctx.lineTo(bRight, winY - 3); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = color; ctx.font = '7px monospace'; ctx.textAlign = 'center';
          ctx.fillText(N + ':' + D, bLeft + winBW/2, winY - 10);
          ctx.textAlign = 'left';
        }
      }

      // Spandrel / floor band
      ctx.fillStyle = isDark ? '#20273c' : '#d0d8e8';
      ctx.fillRect(bx, fy, bldgW, spandrelH);
      ctx.strokeStyle = isDark ? '#2d3850' : '#b0bcd0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, fy + slabH); ctx.lineTo(bx + bldgW, fy + slabH); ctx.stroke();
    }

    // Structural frame columns (over-painted on top)
    for (var c = 0; c <= bays; c++) {
      var colX = bx + c * bayW;
      var fGrad = ctx.createLinearGradient(colX - frameW/2, 0, colX + frameW/2, 0);
      if (isDark) {
        fGrad.addColorStop(0, '#1e2538'); fGrad.addColorStop(0.5, '#3a4462'); fGrad.addColorStop(1, '#1e2538');
      } else {
        fGrad.addColorStop(0, '#c0cad8'); fGrad.addColorStop(0.5, '#e8edf5'); fGrad.addColorStop(1, '#c0cad8');
      }
      ctx.fillStyle = fGrad;
      ctx.fillRect(colX - frameW/2, massY, frameW, massH);
      ctx.strokeStyle = isDark ? '#3d4a70' : '#a8b8cc'; ctx.lineWidth = 0.7;
      ctx.strokeRect(colX - frameW/2, massY, frameW, massH);
    }

    // Top slab
    ctx.fillStyle = isDark ? '#20273c' : '#c8d0e0';
    ctx.fillRect(bx, massY, bldgW, slabH);

    // Brise-soleil fins (horizontal shading elements)
    if (treatment === 'brise') {
      var finCount  = 3;
      var finDepth  = Math.min(bayW * 0.28, 20);
      var finT      = Math.max(2, floorH * 0.055);
      ctx.fillStyle = isDark ? '#3a4a65' : '#b8c8d8';
      for (var fl2 = 0; fl2 < floors; fl2++) {
        var fy2 = massY + fl2 * floorH;
        for (var fn = 0; fn < finCount; fn++) {
          var finY = fy2 + spandrelH + (glazingH / (finCount + 1)) * (fn + 1);
          ctx.fillRect(bx, finY - finT/2, bldgW + finDepth, finT);
          ctx.strokeStyle = isDark ? '#4a5a78' : '#a8b8c8'; ctx.lineWidth = 0.5;
          ctx.strokeRect(bx, finY - finT/2, bldgW + finDepth, finT);
        }
      }
    }

    // Pilotis (open ground-floor colonnade)
    if (hasPilotis && pilotiH > 0) {
      var pilotiW = Math.max(6, frameW * 1.1);
      for (var c2 = 0; c2 <= bays; c2++) {
        var pX = bx + c2 * bayW;
        var pGrad = ctx.createLinearGradient(pX - pilotiW/2, 0, pX + pilotiW/2, 0);
        if (isDark) {
          pGrad.addColorStop(0, '#1e2538'); pGrad.addColorStop(0.5, '#3a4462'); pGrad.addColorStop(1, '#1e2538');
        } else {
          pGrad.addColorStop(0, '#b8c8d8'); pGrad.addColorStop(0.5, '#dce4f0'); pGrad.addColorStop(1, '#b8c8d8');
        }
        ctx.fillStyle = pGrad;
        ctx.fillRect(pX - pilotiW/2, pilotiTopY, pilotiW, pilotiH);
        ctx.strokeStyle = isDark ? '#3d4a70' : '#a0b0c0'; ctx.lineWidth = 0.7;
        ctx.strokeRect(pX - pilotiW/2, pilotiTopY, pilotiW, pilotiH);
      }
    }
  }

  // Building outline
  ctx.strokeStyle = isDark ? '#3d4a70' : '#7090aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, massY, bldgW, massH);

  // Flat roof parapet
  ctx.fillStyle = isDark ? '#252d42' : '#c8d0e0';
  ctx.strokeStyle = isDark ? '#3d4a70' : '#a0b0c0'; ctx.lineWidth = 1.5;
  ctx.fillRect(bx - 4, massY - parapetH, bldgW + 8, parapetH);
  ctx.strokeRect(bx - 4, massY - parapetH, bldgW + 8, parapetH);

  // Regulating lines
  if (showLines) {
    _drawRegulatingLines(ctx, bx, massY, bldgW, massH, 0, slabH, N, D, r, color, isDark);
  }

  // Proportion annotations
  _drawAnnotations(ctx, bx, massY, bldgW, massH, bayW, bayW * 0.78, glazingH, slabH, M, interval, color, isDark);

  // Proportion label
  _drawProportionLabel(ctx, W, H, interval, color);

  // Treatment label
  var treatLabels = { frame:'Exposed Frame', curtain:'Curtain Wall', brise:'Brise-Soleil' };
  ctx.fillStyle = isDark ? 'rgba(180,210,255,0.45)' : 'rgba(0,50,120,0.40)';
  ctx.font = '9px monospace';
  ctx.fillText('Modernist — ' + (treatLabels[treatment] || treatment), bx, massY - parapetH - 6);
}

// ─────────────────────────────────────────────────────────────
//  Column drawing
// ─────────────────────────────────────────────────────────────
function _drawColumn(ctx, cx, base, w, h, order, isDark) {
  var grad = ctx.createLinearGradient(cx - w/2, 0, cx + w/2, 0);
  if (isDark) {
    grad.addColorStop(0, '#2d3347'); grad.addColorStop(0.45, '#4a5070');
    grad.addColorStop(0.55, '#3d4460'); grad.addColorStop(1, '#252940');
  } else {
    grad.addColorStop(0, '#d8d0c0'); grad.addColorStop(0.45, '#f8f4ec');
    grad.addColorStop(0.55, '#ede8dc'); grad.addColorStop(1, '#d0c8b8');
  }
  // Shaft — slightly tapered (entasis)
  var taper = w * 0.06;
  ctx.beginPath();
  ctx.moveTo(cx - w/2, base);
  ctx.lineTo(cx - w/2 + taper, base - h);
  ctx.lineTo(cx + w/2 - taper, base - h);
  ctx.lineTo(cx + w/2, base);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = isDark ? '#3a4060' : '#c8c0b0';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Capital
  var capH = w * { doric: 0.6, ionic: 0.9, corinthian: 1.4 }[order] || 0.7;
  ctx.fillStyle = isDark ? '#4a5070' : '#ede8dc';
  // Abacus (flat plate)
  ctx.fillRect(cx - w/2 - w*0.2, base - h, w * 1.4, capH * 0.35);
  // Echinus (round under plate)
  ctx.beginPath();
  ctx.ellipse(cx, base - h + capH*0.6, w*0.6, capH*0.4, 0, 0, Math.PI*2);
  ctx.fill();

  if (order === 'ionic' || order === 'corinthian') {
    // Volutes (simple representation)
    ctx.strokeStyle = isDark ? '#6060a0' : '#9090c0';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(cx - w*0.45, base - h + capH*0.6, w*0.22, 0, Math.PI*1.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + w*0.45, base - h + capH*0.6, w*0.22, Math.PI*1.5, Math.PI*3); ctx.stroke();
  }

  // Base
  ctx.fillStyle = isDark ? '#3d4460' : '#ddd8c8';
  ctx.fillRect(cx - w/2 - w*0.15, base - w*0.5, w * 1.3, w * 0.25);
  ctx.fillRect(cx - w/2 - w*0.08, base - w*0.25, w * 1.16, w * 0.25);
}

// ─────────────────────────────────────────────────────────────
//  Window drawing
// ─────────────────────────────────────────────────────────────
function _drawWindow(ctx, x, y, w, h, style, isDark, color, annotate, r) {
  // Frame
  ctx.strokeStyle = isDark ? '#3d4460' : '#c0b898';
  ctx.lineWidth = 1;

  if (style === 'gothic') {
    // Pointed arch window
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + h * 0.35);
    ctx.quadraticCurveTo(x, y, x + w/2, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + h * 0.35);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fillStyle = isDark ? 'rgba(108,142,255,0.12)' : 'rgba(160,184,255,0.2)';
    ctx.strokeStyle = isDark ? '#5040a0' : '#9090c0';
    ctx.fill(); ctx.stroke();
    // Tracery
    ctx.strokeStyle = color + '60';
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(x + w/2, y + h * 0.4); ctx.lineTo(x + w/2, y + h); ctx.stroke();
  } else {
    // Classical / Modernist rectangular window
    ctx.fillStyle = isDark ? 'rgba(108,142,255,0.1)' : 'rgba(200,220,255,0.25)';
    _archRoundRect(ctx, x, y, w, h, 1); ctx.fill();
    ctx.strokeStyle = isDark ? '#3d4460' : '#c0b898'; ctx.lineWidth = 1;
    _archRoundRect(ctx, x, y, w, h, 1); ctx.stroke();

    // Pane divider
    ctx.strokeStyle = isDark ? '#3d4460' : '#d0c8b0'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x + w/2, y); ctx.lineTo(x + w/2, y + h); ctx.stroke();
    if (h > w * 0.8) {
      ctx.beginPath(); ctx.moveTo(x, y + h/2); ctx.lineTo(x + w, y + h/2); ctx.stroke();
    }
    // Keystone (classical)
    if (style === 'classical') {
      ctx.fillStyle = isDark ? '#4a5070' : '#e0d8c8';
      ctx.fillRect(x + w*0.35, y - 3, w*0.3, 5);
    }
  }

  // Ratio annotation on the first window
  if (annotate) {
    ctx.strokeStyle = color + '70'; ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]);
    // Width bracket
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + w, y - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x, y - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w, y - 9); ctx.lineTo(x + w, y - 3); ctx.stroke();
    // Height bracket
    ctx.beginPath(); ctx.moveTo(x + w + 5, y); ctx.lineTo(x + w + 5, y + h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w + 2, y); ctx.lineTo(x + w + 8, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w + 2, y + h); ctx.lineTo(x + w + 8, y + h); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('W', x + w/2, y - 10);
    ctx.textAlign = 'left';
    ctx.fillText('H=' + (r > 1 ? 'W×' + r.toFixed(2) : 'W'), x + w + 10, y + h/2 + 3);
  }
}

// ─────────────────────────────────────────────────────────────
//  Regulating lines — visual proof of proportional system
// ─────────────────────────────────────────────────────────────
function _drawRegulatingLines(ctx, bx, by, bldgW, bldgH, pedH, entH, N, D, r, color, isDark) {
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;

  // Primary diagonal — defines overall N:D proportion
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(bx, by + bldgH);
  ctx.lineTo(bx + bldgW, by);
  ctx.stroke();

  // Secondary diagonal — from top-left to bottom-right
  ctx.strokeStyle = isDark ? '#a78bfa' : '#7060d0';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bldgW, by + bldgH);
  ctx.stroke();

  // Square regulator — inscribed square from left edge
  // Width of square = bldgH (height), so right edge of square is at bx + bldgH
  var sqW = bldgH; // D units (square D×D)
  if (sqW < bldgW) {
    ctx.strokeStyle = isDark ? '#34d399' : '#059669';
    ctx.beginPath();
    ctx.rect(bx, by, sqW, bldgH);
    ctx.stroke();
    // The "leftover" rectangle: width = bldgW - bldgH
    // This remainder has ratio (bldgW - bldgH) : bldgH = (N-D):D
    if (bldgW - sqW > 4) {
      ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
      ctx.beginPath();
      ctx.rect(bx + sqW, by, bldgW - sqW, bldgH);
      ctx.stroke();
    }
  }

  // Le Corbusier regulating line: 45° from corner through entablature
  ctx.strokeStyle = isDark ? '#f472b6' : '#db2777';
  ctx.beginPath();
  ctx.moveTo(bx, by + bldgH);
  ctx.lineTo(bx + entH, by + bldgH - entH);
  ctx.stroke();

  // Show that the diagonal passes through the top of the columns
  ctx.strokeStyle = color + 'cc';
  ctx.setLineDash([3, 4]);
  var colTopY = by + pedH + entH;
  ctx.beginPath();
  ctx.moveTo(bx, colTopY);
  ctx.lineTo(bx + bldgW, colTopY);
  ctx.stroke();

  ctx.restore();

  // Legend for regulating lines
  _drawRegLegend(ctx, bx + bldgW + 8, by + 10, color, isDark);
}

function _drawRegLegend(ctx, x, y, color, isDark) {
  if (x + 80 > x + 200) return; // too narrow
  var items = [
    { col: color, label: 'N:D diagonal' },
    { col: isDark ? '#a78bfa' : '#7060d0', label: 'D:N diagonal' },
    { col: isDark ? '#34d399' : '#059669', label: 'D×D square' },
    { col: isDark ? '#f59e0b' : '#d97706', label: 'Remainder' },
  ];
  ctx.font = '8px monospace';
  items.forEach(function(item, i) {
    ctx.strokeStyle = item.col; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(x, y + i*13 + 4); ctx.lineTo(x + 14, y + i*13 + 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
    ctx.fillText(item.label, x + 18, y + i*13 + 7);
  });
}

// ─────────────────────────────────────────────────────────────
//  Proportion annotations — label every derived dimension
// ─────────────────────────────────────────────────────────────
function _drawAnnotations(ctx, bx, by, bldgW, bldgH, bayW, winW, winH, entH, M, interval, color, isDark) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var r = N / D;
  var textColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  var accentCol = color;
  ctx.font = '8px monospace';

  // ── W dimension (top of building) ───────────────────────────
  _dimArrow(ctx, bx, by - 18, bx + bldgW, by - 18, textColor, 'W = ' + N + ' units', isDark);
  // ── H dimension (right side) ─────────────────────────────────
  _dimArrow(ctx, bx + bldgW + 16, by, bx + bldgW + 16, by + bldgH, textColor, 'H = ' + D + ' units', isDark, true);
  // ── Bay width (bottom of building) ───────────────────────────
  _dimArrow(ctx, bx, by + bldgH + 14, bx + bayW, by + bldgH + 14, accentCol, 'bay = W/' + (interval.ratio[0] > interval.ratio[1] ? N : D), isDark);
  // ── Module M ─────────────────────────────────────────────────
  ctx.fillStyle = accentCol;
  ctx.font = 'bold 8px monospace';
  ctx.fillText('M=' + M.toFixed(0) + 'px', bx + 3, by + bldgH - 4);
  // ── Entablature ───────────────────────────────────────────────
  ctx.fillStyle = textColor;
  ctx.font = '8px monospace';
  ctx.fillText('Ent=' + N + '÷' + (N+D), bx + bldgW/2 - 20, by + entH*0.5 + 3);
}

function _dimArrow(ctx, x1, y1, x2, y2, col, label, isDark, vertical) {
  ctx.save();
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineWidth = 0.7; ctx.setLineDash([2, 3]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]);
  // End ticks
  var tx = vertical ? 3 : 0, ty = vertical ? 0 : 3;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x1-tx, y1-ty); ctx.lineTo(x1+tx, y1+ty); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2-tx, y2-ty); ctx.lineTo(x2+tx, y2+ty); ctx.stroke();
  ctx.font = '8px monospace';
  if (vertical) {
    ctx.save(); ctx.translate((x1+x2)/2, (y1+y2)/2); ctx.rotate(-Math.PI/2);
    ctx.textAlign = 'center'; ctx.fillText(label, 0, -4); ctx.restore();
  } else {
    ctx.textAlign = 'center'; ctx.fillText(label, (x1+x2)/2, y1 - 4);
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
//  Entablature details
// ─────────────────────────────────────────────────────────────
function _drawTriglyphs(ctx, bx, ey, bW, eH, bays, isDark, color) {
  var numT = bays * 2 + 1;
  var step = bW / numT;
  ctx.fillStyle = isDark ? '#1e2238' : '#d8d0c0';
  for (var i = 0; i < numT; i += 2) {
    var tx = bx + i * step + step * 0.15;
    ctx.fillRect(tx, ey + eH*0.1, step*0.7, eH*0.8);
    // Glyphs
    ctx.strokeStyle = isDark ? '#3d4460' : '#b8b0a0'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(tx + step*0.24, ey+eH*0.12); ctx.lineTo(tx + step*0.24, ey+eH*0.88); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx + step*0.46, ey+eH*0.12); ctx.lineTo(tx + step*0.46, ey+eH*0.88); ctx.stroke();
  }
}

function _drawDentils(ctx, bx, ey, bW, eH, isDark, color) {
  var n = Math.round(bW / (eH * 0.5));
  var step = bW / n;
  ctx.fillStyle = isDark ? '#1e2238' : '#d8d0c0';
  for (var i = 0; i < n; i += 2) {
    ctx.fillRect(bx + i * step, ey + eH * 0.55, step * 0.85, eH * 0.4);
  }
}

// ─────────────────────────────────────────────────────────────
//  Module grid
// ─────────────────────────────────────────────────────────────
function _drawModuleGrid(ctx, bx, by, bW, bH, M, isDark) {
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(108,142,255,0.12)' : 'rgba(61,92,255,0.1)';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([1, 2]);
  for (var x = bx; x <= bx + bW + 0.5; x += M) {
    ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by + bH); ctx.stroke();
  }
  for (var y = by; y <= by + bH + 0.5; y += M) {
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bW, y); ctx.stroke();
  }
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
//  Sky / Ground
// ─────────────────────────────────────────────────────────────
function _drawSkyGround(ctx, W, H, isDark) {
  var sky = ctx.createLinearGradient(0, 0, 0, H * 0.78);
  if (isDark) { sky.addColorStop(0, '#080c18'); sky.addColorStop(1, '#141828'); }
  else { sky.addColorStop(0, '#c8deff'); sky.addColorStop(1, '#e8f0ff'); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.78);

  var grd = ctx.createLinearGradient(0, H*0.78, 0, H);
  if (isDark) { grd.addColorStop(0, '#1a1e2a'); grd.addColorStop(1, '#0d0f14'); }
  else { grd.addColorStop(0, '#d8dcea'); grd.addColorStop(1, '#c4c8dc'); }
  ctx.fillStyle = grd; ctx.fillRect(0, H*0.78, W, H*0.22);

  // Ground line
  ctx.strokeStyle = isDark ? '#2d3347' : '#b0b8cc'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H*0.78); ctx.lineTo(W, H*0.78); ctx.stroke();
}

// ─────────────────────────────────────────────────────────────
//  Proportion label (bottom)
// ─────────────────────────────────────────────────────────────
function _drawProportionLabel(ctx, W, H, interval, color) {
  var N = interval.ratio[0], D = interval.ratio[1];
  var isDark2 = document.body.dataset.theme !== 'light';
  ctx.fillStyle = isDark2 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(N + ' : ' + D, 12, H - 22);
  ctx.fillStyle = color; ctx.font = '10px system-ui';
  ctx.fillText(interval.name + '  —  Facade W:H = ' + N + ':' + D, 12, H - 8);
}

// ─────────────────────────────────────────────────────────────
//  NATURE — fractal tree (unchanged)
// ─────────────────────────────────────────────────────────────
function _drawNature(ctx, W, H, ratio, interval, isDark) {
  var color = _archColor(interval.color);
  var bg = ctx.createLinearGradient(0, 0, 0, H);
  if (isDark) { bg.addColorStop(0, '#0d1a0f'); bg.addColorStop(1, '#0d0f14'); }
  else { bg.addColorStop(0, '#e0f0d8'); bg.addColorStop(1, '#f0f8e8'); }
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  _drawTree(ctx, W/2, H*0.88, -Math.PI/2, H*0.27, ratio, 7, color, isDark);
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('Branching ratio: ' + interval.ratio[0] + ':' + interval.ratio[1], 12, H - 22);
  ctx.fillStyle = color; ctx.font = '10px system-ui';
  ctx.fillText(interval.name, 12, H - 8);
}

function _drawTree(ctx, x, y, angle, len, ratio, depth, color, isDark) {
  if (depth === 0 || len < 2) return;
  var x2 = x + Math.cos(angle)*len, y2 = y + Math.sin(angle)*len;
  var alpha = 0.4 + depth*0.07;
  ctx.strokeStyle = color + Math.round(alpha*255).toString(16).padStart(2,'0');
  ctx.lineWidth = Math.max(0.5, depth*0.8);
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x2,y2); ctx.stroke();
  var spread = Math.PI / (2.5 + ratio*0.5), lr = 1/ratio;
  _drawTree(ctx, x2, y2, angle-spread, len*lr, ratio, depth-1, color, isDark);
  _drawTree(ctx, x2, y2, angle+spread, len*(1-lr+0.35), ratio, depth-1, color, isDark);
}

// ─────────────────────────────────────────────────────────────
//  TYPOGRAPHY — modular scale (unchanged)
// ─────────────────────────────────────────────────────────────
function _drawTypography(ctx, W, H, ratio, interval, isDark) {
  var color = _archColor(interval.color);
  ctx.fillStyle = isDark ? '#13161e' : '#f8f9ff'; ctx.fillRect(0,0,W,H);
  var labels = ['Caption','Body','Subtitle','Title','Display','Hero'];
  var samples = ['Small text','Body text','Subheading','Heading','Display','Hero'];
  var yPos = H*0.08;
  for (var i = 0; i < labels.length; i++) {
    var fs = Math.min(12*Math.pow(ratio,i), H*0.18);
    var alpha = 0.35 + (i/labels.length)*0.65;
    ctx.fillStyle = isDark ? 'rgba(232,234,240,'+alpha+')' : 'rgba(26,30,42,'+alpha+')';
    ctx.font = Math.round(fs)+'px system-ui';
    ctx.fillText(samples[i], 20, yPos+fs);
    ctx.fillStyle = color+'99'; ctx.font = '9px monospace';
    ctx.fillText(labels[i]+': '+Math.round(fs)+'px', 20, yPos+fs+12);
    ctx.strokeStyle = isDark?'#2d3347':'#d0d5e8'; ctx.lineWidth=0.5;
    ctx.beginPath(); ctx.moveTo(0,yPos+fs+18); ctx.lineTo(W,yPos+fs+18); ctx.stroke();
    yPos += fs+24;
    if (yPos > H*0.84) break;
  }
  ctx.fillStyle = isDark?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.4)';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('Scale: '+interval.ratio[0]+':'+interval.ratio[1]+' = '+ratio.toFixed(4), 12, H-8);
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function _archColor(cssVar) {
  var map = {
    'var(--c-unison)':'#6c8eff','var(--c-octave)':'#34d399','var(--c-fifth)':'#f59e0b',
    'var(--c-fourth)':'#a78bfa','var(--c-third)':'#f472b6','var(--c-minor)':'#fb923c',
    'var(--c-tritone)':'#ef4444','var(--accent-2)':'#a78bfa',
  };
  return map[cssVar] || '#6c8eff';
}

function _archRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}
