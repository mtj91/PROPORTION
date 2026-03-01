// ============================================================
//  PROPORTION — Main App
//  Loaded last; all other js/ files are already in scope.
// ============================================================

// ── Interval data ─────────────────────────────────────────────
var INTERVALS = [
  { name: 'Unison',         ratio: [1,1],   cents: 0,    color: 'var(--c-unison)',
    desc: 'The identity — a note against itself. Ratio 1:1. In architecture: the perfect square.' },
  { name: 'Minor Second',   ratio: [16,15], cents: 112,  color: 'var(--c-tritone)',
    desc: 'Strongly dissonant. In architecture, a proportion that unsettles: almost-square, never quite.' },
  { name: 'Major Second',   ratio: [9,8],   cents: 204,  color: 'var(--c-minor)',
    desc: 'Mild dissonance. The 9:8 "tone" is the basis of whole-step scales and 9:8 stone-course rhythms.' },
  { name: 'Minor Third',    ratio: [6,5],   cents: 316,  color: 'var(--c-third)',
    desc: 'Soft, melancholic consonance. 6:5 shapes many Renaissance window and door proportions.' },
  { name: 'Major Third',    ratio: [5,4],   cents: 386,  color: 'var(--c-third)',
    desc: '5:4 — elegant consonance. Found in Palladio\'s room proportions and the Pantheon\'s drum.' },
  { name: 'Perfect Fourth', ratio: [4,3],   cents: 498,  color: 'var(--c-fourth)',
    desc: '4:3 — the subdominant. Greek temple stylobate ratios, Tim Brown\'s type scale.' },
  { name: 'Tritone',        ratio: [45,32], cents: 590,  color: 'var(--c-tritone)',
    desc: 'Diabolus in musica. Maximally dissonant. Gothic builders explicitly avoided this proportion.' },
  { name: 'Perfect Fifth',  ratio: [3,2],   cents: 702,  color: 'var(--c-fifth)',
    desc: '3:2 — most consonant after the octave. Pythagorean tuning, Palladio\'s 3:2 rooms, line-height 1.5.' },
  { name: 'Minor Sixth',    ratio: [8,5],   cents: 814,  color: 'var(--c-minor)',
    desc: '8:5 = 1.600 — the nearest musical interval to φ (1.618). Le Corbusier\'s Modulor, sunflowers.' },
  { name: 'Major Sixth',    ratio: [5,3],   cents: 884,  color: 'var(--c-third)',
    desc: '5:3 — bright consonance. Parthenon facade, DNA helix (34:21 ≈ 5:3), Fibonacci rooms.' },
  { name: 'Minor Seventh',  ratio: [16,9],  cents: 996,  color: 'var(--c-minor)',
    desc: '16:9 — the widescreen ratio. A harmonic of the overtone series and every modern screen.' },
  { name: 'Major Seventh',  ratio: [15,8],  cents: 1088, color: 'var(--c-tritone)',
    desc: 'Strong dissonance yearning to resolve. Baroque ornamental facades use this for tension.' },
  { name: 'Octave',         ratio: [2,1],   cents: 1200, color: 'var(--c-octave)',
    desc: '2:1 — the most fundamental proportion. Divides space by half. Basis of all doubling systems.' },
];

// ── Application state ─────────────────────────────────────────
var state = {
  selectedInterval: INTERVALS[7],  // Perfect Fifth
  baseFreq: 440,
  tuning: 'just',
  waveType: 'sine',
  soundEnabled: true,
  animatingWaves: false,
  highlightAll: false,
  domain: 'architecture',
  facadeStyle: 'classical',
  showRatios: false,
  rootNote: 'A',
  analogyFilter: null,  // null = no filter, [n,d] = proportion filter
  // Architecture parameters (3-system model)
  arch: {
    scale: 'standard',    // 'intimate' | 'standard' | 'grand'
    bays: 5,              // direct bay count (overrides preset when set by slider)
    floors: 2,            // direct floor count (overrides preset when set by slider)
    treatment: 'ionic',   // classical: doric/ionic/corinthian | modernist: frame/curtain/brise | gothic: simple/tracery/ornate
    analysis: 'lines',    // 'none' | 'lines' | 'grid' | 'full'
  },
  goldenArchMode: 'rooms',
};

