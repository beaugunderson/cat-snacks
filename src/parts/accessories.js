import {darken, lighten} from '../color.js';
import {
  TAU, arc, bezier, circle, ellipse, heart, inflate, lerp, lerpPt, path, quad, rect, rotate, roundRect,
  star, translate,
} from '../geom.js';
import {fillShape, lineShape, textShape} from '../shapes.js';

// Accessories get the finished head's anchors (eye positions, head top, chin,
// ear tips) and return shapes for the layer behind the head and the layer in
// front of it.

const acc = (polys, fill, ink, width = 5, extra) => fillShape('acc', polys, fill, ink, width, extra);
const accLine = (polys, stroke, width, extra) => lineShape('accLine', polys, stroke, width, extra);

// rotate every shape around a pivot, for tilted hats
function tilt(shapes, angle, pivot) {
  return shapes.map(s => ({...s, polys: s.polys.map(p => rotate(p, angle, pivot[0], pivot[1]))}));
}

function cone(baseY, halfWidth, height) {
  return [[-halfWidth, baseY], [0, baseY - height], [halfWidth, baseY]];
}

const RIM_COLORS = ['#000000', '#1766b5', '#6617b5', '#8b0000', '#a52a2a', '#b56617', '#daf650'];
const TINTS = ['#000000', '#0a0f05', '#163721', '#8b4513', '#ef597b', '#f3f315', '#ff69b4'];

