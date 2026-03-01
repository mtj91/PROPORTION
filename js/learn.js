// ============================================================
//  PROPORTION — Interactive Learning Module  (v2 — enhanced)
//  Loaded before app.js — uses var for file:// compatibility.
// ============================================================

// ── Frequency constants (A4 = 440 Hz, just intonation) ────────
var LF = {
  A3:220,  B3:247.5, C4:264,   D4:293.3, E4:330,  F4:352,  G4:396,
  A4:440,  Bb4:469.3,B4:495,   C5:528,   Cs5:550, D5:586.7,
  E5:660,  F5:704,   Fs5:733.3,G5:792,   Gs5:825, A5:880,  C6:1056
};

// ── Audio helpers ─────────────────────────────────────────────
function _lAC() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); }
  catch(e) { return null; }
}

function _lNote(ac, freq, start, dur, vol) {
  var osc = ac.createOscillator();
  var g = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.type = 'sine'; osc.frequency.value = freq;
  var t = ac.currentTime + (start || 0);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol || 0.14, t + 0.02);
  g.gain.setValueAtTime(vol || 0.14, t + dur - 0.07);
  g.gain.linearRampToValueAtTime(0, t + dur);
  osc.start(t); osc.stop(t + dur);
}

function _learnPlayChord(freqs, dur) {
  if (typeof state !== 'undefined' && !state.soundEnabled) return;
  var ac = _lAC(); if (!ac) return;
  freqs.forEach(function(f) { _lNote(ac, f, 0, dur || 1.5); });
}

function _learnPlaySeq(freqs, gap, dur) {
  if (typeof state !== 'undefined' && !state.soundEnabled) return;
  var ac = _lAC(); if (!ac) return;
  var d = dur || 0.6;
  freqs.forEach(function(f, i) { _lNote(ac, f, i * (gap || 0.65), d); });
}

// ── SVG diagram generators ────────────────────────────────────

function _svgRatioBars(n, d, lbl1, lbl2) {
  var max = Math.max(n, d); var bw = 210;
  var w1 = Math.round((n / max) * bw);
  var w2 = Math.round((d / max) * bw);
  return '<svg viewBox="0 0 290 82" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">' +
    '<text x="8" y="18" fill="#9fa8c0" font-size="10" font-family="monospace">' + (lbl1 || ('n = ' + n)) + '</text>' +
    '<rect x="8" y="22" width="' + w1 + '" height="14" rx="3" fill="#6c8eff" opacity="0.85"/>' +
    '<text x="' + (w1 + 14) + '" y="33" fill="#6c8eff" font-size="11" font-family="monospace" font-weight="bold">' + n + '</text>' +
    '<text x="8" y="54" fill="#9fa8c0" font-size="10" font-family="monospace">' + (lbl2 || ('d = ' + d)) + '</text>' +
    '<rect x="8" y="58" width="' + w2 + '" height="14" rx="3" fill="#f59e0b" opacity="0.85"/>' +
    '<text x="' + (w2 + 14) + '" y="69" fill="#f59e0b" font-size="11" font-family="monospace" font-weight="bold">' + d + '</text>' +
    '<text x="8" y="80" fill="#5c6480" font-size="9" font-family="monospace">ratio ' + n + ':' + d + ' = ' + (n/d).toFixed(3) + '</text>' +
    '</svg>';
}

function _svgHarmonicLadder() {
  var cols = ['#6c8eff','#f59e0b','#10b981','#ec4899','#8b5cf6','#06b6d4','#f97316','#84cc16'];
  var intervals = ['—','Octave 2:1','Fifth 3:2','Fourth 4:3','Maj 3rd 5:4','Min 3rd 6:5','Sep 7:6','Maj 2nd 8:7'];
  var svg = '<svg viewBox="0 0 290 105" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  svg += '<text x="2" y="10" fill="#5c6480" font-size="8" font-family="monospace">harmonic</text>';
  svg += '<text x="150" y="10" fill="#5c6480" font-size="8" font-family="monospace">interval above</text>';
  for (var i = 0; i < 8; i++) {
    var n = i + 1;
    var y = 20 + i * 11;
    var bw = Math.round((n / 8) * 180);
    svg += '<rect x="30" y="' + (y-7) + '" width="' + bw + '" height="8" rx="2" fill="' + cols[i] + '" opacity="0.8"/>';
    svg += '<text x="2" y="' + y + '" fill="#9fa8c0" font-size="9" font-family="monospace">' + n + 'f</text>';
    if (i > 0) {
      svg += '<text x="218" y="' + y + '" fill="' + cols[i] + '" font-size="8" font-family="monospace">' + intervals[i] + '</text>';
    }
  }
  svg += '</svg>';
  return svg;
}

function _svgWaveComparison() {
  var svg = '<svg viewBox="0 0 290 90" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  // Simple wave for 3:2 (smooth, regular)
  svg += '<text x="8" y="12" fill="#f59e0b" font-size="10" font-family="monospace">3:2 Perfect Fifth — smooth</text>';
  var pts1 = '';
  for (var i = 0; i <= 80; i++) {
    var x = 8 + (i / 80) * 274;
    var y = 27 + Math.sin(i * 0.235) * 7 + Math.sin(i * 0.157) * 4;
    pts1 += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
  }
  svg += '<path d="' + pts1 + '" stroke="#f59e0b" stroke-width="1.5" fill="none" opacity="0.9"/>';
  // Rough wave for tritone (45:32)
  svg += '<text x="8" y="55" fill="#ef4444" font-size="10" font-family="monospace">45:32 Tritone — beating</text>';
  var pts2 = '';
  for (var j = 0; j <= 80; j++) {
    var x2 = 8 + (j / 80) * 274;
    var y2 = 70 + Math.sin(j * 0.235) * 7 + Math.sin(j * 0.222) * 6.5;
    pts2 += (j === 0 ? 'M' : 'L') + x2.toFixed(1) + ',' + y2.toFixed(1) + ' ';
  }
  svg += '<path d="' + pts2 + '" stroke="#ef4444" stroke-width="1.5" fill="none" opacity="0.9"/>';
  svg += '</svg>';
  return svg;
}

function _svgTritoneMidpoint() {
  var svg = '<svg viewBox="0 0 290 70" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  svg += '<text x="8" y="12" fill="#9fa8c0" font-size="9" font-family="monospace">one octave = 1200 cents</text>';
  // Octave bar
  svg += '<rect x="20" y="22" width="250" height="12" rx="3" fill="#1a1e2a" stroke="#2d3347" stroke-width="1"/>';
  // Left half (unison → tritone)
  svg += '<rect x="20" y="22" width="125" height="12" rx="3" fill="#6c8eff" opacity="0.4"/>';
  // Right half (tritone → octave)
  svg += '<rect x="145" y="22" width="125" height="12" rx="3" fill="#34d399" opacity="0.4"/>';
  // Tritone marker
  svg += '<line x1="145" y1="18" x2="145" y2="38" stroke="#ef4444" stroke-width="2"/>';
  svg += '<text x="135" y="52" fill="#ef4444" font-size="9" font-family="monospace">600¢</text>';
  svg += '<text x="135" y="64" fill="#ef4444" font-size="9" font-family="monospace">Tritone</text>';
  // Labels
  svg += '<text x="8" y="34" fill="#6c8eff" font-size="9" font-family="monospace">1:1</text>';
  svg += '<text x="264" y="34" fill="#34d399" font-size="9" font-family="monospace">2:1</text>';
  svg += '<text x="26" y="52" fill="#6c8eff" font-size="9" font-family="monospace">0¢</text>';
  svg += '<text x="246" y="52" fill="#34d399" font-size="9" font-family="monospace">1200¢</text>';
  svg += '</svg>';
  return svg;
}

function _svgCrossDomain() {
  var svg = '<svg viewBox="0 0 290 120" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  // Center node
  svg += '<rect x="110" y="45" width="70" height="30" rx="6" fill="#6c8eff" opacity="0.25" stroke="#6c8eff" stroke-width="1"/>';
  svg += '<text x="145" y="64" fill="#6c8eff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">3 : 2</text>';
  // Four domain boxes
  var domains = [
    {label:'Music', sub:'Perfect Fifth', x:8,  y:5,  c:'#f59e0b'},
    {label:'Arch.', sub:'Room ratio',    x:212,y:5,  c:'#10b981'},
    {label:'Nature',sub:'φ spirals',     x:8,  y:85, c:'#a78bfa'},
    {label:'Type',  sub:'Scale ratio',   x:212,y:85, c:'#f472b6'},
  ];
  domains.forEach(function(d) {
    svg += '<rect x="' + d.x + '" y="' + d.y + '" width="68" height="28" rx="5" fill="' + d.c + '" opacity="0.15" stroke="' + d.c + '" stroke-width="1"/>';
    svg += '<text x="' + (d.x+34) + '" y="' + (d.y+13) + '" fill="' + d.c + '" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">' + d.label + '</text>';
    svg += '<text x="' + (d.x+34) + '" y="' + (d.y+24) + '" fill="#5c6480" font-size="8" text-anchor="middle" font-family="sans-serif">' + d.sub + '</text>';
  });
  // Lines from center to corners
  var lines = [{x1:110,y1:60,x2:76,y2:19},{x1:180,y1:60,x2:212,y2:19},{x1:110,y1:60,x2:76,y2:99},{x1:180,y1:60,x2:212,y2:99}];
  var lc = ['#f59e0b','#10b981','#a78bfa','#f472b6'];
  lines.forEach(function(l,i) {
    svg += '<line x1="' + l.x1 + '" y1="' + l.y1 + '" x2="' + l.x2 + '" y2="' + l.y2 + '" stroke="' + lc[i] + '" stroke-width="1" opacity="0.5" stroke-dasharray="3,3"/>';
  });
  svg += '</svg>';
  return svg;
}

function _svgFibonacci() {
  var svg = '<svg viewBox="0 0 290 115" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  var cols = ['#6c8eff','#f59e0b','#10b981','#ec4899','#8b5cf6','#06b6d4'];
  // Fibonacci rectangle subdivisions (simplified)
  // Main rect: 290x115, subdivide by φ
  // Rect sequence: 177x109, then 109x68, then 68x41, ...
  var rects = [
    {x:2,  y:3,  w:174, h:107, label:'φ'},
    {x:176,y:3,  w:107, h:107, label:'1'},
    {x:176,y:3,  w:107, h:66,  label:''},
    {x:176,y:69, w:66,  h:38,  label:''},
    {x:242,y:69, w:41,  h:38,  label:''},
  ];
  rects.forEach(function(r, i) {
    svg += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="' + cols[i] + '" opacity="' + (0.12 + i*0.03) + '" stroke="' + cols[i] + '" stroke-width="1"/>';
    if (r.label) svg += '<text x="' + (r.x + r.w/2) + '" y="' + (r.y + r.h/2 + 4) + '" fill="' + cols[i] + '" font-size="12" text-anchor="middle" font-family="monospace" opacity="0.7">' + r.label + '</text>';
  });
  // Golden spiral arc approximation
  svg += '<path d="M 176 110 Q 2 110 2 3" stroke="#f59e0b" stroke-width="1.5" fill="none" opacity="0.6"/>';
  svg += '<path d="M 283 3 Q 283 69 176 69" stroke="#10b981" stroke-width="1.5" fill="none" opacity="0.6"/>';
  svg += '<text x="148" y="112" fill="#5c6480" font-size="8" text-anchor="middle" font-family="monospace">φ:1 → subdivides into square + φ rectangle</text>';
  svg += '</svg>';
  return svg;
}

