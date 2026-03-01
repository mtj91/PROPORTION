// ============================================================
//  Cross-Domain Analogies Panel
// ============================================================

var ANALOGY_DATA = {
  architecture: [
    { example: 'Parthenon Façade',           ratioKey: [4,3],  desc: 'Width to height of the stylobate approximates 4:3, placing the colonnade in perfect fourth proportion.' },
    { example: 'Palladio — Villa Rotonda',   ratioKey: [3,2],  desc: 'Room proportions of 3:2 (perfect fifth) throughout. Palladio explicitly mapped musical intervals to room ratios.' },
    { example: 'Le Corbusier Modulor',       ratioKey: [8,5],  desc: 'The Modulor system uses 8:5 ≈ φ as its fundamental unit, linking the human figure to architectural scale.' },
    { example: 'Gothic Lancet Window',       ratioKey: [5,2],  desc: 'Tall pointed arches use ratios near 5:2 to achieve soaring verticality in Gothic cathedrals.' },
    { example: 'Doric Column (h:d)',         ratioKey: [6,1],  desc: 'Column height-to-diameter: Doric 6:1, Ionic 8:1, Corinthian 10:1 — each order has its own "interval".' },
    { example: 'Widescreen 16:9 Facade',     ratioKey: [16,9], desc: '16:9 = minor seventh in music. Used in curtain-wall office buildings and the standard widescreen window band.' },
    { example: 'Great Pyramid of Giza',      ratioKey: [13,8], desc: 'Slant height to half-base ≈ φ (1.618). The 4:3 construction slope produces the golden ratio as a natural consequence.' },
    { example: 'Classical Door & Portal',    ratioKey: [2,1],  desc: 'The classical door — twice as tall as wide — encodes the octave proportion. Used from ancient Greece through the Renaissance.' },
    { example: 'Japanese Shoji & Tatami',    ratioKey: [2,1],  desc: 'The tatami mat and shoji screen carry the 2:1 (octave) proportion into domestic scale — a harmonic unit of measurement.' },
    { example: 'Renaissance Window (piano nobile)', ratioKey: [3,2], desc: 'Palladio and Bramante used 3:2 windows on piano nobile floors. The perfect fifth framing the view.' },
  ],
  nature: [
    { example: 'Sunflower Phyllotaxis',      ratioKey: [8,5],  desc: 'Sunflower seed spirals follow consecutive Fibonacci numbers, approximating φ ≈ 8:5.' },
    { example: 'Nautilus Shell',             ratioKey: [8,5],  desc: 'The logarithmic spiral grows by a factor close to φ with each quarter turn — equiangular, eternal proportion.' },
    { example: 'DNA Double Helix',           ratioKey: [5,3],  desc: 'One full helical turn: 34Å long, 21Å wide — consecutive Fibonacci numbers (major sixth ratio).' },
    { example: 'Human Navel Height',         ratioKey: [8,5],  desc: 'Ratio of total height to navel height ≈ φ ≈ 1.618. Da Vinci\'s Vitruvian Man encodes this proportion.' },
    { example: 'Crystal Cubic Lattice',      ratioKey: [1,1],  desc: 'Cubic crystals express 1:1 proportion — unison — in their atomic spacing along all three axes.' },
    { example: 'Harmonic Overtones',         ratioKey: [2,1],  desc: 'Standing waves in strings and pipes double in frequency per octave (2:1) — nature\'s own tuning system.' },
    { example: 'Romanesco Broccoli',         ratioKey: [8,5],  desc: 'Each floret is a self-similar copy of the whole. Spiral counts of 8 and 13 are consecutive Fibonacci numbers.' },
    { example: 'Tree Branching Pattern',     ratioKey: [3,2],  desc: 'Branch angles derived from the golden angle (137.5°) create 3:2 Fibonacci spiral patterns for optimal light capture.' },
    { example: 'Human Facial Proportions',   ratioKey: [8,5],  desc: 'Face width to eye width ≈ φ; feature spacing follows φ. The basis of classical portrait proportion and modern analysis.' },
    { example: 'Pineapple Spiral Rows',      ratioKey: [13,8], desc: 'A pineapple has 8 spirals clockwise and 13 counter-clockwise — consecutive Fibonacci numbers approaching φ.' },
  ],
  typography: [
    { example: 'Major Third Scale',          ratioKey: [5,4],  desc: 'Type scale of 1.25 (5:4) gives gentle, readable hierarchy from body to heading.' },
    { example: 'Perfect Fourth Scale',       ratioKey: [4,3],  desc: 'The 4:3 modular scale (1.333) is Tim Brown\'s recommendation for web typography.' },
    { example: 'Golden Ratio Scale',         ratioKey: [8,5],  desc: 'A 1.618 type scale creates dramatic contrast — cinematic. Best for display-heavy layouts.' },
    { example: 'Octave Scale',               ratioKey: [2,1],  desc: 'Doubling sizes (2:1) at each level: body 16px, heading 32px — simple octave harmony.' },
    { example: 'Optimal Line Height',        ratioKey: [3,2],  desc: 'A line-height of 1.5 (3:2, perfect fifth) is the most-cited optimal ratio for body text readability.' },
    { example: 'ISO 216 Paper (√2)',         ratioKey: [7,5],  desc: 'ISO A-series paper uses √2:1. Fold A3 and you get A4 — the same proportions at half size, endlessly.' },
    { example: 'Book Page Canon (Van de Graaf)', ratioKey: [3,2], desc: 'The Van de Graaf canon places a 2:3 text block on a 2:3 page. Fibonacci margins govern manuscripts for centuries.' },
    { example: '35mm Film / DSLR Frame',     ratioKey: [3,2],  desc: 'The 35mm film frame (36×24mm = 3:2) and DSLR sensors use the perfect fifth. The standard photographic proportion.' },
  ],
  design: [
    { example: 'Credit Card (ISO/IEC 7810)', ratioKey: [8,5],  desc: 'The global credit card standard (85.6×54mm = 1.585) is virtually identical to 8:5 ≈ φ. The wallet holds golden rectangles.' },
    { example: 'Classic TV & Monitor (4:3)', ratioKey: [4,3],  desc: 'The original television and computer monitor used 4:3 — the same perfect fourth as Greek temple proportions.' },
    { example: 'HDTV & Smartphone (16:9)',   ratioKey: [16,9], desc: '16:9 became the global display standard in 2009. Its musical equivalent is the minor seventh (996 cents).' },
    { example: 'A-Series Paper (√2:1)',      ratioKey: [7,5],  desc: 'ISO 216 (A4, A3, A2…) uses √2:1. Every fold preserves the proportion — a mathematically self-similar system.' },
    { example: 'US Business Card',           ratioKey: [7,4],  desc: 'The US standard business card (3.5″ × 2″ = 7:4 = 1.75) sits between the perfect fifth and major sixth.' },
    { example: 'Vinyl Record (label:disc)',  ratioKey: [1,3],  desc: 'The centre label is 1/3 the diameter of a 12" vinyl record — the inverse perfect fifth. Intentional or coincidental?' },
    { example: 'Movie Screen (1.85:1)',      ratioKey: [15,8], desc: 'The standard theatrical flat format (1.85:1 ≈ 15:8) is close to the major seventh. Cinema projects near-dissonant proportions.' },
    { example: 'Golden Ratio Crop (Photography)', ratioKey: [8,5], desc: 'The φ crop guide appears in Lightroom and Photoshop. Placing subjects at the golden spiral intersection is a classical composition rule.' },
  ],
};

