// ============================================================
//  Interactive Piano Keyboard  (no imports — uses globals from app.js)
// ============================================================

var NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var BLACK_NOTES_SET = new Set([1,3,6,8,10]);
var ROOT_OFFSETS = {C:0, D:2, E:4, F:5, G:7, A:9, B:11};
var C4 = 261.63;

// ── QWERTY keyboard map: key letter → semitone offset from C4 ─
// White keys: A=C4 S=D4 D=E4 F=F4 G=G4 H=A4 J=B4 K=C5
// Black keys: W=C#4 E=D#4 T=F#4 Y=G#4 U=A#4
var KB_SHORTCUT_MAP = {
  'a':0, 'w':1, 's':2, 'e':3, 'd':4, 'f':5, 't':6,
  'g':7, 'y':8, 'h':9, 'u':10,'j':11,'k':12
};

var COLOR_MAP_KB = {
  'var(--c-unison)': '#6c8eff', 'var(--c-octave)': '#34d399',
  'var(--c-fifth)': '#f59e0b', 'var(--c-fourth)': '#a78bfa',
  'var(--c-third)': '#f472b6', 'var(--c-minor)': '#fb923c',
  'var(--c-tritone)': '#ef4444', 'var(--accent-2)': '#a78bfa',
};

// Map semitone → DOM element (rebuilt each time buildKeyboard runs)
var _kbSemiToEl = {};
var _kbShortcutsInited = false;

function buildKeyboard(state) {
  var container = document.getElementById('keyboard-container');
  if (!container) return;
  container.innerHTML = '';
  _kbSemiToEl = {};

  var rootOffset = ROOT_OFFSETS[state.rootNote] !== undefined ? ROOT_OFFSETS[state.rootNote] : 9;
  var ivColor = COLOR_MAP_KB[state.selectedInterval.color] || '#6c8eff';

  var wrap = document.createElement('div');
  wrap.className = 'keyboard-wrap';

  // Build reverse map: semitone → shortcut label
  var semiToShortcut = {};
  Object.keys(KB_SHORTCUT_MAP).forEach(function(k) {
    semiToShortcut[KB_SHORTCUT_MAP[k]] = k.toUpperCase();
  });

  for (var semi = 0; semi < 25; semi++) {
    var noteIdx = semi % 12;
    var isBlack = BLACK_NOTES_SET.has(noteIdx);
    var freq = C4 * Math.pow(2, semi / 12);
    var noteName = NOTE_NAMES[noteIdx] + (semi < 12 ? '4' : '5');
    var displayName = NOTE_NAMES[noteIdx];
    var isRoot = noteIdx === rootOffset;
    var semiFromRoot = (noteIdx - rootOffset + 12) % 12;

    // Find matching interval
    var matchedIv = null;
    if (typeof INTERVALS !== 'undefined') {
      INTERVALS.forEach(function(iv) {
        var ivSemis = Math.round(iv.cents / 100);
        if (ivSemis === semiFromRoot) matchedIv = iv;
      });
    }

    var key = document.createElement('div');
    key.className = 'key ' + (isBlack ? 'key-black' : 'key-white');

    if (isRoot) {
      key.classList.add('highlighted-root');
    } else if (state.highlightAll) {
      if (matchedIv) {
        var allColor = COLOR_MAP_KB[matchedIv.color] || '#6c8eff';
        key.classList.add('highlighted-interval');
        key.style.background = isBlack ? _kbShade(allColor, -30) : _kbLighten(allColor);
        key.style.borderColor = allColor;
      }
    } else {
      var selectedSemis = Math.round(state.selectedInterval.cents / 100);
      if (semiFromRoot === selectedSemis) {
        key.classList.add('highlighted-interval');
        key.style.background = isBlack ? _kbShade(ivColor, -30) : _kbLighten(ivColor);
        key.style.borderColor = ivColor;
      }
    }

    var labelEl = document.createElement('div');
    labelEl.className = 'key-label';
    labelEl.textContent = isBlack ? '' : displayName;

    var ratioEl = document.createElement('div');
    ratioEl.className = 'key-ratio';
    if (state.showRatios) {
      if (isRoot) ratioEl.textContent = '1:1';
      else if (matchedIv) ratioEl.textContent = matchedIv.ratio[0] + ':' + matchedIv.ratio[1];
    }

    // Keyboard shortcut label
    var shortcutEl = document.createElement('div');
    shortcutEl.className = 'key-shortcut';
    if (semi < 13 && semiToShortcut[semi] !== undefined) {
      shortcutEl.textContent = semiToShortcut[semi];
    }

    key.appendChild(labelEl);
    key.appendChild(ratioEl);
    key.appendChild(shortcutEl);

    // Store element for keyboard shortcut use
    _kbSemiToEl[semi] = key;

    (function(k, f, nName, mIv) {
      k.addEventListener('mousedown', function(e) {
        e.preventDefault();
        k.classList.add('pressed');
        if (typeof playNoteStart === 'function') playNoteStart(f, 'mouse_' + nName);
        else if (typeof playNote === 'function') playNote(f, 0.8);
        _kbTooltip(e, nName + ' — ' + f.toFixed(1) + ' Hz' + (mIv ? ' (' + mIv.name + ')' : ''));
      });
      k.addEventListener('mouseup', function() {
        k.classList.remove('pressed');
        if (typeof playNoteStop === 'function') playNoteStop('mouse_' + nName);
      });
      k.addEventListener('mouseleave', function() {
        k.classList.remove('pressed');
        if (typeof playNoteStop === 'function') playNoteStop('mouse_' + nName);
      });
    })(key, freq, noteName, matchedIv);

    wrap.appendChild(key);
  }

  container.appendChild(wrap);

  // Wire keyboard shortcuts (only once across all buildKeyboard calls)
  _initKbShortcuts();
}

