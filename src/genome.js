import {
  ACCESSORY_SLOTS, BACKGROUNDS, EFFECT_GROUPS, EVERYDAY_BACKGROUNDS, FERAL_ACCESSORIES,
  FERAL_BACKGROUNDS, LAYER_EFFECTS, PATTERNS, STYLES,
} from './catalog.js';
import {hsl, lighten, darken, pickContrasting, shiftHue} from './color.js';
import * as P from './palettes.js';
import {Rng, randomSeed} from './rng.js';
import {STYLE_META} from './styles/meta.js';

// A genome is a flat bag of traits. It fully determines a cat: rendering the
// same genome always draws the same picture, and any trait can be pinned by
// passing it in `overrides`.
//
// Chaos (0 to 1) scales everything strange: at 0 every cat is an ordinary cat
// (in any art style), and the weird eyes, feral accessories and effects all
// fade in as it rises.

const HEAD_PRESETS = {
  ellipse: () => ({headN: 2, jowl: 0}),
  squircle: r => ({headN: r.float(2.7, 3.6), jowl: 0}),
  chonk: r => ({headN: 2.3, jowl: r.float(0.12, 0.25), headW: r.float(195, 225), headH: r.float(115, 145)}),
  onigiri: r => ({headN: 2.4, jowl: r.float(0.3, 0.45), headH: r.float(130, 160)}),
  triangular: r => ({headN: 2, jowl: 0, headAngle: r.float(0.75, 0.9)}),
  pear: r => ({headN: 2, jowl: r.float(0.15, 0.25)}),
  bean: r => ({headN: 2.2, jowl: r.float(-0.2, -0.1)}),
};

function head(r) {
  const headShape = r.weighted({ellipse: 4, squircle: 2, chonk: 2, onigiri: 1.5, triangular: 3, pear: 1, bean: 1});

  return {
    headShape,
    headW: r.float(150, 210),
    headH: r.float(100, 155),
    headAngle: 0.8,
    ...HEAD_PRESETS[headShape](r),
    earShape: r.weighted({pointy: 4, curved: 4, folded: 1, tufted: 1, big: 1, rounded: 2, tiny: 1}),
    earSize: r.float(0.85, 1.2),
    earSpread: r.float(0.9, 1.1),
    earLean: r.float(-0.15, 0.2),
    earInsides: r.chance(0.65),
  };
}

function palette(r, c) {
  const feral = r.chance(0.5 * c);
  const fur = feral ? hsl(r.float(0, 360), r.float(0.55, 0.9), r.float(0.5, 0.72)) : r.pick(P.FUR);
  const irisPool = r.chance(0.3 * c) ? P.FERAL_IRIS : P.IRIS;
  const eyeColor = r.pick(irisPool);

  return {
    fur,
    fur2: darken(fur, r.float(0.08, 0.18)),
    fur3: lighten(fur, r.float(0.12, 0.25)),
    earInner: r.chance(0.6) ? r.pick(P.EAR_INNER) : lighten(fur, r.sign() * 0.075),
    eyeColor,
    eyeColorR: r.chance(0.12 + 0.1 * c) ? r.pick(irisPool) : eyeColor,
    dotEyeColor: pickContrasting(r, fur, P.DOT_EYES),
    noseColor: pickContrasting(r, fur, P.NOSE),
    ink: r.chance(0.12 * c) ? darken(shiftHue(fur, 180), 0.35) : P.INK,
    bgColor: pickContrasting(r, fur, P.BACKGROUND),
    accent: r.pick(P.ACCENTS),
    accent2: r.pick(P.ACCENTS),
  };
}

function face(r, c) {
  const odd = c * 1.7;
  const eyeKind = r.weighted({
    dot: 6, round: 4, anime: 3, slit: 3, sleepy: 1.5, closed: 1, happy: 1.2, content: 1, pie: 0.4,
    heart: odd, star: odd, x: odd, spiral: odd, void: odd, button: odd * 0.5, glow: odd,
  });

  let eyeKindR = eyeKind;

  // a wink, or at higher chaos, one mismatched eye
  if (r.chance(0.08 + 0.12 * c)) {
    eyeKindR = r.chance(c) ? r.pick(['x', 'star', 'heart', 'spiral']) : r.pick(['happy', 'closed', 'content']);
  }

  return {
    eyeKind,
    eyeKindR,
    eyeSize: r.float(10, 15),
    eyeSpacing: r.float(0.36, 0.46),
    eyeY: -r.float(0.18, 0.34),
    derp: r.chance(0.05 + 0.15 * c),
    brows: r.chance(0.05 + 0.3 * c) ? r.pick(['angry', 'worried', 'raised', 'unibrow']) : 'none',
    noseKind: r.weighted({round: 4, triangle: 4, heart: 1.5, button: 1.5, wide: 1, none: 0.3}),
    noseY: r.float(-0.05, 0.18),
    mouthKind: r.weighted({
      split: 5, w: 4, smile: 2, o: 1, blep: 1.5 + c, meow: 1 + c, fangs: c * 1.5,
      flat: 0.7, cheshire: c * 1.2, frown: 0.5, wobbly: 0.3 + c * 0.7,
    }),
    mouthW: r.float(0.22, 0.34),
    mouthH: r.float(0.15, 0.32),
    mouthDrop: r.chance(0.5),
    whiskerKind: r.weighted({none: 2, straight: 3, droopy: 3, curly: 0.5 + c, long: 1, messy: 0.5 + c, pads: 1}),
    whiskerDroop: r.float(0.02, 0.12),
    cheeks: r.chance(0.2 + 0.2 * c),
  };
}