const ACCESSORIES = {
  // hats ---------------------------------------------------------------------

  tophat(a) {
    const {w, h, top, ink, rng} = a;
    const base = top + h * 0.12;
    const cw = w * 0.4;
    const ch = h * rng.float(0.8, 1.05);
    const color = rng.pick(['#222222', '#3b2a4a', '#5a2323', '#1f3b2c']);
    const shapes = [
      acc(ellipse(0, base, w * 0.62, h * 0.1), color, ink, 6),
      acc([[-cw, base], [-cw * 0.92, base - ch], [cw * 0.92, base - ch], [cw, base]], color, ink, 6),
      acc([[-cw * 0.985, base - h * 0.08], [-cw * 0.96, base - h * 0.24], [cw * 0.96, base - h * 0.24], [cw * 0.985, base - h * 0.08]], a.accent, ink, 4),
      acc(ellipse(0, base - ch, cw * 0.92, h * 0.06), lighten(color, 0.06), ink, 5),
    ];
    return {front: tilt(shapes, rng.float(-0.25, 0.25), [0, base])};
  },

  party(a) {
    const {w, h, top, ink, rng} = a;
    const base = top + h * 0.1;
    const half = w * 0.28;
    const height = h * 1.15;
    const tri = cone(base, half, height);
    const bands = [];

    for (let i = 0; i < 3; i++) {
      const t0 = 0.12 + i * 0.28;
      const t1 = t0 + 0.13;
      const l0 = lerpPt(tri[0], tri[1], t0);
      const l1 = lerpPt(tri[0], tri[1], t1);
      const r0 = lerpPt(tri[2], tri[1], t0);
      const r1 = lerpPt(tri[2], tri[1], t1);
      bands.push([l0, l1, r1, r0]);
    }

    const shapes = [
      acc(tri, a.accent, ink, 5),
      acc(bands, a.accent2, null, 0),
      accLine([tri], ink, 5),
      acc(circle(0, base - height, w * 0.07), '#ffffff', ink, 4),
    ];
    return {front: tilt(shapes, rng.float(-0.35, 0.35), [0, base])};
  },

  crown(a) {
    const {w, h, top, ink, rng} = a;
    const base = top + h * 0.15;
    const cw = w * 0.38;
    const ch = h * 0.5;
    const points = [];
    const spikes = 5;

    points.push([-cw, base]);
    for (let i = 0; i <= spikes * 2; i++) {
      const x = lerp(-cw, cw, i / (spikes * 2));
      points.push([x, i % 2 === 0 ? base - ch : base - ch * 0.45]);
    }
    points.push([cw, base]);

    const gold = '#f5c542';
    const jewels = [];
    for (let i = 0; i < 3; i++) {
      jewels.push(acc(circle(lerp(-cw * 0.55, cw * 0.55, i / 2), base - ch * 0.2, w * 0.035), ['#e63946', '#3a86ff', '#2ecc71'][i], ink, 3));
    }

    const shapes = [acc(points, gold, ink, 5), ...jewels];
    for (let i = 0; i <= spikes; i++) {
      shapes.push(acc(circle(lerp(-cw, cw, i / spikes), base - ch, w * 0.028), '#fff3b0', ink, 3));
    }

    return {front: tilt(shapes, rng.float(-0.15, 0.15), [0, base])};
  },

  beanie(a) {
    const {w, h, top, ink} = a;
    const base = top + h * 0.45;
    const dome = arc(0, base, w * 0.72, h * 0.62, Math.PI, TAU, 30);
    const ribs = [];

    for (let i = -3; i <= 3; i++) {
      ribs.push([[i * w * 0.18, base], [i * w * 0.12, base - h * 0.5 * Math.cos((i / 4) * 1.2)]]);
    }

    return {
      front: [
        acc(dome, a.accent, ink, 6),
        accLine(ribs, darken(a.accent, 0.12), 4),
        acc(roundRect(-w * 0.76, base - h * 0.12, w * 1.52, h * 0.24, h * 0.1), darken(a.accent, 0.08), ink, 6),
        acc(circle(0, base - h * 0.64, w * 0.12), a.accent2, ink, 5),
      ],
    };
  },

  wizard(a) {
    const {w, h, top, ink, rng} = a;
    const base = top + h * 0.12;
    const purple = rng.pick(['#4b3fa0', '#2a2a72', '#5b2a86']);
    const tip = [w * 0.35, base - h * 1.5];
    const hat = path([-w * 0.32, base])
      .quad([-w * 0.1, base - h * 0.8], [0, base - h * 1.15])
      .quad([w * 0.1, base - h * 1.35], tip)
      .quad([w * 0.18, base - h * 1.1], [w * 0.32, base])
      .pts;
    const stars = [];

    for (let i = 0; i < 3; i++) {
      stars.push(star(rng.float(-w * 0.15, w * 0.15), base - h * rng.float(0.2, 0.9), w * 0.05, 0.45));
    }

    return {
      front: [
        acc(ellipse(0, base, w * 0.7, h * 0.12), purple, ink, 6),
        acc(hat, purple, ink, 6),
        acc(stars, '#ffd23f', null, 0),
        acc(star(tip[0], tip[1], w * 0.06, 0.45), '#ffd23f', ink, 3),
      ],
    };
  },

  halo(a) {
    const {w, h, top, t} = a;
    const y = top - h * 0.35 + Math.sin(t * 2) * 4;
    return {front: [accLine([ellipse(0, y, w * 0.5, w * 0.11)], '#ffd84a', 10, {glow: '#fff3a0'})]};
  },

  horns(a) {
    const {w, h, top, ink} = a;
    const shapes = [];

    for (const o of [-1, 1]) {
      const bx = o * w * 0.3;
      const by = top + h * 0.15;
      const tip = [o * w * 0.52, top - h * 0.55];
      const horn = [
        ...quad([bx - o * w * 0.1, by], [bx - o * w * 0.1, top - h * 0.3], tip, 12),
        ...quad(tip, [bx + o * w * 0.12, top - h * 0.05], [bx + o * w * 0.1, by], 12).slice(1),
      ];
      shapes.push(acc(horn, '#c1121f', ink, 5));
    }

    return {front: shapes};
  },

  unicorn(a) {
    const {w, h, top, ink} = a;
    const base = top + h * 0.15;
    const tri = [[-w * 0.1, base], [0, base - h * 1.0], [w * 0.1, base]];
    const stripes = [];

    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const y = lerp(base, base - h, t);
      const half = w * 0.1 * (1 - t);
      stripes.push([[-half, y + 6], [half, y - 6]]);
    }

    return {front: [acc(tri, '#f7d6ff', ink, 5), accLine(stripes, '#b388eb', 4)]};
  },

  propeller(a) {
    const {w, h, top, ink, t} = a;
    const base = top + h * 0.3;
    const dome = arc(0, base, w * 0.45, h * 0.42, Math.PI, TAU, 24);
    const segments = [];
    const colors = ['#e63946', '#f1c40f', '#3498db', '#2ecc71'];

    for (let i = 0; i < 4; i++) {
      const a0 = Math.PI + (i / 4) * Math.PI;
      const a1 = Math.PI + ((i + 1) / 4) * Math.PI;
      segments.push(acc([[0, base], ...arc(0, base, w * 0.45, h * 0.42, a0, a1, 8)], colors[i], null, 0));
    }

    const hub = [0, base - h * 0.42 - h * 0.18];
    const spin = (t || 0) * 12;
    const squash = Math.cos(spin);
    const blades = [
      ellipse(hub[0] - w * 0.2 * squash, hub[1], Math.abs(w * 0.2 * squash) + 3, h * 0.05),
      ellipse(hub[0] + w * 0.2 * squash, hub[1], Math.abs(w * 0.2 * squash) + 3, h * 0.05),
    ];

    return {
      front: [
        ...segments,
        accLine([dome], ink, 6),
        accLine([[[0, base - h * 0.42], hub]], ink, 5),
        acc(blades, '#f1c40f', ink, 4),
        acc(circle(hub[0], hub[1], w * 0.03), '#e63946', ink, 3),
      ],
    };
  },

  flowers(a) {
    const {w, h, top, ink, rng} = a;
    const shapes = [];
    const count = rng.int(5, 7);
    const colors = ['#ff8fab', '#ffd166', '#cdb4db', '#ffffff', '#ff6b6b', '#a0c4ff'];

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = lerp(Math.PI * 1.12, Math.PI * 1.88, t);
      const cx = Math.cos(angle) * w * 0.82;
      const cy = top + h * 0.95 + Math.sin(angle) * h * 0.95;
      const r = w * rng.float(0.07, 0.09);
      const petals = [];

      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * TAU + rng.float(0, 1);
        petals.push(circle(cx + Math.cos(pa) * r, cy + Math.sin(pa) * r, r * 0.75, 14));
      }

      shapes.push(acc(petals, rng.pick(colors), ink, 3));
      shapes.push(acc(circle(cx, cy, r * 0.5, 12), '#ffb703', ink, 2));
    }

    return {front: shapes};
  },

  cowboy(a) {
    const {w, h, top, ink} = a;
    const base = top + h * 0.2;
    const brown = '#8b5a2b';
    const brim = path([-w * 0.95, base - h * 0.25])
      .quad([-w * 0.7, base + h * 0.12], [0, base + h * 0.08])
      .quad([w * 0.7, base + h * 0.12], [w * 0.95, base - h * 0.25])
      .quad([w * 0.6, base - h * 0.02], [0, base - h * 0.04])
      .quad([-w * 0.6, base - h * 0.02], [-w * 0.95, base - h * 0.25])
      .pts;
    const crown = path([-w * 0.42, base])
      .quad([-w * 0.45, base - h * 0.75], [-w * 0.15, base - h * 0.72])
      .quad([0, base - h * 0.6], [w * 0.15, base - h * 0.72])
      .quad([w * 0.45, base - h * 0.75], [w * 0.42, base])
      .pts;

    return {
      front: [
        acc(crown, brown, ink, 6),
        acc(roundRect(-w * 0.42, base - h * 0.2, w * 0.84, h * 0.12, 4), '#4a2c14', null, 0),
        acc(brim, lighten(brown, 0.05), ink, 6),
      ],
    };
  },

  antennae(a) {
    const {w, h, top, ink, t} = a;
    const shapes = [];

    for (const o of [-1, 1]) {
      const wobble = Math.sin((t || 0) * 5 + o) * 10;
      const end = [o * w * 0.35 + wobble, top - h * 0.75];
      shapes.push(accLine([quad([o * w * 0.12, top + h * 0.1], [o * w * 0.1, top - h * 0.5], end, 12)], ink, 6));
      shapes.push(acc(circle(end[0], end[1], w * 0.07), a.accent, ink, 4, {glow: a.accent}));
    }

    return {front: shapes};
  },

  // ears ---------------------------------------------------------------------

  bow(a) {
    const {w, ears, ink} = a;
    const ear = ears[1];
    const [cx, cy] = lerpPt(lerpPt(ear.inner, ear.outer, 0.5), ear.tip, 0.25);
    const s = w * 0.14;
    const wings = [
      [[cx, cy], [cx - s, cy - s * 0.7], [cx - s * 1.1, cy + s * 0.7]],
      [[cx, cy], [cx + s, cy - s * 0.7], [cx + s * 1.1, cy + s * 0.7]],
    ];
    const shapes = [acc(wings, a.accent, ink, 5), acc(circle(cx, cy, s * 0.3), darken(a.accent, 0.1), ink, 4)];
    return {front: tilt(shapes, 0.5, [cx, cy])};
  },

  earring(a) {
    const {ears, w} = a;
    const ear = ears[0];
    const [x, y] = lerpPt(ear.outer, ear.tip, 0.2);
    return {front: [accLine([circle(x - 4, y + w * 0.08, w * 0.06)], '#f5c542', 6)]};
  },

  headphones(a) {
    const {w, h, top, ink} = a;
    const band = arc(0, top + h * 0.95, w * 1.02, h * 1.15, Math.PI * 1.05, Math.PI * 1.95, 30);
    const cups = [-1, 1].map(o => roundRect(o * w * 1.02 - w * 0.13, -h * 0.35, w * 0.26, h * 0.6, w * 0.1));
    return {
      front: [
        accLine([band], ink, 16),
        accLine([band], a.accent, 9),
        acc(cups, a.accent, ink, 6),
      ],
    };
  },

  // eyes ---------------------------------------------------------------------

  glasses(a) {
    const {eyes, eyeSize, rng} = a;
    const xr = eyeSize * rng.float(2.5, 3.5);
    const yr = eyeSize * rng.float(1.75, 2.4);
    const rim = rng.pick(RIM_COLORS);
    const tint = rng.chance(0.5) ? rng.pick(TINTS) : null;
    const lenses = eyes.map(([x, y]) => rect(x - xr, y - yr, xr * 2, yr * 2));
    const bridgeY = eyes[0][1] + yr / rng.float(2, 5);
    const shapes = [];

    if (tint) {
      shapes.push(acc(lenses, tint, null, 0, {alpha: rng.float(0.2, 0.6)}));
    }

    shapes.push(accLine(lenses.map(l => [...l, l[0]]), rim, rng.float(7, 12)));
    shapes.push(accLine([[[eyes[0][0] + xr, bridgeY], [eyes[1][0] - xr, bridgeY]]], rim, 7));
    return {front: shapes};
  },

  roundGlasses(a) {
    const {eyes, eyeRadius, ink} = a;
    const r = Math.max(eyeRadius * 1.35, 26);
    const [l, rr] = eyes;
    return {
      front: [
        acc(eyes.map(([x, y]) => circle(x, y, r)), '#dff6ff', null, 0, {alpha: 0.25}),
        accLine(eyes.map(([x, y]) => [...circle(x, y, r), circle(x, y, r)[0]]), ink, 6),
        accLine([quad([l[0] + r, l[1]], [0, l[1] - r * 0.5], [rr[0] - r, rr[1]], 10)], ink, 6),
      ],
    };
  },

  shades(a) {
    const {eyes, eyeSize, t} = a;
    const u = Math.max(eyeSize * 0.75, 8);
    const [l, r] = eyes;
    const left = l[0] - u * 4;
    const right = r[0] + u * 4;
    const y = l[1] - u * 2;
    const cells = [rect(left - u, y, right - left + u * 2, u)];

    for (const ex of [l[0], r[0]]) {
      cells.push(rect(ex - u * 3.5, y + u, u * 7, u));
      cells.push(rect(ex - u * 3, y + u * 2, u * 6, u));
      cells.push(rect(ex - u * 2, y + u * 3, u * 4, u));
    }

    const shine = [];
    for (const ex of [l[0], r[0]]) {
      shine.push(rect(ex - u * 2, y + u, u, u), rect(ex - u, y + u * 2, u, u));
    }

    // "deal with it": slide in from above on each loop of the animation
    const drop = t == null ? 0 : -Math.max(0, 1 - (t % 6) / 1.2) * 320;
    const move = shapes => shapes.map(s => ({...s, polys: s.polys.map(p => translate(p, 0, drop))}));

    return {front: move([acc(cells, '#0a0a0a', null, 0), acc(shine, '#ffffff', null, 0)])};
  },

  monocle(a) {
    const {eyes, eyeRadius, h} = a;
    const [x, y] = eyes[1];
    const r = Math.max(eyeRadius * 1.4, 28);
    const chain = [];

    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      chain.push([x + r * 0.7 + t * r * 1.2, y + r * 0.7 + Math.sin(t * Math.PI) * h * 0.25 + t * h * 0.5]);
    }

    return {
      front: [
        acc(circle(x, y, r), '#e8f7ff', null, 0, {alpha: 0.2}),
        accLine([[...circle(x, y, r), circle(x, y, r)[0]]], '#d4a017', 6),
        accLine([chain], '#d4a017', 3),
      ],
    };
  },

  eyepatch(a) {
    const {eyes, eyeRadius, w, h, ink} = a;
    const [x, y] = eyes[0];
    const r = Math.max(eyeRadius * 1.25, 24);
    return {
      front: [
        accLine([[[-w * 1.05, y + h * 0.35], [x, y]], [[x, y], [w * 0.95, -h * 0.75]]], ink, 6),
        acc(ellipse(x, y, r * 1.1, r * 0.95), '#111111', ink, 4),
      ],
    };
  },

  lasers(a) {
    const {eyes, t} = a;
    const flicker = 1 + Math.sin((t || 0) * 30) * 0.15;
    const beams = eyes.map(([x, y], i) => {
      const o = i === 0 ? -1 : 1;
      return [[x, y], [x + o * 600, y + 380]];
    });

    return {
      front: [
        accLine(beams, '#ff1a1a', 26 * flicker, {alpha: 0.75, glow: '#ff0000'}),
        accLine(beams, '#ffe0e0', 8 * flicker),
      ],
    };
  },

  visor(a) {
    const {eyes, eyeRadius, ink} = a;
    const [l, r] = eyes;
    const hh = Math.max(eyeRadius * 1.3, 22);
    const x0 = l[0] - hh * 1.8;
    const x1 = r[0] + hh * 1.8;
    const lines = [];

    for (let i = 1; i < 4; i++) {
      const y = l[1] - hh + (i / 4) * hh * 2;
      lines.push([[x0 + 8, y], [x1 - 8, y]]);
    }

    return {
      front: [
        acc(roundRect(x0, l[1] - hh, x1 - x0, hh * 2, hh * 0.8), a.accent, ink, 6, {alpha: 0.85, glow: a.accent}),
        accLine(lines, lighten(a.accent, 0.25), 3, {alpha: 0.7}),
      ],
    };
  },

  anaglyph(a) {
    const {eyes, eyeRadius} = a;
    const r = Math.max(eyeRadius * 1.3, 24);
    const lens = ([x, y]) => rect(x - r * 1.3, y - r, r * 2.6, r * 2);
    return {
      front: [
        acc(lens(eyes[0]), '#ff2a2a', null, 0, {alpha: 0.7}),
        acc(lens(eyes[1]), '#00c8ff', null, 0, {alpha: 0.7}),
        accLine(eyes.map(e => [...lens(e), lens(e)[0]]), '#ffffff', 10),
        accLine([[[eyes[0][0] + r * 1.3, eyes[0][1]], [eyes[1][0] - r * 1.3, eyes[1][1]]]], '#ffffff', 10),
      ],
    };
  },

  // face ---------------------------------------------------------------------

  mustache(a) {
    const {w, h, mouthY, rng} = a;
    const y = mouthY + h * 0.02;
    const color = rng.pick(['#2b1d14', '#4a2c14', '#1d1a1f', '#8b5a2b']);
    const polys = [];

    const r = w * 0.06;

    for (const o of [-1, 1]) {
      const end = [o * w * 0.42, y - h * 0.06];
      const curve = bezier([0, y], [o * w * 0.12, y + h * 0.12], [o * w * 0.32, y + h * 0.1], end, 16);
      // curl up and back toward the face
      const start = o > 0 ? 0 : Math.PI;
      const curl = arc(end[0] - o * r, end[1], r, r, start, start - o * Math.PI * 1.5, 12);
      polys.push([...curve, ...curl.slice(1)]);
    }

    return {front: [accLine(polys, color, 11)]};
  },

  bandaid(a) {
    const {w, h, rng} = a;
    const x = rng.sign() * w * rng.float(0.35, 0.55);
    const y = -h * rng.float(0.5, 0.75);
    const s = w * 0.12;
    const shapes = [
      acc(roundRect(x - s, y - s * 0.35, s * 2, s * 0.7, s * 0.3), '#f1c27d', '#c49a6c', 3),
      acc(rect(x - s * 0.35, y - s * 0.35, s * 0.7, s * 0.7), '#e0a96d', null, 0),
    ];
    return {front: tilt(shapes, rng.float(-0.6, 0.6), [x, y])};
  },

  thirdEye(a) {
    const {eyes, top, ink, eyeSize, t, accent} = a;
    const y = (top + eyes[0][1]) / 2 + 6;
    const s = eyeSize * 1.1;
    const look = Math.sin((t || 0) * 1.7) * s * 0.5;
    const outline = [
      ...quad([0, y - s * 2.2], [s * 2.2, y], [0, y + s * 2.2], 12),
      ...quad([0, y + s * 2.2], [-s * 2.2, y], [0, y - s * 2.2], 12).slice(1, -1),
    ];

    return {
      front: [
        acc(outline, '#ffffff', ink, 4, {glow: accent}),
        acc(circle(look, y, s * 0.8), accent, null, 0),
        acc(ellipse(look, y, s * 0.2, s * 0.7), ink, null, 0),
      ],
    };
  },

  fish(a) {
    const {w, h, mouthY, ink, t} = a;
    const y = mouthY + h * 0.12;
    const wag = Math.sin((t || 0) * 6) * 0.12;
    const body = ellipse(w * 0.12, y, w * 0.34, h * 0.13);
    const tail = [[w * 0.42, y], [w * 0.62, y - h * 0.14], [w * 0.62, y + h * 0.14]];
    const shapes = [
      acc(rotate(tail, wag, w * 0.42, y), '#6fa8dc', ink, 4),
      acc(body, '#8fb8de', ink, 5),
      acc(circle(-w * 0.1, y - h * 0.02, 4.5), ink, null, 0),
      accLine([arc(w * 0.02, y, h * 0.08, h * 0.1, -1, 1, 8)], ink, 3),
    ];
    return {front: shapes};
  },

  bubblegum(a) {
    const {w, mouthY, h, t} = a;
    const grow = t == null ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t * 0.8));
    const r = w * 0.3 * grow;
    const cy = mouthY + h * 0.1 + r * 0.6;
    return {
      front: [
        acc(circle(0, cy, r), '#ff8fc8', '#e0569b', 4, {alpha: 0.9}),
        acc(ellipse(-r * 0.4, cy - r * 0.45, r * 0.2, r * 0.12, 16, -0.6), '#ffffff', null, 0, {alpha: 0.8}),
      ],
    };
  },

  tears(a) {
    const {eyes, eyeRadius, bottom, t} = a;
    const shift = ((t || 0) * 40) % 30;
    const streams = eyes.map(([x, y]) => roundRect(x - 7, y + eyeRadius * 0.6, 14, bottom - y - eyeRadius * 0.6 + 10, 7));
    const drops = eyes.map(([x, y]) => heart(x, y + eyeRadius + 30 + shift, 9));
    return {front: [acc(streams, '#6ec6ff', null, 0, {alpha: 0.75}), acc(drops, '#6ec6ff', null, 0, {alpha: 0.75})]};
  },

  // neck ---------------------------------------------------------------------

  bowtie(a) {
    const {w, bottom, ink} = a;
    const y = bottom + 6;
    const s = w * 0.2;
    return {
      front: [
        acc([[0, y], [-s, y - s * 0.55], [-s, y + s * 0.55]], a.accent, ink, 5),
        acc([[0, y], [s, y - s * 0.55], [s, y + s * 0.55]], a.accent, ink, 5),
        acc(roundRect(-s * 0.22, y - s * 0.25, s * 0.44, s * 0.5, 5), darken(a.accent, 0.1), ink, 4),
      ],
    };
  },

  collar(a) {
    const {w, h, bottom, ink} = a;
    const band = quad([-w * 0.8, bottom - h * 0.35], [0, bottom + h * 0.28], [w * 0.8, bottom - h * 0.35], 24);
    return {
      back: [accLine([band], ink, 30), accLine([band], a.accent, 22)],
      front: [
        acc(circle(0, bottom + h * 0.07, w * 0.08), '#f5c542', ink, 4),
        accLine([[[0, bottom + h * 0.07], [0, bottom + h * 0.07 + w * 0.08]]], ink, 3),
      ],
    };
  },

  bandana(a) {
    const {w, h, bottom, ink, rng} = a;
    const tri = [[-w * 0.72, bottom - h * 0.25], [w * 0.72, bottom - h * 0.25], [0, bottom + h * 0.45]];
    const dots = [];

    for (let i = 0; i < 9; i++) {
      const u = rng.float(0, 1);
      const v = rng.float(0, 1 - u);
      const x = tri[0][0] * (1 - u - v) + tri[1][0] * u + tri[2][0] * v;
      const y = tri[0][1] * (1 - u - v) + tri[1][1] * u + tri[2][1] * v;
      dots.push(circle(x, y, 5, 10));
    }

    return {back: [acc(tri, a.accent, ink, 5), acc(dots, '#ffffff', null, 0)]};
  },

  // floating -----------------------------------------------------------------

  sparkles(a) {
    const {w, h, rng, t} = a;
    const shapes = [];

    for (let i = 0; i < 6; i++) {
      const angle = rng.float(0, TAU);
      const r = rng.float(1.0, 1.2);
      const x = Math.cos(angle) * w * r;
      const y = Math.sin(angle) * h * r * 1.2 - h * 0.2;
      const pulse = t == null ? 1 : 0.6 + 0.4 * Math.abs(Math.sin(t * 2 + i));
      const s = rng.float(10, 22) * pulse;
      shapes.push(acc(star(x, y, s, 0.25, 4), rng.pick(['#fff7b2', '#ffffff', a.accent]), null, 0, {glow: '#ffffff'}));
    }

    return {front: shapes};
  },

  hearts(a) {
    const {w, h, top, rng, t} = a;
    const shapes = [];

    for (let i = 0; i < 4; i++) {
      const rise = t == null ? 0 : ((t * 30 + i * 40) % 160);
      const x = rng.sign() * w * rng.float(0.6, 1.3);
      const y = top + h * rng.float(-0.2, 0.8) - rise;
      shapes.push(acc(heart(x, y, rng.float(12, 22)), rng.pick(['#ff4d6d', '#ff8fab', '#ff006e']), null, 0));
    }

    return {front: shapes};
  },

  zzz(a) {
    const {w, top, ink, t} = a;
    const polys = [];

    for (let i = 0; i < 3; i++) {
      const s = 14 + i * 8;
      const drift = t == null ? 0 : Math.sin(t * 1.5 + i) * 6;
      const x = w * 0.75 + i * 32 + drift;
      const y = top - 10 - i * 42;
      polys.push([[x, y], [x + s, y], [x, y + s], [x + s, y + s]]);
    }

    return {front: [accLine(polys, ink, 6)]};
  },

  speech(a) {
    const {w, top, ink, rng} = a;
    const words = ['meow', 'mrrp', 'feed me', 'no.', 'bread?', 'mlem', 'hi', '!!!', 'nyan', 'purr', 'bap', 'wat'];
    const word = rng.pick(words);
    const bw = Math.max(90, word.length * 20 + 40);
    const bh = 64;
    const x = rng.sign() > 0 ? w * 0.55 : -w * 0.55 - bw;
    const y = top - 110;
    const tailX = x < 0 ? x + bw * 0.75 : x + bw * 0.25;
    const tail = [[tailX - 12, y + bh - 2], [tailX + 12, y + bh - 2], [tailX + (x < 0 ? 22 : -22), y + bh + 30]];

    return {
      front: [
        acc(tail, '#ffffff', ink, 5),
        acc(roundRect(x, y, bw, bh, 26), '#ffffff', ink, 5),
        acc(rect(tailX - 10, y + bh - 8, 20, 8), '#ffffff', null, 0),
        textShape(word, x + bw / 2, y + bh / 2 + 2, 30, ink),
      ],
    };
  },

  sweat(a) {
    const {w, h} = a;
    const x = w * 0.72;
    const y = -h * 0.75;
    const drop = [...quad([x, y - 28], [x + 18, y], [x + 12, y + 10], 8), ...arc(x, y + 8, 12, 12, 0.2, Math.PI - 0.2, 10), ...quad([x - 12, y + 10], [x - 18, y], [x, y - 28], 8)];
    return {front: [acc(drop, '#8fd3ff', '#2f7fb8', 4)]};
  },

  anger(a) {
    const {w, h} = a;
    const cx = w * 0.62;
    const cy = -h * 0.95;
    const s = 16;
    const polys = [];

    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      polys.push(quad([cx + dx * s * 0.4, cy + dy * s * 1.4], [cx + dx * s * 0.4, cy + dy * s * 0.4], [cx + dx * s * 1.4, cy + dy * s * 0.4], 8));
    }

    return {front: [accLine(polys, '#e63946', 7)]};
  },

  notes(a) {
    const {w, top, ink, rng, t} = a;
    const shapes = [];

    for (let i = 0; i < 3; i++) {
      const x = rng.sign() * w * rng.float(0.7, 1.2);
      const y = top + rng.float(-40, 60) - (t == null ? 0 : Math.sin(t * 2 + i) * 10);
      shapes.push(acc(ellipse(x, y, 11, 8, 16, -0.4), ink, null, 0));
      shapes.push(accLine([[[x + 9, y - 2], [x + 9, y - 42], [x + 24, y - 30]]], ink, 5));
    }

    return {front: shapes};
  },

  stink(a) {
    const {w, h, t} = a;
    const polys = [];

    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * w * 0.9;
      const pts = [];
      for (let k = 0; k <= 16; k++) {
        const y = -h * 1.2 - k * 8 + (i === 1 ? -40 : 0);
        pts.push([x + Math.sin(k * 0.8 + (t || 0) * 4) * 9, y]);
      }
      polys.push(pts);
    }

    return {front: [accLine(polys, '#7cb342', 6, {alpha: 0.8})]};
  },

  // more hats -----------------------------------------------------------------

  tricorn(a) {
    const {w, h, top, ink, rng} = a;
    const base = top + h * 0.18;
    const brim = path([-w * 0.8, base])
      .quad([-w * 0.5, base - h * 0.95], [0, base - h * 0.55])
      .quad([w * 0.5, base - h * 0.95], [w * 0.8, base])
      .quad([0, base + h * 0.14], [-w * 0.8, base])
      .pts;
    const trim = [
      quad([-w * 0.8, base], [-w * 0.5, base - h * 0.95], [0, base - h * 0.55], 14),
      quad([0, base - h * 0.55], [w * 0.5, base - h * 0.95], [w * 0.8, base], 14),
    ];
    const skull = [0, base - h * 0.2];
    const shapes = [
      acc(brim, '#2b2118', ink, 6),
      accLine(trim, '#d4a017', 4),
      accLine([[[skull[0] - 16, skull[1] + 12], [skull[0] + 16, skull[1] + 26]], [[skull[0] + 16, skull[1] + 12], [skull[0] - 16, skull[1] + 26]]], '#f4efe4', 4),
      acc(circle(skull[0], skull[1], 11), '#f4efe4', null, 0),
      acc([circle(skull[0] - 4, skull[1] - 1, 2.5, 8), circle(skull[0] + 4, skull[1] - 1, 2.5, 8)], '#2b2118', null, 0),
    ];
    return {front: tilt(shapes, rng.float(-0.12, 0.12), [0, base])};
  },

  chef(a) {
    const {w, h, top, ink} = a;
    const base = top + h * 0.15;
    const white = '#fbfbf8';
    const puffs = [
      circle(-w * 0.26, base - h * 0.5, w * 0.24),
      circle(w * 0.26, base - h * 0.5, w * 0.24),
      circle(0, base - h * 0.68, w * 0.28),
    ];
    const band = roundRect(-w * 0.36, base - h * 0.3, w * 0.72, h * 0.32, 8);
    const pleats = [-0.18, 0, 0.18].map(t => [[w * t, base - h * 0.26], [w * t, base - h * 0.02]]);
    // an ink underlay a little larger than the white fill gives one outline
    // around the whole toque, without seams where the puffs overlap
    return {
      front: [
        acc([...puffs.map(p => inflate(p, 5)), inflate(band, 5)], ink, null, 0),
        acc([...puffs, band, roundRect(-w * 0.3, base - h * 0.62, w * 0.6, h * 0.4, 10)], white, null, 0),
        accLine(pleats, '#d9d6cc', 3),
      ],
    };
  },

  santa(a) {
    const {w, h, top, ink} = a;
    const base = top + h * 0.2;
    const cone = path([-w * 0.48, base])
      .quad([-w * 0.25, base - h * 1.25], [w * 0.5, base - h * 0.78])
      .quad([w * 0.15, base - h * 0.62], [w * 0.48, base])
      .pts;
    return {
      front: [
        acc(cone, '#d62828', ink, 5),
        acc(roundRect(-w * 0.56, base - h * 0.13, w * 1.12, h * 0.24, h * 0.12), '#f8f6f0', ink, 5),
        acc(circle(w * 0.52, base - h * 0.8, w * 0.1), '#f8f6f0', ink, 4),
      ],
    };
  },

  viking(a) {
    const {w, h, top, ink} = a;
    const base = top + h * 0.35;
    const steel = '#9aa5b1';
    const dome = arc(0, base, w * 0.66, h * 0.6, Math.PI, TAU, 30);
    const horns = [-1, 1].map(o => [
      ...quad([o * w * 0.5, base - h * 0.15], [o * w * 1.0, base - h * 0.2], [o * w * 0.95, base - h * 1.05], 14),
      ...quad([o * w * 0.95, base - h * 1.05], [o * w * 0.82, base - h * 0.45], [o * w * 0.56, base - h * 0.4], 14).slice(1),
    ]);
    const rivets = [-0.45, -0.22, 0, 0.22, 0.45].map(t => circle(w * t, base - h * 0.03, 4.5, 10));
    return {
      front: [
        acc(horns, '#f1e3c6', ink, 5),
        acc(dome, steel, ink, 6),
        accLine([[[0, base - h * 0.6], [0, base]]], lighten(steel, 0.12), 8),
        acc(roundRect(-w * 0.7, base - h * 0.12, w * 1.4, h * 0.2, 6), darken(steel, 0.08), ink, 5),
        acc(rivets, '#e8e2d0', null, 0),
      ],
    };
  },

  gradcap(a) {
    const {w, h, top, ink, rng} = a;
    const base = top + h * 0.2;
    const board = [[-w * 0.78, base - h * 0.32], [0, base - h * 0.52], [w * 0.78, base - h * 0.32], [0, base - h * 0.12]];
    const button = [0, base - h * 0.32];
    const tassel = [w * 0.6, base - h * 0.28];
    const shapes = [
      acc(roundRect(-w * 0.36, base - h * 0.3, w * 0.72, h * 0.34, 10), '#1d1a1f', ink, 5),
      acc(board, '#26232a', ink, 5),
      accLine([[button, tassel, [tassel[0], base + h * 0.15]]], '#f2c14e', 5),
      acc(roundRect(tassel[0] - 7, base + h * 0.1, 14, h * 0.2, 4), '#f2c14e', null, 0),
      acc(circle(button[0], button[1], 7), '#f2c14e', null, 0),
    ];
    return {front: tilt(shapes, rng.float(-0.1, 0.1), [0, base])};
  },

  spaceHelmet(a) {
    const {w, h, top, bottom} = a;
    const cy = (top + bottom) / 2 - h * 0.08;
    const r = Math.max(w * 1.12, (bottom - top) * 0.62);
    return {
      front: [
        acc(circle(0, cy, r, 64), '#cfe9ff', '#e6f2ff', 7, {alpha: 0.22}),
        accLine([arc(0, cy, r * 0.84, r * 0.84, Math.PI * 1.15, Math.PI * 1.45, 16)], '#ffffff', 10, {alpha: 0.7}),
        accLine([arc(0, cy, r * 0.84, r * 0.84, Math.PI * 1.52, Math.PI * 1.6, 6)], '#ffffff', 10, {alpha: 0.7}),
        acc(roundRect(-r * 0.7, cy + r * 0.86, r * 1.4, r * 0.2, r * 0.08), '#b8c2cc', a.ink, 5),
      ],
    };
  },

  mohawk(a) {
    const {w, h, top, rng} = a;
    const color = rng.pick(['#ff2e88', '#39ff14', '#00c2ff', '#b026ff', '#ff6b00']);
    const spikes = [];
    const n = 5;
    for (let i = 0; i < n; i++) {
      const x = lerp(-w * 0.26, w * 0.26, i / (n - 1));
      const tall = h * (0.4 + 0.25 * Math.sin((i / (n - 1)) * Math.PI)) * rng.float(0.85, 1.1);
      spikes.push([[x - w * 0.09, top + h * 0.25], [x + rng.float(-8, 8), top - tall], [x + w * 0.09, top + h * 0.25]]);
    }
    // behind the head, so the spikes grow out from under the outline
    return {back: [acc(spikes, color, a.ink, 5)]};
  },

  catEars(a) {
    const {w, h, top, ink} = a;
    const band = arc(0, top + h * 0.95, w * 0.82, h * 1.12, Math.PI * 1.1, Math.PI * 1.9, 26);
    const ears = [-1, 1].map(o => {
      const bx = o * w * 0.36;
      const by = top + h * 0.02;
      return {
        outer: [[bx - w * 0.14, by], [bx + o * w * 0.05, by - h * 0.5], [bx + w * 0.14, by]],
        inner: [[bx - w * 0.07, by - h * 0.04], [bx + o * w * 0.04, by - h * 0.32], [bx + w * 0.07, by - h * 0.04]],
      };
    });
    return {
      front: [
        accLine([band], ink, 12),
        accLine([band], a.accent, 7),
        acc(ears.map(e => e.outer), a.accent, ink, 5),
        acc(ears.map(e => e.inner), '#f7a8b8', null, 0),
      ],
    };
  },

  // more ears -----------------------------------------------------------------

  flowerEar(a) {
    const {w, ears, ink, rng} = a;
    const ear = ears[0];
    const [cx, cy] = lerpPt(lerpPt(ear.inner, ear.outer, 0.5), ear.tip, 0.15);
    const r = w * 0.1;
    const color = rng.pick(['#ff4d6d', '#ff8fab', '#ffb703', '#f15bb5']);
    const petals = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * TAU - Math.PI / 2;
      petals.push(ellipse(cx + Math.cos(angle) * r * 0.9, cy + Math.sin(angle) * r * 0.9, r * 0.75, r * 0.55, 18, angle));
    }
    return {
      front: [
        acc(petals, color, ink, 3),
        accLine([[[cx, cy], [cx + r * 0.6, cy - r * 1.1]]], '#ffd23f', 3),
        acc(circle(cx, cy, r * 0.28), '#ffd23f', null, 0),
      ],
    };
  },

  piercings(a) {
    const {ears, w} = a;
    const ear = ears[1];
    const studs = [0.22, 0.45, 0.66].map(t => {
      const [x, y] = lerpPt(ear.outer, ear.tip, t);
      return circle(x - 5, y, 4.5, 10);
    });
    const [hx, hy] = lerpPt(ear.outer, ear.tip, 0.08);
    return {
      front: [
        acc(studs, '#f5d77a', '#8a6a1c', 2),
        accLine([arc(hx - 2, hy + w * 0.045, w * 0.045, w * 0.045, -0.4, Math.PI + 0.4, 14)], '#f5d77a', 4),
      ],
    };
  },

  // more eyewear --------------------------------------------------------------

  heartShades(a) {
    const {eyes, eyeRadius, ink} = a;
    const s = Math.max(eyeRadius * 1.45, 26);
    const lenses = eyes.map(([x, y]) => heart(x, y + s * 0.05, s));
    return {
      front: [
        acc(lenses, '#ff2e63', ink, 5, {alpha: 0.88}),
        accLine([[[eyes[0][0] + s * 0.75, eyes[0][1] - s * 0.25], [eyes[1][0] - s * 0.75, eyes[1][1] - s * 0.25]]], ink, 5),
        acc(eyes.map(([x, y]) => ellipse(x - s * 0.35, y - s * 0.3, s * 0.18, s * 0.1, 12, -0.5)), '#ffffff', null, 0, {alpha: 0.7}),
      ],
    };
  },

  starShades(a) {
    const {eyes, eyeRadius, ink} = a;
    const s = Math.max(eyeRadius * 1.6, 28);
    return {
      front: [
        acc(eyes.map(([x, y]) => star(x, y, s, 0.55, 5)), '#ffd23f', ink, 5, {alpha: 0.9}),
        accLine([[[eyes[0][0] + s * 0.5, eyes[0][1] - s * 0.1], [eyes[1][0] - s * 0.5, eyes[1][1] - s * 0.1]]], ink, 5),
      ],
    };
  },

  goggles(a) {
    const {eyes, eyeRadius, w, ink} = a;
    const r = Math.max(eyeRadius * 1.3, 24);
    const brass = '#b5893b';
    const y = eyes[0][1];
    return {
      front: [
        accLine([[[-w * 1.02, y - 4], [eyes[0][0] - r, y]], [[eyes[1][0] + r, y], [w * 1.02, y - 4]]], '#5a3b1e', 12),
        acc(eyes.map(([x, yy]) => circle(x, yy, r)), '#6fc3df', null, 0, {alpha: 0.45}),
        accLine(eyes.map(([x, yy]) => [...circle(x, yy, r), circle(x, yy, r)[0]]), brass, 9),
        accLine(eyes.map(([x, yy]) => [...circle(x, yy, r + 6), circle(x, yy, r + 6)[0]]), ink, 2),
        accLine([[[eyes[0][0] + r, y], [eyes[1][0] - r, y]]], brass, 7),
        acc(eyes.map(([x, yy]) => circle(x + r * 0.72, yy - r * 0.72, 3.5, 8)), '#e8d6a0', null, 0),
      ],
    };
  },

  sleepMask(a) {
    const {eyes, eyeRadius, w, ink, rng} = a;
    const hh = Math.max(eyeRadius * 1.25, 22);
    const [l, r] = eyes;
    const color = rng.pick(['#b8a1e3', '#f7a8b8', '#9ad0ec', '#2b2d42']);
    const mask = roundRect(l[0] - hh * 1.9, l[1] - hh, r[0] - l[0] + hh * 3.8, hh * 2, hh);
    const lashes = eyes.map(([x, y]) => arc(x, y - hh * 0.2, hh * 0.8, hh * 0.55, 0.2, Math.PI - 0.2, 14));
    const thread = color === '#2b2d42' ? '#f4efe4' : '#3b2d4f';
    return {
      front: [
        accLine([[[-w * 1.02, l[1] - hh * 0.5], [l[0] - hh * 1.9, l[1]]], [[r[0] + hh * 1.9, r[1]], [w * 1.02, r[1] - hh * 0.5]]], ink, 5),
        acc(mask, color, ink, 5),
        accLine(lashes, thread, 4),
      ],
    };
  },

  // more face -----------------------------------------------------------------

  rose(a) {
    const {w, h, mouthY, ink} = a;
    const y = mouthY + h * 0.02;
    const head = [-w * 0.42, y - h * 0.12];
    const r = w * 0.1;
    const petals = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TAU;
      petals.push(circle(head[0] + Math.cos(angle) * r * 0.55, head[1] + Math.sin(angle) * r * 0.55, r * 0.6, 14));
    }
    const swirl = arc(head[0], head[1], r * 0.45, r * 0.45, 0, TAU * 0.85, 16);
    return {
      front: [
        accLine([quad([head[0], head[1]], [0, y + h * 0.12], [w * 0.5, y + h * 0.06], 16)], '#2d6a4f', 6),
        acc(ellipse(w * 0.2, y + h * 0.13, w * 0.09, w * 0.04, 16, -0.4), '#40916c', ink, 3),
        acc(petals, '#d00000', ink, 3),
        accLine([swirl], '#6a040f', 3),
      ],
    };
  },

  bubblePipe(a) {
    const {w, h, mouthY, ink, t} = a;
    const y = mouthY + h * 0.05;
    const bowl = [w * 0.62, y + h * 0.05];
    const bubbles = [];
    for (let i = 0; i < 4; i++) {
      const rise = t == null ? i * 38 : ((t * 45 + i * 38) % 150);
      const r = 8 + i * 3;
      bubbles.push(circle(bowl[0] + Math.sin(i * 2 + (t || 0) * 2) * 12, bowl[1] - h * 0.3 - rise, r, 20));
    }
    return {
      front: [
        accLine([[[w * 0.12, y], [bowl[0] - w * 0.05, y + h * 0.02]]], '#5a3b1e', 7),
        acc(roundRect(bowl[0] - w * 0.08, y - h * 0.12, w * 0.16, h * 0.2, 6), '#8a5a2b', ink, 4),
        accLine(bubbles.map(b => [...b, b[0]]), '#9ad0ec', 3, {alpha: 0.85}),
      ],
    };
  },

  septum(a) {
    const {noseBottom} = a;
    return {front: [accLine([arc(0, noseBottom + 4, 12, 12, 0.2, Math.PI - 0.2, 14)], '#f5d77a', 5)]};
  },

  pizza(a) {
    const {w, h, mouthY, ink} = a;
    const tip = [w * 0.05, mouthY + h * 0.05];
    const left = [-w * 0.22, mouthY + h * 0.75];
    const right = [w * 0.4, mouthY + h * 0.68];
    const pepperoni = [0.35, 0.55, 0.72].map((t, i) => {
      const p = lerpPt(tip, lerpPt(left, right, [0.3, 0.7, 0.45][i]), t);
      return circle(p[0], p[1], w * 0.035, 14);
    });
    return {
      front: [
        acc([tip, right, left], '#ffd166', ink, 4),
        acc(pepperoni, '#c1121f', null, 0),
        accLine([[left, right]], '#d08c47', 14),
        accLine([[left, right]], ink, 2, {alpha: 0.5}),
      ],
    };
  },

  // more neck -----------------------------------------------------------------

  pearls(a) {
    const {w, h, bottom} = a;
    const strand = quad([-w * 0.66, bottom - h * 0.35], [0, bottom + h * 0.62], [w * 0.66, bottom - h * 0.35], 26);
    return {back: [acc(strand.map(([x, y]) => circle(x, y, 7.5, 12)), '#f7f3ea', '#b8b0a0', 2)]};
  },

  chain(a) {
    const {w, h, bottom, ink} = a;
    const strand = quad([-w * 0.7, bottom - h * 0.35], [0, bottom + h * 0.62], [w * 0.7, bottom - h * 0.35], 20);
    const links = strand.map(([x, y], i) => ellipse(x, y, 9, 6, 14, i % 2 ? 0.8 : -0.8));
    const [mx, my] = [0, bottom + h * 0.1];
    return {
      back: [accLine(links.map(l => [...l, l[0]]), '#f2c14e', 4)],
      front: [
        acc(circle(mx, my + w * 0.08, w * 0.1), '#f2c14e', ink, 4),
        acc(star(mx, my + w * 0.08, w * 0.06, 0.45), '#fff3b0', null, 0),
      ],
    };
  },

  scarf(a) {
    const {w, h, bottom, ink, rng} = a;
    const band = quad([-w * 0.8, bottom - h * 0.3], [0, bottom + h * 0.5], [w * 0.8, bottom - h * 0.3], 24);
    const side = rng.sign();
    const tailX = side * w * 0.3;
    const tailY = bottom - h * 0.02;
    const stripes = [0.3, 0.55, 0.8].map(t => [[tailX - w * 0.1, tailY + h * 0.6 * t], [tailX + w * 0.1, tailY + h * 0.6 * t]]);
    const fringe = [-0.07, -0.02, 0.03, 0.08].map(t => [[tailX + w * t, tailY + h * 0.62], [tailX + w * t, tailY + h * 0.72]]);
    return {
      back: [accLine([band], ink, 40), accLine([band], a.accent, 32)],
      front: [
        acc(roundRect(tailX - w * 0.11, tailY, w * 0.22, h * 0.62, 6), a.accent, ink, 4),
        accLine(stripes, a.accent2, 6),
        accLine(fringe, a.accent, 4),
      ],
    };
  },

  bread(a) {
    const {w, h, top, bottom, ink} = a;
    const H = (bottom - top) * 0.78;
    const cy = (top + bottom) / 2 + h * 0.12;
    const W = w * 1.28;
    // a toast slice: a rounded body under a wider domed top
    const slice = inset => [
      roundRect(-W + inset, cy - H * 0.3 + inset, (W - inset) * 2, H * 1.0 - inset * 2, 36),
      ellipse(0, cy - H * 0.3, W * 1.12 - inset, H * 0.48 - inset, 60),
    ];
    return {
      back: [
        acc(slice(-6), ink, null, 0),
        acc(slice(0), '#b5733a', null, 0),
        acc(slice(24), '#f1d7a3', null, 0),
      ],
    };
  },

  // more floating -------------------------------------------------------------

  yarn(a) {
    const {w, bottom, h, ink, rng, t} = a;
    const side = rng.sign();
    const cx = side * w * 1.02;
    const cy = bottom - h * 0.1;
    const r = w * 0.17;
    const color = rng.pick(['#e63946', '#4895ef', '#f15bb5', '#80b918']);
    const wraps = [0.3, 0.9, 1.5, 2.1].map(angle => arc(cx, cy, r * 0.95, r * 0.4, 0, Math.PI, 14).map(p => rotate([p], angle, cx, cy)[0]));
    const thread = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      thread.push([cx - side * r * 0.8 - side * u * w * 0.5, cy + r * 0.6 + Math.sin(u * 9 + (t || 0) * 2) * 10 + u * 20]);
    }
    return {
      front: [
        accLine([thread], color, 4),
        acc(circle(cx, cy, r), color, ink, 4),
        accLine(wraps, darken(color, 0.15), 3),
      ],
    };
  },

  butterflies(a) {
    const {w, h, top, ink, rng, t} = a;
    const shapes = [];
    for (let i = 0; i < 3; i++) {
      const x = rng.sign() * w * rng.float(0.75, 1.2) + (t == null ? 0 : Math.sin(t + i) * 15);
      const y = top + rng.float(-30, h * 0.9) + (t == null ? 0 : Math.cos(t * 1.3 + i) * 10);
      const flap = t == null ? 1 : 0.35 + 0.65 * Math.abs(Math.cos(t * 7 + i));
      const s = rng.float(20, 30);
      const color = rng.pick(['#ffb703', '#8ecae6', '#f15bb5', '#fb8500', '#b5e48c']);
      const wings = [
        ellipse(x - s * 0.55 * flap, y - s * 0.3, s * 0.6 * flap, s * 0.5, 16, -0.3),
        ellipse(x + s * 0.55 * flap, y - s * 0.3, s * 0.6 * flap, s * 0.5, 16, 0.3),
        ellipse(x - s * 0.4 * flap, y + s * 0.35, s * 0.4 * flap, s * 0.35, 14, 0.4),
        ellipse(x + s * 0.4 * flap, y + s * 0.35, s * 0.4 * flap, s * 0.35, 14, -0.4),
      ];
      shapes.push(acc(wings, color, ink, 2));
      shapes.push(accLine([[[x, y - s * 0.55], [x, y + s * 0.6]]], ink, 3));
    }
    return {front: shapes};
  },

  raincloud(a) {
    const {w, h, top, ink, t} = a;
    const cy = top - h * 0.55;
    const puffs = [
      circle(-w * 0.32, cy + 10, w * 0.2),
      circle(0, cy - 8, w * 0.28),
      circle(w * 0.32, cy + 10, w * 0.2),
    ];
    const drops = [];
    const fall = t == null ? 0 : (t * 120) % 40;
    for (let i = 0; i < 7; i++) {
      const x = lerp(-w * 0.4, w * 0.4, i / 6);
      const y = cy + w * 0.18 + ((i * 17 + fall) % 40);
      drops.push([[x, y], [x - 6, y + 16]]);
    }
    const base = roundRect(-w * 0.5, cy + 4, w, w * 0.22, w * 0.1);
    return {
      front: [
        accLine(drops, '#4895ef', 4),
        acc([...puffs.map(p => inflate(p, 5)), inflate(base, 5)], ink, null, 0),
        acc([...puffs, base], '#9aa5b1', null, 0),
      ],
    };
  },

  fishbone(a) {
    const {w, h, top, ink, rng, t} = a;
    const cx = rng.sign() * w * rng.float(0.8, 1.05);
    const cy = top + h * rng.float(0.1, 0.6);
    const L = w * 0.62;
    const spin = (t || 0) * 0.8;
    const ribs = [];
    for (let i = 1; i <= 4; i++) {
      const x = cx - L / 2 + (i / 5) * L * 0.8;
      ribs.push([[x, cy - L * 0.18], [x, cy + L * 0.18]]);
    }
    const shapes = [
      accLine([[[cx - L / 2, cy], [cx + L * 0.3, cy]], ...ribs], ink, 4),
      acc([[cx + L * 0.28, cy - L * 0.18], [cx + L / 2, cy], [cx + L * 0.28, cy + L * 0.18]], '#e8e2d0', ink, 4),
      acc([[cx - L / 2, cy], [cx - L * 0.68, cy - L * 0.18], [cx - L * 0.68, cy + L * 0.18]], '#e8e2d0', ink, 4),
    ];
    return {front: tilt(shapes, Math.sin(spin) * 0.4, [cx, cy])};
  },
};

export const ACCESSORY_NAMES = Object.keys(ACCESSORIES);

export function accessories(anchors, rng) {
  const back = [];
  const front = [];

  for (const name of anchors.g.accessories) {
    const build = ACCESSORIES[name];

    if (!build) {
      continue;
    }

    const out = build({...anchors, rng: rng.fork(name)});
    const tag = s => ({...s, source: name});
    back.push(...(out.back || []).map(tag));
    front.push(...(out.front || []).map(tag));
  }

  return {back, front};
}