// ── Web Audio ─────────────────────────────────────────────────
var _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playInterval(freq1, freq2, duration) {
  duration = duration || 1.2;
  if (!state.soundEnabled) return;
  var ctx = _getAudioCtx();
  var t = ctx.currentTime;
  [freq1, freq2].forEach(function(freq, i) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = state.waveType;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.linearRampToValueAtTime(0.12, t + duration * 0.6);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t + i * 0.05); osc.stop(t + duration + 0.05);
  });
}

function playNote(freq, duration) {
  duration = duration || 0.6;
  if (!state.soundEnabled) return;
  var ctx = _getAudioCtx();
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = state.waveType;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
  gain.gain.linearRampToValueAtTime(0.08, t + duration * 0.5);
  gain.gain.linearRampToValueAtTime(0, t + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t); osc.stop(t + duration + 0.05);
}

// ── Sustained notes for keyboard shortcuts ────────────────────
var _kbHeldNodes = {};

function playNoteStart(freq, keyId) {
  if (!state.soundEnabled) return;
  if (_kbHeldNodes[keyId]) return; // already playing
  var ctx = _getAudioCtx();
  var t = ctx.currentTime;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = state.waveType;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.2, t + 0.012);
  gain.gain.linearRampToValueAtTime(0.14, t + 0.1);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t);
  _kbHeldNodes[keyId] = { osc: osc, gain: gain };
}

function playNoteStop(keyId) {
  var node = _kbHeldNodes[keyId];
  if (!node) return;
  var ctx = _getAudioCtx();
  var t = ctx.currentTime;
  node.gain.gain.cancelScheduledValues(t);
  node.gain.gain.setValueAtTime(node.gain.gain.value, t);
  node.gain.gain.linearRampToValueAtTime(0, t + 0.12);
  node.osc.stop(t + 0.14);
  delete _kbHeldNodes[keyId];
}

// ── Canvas sizing ─────────────────────────────────────────────
var CANVAS_HEIGHTS = {
  'canvas-harmonic':      180,
  'canvas-architecture':  300,
  'canvas-golden-music':  240,
  'canvas-wheel':         240,
  'canvas-golden-arch':   260,
};

function resizeAllCanvases() {
  Object.keys(CANVAS_HEIGHTS).forEach(function(id) {
    var c = document.getElementById(id);
    if (!c) return;
    var parent = c.parentElement;
    var w = parent.clientWidth || parent.getBoundingClientRect().width || 400;
    c.width = Math.floor(w);
    c.height = CANVAS_HEIGHTS[id];
    c.style.height = CANVAS_HEIGHTS[id] + 'px';
  });
}

// ── Render all panels ─────────────────────────────────────────
function updateAll() {
  drawHarmonic(
    document.getElementById('canvas-harmonic'),
    state.selectedInterval, state.baseFreq, state.animatingWaves
  );
  drawArchitecture(
    document.getElementById('canvas-architecture'),
    state.selectedInterval, state.facadeStyle, state.domain, state.arch
  );
  drawGoldenMusic(
    document.getElementById('canvas-golden-music'),
    state.selectedInterval, INTERVALS
  );
  drawProportionWheel(
    document.getElementById('canvas-wheel'),
    state.selectedInterval, INTERVALS
  );
  drawGoldenArchitecture(
    document.getElementById('canvas-golden-arch'),
    state.selectedInterval, state.goldenArchMode
  );
  buildKeyboard(state);
  buildAnalogyGrid(state.selectedInterval, state.domain, state.analogyFilter);
  _updateInfoCard();
  _updateLegend();
  _updateArchLabels();
}

function _updateInfoCard() {
  var iv = state.selectedInterval;
  var n = iv.ratio[0], d = iv.ratio[1];
  document.getElementById('info-ratio').textContent = n + ' : ' + d;
  document.getElementById('info-name').textContent = iv.name;
  document.getElementById('info-cents').textContent = iv.cents + ' cents';
  document.getElementById('info-decimal').textContent = (n / d).toFixed(4);
  document.getElementById('info-desc').textContent = iv.desc;
}