function _svgProportionWheelSimple() {
  var svg = '<svg viewBox="0 0 200 200" class="diagram-svg diagram-svg-sq" xmlns="http://www.w3.org/2000/svg">';
  var cx = 100, cy = 100, r = 75;
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#2d3347" stroke-width="1.5"/>';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#6c8eff"/>';
  // Intervals: cents → angle (0° = top, clockwise)
  var ivs = [
    {name:'P1',  cents:0,    c:'#6c8eff'},
    {name:'m2',  cents:112,  c:'#fb923c'},
    {name:'M2',  cents:204,  c:'#fb923c'},
    {name:'m3',  cents:316,  c:'#f472b6'},
    {name:'M3',  cents:386,  c:'#f472b6'},
    {name:'P4',  cents:498,  c:'#a78bfa'},
    {name:'TT',  cents:600,  c:'#ef4444'},
    {name:'P5',  cents:702,  c:'#f59e0b'},
    {name:'m6',  cents:814,  c:'#10b981'},
    {name:'M6',  cents:884,  c:'#10b981'},
    {name:'m7',  cents:996,  c:'#34d399'},
    {name:'M7',  cents:1088, c:'#34d399'},
    {name:'P8',  cents:1200, c:'#6c8eff'},
  ];
  ivs.forEach(function(iv) {
    var angle = (iv.cents / 1200) * 2 * Math.PI - Math.PI / 2;
    var px = cx + r * Math.cos(angle);
    var py = cy + r * Math.sin(angle);
    svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="4" fill="' + iv.c + '" opacity="0.9"/>';
    var lx = cx + (r + 14) * Math.cos(angle);
    var ly = cy + (r + 14) * Math.sin(angle);
    svg += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" fill="' + iv.c + '" font-size="8" text-anchor="middle" font-family="monospace">' + iv.name + '</text>';
  });
  svg += '</svg>';
  return svg;
}

function _svgThreeOrders() {
  var svg = '<svg viewBox="0 0 290 120" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  var orders = [
    {name:'Doric',     ratio:'6:1', x:20,  w:22, h:72,  c:'#6c8eff', cap:8,  capStyle:'plain'},
    {name:'Ionic',     ratio:'8:1', x:110, w:18, h:90,  c:'#f59e0b', cap:10, capStyle:'scroll'},
    {name:'Corinthian',ratio:'10:1',x:200, w:14, h:110, h2:90, c:'#10b981', cap:14, capStyle:'ornate'},
  ];
  orders.forEach(function(o) {
    var colH = o.h2 || o.h;
    var baseY = 113 - colH;
    // Base
    svg += '<rect x="' + (o.x - 6) + '" y="108" width="' + (o.w + 12) + '" height="5" rx="1" fill="' + o.c + '" opacity="0.5"/>';
    // Shaft (tapered)
    svg += '<rect x="' + o.x + '" y="' + baseY + '" width="' + o.w + '" height="' + colH + '" rx="2" fill="' + o.c + '" opacity="0.25" stroke="' + o.c + '" stroke-width="1"/>';
    // Capital
    svg += '<rect x="' + (o.x - 4) + '" y="' + (baseY - o.cap) + '" width="' + (o.w + 8) + '" height="' + o.cap + '" rx="2" fill="' + o.c + '" opacity="0.6"/>';
    // Label
    svg += '<text x="' + (o.x + o.w/2) + '" y="118" fill="' + o.c + '" font-size="8" text-anchor="middle" font-family="sans-serif">' + o.name + '</text>';
    svg += '<text x="' + (o.x + o.w/2) + '" y="' + (baseY - o.cap - 4) + '" fill="' + o.c + '" font-size="8" text-anchor="middle" font-family="monospace">' + o.ratio + '</text>';
  });
  svg += '</svg>';
  return svg;
}

function _svgPalladioRooms() {
  var rooms = [
    {ratio:[1,1],  label:'1:1\nSquare',  c:'#6c8eff'},
    {ratio:[4,3],  label:'4:3\nP4th',    c:'#a78bfa'},
    {ratio:[3,2],  label:'3:2\nP5th',    c:'#f59e0b'},
    {ratio:[5,3],  label:'5:3\nM6th',    c:'#10b981'},
    {ratio:[2,1],  label:'2:1\nOctave',  c:'#34d399'},
  ];
  var svg = '<svg viewBox="0 0 290 70" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  var x = 4; var maxH = 50;
  rooms.forEach(function(rm) {
    var n = rm.ratio[0], d = rm.ratio[1];
    var w = Math.round((n / 2) * 44);
    var h = Math.round((d / 2) * 44);
    var y = 2 + (maxH - h);
    svg += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + rm.c + '" opacity="0.2" stroke="' + rm.c + '" stroke-width="1.5"/>';
    // Regulating diagonal
    svg += '<line x1="' + x + '" y1="' + y + '" x2="' + (x+w) + '" y2="' + (y+h) + '" stroke="' + rm.c + '" stroke-width="0.7" opacity="0.4"/>';
    var lines = rm.label.split('\n');
    svg += '<text x="' + (x + w/2) + '" y="' + (y + h + 9) + '" fill="' + rm.c + '" font-size="7.5" text-anchor="middle" font-family="monospace">' + lines[0] + '</text>';
    svg += '<text x="' + (x + w/2) + '" y="' + (y + h + 18) + '" fill="#5c6480" font-size="7" text-anchor="middle" font-family="monospace">' + lines[1] + '</text>';
    x += w + 6;
  });
  svg += '</svg>';
  return svg;
}

function _svgCurtainWall() {
  var svg = '<svg viewBox="0 0 290 110" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  var bays = 5, floors = 3;
  var bw = 48, fh = 32;
  var ox = 8, oy = 4;
  for (var f = 0; f < floors; f++) {
    for (var b = 0; b < bays; b++) {
      var x = ox + b * bw; var y = oy + f * fh;
      svg += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + fh + '" fill="#1a1e2a" stroke="#2d3347" stroke-width="1"/>';
      // Glass pane
      svg += '<rect x="' + (x+4) + '" y="' + (y+4) + '" width="' + (bw-8) + '" height="' + (fh-8) + '" rx="1" fill="#6c8eff" opacity="0.12"/>';
    }
  }
  // Dimension annotations
  svg += '<line x1="' + ox + '" y1="104" x2="' + (ox + bw) + '" y2="104" stroke="#f59e0b" stroke-width="1"/>';
  svg += '<text x="' + (ox + bw/2) + '" y="112" fill="#f59e0b" font-size="8" text-anchor="middle" font-family="monospace">bay w</text>';
  svg += '<line x1="258" y1="' + oy + '" x2="258" y2="' + (oy + fh) + '" stroke="#a78bfa" stroke-width="1"/>';
  svg += '<text x="270" y="' + (oy + fh/2 + 3) + '" fill="#a78bfa" font-size="8" text-anchor="middle" font-family="monospace">h</text>';
  svg += '<text x="280" y="112" fill="#5c6480" font-size="8" text-anchor="end" font-family="monospace">bay:floor = 3:2</text>';
  svg += '</svg>';
  return svg;
}

function _svgModulor() {
  var svg = '<svg viewBox="0 0 290 110" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  // Red series (cm values, scaled): 27, 43, 70, 113
  var red = [27, 43, 70, 113, 183];
  var maxV = 183;
  svg += '<text x="8" y="12" fill="#ef4444" font-size="9" font-family="monospace">Red Series  (×φ)</text>';
  var x = 8;
  red.forEach(function(v, i) {
    var w = Math.round((v / maxV) * 120);
    svg += '<rect x="' + x + '" y="16" width="' + w + '" height="12" rx="2" fill="#ef4444" opacity="' + (0.3 + i*0.1) + '"/>';
    svg += '<text x="' + (x + w + 3) + '" y="26" fill="#ef4444" font-size="8" font-family="monospace">' + v + '</text>';
    x += w + 30;
    if (x > 250) x = 8;
  });
  // Blue series
  var blue = [43, 70, 113, 183, 226];
  svg += '<text x="8" y="52" fill="#3b82f6" font-size="9" font-family="monospace">Blue Series (×φ, offset)</text>';
  x = 8;
  blue.forEach(function(v, i) {
    var w = Math.round((v / maxV) * 120);
    svg += '<rect x="' + x + '" y="56" width="' + w + '" height="12" rx="2" fill="#3b82f6" opacity="' + (0.3 + i*0.1) + '"/>';
    svg += '<text x="' + (x + w + 3) + '" y="66" fill="#3b82f6" font-size="8" font-family="monospace">' + v + '</text>';
    x += w + 30;
    if (x > 250) x = 8;
  });
  // Human figure outline (simple)
  svg += '<line x1="247" y1="15" x2="247" y2="108" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2"/>';
  svg += '<circle cx="247" cy="12" r="5" fill="none" stroke="#f59e0b" stroke-width="1.2"/>';
  svg += '<text x="255" y="60" fill="#f59e0b" font-size="8" font-family="monospace">183 cm</text>';
  svg += '<line x1="247" y1="15" x2="270" y2="15" stroke="#f59e0b" stroke-width="0.8" opacity="0.5"/>';
  svg += '<text x="250" y="108" fill="#5c6480" font-size="8" font-family="monospace">Le Corbusier Modulor 1948</text>';
  svg += '</svg>';
  return svg;
}

function _svgTypeScale(ratio) {
  var r = ratio || 1.5;
  var base = 10;
  var sizes = [base];
  for (var i = 0; i < 5; i++) { sizes.push(Math.round(sizes[sizes.length-1] * r)); }
  var maxS = sizes[sizes.length-1];
  var svg = '<svg viewBox="0 0 290 90" class="diagram-svg" xmlns="http://www.w3.org/2000/svg">';
  var cols = ['#5c6480','#9fa8c0','#e8eaf0','#6c8eff','#f59e0b','#f472b6'];
  sizes.forEach(function(s, i) {
    var y = 12 + i * 14;
    var bw = Math.round((s / maxS) * 200);
    svg += '<rect x="60" y="' + (y-9) + '" width="' + bw + '" height="10" rx="2" fill="' + cols[i] + '" opacity="0.7"/>';
    svg += '<text x="54" y="' + y + '" fill="#9fa8c0" font-size="8" text-anchor="end" font-family="monospace">' + s + 'px</text>';
  });
  svg += '<text x="268" y="86" fill="#5c6480" font-size="8" text-anchor="end" font-family="monospace">×' + r.toFixed(3) + ' ratio</text>';
  svg += '</svg>';
  return svg;
}

function _svgSunflower() {
  var svg = '<svg viewBox="0 0 200 200" class="diagram-svg diagram-svg-sq" xmlns="http://www.w3.org/2000/svg">';
  var cx = 100, cy = 100;
  var goldenAngle = 2.39996; // radians = 137.508°
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="95" fill="none" stroke="#2d3347" stroke-width="0.5"/>';
  for (var n = 0; n < 144; n++) {
    var angle = n * goldenAngle;
    var r = 4.5 * Math.sqrt(n);
    if (r > 92) continue;
    var x = cx + r * Math.cos(angle);
    var y = cy + r * Math.sin(angle);
    var size = Math.max(1.5, 3 - r/50);
    var alpha = 0.4 + (r / 92) * 0.5;
    var hue = 30 + (n % 55) * 2;
    svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + size.toFixed(1) + '" fill="hsl(' + hue + ',70%,55%)" opacity="' + alpha.toFixed(2) + '"/>';
  }
  svg += '<text x="100" y="196" fill="#5c6480" font-size="8" text-anchor="middle" font-family="monospace">golden angle = 137.5° = 360°/φ²</text>';
  svg += '</svg>';
  return svg;
}

