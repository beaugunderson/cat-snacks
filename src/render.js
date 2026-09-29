import {drawBackground} from './backgrounds.js';
import {EFFECT_GROUPS, LAYER_EFFECTS} from './catalog.js';
import {EFFECTS} from './effects.js';
import {FRAMES} from './frames.js';
import {Rng} from './rng.js';
import {buildScene} from './scene.js';
import {STYLES} from './styles/index.js';

// Pipeline: background -> style paints the cat on its own transparent layer
// -> layer effects (sticker, shadow...) -> composite -> canvas effects in a
// fixed order (transform, then overlay).

let canvasFactory = (w, h) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

// node callers pass node-canvas's createCanvas here
export function setCanvasFactory(fn) {
  canvasFactory = fn;
}

export const createCanvas = (w, h) => canvasFactory(w, h);

const ORDER = [...EFFECT_GROUPS.transform, ...EFFECT_GROUPS.overlay];

// transparent: skip the background and whole-picture effects, leaving just
// the cat (plus layer effects like sticker or shadow) on a clear canvas
export function renderCat(g, {size = 600, t = null, transparent = false} = {}) {
  const rng = new Rng(g.seed).fork('render');
  const env = {g, size, t, rng, createCanvas, renderCat};
  const style = STYLES[g.style] || STYLES.classic;

  const out = createCanvas(size, size);
  const ctx = out.getContext('2d');
  ctx.scale(size / 600, size / 600);

  if (style.full) {
    style.full(ctx, g, {...env, transparent});
  } else {
    if (!transparent) {
      drawBackground(ctx, g, rng, t);
    }

    const layer = createCanvas(size, size);
    const lctx = layer.getContext('2d');
    lctx.scale(size / 600, size / 600);
    style.draw(lctx, buildScene(g, t), g, {...env, transparent, rng: rng.fork('style')});

    for (const name of g.effects.filter(e => LAYER_EFFECTS.includes(e))) {
      EFFECTS[name](layer, {...env, rng: rng.fork(name)});
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(layer, 0, 0);
  }

  if (transparent) {
    return out;
  }

  for (const name of ORDER.filter(e => g.effects.includes(e))) {
    EFFECTS[name](out, {...env, rng: rng.fork(name)});
  }

  const frame = FRAMES[g.frame];
  return frame ? frame(out, g, {...env, rng: rng.fork('frame')}) : out;
}

export function renderGrid(genomes, {size = 1200, gap = 8, t = null, background = '#ffffff'} = {}) {
  const n = Math.ceil(Math.sqrt(genomes.length));
  const cell = (size - gap * (n + 1)) / n;
  const out = createCanvas(size, size);
  const ctx = out.getContext('2d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);

  genomes.forEach((g, i) => {
    const x = gap + (i % n) * (cell + gap);
    const y = gap + Math.floor(i / n) * (cell + gap);
    ctx.drawImage(renderCat(g, {size: Math.round(cell), t}), Math.round(x), Math.round(y));
  });

  return out;
}
