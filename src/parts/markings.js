import {darken, lighten, luminance, mix} from '../color.js';
import {arc, bezier, blob, bounds, circle, ellipse, lerp, poisson, pointInPoly, quad, rect, scale} from '../geom.js';
import {CALICO_BLACK, CALICO_ORANGE} from '../palettes.js';
import {fillShape} from '../shapes.js';

// Fur patterns. Every shape here is clipped to the head-and-ears silhouette
// by the renderer, so they can spill past the edges freely.

const BIG = 500;

function mark(polys, fill, extra) {
  return fillShape('marking', polys, fill, null, 0, extra);
}

const PATTERNS = {
  tabby(f) {
    const {g, w, h} = f;
    const color = darken(g.fur, 0.14);
    const sideW = w * 0.3;
    const sideH = h * 0.45;
    const top = -h * 1.15;
    const polys = [];

    for (const o of [-1, 1]) {
      polys.push(bezier([sideW * o, top], [sideW * 0.5 * o, -sideH], [sideW * 0.2 * o, -sideH], [sideW * 0.6 * o, top], 16));
    }

    const cw = w * 0.1;
    polys.push(bezier([-cw, top], [-cw * 0.1, -h * 0.5], [cw * 0.1, -h * 0.5], [cw, top], 16));

    for (const o of [-1, 1]) {
      for (const y of [h * 0.05, h * 0.3]) {
        polys.push([[o * w * 1.2, y - 9], [o * w * 0.62, y + 2], [o * w * 1.2, y + 11]]);
      }
    }

    return [mark(polys, color)];
  },

  spot(f, rng) {
    const {g, w, h} = f;
    const size = rng.float(65, 85);
    return [mark(ellipse(w * 0.45 * rng.sign(), -h * rng.float(0.25, 0.55), size * rng.float(1, 1.5), size), darken(g.fur, 0.12))];
  },

  chin(f, rng) {
    const {g, h} = f;
    const cy = -h * rng.float(0.6, 0.9);
    const lower = arc(0, cy, 250, h * 1.5, 0, Math.PI, 40);
    // lower arc runs right to left, then close along the bottom
    return [mark([...lower, [-250, BIG], [250, BIG]], darken(g.fur, 0.1))];
  },

  calico(f, rng) {
    const {g, w, h} = f;
    const dark = luminance(g.fur) < 0.2;
    const colors = dark ? [rng.pick(CALICO_ORANGE), '#f6f1e9'] : [rng.pick(CALICO_ORANGE), rng.pick(CALICO_BLACK)];
    const count = rng.int(2, 4);
    const shapes = [];

    for (let i = 0; i < count; i++) {
      const cx = rng.float(-w, w);
      const cy = rng.float(-h * 1.3, h * 0.6);
      shapes.push(mark(blob(rng, cx, cy, rng.float(0.28, 0.5) * w, 0.35), colors[i % 2]));
    }

    return shapes;
  },

  tuxedo(f) {
    const {g, w, h} = f;
    const capY = g.noseY * h - h * 0.02;
    const bw = w * 0.16;
    const boundary = [
      ...quad([-w * 1.3, capY + h * 0.4], [-w * 0.45, capY - h * 0.05], [-bw, capY], 12),
      [-w * 0.05, -h * 1.2],
      [w * 0.05, -h * 1.2],
      ...quad([bw, capY], [w * 0.45, capY - h * 0.05], [w * 1.3, capY + h * 0.4], 12),
    ];

    if (luminance(g.fur) < 0.35) {
      return [mark([...boundary, [w * 1.3, BIG], [-w * 1.3, BIG]], '#f6f1e9')];
    }

    return [mark([...boundary, [w * 1.3, -BIG], [-w * 1.3, -BIG]], '#2b2522')];
  },

  point(f, _rng, _head, ears) {
    const {g, w, h} = f;
    const color = mix(darken(g.fur, 0.35), '#3a2a22', 0.5);
    const y = g.noseY * h + h * 0.05;

    return [
      mark(ellipse(0, y, w * 0.5, h * 0.62), color, {alpha: 0.35}),
      mark(ellipse(0, y, w * 0.36, h * 0.44), color, {alpha: 0.85}),
      ...ears.map(e => mark(e.outline, color, {alpha: 0.85})),
    ];
  },

  chimera(f) {
    const {g} = f;
    const other = luminance(g.fur) > 0.35 ? '#2b2522' : '#e8a86b';
    return [mark(rect(0, -BIG, BIG, BIG * 2), other)];
  },

  tiger(f, rng) {
    const {g, w, h} = f;
    const color = luminance(g.fur) < 0.1 ? '#e0913a' : darken(g.fur, 0.3);
    const polys = [];

    for (const o of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = lerp(-h * 0.7, h * 0.7, i / 3) + rng.float(-8, 8);
        const tip = [o * w * rng.float(0.55, 0.72), y + rng.float(-15, 15)];
        polys.push([
          [o * w * 1.3, y - h * 0.07],
          ...quad([o * w * 1.0, y - h * 0.09], [o * w * 0.8, tip[1] - 6], tip, 8).slice(1),
          ...quad(tip, [o * w * 0.8, tip[1] + 10], [o * w * 1.3, y + h * 0.07], 8).slice(1),
        ]);
      }
    }

    for (const x of [-w * 0.18, 0, w * 0.18]) {
      const len = x === 0 ? h * 0.55 : h * 0.4;
      polys.push([[x - 8, -h * 1.2], [x, -h * 1.2 + len + h * 0.4], [x + 8, -h * 1.2]]);
    }

    return [mark(polys, color)];
  },

  leopard(f, rng, head) {
    const {g, w} = f;
    const dark = darken(g.fur, 0.35);
    const inner = mix(g.fur, dark, 0.35);
    const b = bounds([head]);
    const shapes = [];

    for (const [px, py] of poisson(rng, b.w, b.h, w * 0.22, 40)) {
      const x = b.minX + px;
      const y = b.minY + py;

      if (!pointInPoly([x, y], head)) {
        continue;
      }

      const r = rng.float(0.07, 0.11) * w;
      shapes.push(mark(blob(rng, x, y, r, 0.3, 12), dark));
      shapes.push(mark(blob(rng, x, y, r * 0.55, 0.3, 10), inner));
    }

    return shapes;
  },

  earTips(f, _rng, _head, ears) {
    const color = darken(f.g.fur, 0.3);
    return ears.map(e => mark(scale(e.outline, 0.42, 0.42, e.tip[0], e.tip[1] - 4), color));
  },

  blaze(f) {
    const {g, w, h} = f;
    const y = g.noseY * h;
    const color = luminance(g.fur) > 0.8 ? darken(g.fur, 0.2) : lighten(g.fur, 0.3);
    return [mark([[-w * 0.05, -h * 1.2], [w * 0.05, -h * 1.2], [w * 0.13, y - h * 0.05], ...arc(0, y - h * 0.05, w * 0.13, h * 0.1, 0, Math.PI, 8).slice(1)], color)];
  },

  galaxy(f, rng, head) {
    const {w, h} = f;
    const b = bounds([head]);
    const shapes = [mark(rect(-BIG, -BIG, BIG * 2, BIG * 2), '#1a1033', {alpha: 0.9})];

    for (const color of ['#6a2c91', '#1b8a9e', '#c2185b']) {
      shapes.push(mark(blob(rng, rng.float(-w * 0.8, w * 0.8), rng.float(-h, h * 0.8), rng.float(0.3, 0.55) * w, 0.45), color, {alpha: 0.45}));
    }

    const stars = [];
    for (let i = 0; i < 40; i++) {
      stars.push(circle(rng.float(b.minX, b.maxX), rng.float(b.minY - 80, b.maxY), rng.float(1, 3.2), 8));
    }

    shapes.push(mark(stars, '#ffffff', {alpha: 0.9}));
    return shapes;
  },

  freckles(f, rng) {
    const {g, w, h} = f;
    const y = g.noseY * h;
    const dots = [];

    for (const o of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        dots.push(circle(o * rng.float(w * 0.15, w * 0.4), y + rng.float(-h * 0.2, h * 0.1), rng.float(2.5, 4.5), 10));
      }
    }

    return [mark(dots, darken(g.fur, 0.25))];
  },
};

export const PATTERN_NAMES = Object.keys(PATTERNS);

export function markings(f, rng, head, ears) {
  const {g} = f;
  const shapes = [];

  for (const name of g.patterns) {
    shapes.push(...PATTERNS[name](f, rng.fork(name), head, ears));
  }

  const siamese = g.patterns.includes('point') || g.patterns.includes('galaxy');

  if (g.earInsides && !siamese) {
    for (const ear of ears) {
      if (ear.insides) {
        shapes.push(fillShape('earInner', ear.insides, g.earInner));
      }
    }
  }

  return shapes;
}
