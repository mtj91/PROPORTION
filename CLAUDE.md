# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**PROPORTION** is a Music Proportion Dashboard — an interactive single-page app for exploring how musical interval ratios (1:1, 2:1, 3:2, 4:3, 5:4…) manifest across music, architecture, nature, and typography.

Open `index.html` directly in a browser — no build step, no server required.

## Architecture

Pure HTML/CSS/vanilla JS, no framework, no bundler, no ES modules (plain `<script>` tags so it works via `file://`).

```
index.html          Main layout (6 panels + sidebar)
style.css           Design system (CSS custom properties, dark/light theme)
js/
  app.js            Entry point — state, audio (Web Audio API), interval data, event wiring
  harmonic.js       Canvas: waveform visualizer for two frequencies at the chosen ratio
  architecture.js   Canvas: facade/nature/typography analogy renderers (3 modes)
  keyboard.js       DOM: interactive piano keyboard with interval highlighting
  fibonacci.js      Canvas: Fibonacci rectangles + golden spiral (with animation)
  wheel.js          Canvas: proportion wheel (circle of intervals)
  analogies.js      DOM: cross-domain analogy cards sorted by ratio proximity
```

Script load order matters: `app.js` is last, all other files must be loaded first (they register globals that `app.js` calls in `updateAll()`).

## Key Data

All interval data lives in `INTERVALS` array in `app.js` — each entry has `{name, ratio:[n,d], cents, color, desc}`.

Global mutable state is the `state` object in `app.js`. All visualizers read from it. Call `updateAll()` after any state change.

```js
state = {
  selectedInterval,   // object from INTERVALS (or custom)
  baseFreq,           // number, Hz
  tuning,             // 'just' | 'pythagorean' | 'equal'  (stored; drives future use)
  waveType,           // 'sine' | 'triangle' | 'square' | 'sawtooth'
  soundEnabled,
  domain,             // 'architecture' | 'nature' | 'typography' | 'design'
  facadeStyle,        // 'classical' | 'modernist' | 'gothic'
  analogyFilter,      // null = no filter; [n, d] = proportion filter (cross-domain mode)
  arch: {
    scale,            // 'intimate' | 'standard' | 'grand'  → bays/floors preset
    treatment,        // classical: 'doric'|'ionic'|'corinthian'
                      // modernist: 'frame'|'curtain'|'brise'
                      // gothic:    'simple'|'tracery'|'ornate'
    analysis,         // 'none' | 'lines' | 'grid' | 'full'
  },
  goldenArchMode,     // 'rooms' | 'facade' | 'modulor'
}
```

Scale presets: `intimate` → 3 bays, 1 floor; `standard` → 5 bays, 2 floors; `grand` → 7 bays, 3 floors.

Treatment buttons are dynamically rebuilt by `_updateTreatmentButtons(facadeStyle)` each time the facade style changes.

## Canvas Pattern

Every canvas visualizer follows: `draw*(canvas, ...params)` → reads `document.body.dataset.theme` for dark/light, uses `canvas.width`/`canvas.height` (set by `resizeAllCanvases()` on load and resize).

The boot sequence double-`requestAnimationFrame`s before calling `resizeAllCanvases()` to ensure layout is complete before canvas dimensions are measured.

## Architecture Canvas Routing

`drawArchitecture()` dispatches on `domain`:
- `'architecture'` or `'design'` → `_drawProportionalFacade()` (classical/modernist/gothic)
- `'nature'` → `_drawNature()`
- `'typography'` → `_drawTypography()`

## Color Map Gotcha

The CSS variable → hex color mapping (`'var(--c-fifth)' → '#f59e0b'`, etc.) is **duplicated** in three places: `_appColor()` in `app.js`, `COLOR_MAP_KB` in `keyboard.js`, and `colorMap` in `analogies.js`. If you add a new interval color CSS variable, update all three.

## Style Note

`harmonic.js` uses `let`/`const`. All other JS files use `var` for global-scope compatibility with `file://` loading. Keep new code in a file consistent with that file's existing style.

## Extending

- **Add an interval**: push to `INTERVALS` in `app.js`.
- **Add an analogy domain**: add a key to `ANALOGY_DATA` in `analogies.js`, add a `.domain-btn` in `index.html`, add a draw branch in `architecture.js`.
- **Add a panel**: create a `.panel` div in `index.html`, write the draw function (loaded before `app.js`), call it from `updateAll()`.

## Git LFS

Configured — store large binary assets (audio, images) via LFS.
Remote: `https://github.com/mtj91/PROPORTION.git` (branch: `main`)