// Proportion filter definitions (label, ratio as [n,d], tolerance)
var PROPORTION_FILTERS = [
  { label: '1:1 — Square',    ratio: [1,1],  tol: 0.04 },
  { label: '5:4 — Maj Third', ratio: [5,4],  tol: 0.04 },
  { label: '4:3 — Fourth',    ratio: [4,3],  tol: 0.04 },
  { label: '3:2 — Fifth',     ratio: [3,2],  tol: 0.04 },
  { label: '5:3 — Maj Sixth', ratio: [5,3],  tol: 0.04 },
  { label: '8:5 ≈ φ',         ratio: [8,5],  tol: 0.06 },
  { label: '2:1 — Octave',    ratio: [2,1],  tol: 0.05 },
  { label: '16:9 — Wide',     ratio: [16,9], tol: 0.05 },
];

function buildAnalogyGrid(interval, domain, filterRatio) {
  var grid = document.getElementById('analogy-grid');
  if (!grid) return;

  var selRatio = interval.ratio[0] / interval.ratio[1];

  var colorMap = {
    'var(--c-unison)': '#6c8eff', 'var(--c-octave)': '#34d399',
    'var(--c-fifth)': '#f59e0b', 'var(--c-fourth)': '#a78bfa',
    'var(--c-third)': '#f472b6', 'var(--c-minor)': '#fb923c',
    'var(--c-tritone)': '#ef4444', 'var(--accent-2)': '#a78bfa',
  };
  var color = colorMap[interval.color] || '#6c8eff';

  var domainLabels = { architecture:'Architecture', nature:'Nature', typography:'Typography', design:'Design' };

  var items;

  if (filterRatio) {
    // Cross-domain mode: gather all items from all domains matching the filter ratio
    var filterVal = filterRatio[0] / filterRatio[1];
    var matchedFilter = PROPORTION_FILTERS.find(function(f) {
      return f.ratio[0] === filterRatio[0] && f.ratio[1] === filterRatio[1];
    });
    var tol = matchedFilter ? matchedFilter.tol : 0.05;

    items = [];
    Object.keys(ANALOGY_DATA).forEach(function(dom) {
      ANALOGY_DATA[dom].forEach(function(entry) {
        var entryRatio = entry.ratioKey[0] / entry.ratioKey[1];
        if (Math.abs(entryRatio - filterVal) <= tol + filterVal * 0.03) {
          items.push({ entry: entry, dom: dom });
        }
      });
    });
    // Sort by closeness to filter ratio
    items.sort(function(a, b) {
      var da = Math.abs(a.entry.ratioKey[0]/a.entry.ratioKey[1] - filterVal);
      var db = Math.abs(b.entry.ratioKey[0]/b.entry.ratioKey[1] - filterVal);
      return da - db;
    });
  } else {
    // Domain mode: show items from selected domain sorted by closeness to selected interval
    var data = ANALOGY_DATA[domain] || ANALOGY_DATA.architecture;
    var sorted = data.slice().sort(function(a, b) {
      var da = Math.abs(a.ratioKey[0] / a.ratioKey[1] - selRatio);
      var db = Math.abs(b.ratioKey[0] / b.ratioKey[1] - selRatio);
      return da - db;
    });
    items = sorted.map(function(entry) { return { entry: entry, dom: domain }; });
  }

  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = '<div style="padding:20px;opacity:0.5;font-size:0.85rem;">No examples found for this proportion.</div>';
    return;
  }

  items.forEach(function(item) {
    var entry = item.entry;
    var dom   = item.dom;
    var itemRatio = entry.ratioKey[0] / entry.ratioKey[1];
    var refRatio  = filterRatio ? filterRatio[0] / filterRatio[1] : selRatio;
    var closeness = 1 - Math.min(1, Math.abs(itemRatio - refRatio) / refRatio);
    var isClose   = closeness > 0.85;

    var card = document.createElement('div');
    card.className = 'analogy-card';
    if (isClose) card.style.borderColor = color;

    card.innerHTML =
      '<div class="analogy-domain">' + (domainLabels[dom] || dom) + '</div>' +
      '<div class="analogy-example">' + entry.example + '</div>' +
      '<div class="analogy-ratio-label">' + entry.ratioKey[0] + ':' + entry.ratioKey[1] + ' = ' + itemRatio.toFixed(3) + '</div>' +
      '<div class="analogy-description">' + entry.desc + '</div>' +
      '<div class="analogy-bar-wrap"><div class="analogy-bar" style="width:' + (closeness * 100).toFixed(1) + '%;background:' + (isClose ? color : '#6c8eff88') + '"></div></div>' +
      '<div style="font-size:0.65rem;color:var(--text-2);margin-top:4px;font-family:var(--mono)">' + (closeness * 100).toFixed(0) + '% match to ' + (filterRatio ? filterRatio[0]+':'+filterRatio[1] : interval.ratio[0]+':'+interval.ratio[1]) + '</div>';

    grid.appendChild(card);
  });
}