function _svgCircleOfFifths() {
  var svg = '<svg viewBox="0 0 200 200" class="diagram-svg diagram-svg-sq" xmlns="http://www.w3.org/2000/svg">';
  var cx = 100, cy = 100, r = 78;
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#2d3347" stroke-width="1.5"/>';
  var notes = ['C','G','D','A','E','B','F♯','D♭','A♭','E♭','B♭','F'];
  var cols = ['#6c8eff','#f59e0b','#10b981','#ec4899','#8b5cf6','#06b6d4','#f97316','#84cc16','#f59e0b','#a78bfa','#34d399','#f472b6'];
  notes.forEach(function(note, i) {
    var angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    var px = cx + r * Math.cos(angle);
    var py = cy + r * Math.sin(angle);
    svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="10" fill="' + cols[i] + '" opacity="0.2"/>';
    svg += '<text x="' + px.toFixed(1) + '" y="' + (py + 3.5).toFixed(1) + '" fill="' + cols[i] + '" font-size="9" font-weight="bold" text-anchor="middle" font-family="sans-serif">' + note + '</text>';
    // Line to center
    var nx = cx + (r - 15) * Math.cos(angle);
    var ny = cy + (r - 15) * Math.sin(angle);
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="' + cols[i] + '" stroke-width="0.5" opacity="0.3"/>';
  });
  svg += '<text x="100" y="104" fill="#5c6480" font-size="8" text-anchor="middle" font-family="monospace">3:2 steps</text>';
  svg += '</svg>';
  return svg;
}