function _updateLegend() {
  var iv = state.selectedInterval;
  var n = iv.ratio[0], d = iv.ratio[1];
  var color = _appColor(iv.color);
  document.getElementById('harmonic-legend').innerHTML =
    '<div class="legend-item"><div class="legend-swatch" style="background:#6c8eff"></div>Root: ' + state.baseFreq + ' Hz</div>' +
    '<div class="legend-item"><div class="legend-swatch" style="background:' + color + '"></div>' + iv.name + ': ' + Math.round(state.baseFreq * n / d) + ' Hz</div>' +
    '<div class="legend-item"><div class="legend-swatch" style="background:#34d399"></div>Ratio: ' + n + ':' + d + ' = ' + (n/d).toFixed(4) + '</div>';
}

var _ARCH_SCALE_PRESETS = { intimate:{bays:3,floors:1}, standard:{bays:5,floors:2}, grand:{bays:7,floors:3} };

function _updateArchLabels() {
  var iv = state.selectedInterval;
  var n = iv.ratio[0], d = iv.ratio[1];
  var r = (n/d).toFixed(3);
  var sp = _ARCH_SCALE_PRESETS[state.arch.scale] || _ARCH_SCALE_PRESETS.standard;
  var bays = state.arch.bays || sp.bays;
  var floors = state.arch.floors || sp.floors;
  document.getElementById('architecture-labels').innerHTML =
    '<span>W:H = ' + n + ':' + d + '</span>' +
    '<span>' + r + '</span>' +
    '<span>' + iv.name + '</span>' +
    '<span>' + bays + ' bays · ' + floors + ' fl · ' + state.arch.treatment + '</span>';

  // Golden arch labels
  var gaLabels = document.getElementById('golden-arch-labels');
  if (gaLabels) {
    var PHI = 1.6180339887;
    var dist = Math.abs(n/d - PHI).toFixed(4);
    gaLabels.innerHTML =
      '<span>' + iv.name + ' = ' + (n/d).toFixed(4) + '</span>' +
      '<span>φ = ' + PHI.toFixed(4) + '</span>' +
      '<span>Δ = ' + dist + '</span>' +
      '<span>' + state.goldenArchMode + ' view</span>';
  }
}

function _appColor(cssVar) {
  var map = {
    'var(--c-unison)':'#6c8eff','var(--c-octave)':'#34d399','var(--c-fifth)':'#f59e0b',
    'var(--c-fourth)':'#a78bfa','var(--c-third)':'#f472b6','var(--c-minor)':'#fb923c',
    'var(--c-tritone)':'#ef4444','var(--accent-2)':'#a78bfa',
  };
  return map[cssVar] || '#6c8eff';
}

// ── Interval list ─────────────────────────────────────────────
function _buildIntervalList() {
  var list = document.getElementById('interval-list');
  list.innerHTML = '';
  INTERVALS.forEach(function(iv) {
    var el = document.createElement('div');
    el.className = 'interval-item' + (iv === state.selectedInterval ? ' active' : '');
    el.innerHTML =
      '<div class="interval-dot" style="background:' + _appColor(iv.color) + '"></div>' +
      '<span class="interval-name">' + iv.name + '</span>' +
      '<span class="interval-ratio">' + iv.ratio[0] + ':' + iv.ratio[1] + '</span>';
    el.addEventListener('click', function() {
      state.selectedInterval = iv;
      document.querySelectorAll('.interval-item').forEach(function(e) { e.classList.remove('active'); });
      el.classList.add('active');
      updateAll();
      playInterval(state.baseFreq, state.baseFreq * iv.ratio[0] / iv.ratio[1]);
    });
    list.appendChild(el);
  });
}