function patterns(r, c) {
  if (r.chance(0.25 - 0.15 * c)) {
    return [];
  }

  const weights = {
    tabby: 5, spot: 2, chin: 2, calico: 2, tuxedo: 2, point: 1.5, chimera: 0.4 + c,
    tiger: 1 + c, leopard: 0.8 + c, earTips: 1, blaze: 1, galaxy: c * 1.1, freckles: 0.6,
  };

  const out = [r.weighted(weights)];

  if (r.chance(0.15 + 0.35 * c)) {
    const second = r.weighted(weights);
    if (!out.includes(second)) {
      out.push(second);
    }
  }

  return out.filter(p => PATTERNS.includes(p));
}

function accessories(r, c) {
  const slots = r.shuffle(Object.keys(ACCESSORY_SLOTS));
  const out = [];
  let p = 0.12 + 0.55 * c;

  for (const slot of slots) {
    if (r.chance(p)) {
      const tame = ACCESSORY_SLOTS[slot].filter(a => !FERAL_ACCESSORIES.includes(a));
      out.push(r.pick(r.chance(c) ? ACCESSORY_SLOTS[slot] : tame));
      p *= 0.55;
    }
  }

  return out;
}

function effects(r, c) {
  const out = [];

  if (r.chance(0.3 * c)) {
    out.push(r.pick(LAYER_EFFECTS));
  }

  if (r.chance(0.36 * c)) {
    out.push(r.pick(EFFECT_GROUPS.transform));
  }

  if (r.chance(0.43 * c)) {
    out.push(r.pick(EFFECT_GROUPS.overlay));
  }

  return out;
}

function background(r, c) {
  if (r.chance(0.35 * c)) {
    return r.pick(FERAL_BACKGROUNDS);
  }

  return r.weighted(EVERYDAY_BACKGROUNDS.map(b => [b, b === 'solid' || b === 'circle' ? 3 : 1]));
}

export function createGenome(seed = randomSeed(), overrides = {}) {
  const root = new Rng(seed);
  const chaos = overrides.chaos ?? 0.6;

  const style = overrides.style ?? root.fork('style').weighted(
    STYLES.map(name => [name, STYLE_META[name].weight(chaos)]));

  let g = {
    seed: String(seed),
    chaos,
    style,
    ...head(root.fork('head')),
    ...palette(root.fork('palette'), chaos),
    ...face(root.fork('face'), chaos),
    patterns: patterns(root.fork('patterns'), chaos),
    accessories: accessories(root.fork('accessories'), chaos),
    background: background(root.fork('background'), chaos),
    bgColor2: null,
    effects: effects(root.fork('effects'), chaos),
    // animation phase offsets, so a grid of cats doesn't blink in unison
    phase: root.fork('phase').float(0, 100),
  };

  g.bgColor2 = lighten(g.bgColor, g.bgColor === '#ffffff' ? -0.08 : root.fork('bg2').sign() * 0.1);

  // accessories nudge the face toward something that goes with them
  const nudge = root.fork('nudge');

  if (g.accessories.includes('zzz') && nudge.chance(0.8)) {
    g.eyeKind = g.eyeKindR = nudge.pick(['closed', 'content', 'sleepy']);
  }

  if (g.accessories.includes('lasers')) {
    g.eyeKind = g.eyeKindR = 'glow';
  }

  if (g.accessories.some(a => a === 'fish' || a === 'bubblegum')) {
    g.mouthKind = 'w';
  }

  const meta = STYLE_META[style];

  if (meta?.tweak) {
    g = {...g, ...meta.tweak(g, root.fork(`tweak:${style}`))};
  }

  if (meta?.medium) {
    g.effects = g.effects.filter(e => !EFFECT_GROUPS.transform.includes(e));
  }

  // wide, flat heads read as a smear once whiskers are in the frame
  g.headH = Math.max(g.headH, g.headW * 0.58);

  const merged = {...g, ...overrides};

  if (!BACKGROUNDS.includes(merged.background)) {
    merged.background = 'solid';
  }

  return merged;
}