// ── Lesson data ────────────────────────────────────────────────
var LEARN_LESSONS = [

  // ── Chapter 1: Music Theory ────────────────────────────────

  {
    id: 'interval-basics',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'What Is a Musical Interval?',
    subtitle: 'The ratio between two frequencies',
    badge: 'Foundation',
    body: [
      { type: 'p', text: 'A musical interval is the relationship between two pitches — expressed as a ratio of their frequencies. When one string vibrates at 440 Hz and another at 880 Hz, the ratio is 2:1. This is an octave: the simplest and most fundamental proportion in music.' },
      { type: 'diagram', title: 'Octave ratio 2:1 vs Fifth 3:2', svg: _svgRatioBars(3, 2, 'Perfect Fifth (f₂)', 'Root (f₁)') },
      { type: 'p', text: 'The ancient Greeks discovered that pleasing intervals correspond to simple whole-number ratios. The smaller the integers, the more consonant (smooth) the sound. This is the Pythagorean ideal: beauty arises from mathematical simplicity.' },
      { type: 'quote', text: 'There is geometry in the humming of the strings; there is music in the spacing of the spheres.', person: 'Pythagoras', role: 'Mathematician & Philosopher', year: 'c. 570–495 BCE' },
      { type: 'fact', text: 'Key insight: intervals are multiplicative, not additive. Going up an octave doubles the frequency; going up two octaves quadruples it.' },
      { type: 'h3', text: 'Fundamental Ratios' },
      { type: 'ratios', items: [
        { ratio: '1:1', name: 'Unison' },
        { ratio: '2:1', name: 'Octave' },
        { ratio: '3:2', name: 'Perfect Fifth' },
        { ratio: '4:3', name: 'Perfect Fourth' },
      ]},
      { type: 'examples', items: [
        { name: 'Pythagorean Monochord', domain: 'Physics', ratio: '2:1', desc: 'A string halved exactly produces the octave — the original ratio discovery' },
        { name: 'Gregorian Chant', domain: 'Music', ratio: '1:1', desc: 'Unison singing — the simplest possible interval relationship' },
        { name: 'Church Bells', domain: 'Acoustics', ratio: '3:2', desc: 'Bell pairs tuned to fifths ring together in natural resonance' },
        { name: 'Guitar Open Strings', domain: 'Music', ratio: '4:3', desc: 'Adjacent open strings are tuned to perfect fourths (except G–B)' },
      ]},
    ],
    demos: [
      { label: '▶ Hear Unison (1:1)', action: 'play-interval', intervalIdx: 0 },
      { label: '▶ Hear Octave (2:1)', action: 'play-interval', intervalIdx: 12 },
      { label: '▶ Hear Perfect Fifth (3:2)', action: 'play-interval', intervalIdx: 7 },
      { label: '🎹 See on Keyboard', action: 'select-interval', intervalIdx: 7, style: 'secondary' },
    ],
    quiz: {
      question: 'Which interval has the ratio 2:1?',
      options: ['Octave', 'Perfect Fifth', 'Perfect Fourth', 'Tritone'],
      correct: 0,
      feedback: 'Correct! The octave is the ratio 2:1 — the most fundamental proportion in music. It sounds like the "same note, higher."',
      hint: 'Think about which interval sounds like the same note in a higher register.',
    },
  },

  {
    id: 'harmonic-series',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'The Harmonic Series',
    subtitle: 'Nature\'s built-in scale',
    badge: 'Acoustics',
    body: [
      { type: 'p', text: 'When any string, pipe, or vocal cord vibrates, it doesn\'t just produce one frequency. It simultaneously produces the fundamental frequency and all its integer multiples — 2×, 3×, 4×, 5× … These overtones are the harmonic series.' },
      { type: 'diagram', title: 'Harmonics 1–8 and the intervals they generate', svg: _svgHarmonicLadder() },
      { type: 'p', text: 'The harmonic series is the physical origin of musical intervals. The ratio between the 2nd and 1st harmonic is 2:1 (octave). Between 3rd and 2nd: 3:2 (perfect fifth). Between 4th and 3rd: 4:3 (perfect fourth). Between 5th and 4th: 5:4 (major third).' },
      { type: 'quote', text: 'The sensation of a musical tone is due to a rapid periodic motion of the sonorous body; the sensation of a noise, to non-periodic motions.', person: 'Hermann von Helmholtz', role: 'Physicist & Physician', year: '1863 — On the Sensations of Tone' },
      { type: 'fact', text: 'This is why the Harmonic Series panel shows a summed waveform — you\'re literally seeing the physics of consonance drawn out in time.' },
      { type: 'h3', text: 'Interval origins in the series' },
      { type: 'ratios', items: [
        { ratio: '2:1', name: 'Harmonics 2÷1' },
        { ratio: '3:2', name: 'Harmonics 3÷2' },
        { ratio: '4:3', name: 'Harmonics 4÷3' },
        { ratio: '5:4', name: 'Harmonics 5÷4' },
      ]},
      { type: 'examples', items: [
        { name: 'Brass Instruments', domain: 'Music', ratio: 'H-series', desc: 'Trumpet, French horn — natural harmonics are all they can play without valves' },
        { name: 'Singing Bowls', domain: 'Acoustics', ratio: 'H-series', desc: 'Tibetan bowls ring with strong 2nd and 3rd harmonics — audibly musical' },
        { name: 'Vocal Formants', domain: 'Phonetics', ratio: 'H-series', desc: 'Vowel sounds are shaped by which harmonics the throat reinforces' },
        { name: 'Didgeridoo', domain: 'Music', ratio: 'H-series', desc: 'Circular breathing sustains the fundamental; skilled players add overtone melody' },
      ]},
    ],
    demos: [
      { label: '▶ Perfect Fifth — smooth wave', action: 'play-interval', intervalIdx: 7 },
      { label: '▶ Tritone — beating wave', action: 'play-interval', intervalIdx: 6 },
      { label: '🎵 Hear harmonics 1–4 as sequence', action: 'play-seq', freqs: [220, 440, 660, 880], gap: 0.7 },
      { label: '🌊 See Harmonic Waveform', action: 'close-and-show', panel: 'harmonic', intervalIdx: 7, style: 'secondary' },
    ],
    quiz: {
      question: 'The interval between the 3rd and 2nd harmonics gives which interval?',
      options: ['Perfect Fifth', 'Octave', 'Major Third', 'Perfect Fourth'],
      correct: 0,
      feedback: 'Correct! 3÷2 = 1.5, which is the perfect fifth. This is literally written into the physics of sound.',
      hint: 'Look at the ratios above: harmonics 3÷2.',
    },
  },

  {
    id: 'consonance',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'Consonance vs Dissonance',
    subtitle: 'Why some sounds feel smooth, others tense',
    badge: 'Perception',
    body: [
      { type: 'p', text: 'Consonance is the sense of stability or "smoothness" when two notes sound together. Dissonance is tension — the sense that the sound wants to resolve. This isn\'t purely cultural: it has a physical basis.' },
      { type: 'diagram', title: 'Waveform comparison: Perfect Fifth vs Tritone', svg: _svgWaveComparison() },
      { type: 'p', text: 'When two frequencies are played together, their waveforms interact. Simple integer ratios (3:2, 4:3) produce waveforms that repeat rapidly and regularly — the ear hears a stable, unified sound. Complex ratios (like 45:32) produce slow, irregular beating — the ear hears tension.' },
      { type: 'quote', text: 'Dissonances are just consonances that have not yet arrived at their destination.', person: 'Jean-Philippe Rameau', role: 'Composer & Music Theorist', year: '1722 — Traité de l\'Harmonie' },
      { type: 'fact', text: 'The psychoacoustic "roughness" of an interval depends on how close the two frequencies\' difference tones fall to audible beating rates (roughly 20–200 Hz).' },
      { type: 'h3', text: 'Consonance spectrum' },
      { type: 'ratios', items: [
        { ratio: '1:1', name: 'Perfect (unison)' },
        { ratio: '2:1', name: 'Perfect (octave)' },
        { ratio: '3:2', name: 'Open (P5th)' },
        { ratio: '45:32', name: 'Maximum dissonance' },
      ]},
    ],
    demos: [
      { label: '▶ Unison (pure consonance)', action: 'play-interval', intervalIdx: 0 },
      { label: '▶ Perfect Fifth (open)', action: 'play-interval', intervalIdx: 7 },
      { label: '▶ Tritone (tension)', action: 'play-interval', intervalIdx: 6 },
      { label: '🎵 Major chord (consonant)', action: 'play-chord', freqs: [264, 330, 396], style: 'secondary' },
      { label: '🎵 Diminished chord (dissonant)', action: 'play-chord', freqs: [264, 316.8, 374.2], style: 'secondary' },
      { label: '🌀 See Proportion Wheel', action: 'close-and-show', panel: 'wheel', intervalIdx: 6, style: 'tertiary' },
    ],
    quiz: {
      question: 'What makes the tritone (45:32) maximally dissonant?',
      options: [
        'Large integers in the ratio create complex beating patterns',
        'It has too many notes',
        'It was declared evil by the church',
        'It is too high-pitched',
      ],
      correct: 0,
      feedback: 'Exactly! The large integers 45 and 32 mean the waveforms repeat very slowly — the ear hears rapid, irregular beating rather than a unified tone.',
      hint: 'Think about what complex ratios do to waveform periodicity.',
    },
  },

  {
    id: 'perfect-intervals',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'Perfect Intervals',
    subtitle: 'P1, P4, P5, P8 — the anchors of harmony',
    badge: 'Theory',
    body: [
      { type: 'p', text: 'The "perfect" intervals — unison (P1), perfect fourth (P4), perfect fifth (P5), and octave (P8) — are called perfect because they sound stable in any context, from any direction (ascending or descending), in any key.' },
      { type: 'diagram', title: 'Circle of Fifths — built entirely from 3:2', svg: _svgCircleOfFifths() },
      { type: 'p', text: 'Pythagorean tuning is built entirely from stacked perfect fifths (3:2). The entire circle of fifths — the backbone of Western harmony — derives from this single proportion. Twelve fifths nearly (but not exactly) equal seven octaves, which is why equal temperament introduces tiny adjustments.' },
      { type: 'quote', text: 'In the beginning was the consonance of the fifth, and the fifth was the measure of all intervals.', person: 'Guido d\'Arezzo', role: 'Music Theorist & Pedagogue', year: 'c. 1025 — Micrologus' },
      { type: 'fact', text: 'In Gregorian chant and early polyphony (before ~1300 CE), only perfect intervals were permitted as consonances. Thirds and sixths were considered dissonant!' },
      { type: 'h3', text: 'The four perfect intervals' },
      { type: 'ratios', items: [
        { ratio: '1:1', name: 'Perfect Unison' },
        { ratio: '4:3', name: 'Perfect Fourth' },
        { ratio: '3:2', name: 'Perfect Fifth' },
        { ratio: '2:1', name: 'Perfect Octave' },
      ]},
    ],
    demos: [
      { label: '▶ Perfect Fourth (4:3)', action: 'play-interval', intervalIdx: 5 },
      { label: '▶ Perfect Fifth (3:2)', action: 'play-interval', intervalIdx: 7 },
      { label: '🎵 P1 → P4 → P5 → P8 sequence', action: 'play-seq', freqs: [440, 586.7, 660, 880], gap: 0.8 },
      { label: '🎹 All Perfects on Keyboard', action: 'highlight-all-demo', style: 'secondary' },
    ],
    quiz: {
      question: 'What tuning system is built entirely from stacked perfect fifths?',
      options: ['Pythagorean', 'Just Intonation', 'Equal Temperament', 'Meantone'],
      correct: 0,
      feedback: 'Correct! Pythagorean tuning stacks 3:2 fifths to generate all scale degrees. You can select "Pythagorean" in the tuning dropdown at the top of the dashboard.',
      hint: 'Look at the tuning dropdown in the header.',
    },
  },

  {
    id: 'major-intervals',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'Major Intervals',
    subtitle: 'M2, M3, M6, M7 — bright and open',
    badge: 'Theory',
    body: [
      { type: 'p', text: 'Major intervals are larger than their minor counterparts by a semitone. They have a characteristic "bright," open sound in Western musical culture. The major third (5:4) in particular is the foundation of major chords — which most listeners describe as happy or stable.' },
      { type: 'diagram', title: 'Major Third ratio 5:4', svg: _svgRatioBars(5, 4, 'Interval note (5)', 'Root note (4)') },
      { type: 'p', text: 'The major third\'s ratio 5:4 = 1.25 appears frequently in architecture. Palladio\'s room proportions, the Pantheon\'s drum-to-rotunda ratio, and many Renaissance window proportions use 5:4 as their governing module.' },
      { type: 'quote', text: 'The third is the sweetest consonance; it is the basis of harmony and modulation.', person: 'Jean-Philippe Rameau', role: 'Composer & Music Theorist', year: '1722' },
      { type: 'fact', text: 'The major sixth (5:3 = 1.667) is extremely close to the golden ratio φ (1.618). The minor sixth (8:5 = 1.6) is even closer. Both appear throughout nature and classical design.' },
      { type: 'h3', text: 'Major interval ratios' },
      { type: 'ratios', items: [
        { ratio: '9:8', name: 'Major Second' },
        { ratio: '5:4', name: 'Major Third' },
        { ratio: '5:3', name: 'Major Sixth' },
        { ratio: '15:8', name: 'Major Seventh' },
      ]},
      { type: 'examples', items: [
        { name: 'C Major Chord', domain: 'Music', ratio: '5:4', desc: 'Root + Major third (5:4) + Perfect fifth (3:2) — the fundamental "happy" chord' },
        { name: 'Beethoven\'s Fifth', domain: 'Music', ratio: '5:4', desc: 'Opening motif lands on the major third — dramatic then resolved' },
        { name: 'Pantheon Drum', domain: 'Architecture', ratio: '5:4', desc: 'Rome, 125 CE — drum height to rotunda diameter approximates 5:4' },
        { name: '"Do-Re-Mi" opening', domain: 'Music', ratio: '9:8', desc: 'The major second (9:8) is the first interval of a major scale' },
      ]},
    ],
    demos: [
      { label: '▶ Major Second (9:8)', action: 'play-interval', intervalIdx: 2 },
      { label: '▶ Major Third (5:4)', action: 'play-interval', intervalIdx: 4 },
      { label: '▶ Major Sixth (5:3)', action: 'play-interval', intervalIdx: 9 },
      { label: '🎵 Major chord A-C♯-E', action: 'play-chord', freqs: [220, 275, 330], style: 'secondary' },
      { label: '🎹 See Major Third (5:4)', action: 'select-interval', intervalIdx: 4, style: 'tertiary' },
    ],
    quiz: {
      question: 'The major third has which ratio?',
      options: ['5:4', '4:3', '6:5', '9:8'],
      correct: 0,
      feedback: 'Correct! 5:4 = 1.25 is the major third. It is the defining interval of a major chord, and appears in Palladio\'s room proportions.',
      hint: 'The major third is between the perfect fourth (4:3) and the major second (9:8).',
    },
  },

  {
    id: 'minor-intervals',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'Minor Intervals',
    subtitle: 'm2, m3, m6, m7 — darker, closer',
    badge: 'Theory',
    body: [
      { type: 'p', text: 'Minor intervals are a semitone smaller than their major counterparts. In Western culture, they carry a darker, more introspective character. The minor third (6:5) is the cornerstone of minor chords — often described as melancholic or serious.' },
      { type: 'diagram', title: 'Minor Sixth 8:5 — closest standard interval to φ', svg: _svgRatioBars(8, 5, 'Minor Sixth (8)', 'Root (5)') },
      { type: 'p', text: 'The minor sixth (8:5 = 1.6) is the interval closest to the golden ratio φ ≈ 1.618. Le Corbusier\'s Modulor proportioning system is based on 8:5 relationships, as are sunflower spiral counts (typically 8 and 13, or 13 and 21 — all Fibonacci numbers approximating 8:5).' },
      { type: 'quote', text: 'I wish I could convey to you the profound melancholy, the tender sadness that comes from the minor mode.', person: 'Frédéric Chopin', role: 'Composer & Pianist', year: 'c. 1830' },
      { type: 'fact', text: 'The minor seventh (16:9) is literally the standard widescreen aspect ratio — your TV, laptop, and phone screen are all proportioned by this musical interval.' },
      { type: 'h3', text: 'Minor interval ratios' },
      { type: 'ratios', items: [
        { ratio: '16:15', name: 'Minor Second' },
        { ratio: '6:5', name: 'Minor Third' },
        { ratio: '8:5', name: 'Minor Sixth' },
        { ratio: '16:9', name: 'Minor Seventh' },
      ]},
      { type: 'examples', items: [
        { name: 'TV / Laptop Screens', domain: 'Design', ratio: '16:9', desc: 'The global widescreen standard is the musical minor seventh interval' },
        { name: 'Le Corbusier Modulor', domain: 'Architecture', ratio: '8:5', desc: 'The Modulor\'s core ratio 8:5 ≈ φ governs all Unité d\'Habitation dimensions' },
        { name: 'Bach Cello Suite No.1', domain: 'Music', ratio: '6:5', desc: 'Opening Prélude establishes minor-third motif — melancholy and searching' },
        { name: 'Sunflower spirals', domain: 'Nature', ratio: '8:5', desc: 'Small sunflowers show 8 and 13 Fibonacci spirals — ratio 13:8 ≈ 1.625 ≈ φ' },
      ]},
    ],
    demos: [
      { label: '▶ Minor Third (6:5)', action: 'play-interval', intervalIdx: 3 },
      { label: '▶ Minor Sixth (8:5)', action: 'play-interval', intervalIdx: 8 },
      { label: '▶ Minor Seventh (16:9)', action: 'play-interval', intervalIdx: 10 },
      { label: '🎵 Minor chord A-C-E', action: 'play-chord', freqs: [220, 264, 330], style: 'secondary' },
      { label: '🎹 See Minor Sixth (8:5)', action: 'select-interval', intervalIdx: 8, style: 'tertiary' },
    ],
    quiz: {
      question: 'The minor seventh (16:9) corresponds to which common aspect ratio?',
      options: ['16:9 widescreen', '4:3 television', '1:1 square', '2.35:1 cinema'],
      correct: 0,
      feedback: 'Exactly! The 16:9 widescreen standard that defines modern screens is a musical interval — the minor seventh.',
      hint: 'Think about the shape of a modern laptop screen.',
    },
  },

  {
    id: 'tritone',
    chapter: 'Music Theory',
    chapterIdx: 1,
    title: 'The Tritone — Diabolus in Musica',
    subtitle: 'Maximum tension at the exact midpoint of the octave',
    badge: 'Advanced',
    body: [
      { type: 'p', text: 'The tritone splits the octave exactly in half — 6 semitones up from any note lands on its tritone. Because it divides the octave into two equal parts, it is maximally symmetrical, and maximally unstable.' },
      { type: 'diagram', title: 'Tritone at the exact midpoint of the octave', svg: _svgTritoneMidpoint() },
      { type: 'p', text: 'Medieval theorists called it "diabolus in musica" — the devil in music. Counterpoint rules for centuries explicitly forbade direct tritone motion. Yet in jazz and blues, the tritone substitution is one of the most powerful harmonic tools: it creates maximum tension that demands resolution.' },
      { type: 'quote', text: 'Mi contra fa est diabolus in musica.', person: 'Medieval Counterpoint Rule', role: 'Anon. — c. 1300 CE', year: '' },
      { type: 'fact', text: 'The tritone is the most dissonant interval because its ratio (45:32 in just intonation) contains the largest integers of any standard interval — creating waveforms that barely repeat.' },
      { type: 'examples', items: [
        { name: '"Maria" — West Side Story', domain: 'Music', ratio: '45:32', desc: 'Opening leap M7→TT — Bernstein used the forbidden interval to signal drama' },
        { name: 'The Simpsons Theme', domain: 'Music', ratio: '45:32', desc: 'Danny Elfman\'s main riff contains a prominent descending tritone' },
        { name: '"Purple Haze" — Hendrix', domain: 'Music', ratio: '45:32', desc: 'The opening riff is built around the E–B♭ tritone — raw electric tension' },
        { name: 'Black Sabbath (Black Sabbath)', domain: 'Music', ratio: '45:32', desc: 'Opening riff is a tritone — literally named "the devil\'s interval" in metal culture' },
      ]},
    ],
    demos: [
      { label: '▶ Tritone (45:32) — hear the tension', action: 'play-interval', intervalIdx: 6 },
      { label: '▶ Perfect Fifth (3:2) — compare resolution', action: 'play-interval', intervalIdx: 7 },
      { label: '🎵 Tritone → Fifth (resolution)', action: 'play-seq', freqs: [440, 622.25, 440, 660], gap: 0.6, style: 'secondary' },
      { label: '🌀 See on Wheel (midpoint)', action: 'close-and-show', panel: 'wheel', intervalIdx: 6, style: 'tertiary' },
    ],
    quiz: {
      question: 'Where does the tritone sit within the octave?',
      options: [
        'Exactly halfway — 6 of 12 semitones',
        'At 3 semitones',
        'At 9 semitones',
        'At 10 semitones',
      ],
      correct: 0,
      feedback: 'Correct! The tritone sits at exactly the midpoint of the octave (6/12 semitones), making it maximally far from both unison and octave — the two poles of consonance.',
      hint: 'The word "tritone" means "three tones" — three whole steps = 6 semitones.',
    },
  },

  // ── Chapter 2: Proportion ──────────────────────────────────

  {
    id: 'ratio-proportion',
    chapter: 'Proportion',
    chapterIdx: 2,
    title: 'Ratio & Proportion',
    subtitle: 'From music to space — the same language',
    badge: 'Principles',
    body: [
      { type: 'p', text: 'A ratio N:D expresses a relationship between two quantities. In music, N:D is the relationship between two frequencies. In architecture, N:D is the relationship between width and height. In typography, N:D is the relationship between successive text sizes. The underlying mathematics is identical.' },
      { type: 'diagram', title: 'One ratio — four domains', svg: _svgCrossDomain() },
      { type: 'p', text: 'Proportion is the governed use of ratios across a system — ensuring that parts relate to each other and to the whole in a consistent, harmonic way. When a building uses 3:2 proportions throughout (bay width to height, window width to height, room length to width), the whole "sounds" like a perfect fifth.' },
      { type: 'quote', text: 'Let no-one who is not a geometer enter here.', person: 'Plato\'s Academy Inscription', role: 'Athens', year: 'c. 380 BCE' },
      { type: 'fact', text: 'Pythagoras reportedly discovered musical proportions using a monochord — a single string divided at different points. He then applied the same ratios to cosmic models of planetary orbits, the "music of the spheres."' },
      { type: 'h3', text: 'The cross-domain principle' },
      { type: 'p', text: 'This dashboard exists to demonstrate one idea: the proportions that make music consonant are the same proportions that make buildings, typography, and natural forms beautiful. Use the Cross-Domain Analogies panel to explore examples across all domains.' },
    ],
    demos: [
      { label: '▶ Perfect Fifth (3:2)', action: 'play-interval', intervalIdx: 7 },
      { label: '📐 See Architecture (3:2)', action: 'close-and-show', panel: 'architecture', intervalIdx: 7 },
      { label: '🔡 See Typography (3:2)', action: 'close-and-show', panel: 'typography', intervalIdx: 7, style: 'secondary' },
      { label: '🌿 See Nature (3:2)', action: 'close-and-show', panel: 'nature', intervalIdx: 7, style: 'tertiary' },
    ],
    quiz: {
      question: 'When a building uses 3:2 proportions consistently throughout, it is analogous to which musical interval?',
      options: ['Perfect Fifth', 'Major Third', 'Minor Sixth', 'Tritone'],
      correct: 0,
      feedback: 'Correct! The perfect fifth has ratio 3:2. Architects like Palladio explicitly used musical interval ratios for room proportions.',
      hint: 'Look for the interval with ratio 3:2 in the sidebar.',
    },
  },

  {
    id: 'fibonacci-golden',
    chapter: 'Proportion',
    chapterIdx: 2,
    title: 'Fibonacci & The Golden Ratio',
    subtitle: 'φ = 1.618 — nature\'s favourite proportion',
    badge: 'Principles',
    body: [
      { type: 'p', text: 'The Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34 …) is generated by the simple rule: each number is the sum of the two before it. As the sequence grows, the ratio of consecutive terms converges on φ (phi) ≈ 1.6180339…' },
      { type: 'diagram', title: 'Golden Rectangle — subdivides into square + smaller φ rectangle', svg: _svgFibonacci() },
      { type: 'p', text: 'φ has the property that φ² = φ + 1, and 1/φ = φ - 1. This self-similar property means a rectangle with proportions φ:1 can be divided into a square and a smaller φ-rectangle — indefinitely. This is the golden rectangle.' },
      { type: 'quote', text: 'The golden section is the proportion of all proportions — it is the proportion of proportions.', person: 'Le Corbusier', role: 'Architect', year: '1948 — Le Modulor' },
      { type: 'fact', text: 'φ is not exactly a musical interval, but it sits between the minor sixth (8:5 = 1.600) and the major sixth (5:3 = 1.667). The nearest rational approximations from Fibonacci are 8:5, 13:8, 21:13 … converging to φ.' },
      { type: 'h3', text: 'Fibonacci in music and nature' },
      { type: 'p', text: 'Sunflower seeds arrange in 34 and 55 spirals (consecutive Fibonacci numbers). The cochlea of the inner ear spirals in a golden ratio. The Fibonacci panel in the dashboard shows how the golden spiral emerges from the rectangle subdivision.' },
      { type: 'examples', items: [
        { name: 'Parthenon, Athens', domain: 'Architecture', ratio: '≈φ', desc: '447 BCE — façade proportions and pediment height approximate the golden ratio' },
        { name: 'Bartók — Music for Strings', domain: 'Music', ratio: 'φ', desc: 'Béla Bartók structured climaxes at Fibonacci positions within movements' },
        { name: 'Nautilus Shell', domain: 'Nature', ratio: 'φ', desc: 'Chamber size grows by φ each revolution — logarithmic golden spiral' },
        { name: 'DNA Double Helix', domain: 'Biology', ratio: 'φ', desc: '34Å pitch, 21Å width — ratio 34:21 = 1.619 ≈ φ (Fibonacci pair)' },
      ]},
    ],
    demos: [
      { label: '▶ Minor Sixth (8:5) — nearest to φ', action: 'play-interval', intervalIdx: 8 },
      { label: '🌀 See Musical Golden Ratio panel', action: 'close-and-show', panel: 'golden-music', intervalIdx: 8 },
      { label: '🏛 See Golden Architecture', action: 'close-and-show', panel: 'golden-arch', intervalIdx: 8, style: 'secondary' },
    ],
    quiz: {
      question: 'Which musical interval is closest to the golden ratio φ ≈ 1.618?',
      options: ['Minor Sixth (8:5 = 1.600)', 'Major Sixth (5:3 = 1.667)', 'Perfect Fifth (3:2 = 1.500)', 'Major Third (5:4 = 1.250)'],
      correct: 0,
      feedback: 'Correct! 8:5 = 1.600 is the nearest standard interval to φ = 1.618. The major sixth (5:3 = 1.667) is also close, but further away.',
      hint: 'φ ≈ 1.618. Which ratio gives a decimal value closest to that?',
    },
  },

  {
    id: 'proportion-wheel',
    chapter: 'Proportion',
    chapterIdx: 2,
    title: 'The Proportion Wheel',
    subtitle: 'Reading the circle of intervals',
    badge: 'Visual',
    body: [
      { type: 'p', text: 'The Proportion Wheel arranges all 13 standard intervals in a circle, from unison (1:1) at 12 o\'clock, around to the octave (2:1) back at 12 o\'clock. The position of each interval is determined by its cent value — its logarithmic distance through the octave.' },
      { type: 'diagram', title: 'Proportion Wheel — all intervals in logarithmic space', svg: _svgProportionWheelSimple() },
      { type: 'p', text: 'Intervals that sit opposite each other on the wheel are "complement" pairs — they add up to an octave. The tritone sits at 6 o\'clock, exactly opposite the unison/octave, confirming its role as the most distant interval from stability.' },
      { type: 'quote', text: 'Music is the arithmetic of sounds as optics is the geometry of light.', person: 'Claude Debussy', role: 'Composer', year: 'c. 1900' },
      { type: 'fact', text: 'The wheel is drawn in logarithmic space (cents), not linear frequency space. This is why the keyboard looks the same in every octave: our ears perceive pitch logarithmically.' },
    ],
    demos: [
      { label: '🌀 Open Proportion Wheel panel', action: 'close-and-show', panel: 'wheel', intervalIdx: 7 },
      { label: '▶ Hear Tritone (6 o\'clock)', action: 'play-interval', intervalIdx: 6 },
      { label: '▶ Hear Octave (12 o\'clock)', action: 'play-interval', intervalIdx: 12 },
    ],
    quiz: {
      question: 'Where does the tritone sit on the Proportion Wheel?',
      options: [
        'At 6 o\'clock — opposite unison/octave',
        'At 3 o\'clock',
        'At 9 o\'clock',
        'Beside the octave at 12 o\'clock',
      ],
      correct: 0,
      feedback: 'Correct! The tritone is exactly 600 cents — half of 1200 cents (one octave) — so it sits at exactly 6 o\'clock, the point of maximum distance from both unison and octave.',
      hint: 'The tritone splits the octave exactly in half.',
    },
  },

  // ── Chapter 3: Architectural Design Theory ────────────────

  {
    id: 'three-orders',
    chapter: 'Architectural Design Theory',
    chapterIdx: 3,
    title: 'The Three Classical Orders',
    subtitle: 'Doric, Ionic, Corinthian — systems of proportion',
    badge: 'Architecture',
    body: [
      { type: 'p', text: 'The three Greek classical orders are not just decorative styles — each is a complete proportional system specifying the relationship between every element from the column base to the pediment cornice.' },
      { type: 'diagram', title: 'Doric (6:1) — Ionic (8:1) — Corinthian (10:1)', svg: _svgThreeOrders() },
      { type: 'p', text: 'The Doric order is the most austere: column height = 6 diameters (6:1). The Ionic is more elegant: 8:1. The Corinthian, the most ornate, reaches 10:1. These ratios govern not just columns but every sub-element through a hierarchy of "modules."' },
      { type: 'quote', text: 'The Doric order will have the proportions and the severity of man; the Ionic, the slenderness and ornament of woman.', person: 'Vitruvius', role: 'Architect & Engineer', year: 'c. 25 BCE — De Architectura' },
      { type: 'fact', text: 'Vitruvius (c. 80–15 BCE) codified these systems in "De Architectura" — the only surviving architectural treatise from antiquity. He described a module (the column diameter) as the basic unit from which all other proportions derive.' },
      { type: 'h3', text: 'Order proportions' },
      { type: 'ratios', items: [
        { ratio: '6:1', name: 'Doric column H:D' },
        { ratio: '8:1', name: 'Ionic column H:D' },
        { ratio: '10:1', name: 'Corinthian H:D' },
        { ratio: 'N:D', name: 'Facade W:H (interval)' },
      ]},
      { type: 'examples', items: [
        { name: 'Parthenon', domain: 'Architecture', ratio: '6:1 (Doric)', desc: 'Athens, 447 BCE — 8 × 17 Doric columns, Ictinus & Callicrates' },
        { name: 'Erechtheion', domain: 'Architecture', ratio: '8:1 (Ionic)', desc: 'Athens, 421 BCE — home of the famous Caryatid porch' },
        { name: 'Pantheon Portico', domain: 'Architecture', ratio: '10:1 (Corinthian)', desc: 'Rome, 125 CE — 16 Corinthian granite columns, each 11.8m tall' },
        { name: 'Temple of Zeus, Olympia', domain: 'Architecture', ratio: '6:1 (Doric)', desc: 'Largest Doric temple in mainland Greece — held the statue of Zeus' },
      ]},
    ],
    demos: [
      { label: '🏛 Doric facade (5th = 3:2)', action: 'close-and-show', panel: 'architecture-doric', intervalIdx: 7 },
      { label: '🏛 Ionic facade', action: 'switch-treatment', treatment: 'ionic' },
      { label: '🏛 Corinthian facade', action: 'switch-treatment', treatment: 'corinthian' },
    ],
    quiz: {
      question: 'The Ionic column height-to-diameter ratio is:',
      options: ['8:1', '6:1', '10:1', '4:1'],
      correct: 0,
      feedback: 'Correct! Ionic columns are 8 diameters tall — more slender than Doric (6:1) and less extravagant than Corinthian (10:1).',
      hint: 'Doric=6, Ionic=?, Corinthian=10.',
    },
  },

  {
    id: 'classical-proportion',
    chapter: 'Architectural Design Theory',
    chapterIdx: 3,
    title: 'Classical Proportion',
    subtitle: 'Palladio, Vitruvius, and the musical room',
    badge: 'Architecture',
    body: [
      { type: 'p', text: 'Andrea Palladio (1508–1580) was the most influential architect of the Renaissance. In "I Quattro Libri dell\'Architettura," he specified that rooms should have proportions that are "musical" — literally using the same ratios as musical intervals.' },
      { type: 'diagram', title: 'Palladio\'s seven room proportions', svg: _svgPalladioRooms() },
      { type: 'p', text: 'Palladio listed seven "most beautiful and proportionable" room shapes: circular; square (1:1); the square and a third (4:3); the square and a half (3:2); the square and two thirds (5:3); two squares (2:1); and the diagonal of the square (√2:1). These are almost exactly the consonant intervals of just intonation.' },
      { type: 'quote', text: 'The proportions of voices are harmonies for the ears; those of measurements are harmonies for the eyes. Such harmonies usually please very much, without anyone knowing why.', person: 'Andrea Palladio', role: 'Architect', year: '1570 — I Quattro Libri' },
      { type: 'fact', text: 'Villa Rotonda (1566), Palladio\'s most famous work, uses the perfect fifth (3:2) as its primary room proportion. The square dome-to-base ratio is 2:1 (octave). The whole composition is a built chord.' },
      { type: 'examples', items: [
        { name: 'Villa Rotonda', domain: 'Architecture', ratio: '3:2', desc: 'Vicenza, 1566 — Palladio\'s masterpiece; primary rooms are perfect fifths' },
        { name: 'Palazzo Chiericati', domain: 'Architecture', ratio: '1:1 + 2:1', desc: 'Vicenza, 1550 — square rooms (1:1) and double-height loggia (2:1)' },
        { name: 'St. Paul\'s Cathedral, nave', domain: 'Architecture', ratio: '≈3:2', desc: 'London, 1710 — Wren\'s nave width:height approaches the perfect fifth' },
        { name: 'Farnese Palace sala', domain: 'Architecture', ratio: '≈3:2', desc: 'Rome, 1517 — Antonio da Sangallo\'s great hall in 3:2 proportion' },
      ]},
    ],
    demos: [
      { label: '▶ Perfect Fifth (Palladio\'s room)', action: 'play-interval', intervalIdx: 7 },
      { label: '🏛 Classical facade analysis', action: 'close-and-show', panel: 'architecture', intervalIdx: 7 },
      { label: '🏛 Switch to 4:3 (Perfect Fourth)', action: 'select-and-show', intervalIdx: 5, style: 'secondary' },
    ],
    quiz: {
      question: 'Palladio described room proportions using which analogy?',
      options: ['Musical intervals', 'Human body proportions', 'Planetary orbits', 'Fibonacci spirals'],
      correct: 0,
      feedback: 'Correct! Palladio explicitly listed musical interval ratios as the most beautiful room shapes, citing Vitruvius\'s theory of harmonic proportion.',
      hint: 'Think about what this dashboard is demonstrating.',
    },
  },

  {
    id: 'modernist-proportion',
    chapter: 'Architectural Design Theory',
    chapterIdx: 3,
    title: 'Modernist Proportion',
    subtitle: 'The grid, curtain wall, and brise-soleil',
    badge: 'Architecture',
    body: [
      { type: 'p', text: 'Modernist architects rejected classical ornament but not proportion. Mies van der Rohe\'s grid, Le Corbusier\'s pilotis and ribbon windows, and the International Style curtain wall all derive their visual quality from rigorous proportional systems.' },
      { type: 'diagram', title: 'Curtain Wall — bay:floor ratio determines visual rhythm', svg: _svgCurtainWall() },
      { type: 'p', text: 'The curtain wall — a glass and metal skin hanging from the structural frame — achieves its rhythm from the bay module. When bay width:floor height uses a simple ratio, the facade has musical order. When it is arbitrary, it feels chaotic.' },
      { type: 'quote', text: 'Less is more.', person: 'Ludwig Mies van der Rohe', role: 'Architect', year: 'c. 1947' },
      { type: 'fact', text: 'Mies\'s Seagram Building (1958) uses a bay module that approximates the golden ratio. The bronze mullions are spaced at 3:2 from the structural bays — a perfect fifth in steel and glass.' },
      { type: 'examples', items: [
        { name: 'Seagram Building', domain: 'Architecture', ratio: '≈3:2', desc: 'New York, 1958 — Mies van der Rohe; bay:floor = perfect fifth proportion' },
        { name: 'Lever House', domain: 'Architecture', ratio: '≈5:4', desc: 'New York, 1952 — Skidmore, Owings & Merrill; first curtain wall skyscraper' },
        { name: 'Farnsworth House', domain: 'Architecture', ratio: '≈3:2', desc: 'Illinois, 1951 — Mies; glass box with 3:2 bay-to-height proportion' },
        { name: 'Unité d\'Habitation', domain: 'Architecture', ratio: 'φ', desc: 'Marseille, 1952 — Le Corbusier; every dimension is a Modulor value' },
      ]},
    ],
    demos: [
      { label: '🏙 Curtain Wall (3:2)', action: 'switch-modernist', treatment: 'curtain', intervalIdx: 7 },
      { label: '🏙 Frame treatment', action: 'switch-modernist', treatment: 'frame' },
      { label: '🏙 Brise-Soleil', action: 'switch-modernist', treatment: 'brise', style: 'secondary' },
    ],
    quiz: {
      question: 'What gives a modernist curtain wall its visual rhythm?',
      options: ['The proportional module of bay width to floor height', 'The choice of glass color', 'The number of floors', 'The building\'s location'],
      correct: 0,
      feedback: 'Correct! The bay module — the ratio of bay width to floor height — determines whether a curtain wall has musical order or arbitrary chaos.',
      hint: 'Think about what creates rhythm in both music and facades.',
    },
  },

  {
    id: 'modulor',
    chapter: 'Architectural Design Theory',
    chapterIdx: 3,
    title: 'Le Corbusier & The Modulor',
    subtitle: 'Human scale meets the golden ratio',
    badge: 'Architecture',
    body: [
      { type: 'p', text: 'In 1948, Le Corbusier published "Le Modulor" — a proportioning system based on the golden ratio and the human body. Starting from a 6-foot man (183 cm) with raised arm reaching 226 cm, he derived two interleaved Fibonacci-like series in the ratio φ.' },
      { type: 'diagram', title: 'Modulor: Red Series and Blue Series (×φ each step)', svg: _svgModulor() },
      { type: 'p', text: 'The Red Series: 6, 9.7, 15.7, 25.4, 41.1, 66.5, 107.5, 174, 281 … (each term × φ). The Blue Series: 11.3, 18.2, 29.5, 47.7 … The two series together cover all dimensions needed for human-scale architecture.' },
      { type: 'quote', text: 'A man-with-arm-upraised provides, at the determining points of his occupation of space — foot, solar plexus, head, tips of upraised fingers — a series of golden sections.', person: 'Le Corbusier', role: 'Architect', year: '1948 — Le Modulor' },
      { type: 'fact', text: 'Corbusier used the Modulor on the Unité d\'Habitation (1952) in Marseille — every room dimension, every corridor width, every step height is a Modulor value. Residents reported it felt "inexplicably right."' },
      { type: 'examples', items: [
        { name: 'Unité d\'Habitation', domain: 'Architecture', ratio: 'Modulor', desc: 'Marseille, 1952 — 337 apartments; every dimension from the Modulor series' },
        { name: 'Chandigarh Capitol', domain: 'Architecture', ratio: 'Modulor', desc: 'India, 1953 — Le Corbusier\'s city plan uses Modulor at all scales' },
        { name: 'Carpenter Center, Harvard', domain: 'Architecture', ratio: 'Modulor', desc: 'Cambridge, 1963 — only Corbusier building in North America; Modulor-governed' },
        { name: 'Sainte-Marie de La Tourette', domain: 'Architecture', ratio: 'Modulor', desc: 'France, 1960 — monastery where Modulor creates varied but harmonious cells' },
      ]},
    ],
    demos: [
      { label: '▶ Minor Sixth (8:5 ≈ φ)', action: 'play-interval', intervalIdx: 8 },
      { label: '🏛 Modulor panel', action: 'close-and-show', panel: 'modulor', intervalIdx: 8 },
      { label: '🌀 Golden spiral (Fibonacci)', action: 'close-and-show', panel: 'golden-music', intervalIdx: 8, style: 'secondary' },
    ],
    quiz: {
      question: 'Le Corbusier\'s Modulor starts from which measurement?',
      options: [
        'A 6-foot man with raised arm (226 cm total reach)',
        'The height of the Parthenon',
        'A Fibonacci number sequence',
        'The meter standard from the French Revolution',
      ],
      correct: 0,
      feedback: 'Correct! The Modulor starts from a 6-foot man (183 cm) with arm raised to 226 cm, then derives the golden-ratio series from that human baseline.',
      hint: 'Think about what "human scale" means and how Corbusier grounded his system.',
    },
  },

  // ── Chapter 4: Cross-Domain ────────────────────────────────

  {
    id: 'music-architecture',
    chapter: 'Cross-Domain',
    chapterIdx: 4,
    title: 'Music Meets Architecture',
    subtitle: '3:2 rooms and perfect fifths — the same proportion',
    badge: 'Cross-Domain',
    body: [
      { type: 'p', text: 'The perfect fifth (3:2) is perhaps the clearest example of music and architecture sharing a common proportion. In music: 3:2 is the most consonant interval after the octave. In architecture: a room with length:width = 3:2 feels naturally proportioned and is described as "spacious but intimate."' },
      { type: 'diagram', title: 'The 3:2 ratio across all four domains', svg: _svgCrossDomain() },
      { type: 'p', text: 'The analogy runs deep. Just as stacked fifths generate the circle of fifths (the foundation of harmonic progression), stacked 3:2 rooms generate a building\'s floor plan with self-similar proportions at every scale.' },
      { type: 'quote', text: 'Architecture is frozen music.', person: 'Arthur Schopenhauer', role: 'Philosopher', year: '1819 — The World as Will and Representation' },
      { type: 'fact', text: 'Alberti, Palladio, and Wren all specified 3:2 rooms in their theoretical writings. The proportions of many great chambers — St. Paul\'s Cathedral nave, the Farnese Palace sala — are close to 3:2.' },
      { type: 'h3', text: 'Cross-domain correspondences' },
      { type: 'ratios', items: [
        { ratio: '3:2', name: 'Music: Perfect Fifth' },
        { ratio: '3:2', name: 'Architecture: Room' },
        { ratio: '3:2', name: 'Typography: Scale ratio' },
        { ratio: '3:2', name: 'Design: Golden-ish rect.' },
      ]},
    ],
    demos: [
      { label: '▶ Perfect Fifth (3:2)', action: 'play-interval', intervalIdx: 7 },
      { label: '📋 See Cross-Domain Cards', action: 'close-and-show', panel: 'analogy', intervalIdx: 7 },
      { label: '🏛 See 3:2 Facade', action: 'close-and-show', panel: 'architecture', intervalIdx: 7, style: 'secondary' },
    ],
    quiz: {
      question: 'A room with length:width = 3:2 corresponds to which musical interval?',
      options: ['Perfect Fifth', 'Major Third', 'Perfect Fourth', 'Octave'],
      correct: 0,
      feedback: 'Correct! 3:2 is the perfect fifth in music and a "naturally proportioned" room in architecture. Palladio listed it as one of the most beautiful room shapes.',
      hint: 'Match the ratio 3:2 to the interval list in the sidebar.',
    },
  },

  {
    id: 'natures-numbers',
    chapter: 'Cross-Domain',
    chapterIdx: 4,
    title: 'Nature\'s Numbers',
    subtitle: 'Sunflowers, DNA, nautilus — the same ratios',
    badge: 'Cross-Domain',
    body: [
      { type: 'p', text: 'The proportions that make music consonant and buildings beautiful appear throughout the natural world — not by design, but because they are the most efficient solutions to growth and packing problems.' },
      { type: 'diagram', title: 'Sunflower: seeds arranged at the golden angle (137.5°)', svg: _svgSunflower() },
      { type: 'p', text: 'Sunflower seed spirals: 34 clockwise, 55 counterclockwise. Ratio: 55:34 ≈ 1.618 (φ). Pine cone scales: 8 and 13 spirals. Ratio: 13:8 = 1.625 (approaches φ). The nautilus shell: each chamber is 1/φ of the previous. DNA helix: 34 Å pitch, 21 Å width — ratio 34:21 ≈ 1.619 (φ).' },
      { type: 'quote', text: 'The golden ratio is the most irrational of all irrational numbers — it is as far from any fraction as it is possible to be.', person: 'Mario Livio', role: 'Astrophysicist & Author', year: '2002 — The Golden Ratio' },
      { type: 'fact', text: 'These proportions arise from optimal packing. Sunflower seeds grow at an angle of 137.5° — the "golden angle" (360° ÷ φ²). This angle ensures the maximum packing density for any number of seeds.' },
      { type: 'examples', items: [
        { name: 'Sunflower (Helianthus)', domain: 'Botany', ratio: '34:55', desc: 'Seed spirals always consecutive Fibonacci numbers; ratio → φ' },
        { name: 'Nautilus Pompilius', domain: 'Zoology', ratio: 'φ', desc: 'Each new chamber grows by factor φ — perfect logarithmic spiral' },
        { name: 'DNA Double Helix', domain: 'Biology', ratio: '34:21', desc: '34Å pitch, 21Å width — ratio 1.619 ≈ φ (Fibonacci 34 and 21)' },
        { name: 'Pinecone scales', domain: 'Botany', ratio: '8:13', desc: '8 spirals one way, 13 another — consecutive Fibonacci, ratio 1.625 ≈ φ' },
      ]},
    ],
    demos: [
      { label: '▶ Minor Sixth (8:5 ≈ φ)', action: 'play-interval', intervalIdx: 8 },
      { label: '🌿 See Fractal Tree (8:5)', action: 'close-and-show', panel: 'nature', intervalIdx: 8 },
      { label: '🌿 See Fractal Tree (Tritone)', action: 'close-and-show', panel: 'nature', intervalIdx: 6, style: 'secondary' },
    ],
    quiz: {
      question: 'Sunflower seed spirals typically show which number pair from the Fibonacci sequence?',
      options: ['34 and 55', '10 and 20', '12 and 24', '7 and 14'],
      correct: 0,
      feedback: 'Correct! 34 and 55 are consecutive Fibonacci numbers, and their ratio (55/34 ≈ 1.618) approximates the golden ratio φ.',
      hint: 'Think about Fibonacci numbers near 30–60.',
    },
  },

  {
    id: 'typography-scale',
    chapter: 'Cross-Domain',
    chapterIdx: 4,
    title: 'Typography as Scale',
    subtitle: 'Type scales = interval ratios',
    badge: 'Cross-Domain',
    body: [
      { type: 'p', text: 'A typographic scale is a system for relating font sizes. The most rational approach is to multiply each size by a fixed ratio — exactly like the ratio between musical intervals. This is the "modular scale" approach popularised by Tim Brown.' },
      { type: 'diagram', title: 'Type scale based on Perfect Fifth (×1.500)', svg: _svgTypeScale(1.5) },
      { type: 'p', text: 'The most common type scale ratio is 1.5 (3:2 — perfect fifth). Start with 16px body text and multiply: 24, 36, 54, 81 … This generates sizes that feel naturally hierarchical because the ratio 3:2 is inherently harmonious.' },
      { type: 'quote', text: 'A modular scale, like a musical scale, is a prearranged set of harmonious proportions.', person: 'Tim Brown', role: 'Typographer & Designer', year: '2010 — "More Meaningful Typography"' },
      { type: 'fact', text: 'Other common type scale ratios: Major Third (5:4 = 1.25) for compact scales, Minor Sixth (8:5 = 1.6) for dramatic scales. The Perfect Fourth (4:3 ≈ 1.333) creates Google\'s Material Design type scale.' },
      { type: 'h3', text: 'Musical type scales' },
      { type: 'ratios', items: [
        { ratio: '5:4', name: 'Compact (Major Third)' },
        { ratio: '4:3', name: 'Material Design (P4)' },
        { ratio: '3:2', name: 'Classic (Perfect Fifth)' },
        { ratio: '8:5', name: 'Dramatic (Minor Sixth)' },
      ]},
      { type: 'examples', items: [
        { name: 'PROPORTION dashboard', domain: 'Typography', ratio: '3:2', desc: 'This very app uses a 3:2 type scale — observe heading sizes relative to body' },
        { name: 'Google Material Design', domain: 'Typography', ratio: '4:3', desc: 'Material type scale uses P4 ratio for harmonious sizing across UI components' },
        { name: 'Traditional Book Typography', domain: 'Typography', ratio: '≈3:2', desc: 'Classical book typography (Garamond era) used near-fifth hierarchical scales' },
        { name: 'modularscale.com', domain: 'Web', ratio: 'Various', desc: 'Tim Brown\'s tool lets you pick any musical interval as your type scale' },
      ]},
    ],
    demos: [
      { label: '🔡 See Typography (P5 scale)', action: 'close-and-show', panel: 'typography', intervalIdx: 7 },
      { label: '🔡 See Typography (M3 scale)', action: 'close-and-show', panel: 'typography', intervalIdx: 4, style: 'secondary' },
      { label: '▶ Hear Minor Sixth scale', action: 'play-interval', intervalIdx: 8 },
    ],
    quiz: {
      question: 'The Perfect Fifth ratio (3:2 = 1.5) applied to a 16px base gives which next size?',
      options: ['24px', '20px', '32px', '18px'],
      correct: 0,
      feedback: 'Correct! 16 × 1.5 = 24px. Continue: 24 × 1.5 = 36px, 36 × 1.5 = 54px … This is a harmonious typographic scale based on the most consonant musical interval.',
      hint: 'Multiply 16 by the ratio 3/2 = 1.5.',
    },
  },

]; // end LEARN_LESSONS

