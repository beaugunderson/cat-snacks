import {
  ACCESSORIES, BACKGROUNDS, BROWS, EAR_SHAPES, EFFECTS, EYE_KINDS, FRAMES, HEAD_SHAPES, MOUTH_KINDS,
  NOSE_KINDS, PATTERNS, STYLES, STYLE_META, WHISKER_KINDS, createGenome, randomSeed, rarity, renderCat,
} from '../src/index.js';

const $ = id => document.getElementById(id);
const canvas = $('cat');
const ctx = canvas.getContext('2d');

const SELECTS = [
  ['style', 'style', STYLES, s => STYLE_META[s].label],
  ['headShape', 'head', HEAD_SHAPES],
  ['earShape', 'ears', EAR_SHAPES],
  ['eyeKind', 'eyes', EYE_KINDS],
  ['mouthKind', 'mouth', MOUTH_KINDS],
  ['noseKind', 'nose', NOSE_KINDS],
  ['whiskerKind', 'whiskers', WHISKER_KINDS],
  ['brows', 'brows', BROWS],
  ['background', 'background', BACKGROUNDS],
  ['frame', 'frame', FRAMES],
];

const CHIPS = [
  ['accessories', ACCESSORIES],
  ['patterns', PATTERNS],
  ['effects', EFFECTS],
];

const LISTS = new Set(CHIPS.map(([key]) => key));

const state = {
  seed: randomSeed(),
  chaos: 0.6,
  pinned: {},
  history: [],
  animate: false,
  gridMode: false,
  genome: null,
};

// url <-> state ----------------------------------------------------------------

function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));

  for (const [key, raw] of params) {
    if (key === 'seed') state.seed = raw;
    else if (key === 'chaos') state.chaos = Number(raw);
    else if (LISTS.has(key)) state.pinned[key] = raw ? raw.split(',') : [];
    else state.pinned[key] = raw;
  }
}

function writeHash() {
  const params = new URLSearchParams({seed: state.seed, chaos: String(state.chaos)});

  for (const [key, value] of Object.entries(state.pinned)) {
    if (key !== 'eyeKindR') params.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  history.replaceState(null, '', `#${params}`);
}

// building the controls ----------------------------------------------------------

function pin(key, value) {
  state.pinned[key] = value;
  if (key === 'eyeKind') state.pinned.eyeKindR = value;
  update();
}

function unpin(key) {
  delete state.pinned[key];
  if (key === 'eyeKind') delete state.pinned.eyeKindR;
  update();
}

function buildControls() {
  const selects = $('selects');

  for (const [key, label, values, name = v => v] of SELECTS) {
    const field = document.createElement('div');
    field.className = 'field';
    field.dataset.key = key;
    field.innerHTML = `<label for="sel-${key}">${label}<button class="pin" hidden>pinned ×</button></label>`;

    const select = document.createElement('select');
    select.id = `sel-${key}`;
    for (const v of values) {
      select.add(new Option(name(v), v));
    }
    select.addEventListener('change', () => pin(key, select.value));
    field.querySelector('.pin').addEventListener('click', () => unpin(key));
    field.append(select);
    selects.append(field);
  }

  for (const [key, values] of CHIPS) {
    const box = $(key);
    for (const v of values) {
      const chip = document.createElement('button');
      chip.textContent = v;
      chip.dataset.value = v;
      chip.addEventListener('click', () => {
        const current = new Set(state.genome[key]);
        current.has(v) ? current.delete(v) : current.add(v);
        pin(key, values.filter(x => current.has(x)));
      });
      box.append(chip);
    }
  }

  for (const button of document.querySelectorAll('.unpin')) {
    button.addEventListener('click', () => unpin(button.dataset.key));
  }
}

function syncControls() {
  const g = state.genome;

  for (const [key] of SELECTS) {
    const field = document.querySelector(`.field[data-key="${key}"]`);
    field.querySelector('select').value = g[key];
    const pinned = key in state.pinned;
    field.classList.toggle('pinned', pinned);
    field.querySelector('.pin').hidden = !pinned;
  }

  for (const [key] of CHIPS) {
    const box = $(key);
    for (const chip of box.children) {
      chip.classList.toggle('on', g[key].includes(chip.dataset.value));
    }
    box.classList.toggle('pinned', key in state.pinned);
    document.querySelector(`.unpin[data-key="${key}"]`).hidden = !(key in state.pinned);
  }

  $('seed').value = state.seed;
  $('catName').textContent = g.name;
  $('rarity').textContent = rarity(g);
  $('rarity').dataset.tier = rarity(g);
  $('chaos').value = state.chaos;
  $('chaosOut').textContent = state.chaos.toFixed(2);
}

// drawing ------------------------------------------------------------------------

function genomeFor(seed) {
  return createGenome(seed, {chaos: state.chaos, ...state.pinned});
}

function draw(t = null) {
  const size = state.animate ? 600 : canvas.width;
  const cat = renderCat(state.genome, {size, t});
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cat, 0, 0, canvas.width, canvas.height);
}