// ── Controls ──────────────────────────────────────────────────
function _initControls() {
  // Sound
  document.getElementById('btn-sound').addEventListener('click', function() {
    state.soundEnabled = !state.soundEnabled;
    document.getElementById('sound-waves').style.opacity = state.soundEnabled ? '1' : '0.2';
  });

  // Theme
  document.getElementById('btn-theme').addEventListener('click', function() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    updateAll();
  });

  // Tuning
  document.getElementById('tuning-system').addEventListener('change', function(e) {
    state.tuning = e.target.value;
  });

  // Base frequency
  var freqSlider = document.getElementById('base-freq');
  var freqDisplay = document.getElementById('base-freq-display');
  var noteMap = {220:'A3',262:'C4',294:'D4',330:'E4',349:'F4',392:'G4',440:'A4',494:'B4',523:'C5',587:'D5',659:'E5',698:'F5',784:'G5',880:'A5'};
  freqSlider.addEventListener('input', function() {
    state.baseFreq = +freqSlider.value;
    var keys = Object.keys(noteMap).map(Number);
    var closest = keys.reduce(function(a, b) { return Math.abs(b - state.baseFreq) < Math.abs(a - state.baseFreq) ? b : a; });
    var noteName = Math.abs(closest - state.baseFreq) < 10 ? noteMap[closest] + ' = ' : '';
    freqDisplay.textContent = noteName + state.baseFreq + ' Hz';
    updateAll();
  });

  // Custom ratio
  document.getElementById('btn-apply-ratio').addEventListener('click', function() {
    var n = +document.getElementById('ratio-num').value;
    var d = +document.getElementById('ratio-den').value;
    if (!n || !d) return;
    var cents = Math.round(1200 * Math.log2(n / d));
    state.selectedInterval = { name: 'Custom ' + n + ':' + d, ratio: [n,d], cents: cents,
      color: 'var(--accent-2)',
      desc: 'Custom ratio ' + n + ':' + d + ' = ' + (n/d).toFixed(4) + '. ' + cents + ' cents.' };
    document.querySelectorAll('.interval-item').forEach(function(e) { e.classList.remove('active'); });
    updateAll();
    playInterval(state.baseFreq, state.baseFreq * n / d);
  });

  // Waveform
  document.querySelectorAll('.wave-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.waveType = btn.dataset.wave;
      document.querySelectorAll('.wave-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // Domain
  document.querySelectorAll('.domain-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.domain = btn.dataset.domain;
      document.querySelectorAll('.domain-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      // Clear proportion filter when switching domain
      state.analogyFilter = null;
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      var allBtn = document.querySelector('.filter-btn[data-ratio=""]');
      if (allBtn) allBtn.classList.add('active');
      var titles = {architecture:'Architecture', nature:'Nature', typography:'Typography', design:'Architecture'};
      document.getElementById('analogy-panel-title').textContent = titles[state.domain] || 'Analogy';
      updateAll();
    });
  });

  // Proportion filter
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var ratioStr = btn.dataset.ratio;
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (!ratioStr) {
        state.analogyFilter = null;
      } else {
        var parts = ratioStr.split(':');
        state.analogyFilter = [+parts[0], +parts[1]];
      }
      buildAnalogyGrid(state.selectedInterval, state.domain, state.analogyFilter);
    });
  });

  // Facade style
  document.getElementById('facade-style').addEventListener('change', function(e) {
    state.facadeStyle = e.target.value;
    _updateTreatmentButtons(state.facadeStyle);
    drawArchitecture(document.getElementById('canvas-architecture'),
      state.selectedInterval, state.facadeStyle, state.domain, state.arch);
    _updateArchLabels();
  });

  // Play interval
  document.getElementById('btn-play-interval').addEventListener('click', function() {
    var n = state.selectedInterval.ratio[0], d = state.selectedInterval.ratio[1];
    playInterval(state.baseFreq, state.baseFreq * n / d, 2.0);
  });

  // Animate waves
  var btnAnim = document.getElementById('btn-animate-waves');
  btnAnim.addEventListener('click', function() {
    state.animatingWaves = !state.animatingWaves;
    btnAnim.classList.toggle('active', state.animatingWaves);
    if (state.animatingWaves) {
      startWaveAnimation(document.getElementById('canvas-harmonic'), state);
    } else {
      stopWaveAnimation();
      drawHarmonic(document.getElementById('canvas-harmonic'), state.selectedInterval, state.baseFreq, false);
    }
  });

  // Animate golden music spiral
  var btnGolden = document.getElementById('btn-anim-golden');
  btnGolden.addEventListener('click', function() {
    btnGolden.classList.toggle('active');
    animateGoldenMusic(
      document.getElementById('canvas-golden-music'),
      state.selectedInterval, INTERVALS
    );
  });

  // Highlight all intervals on keyboard
  document.getElementById('btn-highlight-intervals').addEventListener('click', function() {
    state.highlightAll = !state.highlightAll;
    this.classList.toggle('active', state.highlightAll);
    buildKeyboard(state);
  });

  // Show ratios on keyboard
  document.getElementById('btn-show-ratios').addEventListener('click', function(e) {
    state.showRatios = !state.showRatios;
    e.currentTarget.classList.toggle('active', state.showRatios);
    buildKeyboard(state);
  });

  // Root note
  document.getElementById('root-note').addEventListener('change', function(e) {
    state.rootNote = e.target.value;
    buildKeyboard(state);
  });

  // Golden arch mode
  document.getElementById('golden-arch-mode').addEventListener('change', function(e) {
    state.goldenArchMode = e.target.value;
    drawGoldenArchitecture(document.getElementById('canvas-golden-arch'),
      state.selectedInterval, state.goldenArchMode);
    _updateArchLabels();
  });

  // ── Architecture param bar (3-system) ────────────────────────
  function _archRedraw() {
    drawArchitecture(document.getElementById('canvas-architecture'),
      state.selectedInterval, state.facadeStyle, state.domain, state.arch);
    _updateArchLabels();
  }

  var TREATMENT_OPTIONS = {
    classical: [{val:'doric',label:'Doric'}, {val:'ionic',label:'Ionic'}, {val:'corinthian',label:'Corinthian'}],
    modernist: [{val:'frame',label:'Frame'}, {val:'curtain',label:'Curtain'}, {val:'brise',label:'Brise-sol.'}],
    gothic:    [{val:'simple',label:'Simple'}, {val:'tracery',label:'Tracery'}, {val:'ornate',label:'Ornate'}],
  };

  function _updateTreatmentButtons(facadeStyle) {
    var opts = TREATMENT_OPTIONS[facadeStyle] || TREATMENT_OPTIONS.classical;
    var grp = document.getElementById('arch-treatment');
    if (!grp) return;
    grp.innerHTML = '';
    // Pick first treatment by default if current treatment isn't valid for new style
    var validVals = opts.map(function(o) { return o.val; });
    if (validVals.indexOf(state.arch.treatment) === -1) {
      state.arch.treatment = opts[1] ? opts[1].val : opts[0].val; // default to middle option
    }
    opts.forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className = 'seg-btn' + (opt.val === state.arch.treatment ? ' active' : '');
      btn.dataset.val = opt.val;
      btn.textContent = opt.label;
      btn.addEventListener('click', function() {
        state.arch.treatment = opt.val;
        grp.querySelectorAll('.seg-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        _archRedraw();
      });
      grp.appendChild(btn);
    });
  }

  // Scale
  document.querySelectorAll('#arch-scale .seg-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.arch.scale = btn.dataset.val;
      document.querySelectorAll('#arch-scale .seg-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      // Sync bays/floors sliders to preset values
      var preset = _ARCH_SCALE_PRESETS[state.arch.scale] || _ARCH_SCALE_PRESETS.standard;
      state.arch.bays = preset.bays;
      state.arch.floors = preset.floors;
      var baysSlider = document.getElementById('arch-bays');
      var floorsSlider = document.getElementById('arch-floors');
      if (baysSlider) { baysSlider.value = preset.bays; document.getElementById('bays-display').textContent = preset.bays; }
      if (floorsSlider) { floorsSlider.value = preset.floors; document.getElementById('floors-display').textContent = preset.floors; }
      _archRedraw();
    });
  });

  // Bays slider
  var baysSlider = document.getElementById('arch-bays');
  if (baysSlider) {
    baysSlider.addEventListener('input', function() {
      state.arch.bays = +this.value;
      document.getElementById('bays-display').textContent = this.value;
      _archRedraw();
    });
  }

  // Floors slider
  var floorsSlider = document.getElementById('arch-floors');
  if (floorsSlider) {
    floorsSlider.addEventListener('input', function() {
      state.arch.floors = +this.value;
      document.getElementById('floors-display').textContent = this.value;
      _archRedraw();
    });
  }

  // Treatment (initial wire-up)
  _updateTreatmentButtons(state.facadeStyle);

  // Analysis
  document.querySelectorAll('#arch-analysis .seg-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      state.arch.analysis = btn.dataset.val;
      document.querySelectorAll('#arch-analysis .seg-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      _archRedraw();
    });
  });
}

// ── Boot ──────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      resizeAllCanvases();
      _buildIntervalList();
      _initControls();
      updateAll();
    });
  });

  window.addEventListener('resize', function() {
    resizeAllCanvases();
    updateAll();
  });
});