// ── Progress tracking ─────────────────────────────────────────
var _learnProgress = [];
var _learnCurrentIdx = 0;
var _learnQuizAnswered = false;
var _learnQuizCorrect = false;

function _loadLearnProgress() {
  try {
    var raw = localStorage.getItem('PROPORTION_learn_progress');
    _learnProgress = raw ? JSON.parse(raw) : [];
  } catch(e) { _learnProgress = []; }
}

function _saveLearnProgress() {
  try { localStorage.setItem('PROPORTION_learn_progress', JSON.stringify(_learnProgress)); } catch(e) {}
}

function _markLessonComplete(lessonId) {
  if (_learnProgress.indexOf(lessonId) === -1) {
    _learnProgress.push(lessonId);
    _saveLearnProgress();
  }
}

// ── Overlay open/close ────────────────────────────────────────
function openLearnOverlay() {
  _loadLearnProgress();
  var overlay = document.getElementById('learn-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  _renderLearnNav();
  _renderLesson(_learnCurrentIdx);
  _updateLearnProgress();
}

function closeLearnOverlay() {
  var overlay = document.getElementById('learn-overlay');
  if (overlay) overlay.classList.remove('open');
}

// ── Navigation sidebar ────────────────────────────────────────
function _renderLearnNav() {
  var nav = document.getElementById('learn-nav');
  if (!nav) return;
  nav.innerHTML = '';

  var lastChapter = 0;
  LEARN_LESSONS.forEach(function(lesson, idx) {
    if (lesson.chapterIdx !== lastChapter) {
      lastChapter = lesson.chapterIdx;
      var ch = document.createElement('div');
      ch.className = 'learn-chapter-header';
      ch.textContent = 'Chapter ' + lesson.chapterIdx + ' — ' + lesson.chapter;
      nav.appendChild(ch);
    }
    var item = document.createElement('div');
    var isDone = _learnProgress.indexOf(lesson.id) !== -1;
    item.className = 'learn-nav-item' +
      (idx === _learnCurrentIdx ? ' active' : '') +
      (isDone ? ' done' : '');
    item.innerHTML =
      '<span class="learn-nav-num">' + (idx + 1) + '.</span>' +
      '<span>' + lesson.title + '</span>';
    (function(i) {
      item.addEventListener('click', function() { _renderLesson(i); });
    })(idx);
    nav.appendChild(item);
  });
}

// ── Lesson rendering ──────────────────────────────────────────
function _renderLesson(idx) {
  if (idx < 0 || idx >= LEARN_LESSONS.length) return;
  _learnCurrentIdx = idx;
  _learnQuizAnswered = false;
  _learnQuizCorrect = false;

  var navItems = document.querySelectorAll('.learn-nav-item');
  navItems.forEach(function(item, i) { item.classList.toggle('active', i === idx); });

  var lesson = LEARN_LESSONS[idx];
  var content = document.getElementById('learn-content');
  if (!content) return;

  var html = '<div class="lesson-card">';

  // Intro
  html += '<div class="lesson-intro">';
  html += '<span class="lesson-badge chapter-' + lesson.chapterIdx + '">' + lesson.badge + '</span>';
  html += '<h2 class="lesson-title">' + lesson.title + '</h2>';
  html += '<p class="lesson-subtitle">' + lesson.subtitle + '</p>';
  html += '</div>';

  // Body
  html += '<div class="lesson-body">';
  lesson.body.forEach(function(block) {
    if (block.type === 'p') {
      html += '<p>' + block.text + '</p>';
    } else if (block.type === 'h3') {
      html += '<h3>' + block.text + '</h3>';
    } else if (block.type === 'fact') {
      html += '<div class="lesson-fact-box key-fact">' + block.text + '</div>';
    } else if (block.type === 'ratios') {
      html += '<div class="lesson-ratio-display">';
      block.items.forEach(function(item) {
        html += '<div class="lesson-ratio-chip">' +
          '<span class="chip-ratio">' + item.ratio + '</span>' +
          '<span class="chip-name">' + item.name + '</span>' +
          '</div>';
      });
      html += '</div>';
    } else if (block.type === 'diagram') {
      html += '<div class="lesson-diagram">';
      if (block.title) html += '<div class="lesson-diagram-title">' + block.title + '</div>';
      html += block.svg;
      html += '</div>';
    } else if (block.type === 'quote') {
      html += '<blockquote class="lesson-quote">' +
        '<p class="lesson-quote-text">"' + block.text + '"</p>' +
        '<footer class="lesson-quote-footer">' +
          '<span class="lesson-quote-person">' + block.person + '</span>' +
          '<span class="lesson-quote-role">' + block.role + (block.year ? ', ' + block.year : '') + '</span>' +
        '</footer>' +
        '</blockquote>';
    } else if (block.type === 'examples') {
      html += '<div class="lesson-examples-grid">';
      block.items.forEach(function(ex) {
        html += '<div class="lesson-example-card">' +
          '<div class="example-header">' +
            '<span class="example-name">' + ex.name + '</span>' +
            '<span class="example-ratio">' + ex.ratio + '</span>' +
          '</div>' +
          '<div class="example-domain">' + ex.domain + '</div>' +
          '<div class="example-desc">' + ex.desc + '</div>' +
          '</div>';
      });
      html += '</div>';
    }
  });
  html += '</div>';

  // Demo buttons
  if (lesson.demos && lesson.demos.length > 0) {
    html += '<div class="lesson-demos">';
    lesson.demos.forEach(function(demo, di) {
      var cls = 'demo-btn ' + (demo.style || '');
      html += '<button class="' + cls.trim() + '" data-demo-idx="' + di + '">' + demo.label + '</button>';
    });
    html += '</div>';
  }

  // Quiz
  if (lesson.quiz) {
    html += '<div class="lesson-quiz" id="lesson-quiz">';
    html += '<div class="quiz-question">🧠 ' + lesson.quiz.question + '</div>';
    html += '<div class="quiz-options">';
    lesson.quiz.options.forEach(function(opt, oi) {
      html += '<button class="quiz-option" data-opt-idx="' + oi + '">' + opt + '</button>';
    });
    html += '</div>';
    html += '<div class="quiz-feedback" id="quiz-feedback"></div>';
    html += '</div>';
  }

  // Lesson nav
  html += '<div class="lesson-nav-row">';
  if (idx > 0) {
    html += '<button class="lesson-nav-btn" id="btn-prev-lesson">← Previous</button>';
  } else {
    html += '<span></span>';
  }
  html += '<span class="lesson-counter">' + (idx + 1) + ' / ' + LEARN_LESSONS.length + '</span>';
  if (idx < LEARN_LESSONS.length - 1) {
    html += '<button class="lesson-nav-btn primary-nav" id="btn-next-lesson">Next →</button>';
  } else {
    html += '<button class="lesson-nav-btn primary-nav" id="btn-next-lesson">Finish ✓</button>';
  }
  html += '</div>';

  html += '</div>'; // .lesson-card
  content.innerHTML = html;
  content.scrollTop = 0;

  // Wire demo buttons
  content.querySelectorAll('.demo-btn').forEach(function(btn) {
    var di = +btn.dataset.demoIdx;
    btn.addEventListener('click', function() {
      _runDemoAction(lesson.demos[di]);
    });
  });

  // Wire quiz
  if (lesson.quiz) {
    content.querySelectorAll('.quiz-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (_learnQuizAnswered) return;
        var oi = +btn.dataset.optIdx;
        _handleQuizAnswer(lesson, oi);
      });
    });
  }

  // Wire nav buttons
  var prevBtn = document.getElementById('btn-prev-lesson');
  if (prevBtn) prevBtn.addEventListener('click', function() { _renderLesson(idx - 1); });
  var nextBtn = document.getElementById('btn-next-lesson');
  if (nextBtn) nextBtn.addEventListener('click', function() {
    if (idx < LEARN_LESSONS.length - 1) {
      _renderLesson(idx + 1);
    } else {
      closeLearnOverlay();
    }
  });
}