// ── QWERTY keyboard shortcuts ────────────────────────────────
// Normal press:  single sustained note
// Shift + press: play the currently selected interval from that key's pitch
//                Both the root key and the interval partner key light up

function _initKbShortcuts() {
  if (_kbShortcutsInited) return;
  _kbShortcutsInited = true;

  // Track which partner key was lit up per held key, so we can clear it on keyup
  var _kbIntervalPartner = {}; // key → partner semitone index

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (e.repeat) return;

    var key = e.key.toLowerCase();
    if (!(key in KB_SHORTCUT_MAP)) return;
    e.preventDefault();

    var semi = KB_SHORTCUT_MAP[key];
    var freq = C4 * Math.pow(2, semi / 12);
    var el = _kbSemiToEl[semi];

    if (e.shiftKey) {
      // ── Interval mode: play root + interval note ─────────────
      // Get currently selected interval from app state
      var iv = (typeof state !== 'undefined') ? state.selectedInterval : null;
      var N = iv ? iv.ratio[0] : 3;
      var D = iv ? iv.ratio[1] : 2;
      var freq2 = freq * N / D;

      if (el) el.classList.add('pressed', 'pressed-interval-root');

      // Light up the partner note on the keyboard (if visible)
      var intervalSemis = Math.round(Math.log2(N / D) * 12);
      var partnerSemi = semi + intervalSemis;
      var partnerEl = _kbSemiToEl[partnerSemi];
      if (partnerEl) {
        partnerEl.classList.add('pressed', 'pressed-interval-partner');
        _kbIntervalPartner[key] = partnerSemi;
      }

      if (typeof playInterval === 'function') playInterval(freq, freq2, 1.4);
    } else {
      // ── Single note mode ─────────────────────────────────────
      if (el) el.classList.add('pressed');
      if (typeof playNoteStart === 'function') playNoteStart(freq, 'kb_' + key);
      else if (typeof playNote === 'function') playNote(freq, 0.8);
    }
  });

  document.addEventListener('keyup', function(e) {
    var key = e.key.toLowerCase();
    if (!(key in KB_SHORTCUT_MAP)) return;

    var semi = KB_SHORTCUT_MAP[key];
    var el = _kbSemiToEl[semi];
    if (el) el.classList.remove('pressed', 'pressed-interval-root');

    // Clear partner key highlight
    if (_kbIntervalPartner[key] !== undefined) {
      var partEl = _kbSemiToEl[_kbIntervalPartner[key]];
      if (partEl) partEl.classList.remove('pressed', 'pressed-interval-partner');
      delete _kbIntervalPartner[key];
    }

    if (typeof playNoteStop === 'function') playNoteStop('kb_' + key);
  });
}

function _kbLighten(hex) {
  var num = parseInt(hex.slice(1), 16);
  var r = Math.min(255, (num >> 16) + 80);
  var g = Math.min(255, ((num >> 8) & 0xff) + 80);
  var b = Math.min(255, (num & 0xff) + 80);
  return 'rgba(' + r + ',' + g + ',' + b + ',0.38)';
}

function _kbShade(hex, amt) {
  var num = parseInt(hex.slice(1), 16);
  var r = Math.max(0, (num >> 16) + amt);
  var g = Math.max(0, ((num >> 8) & 0xff) + amt);
  var b = Math.max(0, (num & 0xff) + amt);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function _kbTooltip(e, text) {
  var tip = document.getElementById('tooltip');
  if (!tip) return;
  tip.textContent = text;
  tip.classList.add('visible');
  tip.style.left = (e.clientX + 12) + 'px';
  tip.style.top = (e.clientY - 28) + 'px';
  setTimeout(function() { tip.classList.remove('visible'); }, 1400);
}