function drawGrid() {
  const grid = $('grid');
  grid.replaceChildren();

  for (let i = 0; i < 16; i++) {
    const seed = randomSeed();
    const cell = renderCat(genomeFor(seed), {size: 300});
    cell.title = seed;
    cell.addEventListener('click', () => {
      $('gridMode').checked = false;
      state.gridMode = false;
      go(seed);
    });
    grid.append(cell);
  }
}

function update() {
  state.genome = genomeFor(state.seed);
  syncControls();
  writeHash();

  $('grid').hidden = !state.gridMode;
  if (state.gridMode) {
    drawGrid();
  } else if (!state.animate) {
    draw();
  }
}

function go(seed) {
  if (seed !== state.seed) {
    state.history.push(state.seed);
  }
  state.seed = seed;
  update();
}

// animation and recording -----------------------------------------------------------

let start = null;

function frame(now) {
  if (!state.animate) {
    return;
  }

  start ??= now;
  if (!state.gridMode) {
    draw((now - start) / 1000);
  }
  requestAnimationFrame(frame);
}

function setAnimate(on) {
  state.animate = on;
  $('animate').checked = on;
  start = null;
  if (on) {
    requestAnimationFrame(frame);
  } else {
    draw();
  }
}

async function record() {
  const button = $('record');
  const wasAnimating = state.animate;
  setAnimate(true);

  const stream = canvas.captureStream(30);
  const type = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
  const recorder = new MediaRecorder(stream, {mimeType: type, videoBitsPerSecond: 6_000_000});
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, {type});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cat-${state.seed}.${type.includes('mp4') ? 'mp4' : 'webm'}`;
    link.click();
    button.textContent = 'record clip';
    button.disabled = false;
    if (!wasAnimating) setAnimate(false);
  };

  button.disabled = true;
  button.textContent = 'recording…';
  recorder.start();
  setTimeout(() => recorder.stop(), 4000);
}

function save() {
  const big = renderCat(state.genome, {size: 1600});
  big.toBlob(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cat-${state.seed}.png`;
    link.click();
  });
}

// wiring ------------------------------------------------------------------------------

function sizeCanvas() {
  const px = Math.min(1400, Math.round(canvas.getBoundingClientRect().width * devicePixelRatio));
  if (px && px !== canvas.width) {
    canvas.width = canvas.height = px;
    if (!state.animate && state.genome) draw();
  }
}

buildControls();
readHash();

$('another').addEventListener('click', () => go(randomSeed()));
$('back').addEventListener('click', () => {
  if (state.history.length) {
    state.seed = state.history.pop();
    update();
  }
});
$('seed').addEventListener('change', e => go(e.target.value.trim() || randomSeed()));
$('chaos').addEventListener('input', e => {
  state.chaos = Number(e.target.value);
  update();
});
$('animate').addEventListener('change', e => setAnimate(e.target.checked));
$('gridMode').addEventListener('change', e => {
  state.gridMode = e.target.checked;
  update();
});
$('save').addEventListener('click', save);
$('record').addEventListener('click', record);
$('copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(location.href);
  $('copy').textContent = 'copied!';
  setTimeout(() => ($('copy').textContent = 'copy link'), 1200);
});
$('unpinAll').addEventListener('click', () => {
  state.pinned = {};
  update();
});

document.addEventListener('keydown', e => {
  if (e.target.matches('input[type="text"], input:not([type]), select') || e.metaKey || e.ctrlKey) {
    return;
  }

  if (e.key === ' ' || e.key === 'ArrowRight') {
    e.preventDefault();
    go(randomSeed());
  } else if (e.key === 'ArrowLeft') {
    $('back').click();
  } else if (e.key === 'a') {
    setAnimate(!state.animate);
  } else if (e.key === 'g') {
    $('gridMode').click();
  } else if (e.key === 's') {
    save();
  }
});

new ResizeObserver(sizeCanvas).observe(canvas);
sizeCanvas();
update();