// ── Quiz handling ─────────────────────────────────────────────
function _handleQuizAnswer(lesson, optIdx) {
  _learnQuizAnswered = true;
  var isCorrect = (optIdx === lesson.quiz.correct);
  _learnQuizCorrect = isCorrect;

  var opts = document.querySelectorAll('.quiz-option');
  opts.forEach(function(b) { b.classList.add('answered'); });

  if (isCorrect) {
    opts[optIdx].classList.add('correct');
    var fb = document.getElementById('quiz-feedback');
    if (fb) {
      fb.className = 'quiz-feedback success';
      fb.textContent = '✓ ' + lesson.quiz.feedback;
    }
    _markLessonComplete(lesson.id);
    _updateLearnProgress();
    _renderLearnNav();
  } else {
    opts[optIdx].classList.add('wrong');
    var fb2 = document.getElementById('quiz-feedback');
    if (fb2) {
      fb2.className = 'quiz-feedback hint';
      fb2.textContent = 'Not quite. Hint: ' + lesson.quiz.hint + ' Try again!';
    }
    setTimeout(function() { _learnQuizAnswered = false; opts[optIdx].classList.remove('answered'); }, 300);
  }
}

// ── Demo action dispatcher ────────────────────────────────────
function _runDemoAction(demo) {
  if (!demo) return;
  var action = demo.action;
  var iIdx = demo.intervalIdx !== undefined ? demo.intervalIdx : -1;

  if (action === 'play-interval') {
    if (iIdx >= 0 && typeof INTERVALS !== 'undefined' && typeof playInterval === 'function') {
      var iv = INTERVALS[iIdx];
      if (iv) { playInterval(440, 440 * iv.ratio[0] / iv.ratio[1], 1.4); }
    }

  } else if (action === 'play-chord') {
    if (demo.freqs) _learnPlayChord(demo.freqs);

  } else if (action === 'play-seq') {
    if (demo.freqs) _learnPlaySeq(demo.freqs, demo.gap);

  } else if (action === 'select-interval') {
    if (iIdx >= 0 && typeof INTERVALS !== 'undefined' && typeof state !== 'undefined') {
      state.selectedInterval = INTERVALS[iIdx];
      if (typeof buildKeyboard === 'function') buildKeyboard(state);
      document.querySelectorAll('.interval-item').forEach(function(el, i) {
        el.classList.toggle('active', i === iIdx);
      });
      if (typeof updateAll === 'function') updateAll();
    }

  } else if (action === 'highlight-all-demo') {
    if (typeof state !== 'undefined' && typeof buildKeyboard === 'function') {
      state.highlightAll = true;
      var hiBtn = document.getElementById('btn-highlight-intervals');
      if (hiBtn) hiBtn.classList.add('active');
      buildKeyboard(state);
    }

  } else if (action === 'select-and-show') {
    if (iIdx >= 0 && typeof INTERVALS !== 'undefined' && typeof state !== 'undefined') {
      state.selectedInterval = INTERVALS[iIdx];
      document.querySelectorAll('.interval-item').forEach(function(el, i) {
        el.classList.toggle('active', i === iIdx);
      });
      if (typeof updateAll === 'function') updateAll();
      closeLearnOverlay();
    }

  } else if (action === 'switch-treatment') {
    if (typeof state !== 'undefined') {
      state.arch.treatment = demo.treatment;
      state.facadeStyle = 'classical';
      var fsEl = document.getElementById('facade-style');
      if (fsEl) fsEl.value = 'classical';
      var grp = document.getElementById('arch-treatment');
      if (grp) {
        grp.querySelectorAll('.seg-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.val === demo.treatment);
        });
      }
      if (iIdx >= 0 && typeof INTERVALS !== 'undefined') {
        state.selectedInterval = INTERVALS[iIdx];
      }
      if (typeof updateAll === 'function') updateAll();
      closeLearnOverlay();
    }

  } else if (action === 'switch-modernist') {
    if (typeof state !== 'undefined') {
      state.facadeStyle = 'modernist';
      state.arch.treatment = demo.treatment;
      var fsEl2 = document.getElementById('facade-style');
      if (fsEl2) fsEl2.value = 'modernist';
      if (iIdx >= 0 && typeof INTERVALS !== 'undefined') {
        state.selectedInterval = INTERVALS[iIdx];
      }
      if (typeof updateAll === 'function') updateAll();
      closeLearnOverlay();
    }

  } else if (action === 'close-and-show') {
    if (typeof state !== 'undefined') {
      if (iIdx >= 0 && typeof INTERVALS !== 'undefined') {
        state.selectedInterval = INTERVALS[iIdx];
        document.querySelectorAll('.interval-item').forEach(function(el, i) {
          el.classList.toggle('active', i === iIdx);
        });
      }
      var panel = demo.panel;
      if (panel === 'architecture' || panel === 'architecture-doric') {
        state.domain = 'architecture';
        state.facadeStyle = 'classical';
        if (panel === 'architecture-doric') state.arch.treatment = 'doric';
        var fsEl3 = document.getElementById('facade-style');
        if (fsEl3) fsEl3.value = 'classical';
        document.querySelectorAll('.domain-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.domain === 'architecture');
        });
      } else if (panel === 'nature') {
        state.domain = 'nature';
        document.querySelectorAll('.domain-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.domain === 'nature');
        });
      } else if (panel === 'typography') {
        state.domain = 'typography';
        document.querySelectorAll('.domain-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.domain === 'typography');
        });
      } else if (panel === 'golden-arch') {
        state.goldenArchMode = 'rooms';
        var gaEl = document.getElementById('golden-arch-mode');
        if (gaEl) gaEl.value = 'rooms';
      } else if (panel === 'modulor') {
        state.goldenArchMode = 'modulor';
        var gaEl2 = document.getElementById('golden-arch-mode');
        if (gaEl2) gaEl2.value = 'modulor';
      } else if (panel === 'analogy') {
        state.analogyFilter = null;
        document.querySelectorAll('.filter-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.ratio === '');
        });
      }
      if (typeof updateAll === 'function') updateAll();
    }
    closeLearnOverlay();
  }
}

// ── Progress bar update ───────────────────────────────────────
function _updateLearnProgress() {
  var total = LEARN_LESSONS.length;
  var done = _learnProgress.length;
  var fill = document.getElementById('learn-progress-fill');
  var label = document.getElementById('learn-progress-label');
  if (fill) fill.style.width = Math.round((done / total) * 100) + '%';
  if (label) label.textContent = done + ' / ' + total;
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var btnLearn = document.getElementById('btn-learn');
  if (btnLearn) {
    btnLearn.addEventListener('click', function() { openLearnOverlay(); });
  }
  var btnClose = document.getElementById('learn-close');
  if (btnClose) {
    btnClose.addEventListener('click', function() { closeLearnOverlay(); });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var overlay = document.getElementById('learn-overlay');
      if (overlay && overlay.classList.contains('open')) { closeLearnOverlay(); }
    }
  });
});
