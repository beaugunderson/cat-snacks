import {contrast, darken, lighten, luminance} from '../color.js';
import {TAU, arc, bezier, circle, ellipse, heart, lerp, quad, roundRect, scale, spiral, star} from '../geom.js';
import {fillShape, lineShape} from '../shapes.js';

// Eyes, brows, cheeks, nose, mouth and whiskers. Every builder works in
// head-local coordinates and returns an array of shapes.

const WHITE = '#ffffff';

function almond(cx, cy, rx, ry) {
  return [
    ...quad([cx - rx, cy], [cx, cy - ry * 2], [cx + rx, cy], 14),
    ...quad([cx + rx, cy], [cx, cy + ry * 2], [cx - rx, cy], 14).slice(1, -1),
  ];
}

// visual radius of each eye kind in units of eyeSize, used to fit glasses
export const EYE_RADIUS = {
  dot: 1, round: 1.7, anime: 2.4, slit: 1.9, sleepy: 1.6, closed: 1.6, happy: 1.6, content: 1.6,
  heart: 2, star: 2.2, x: 1.5, spiral: 1.9, void: 2.2, pie: 2.6, button: 1.7, glow: 1.6,
};

const OPEN_KINDS = new Set(['dot', 'round', 'anime', 'slit', 'heart', 'star', 'void', 'pie', 'button', 'glow', 'spiral']);

function eye(kind, cx, cy, s, side, f) {
  const {g, ink, anim, lineInk} = f;
  const iris = side > 0 ? g.eyeColorR : g.eyeColor;
  let lookX = anim.lookX;
  let lookY = anim.lookY;

  if (g.derp) {
    lookX = -side * 0.8;
    lookY = side * 0.3;
  }

  const shapes = [];
  const add = s => shapes.push(s);

  switch (kind) {
    case 'dot':
      add(fillShape('eye', circle(cx, cy, s), g.dotEyeColor));
      break;

    case 'round': {
      const R = s * 1.7;
      const px = cx + lookX * R * 0.35;
      const py = cy + lookY * R * 0.3;
      add(fillShape('sclera', circle(cx, cy, R), WHITE, ink, 4));
      add(fillShape('iris', circle(px, py, s * 1.15), iris));
      add(fillShape('pupil', circle(px, py, s * 0.6), ink));
      add(fillShape('shine', circle(px - s * 0.45, py - s * 0.45, s * 0.3), WHITE));
      break;
    }

    case 'anime': {
      const rx = s * 1.8;
      const ry = s * 2.4;
      const px = cx + lookX * s * 0.4;
      const py = cy + lookY * s * 0.3;
      add(fillShape('iris', ellipse(cx, cy, rx, ry), darken(iris, 0.12), ink, 5));
      add(fillShape('iris', ellipse(px, py + s * 0.8, rx * 0.75, ry * 0.45), lighten(iris, 0.12)));
      add(fillShape('pupil', ellipse(px, py + s * 0.1, s * 0.75, s * 1.05), darken(iris, 0.45)));
      add(fillShape('shine', ellipse(px - s * 0.6, py - s * 1.0, s * 0.62, s * 0.5, 24, -0.4), WHITE));
      add(fillShape('shine', circle(px + s * 0.75, py + s * 1.0, s * 0.26), WHITE));
      add(lineShape('lid', arc(cx, cy, rx * 1.02, ry * 1.02, Math.PI + 0.35, TAU - 0.35), lineInk, 7));
      add(lineShape('lid', [[cx + side * rx * 0.85, cy - ry * 0.55], [cx + side * rx * 1.35, cy - ry * 0.95]], lineInk, 5));
      break;
    }

    case 'slit': {
      const rx = s * 1.9;
      const px = cx + lookX * s * 0.6;
      add(fillShape('iris', almond(cx, cy, rx, s * 0.62), iris, ink, 4));
      add(fillShape('pupil', ellipse(px, cy, s * 0.28, s * 1.1), ink));
      add(fillShape('shine', circle(px - s * 0.5, cy - s * 0.35, s * 0.22), WHITE));
      break;
    }

    case 'sleepy': {
      const R = s * 1.6;
      const lid = cy - s * 0.1;
      const lower = [...arc(cx, lid, R, R * 0.9, 0, Math.PI, 20)];
      add(fillShape('iris', lower, iris, ink, 4));
      add(fillShape('pupil', arc(cx + lookX * s * 0.3, lid, s * 0.65, s * 0.65, 0, Math.PI, 12), ink));
      add(lineShape('lid', quad([cx - R * 1.1, lid], [cx, lid - s * 0.4], [cx + R * 1.1, lid]), lineInk, 6));
      break;
    }

    case 'closed':
      add(lineShape('lid', quad([cx - s * 1.6, cy], [cx, cy + s * 0.5], [cx + s * 1.6, cy]), lineInk, 6));
      break;

    case 'happy':
      add(lineShape('lid', arc(cx, cy + s * 0.6, s * 1.5, s * 1.4, Math.PI + 0.15, TAU - 0.15), lineInk, 6));
      break;

    case 'content':
      add(lineShape('lid', arc(cx, cy - s * 0.6, s * 1.5, s * 1.3, 0.15, Math.PI - 0.15), lineInk, 6));
      break;

    case 'heart':
      add(fillShape('eye', heart(cx, cy, s * 2), '#ff4d6d', ink, 3));
      add(fillShape('shine', circle(cx - s * 0.8, cy - s * 0.7, s * 0.35), WHITE));
      break;

    case 'star':
      add(fillShape('eye', star(cx, cy, s * 2.2, 0.45, 5), '#ffd23f', ink, 3));
      break;

    case 'x':
      add(lineShape('lid', [
        [[cx - s * 1.2, cy - s * 1.2], [cx + s * 1.2, cy + s * 1.2]],
        [[cx + s * 1.2, cy - s * 1.2], [cx - s * 1.2, cy + s * 1.2]],
      ], lineInk, 6));
      break;

    case 'spiral':
      add(fillShape('sclera', circle(cx, cy, s * 1.9), WHITE, ink, 3));
      add(lineShape('lid', spiral(cx, cy, s * 1.7, 3, 90, side * (anim.time || 0) * 4), ink, 3));
      break;

    case 'void':
      add(fillShape('eye', ellipse(cx, cy, s * 1.9, s * 2.2), '#050505'));
      add(fillShape('shine', circle(cx - s * 0.7, cy - s * 0.9, s * 0.4), WHITE));
      add(fillShape('shine', circle(cx + s * 0.6, cy + s * 0.8, s * 0.18), WHITE));
      break;

    case 'pie': {
      add(fillShape('sclera', ellipse(cx, cy, s * 1.45, s * 2.6), WHITE, ink, 5));
      const px = cx + lookX * s * 0.3;
      const py = cy + s * 0.6;
      add(fillShape('pupil', ellipse(px, py, s * 0.95, s * 1.75), ink));
      const cut = [[px - s * 0.1, py - s * 0.6], ...arc(px - s * 0.1, py - s * 0.6, s * 1.5, s * 1.5, -2.2, -1.5, 6)];
      add(fillShape('shine', cut, WHITE));
      break;
    }

    case 'button': {
      const R = s * 1.7;
      add(fillShape('eye', circle(cx, cy, R), g.accent2, ink, 3));
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        add(fillShape('pupil', circle(cx + dx * R * 0.3, cy + dy * R * 0.3, R * 0.13), ink));
      }
      add(lineShape('lid', [
        [[cx - R * 0.3, cy - R * 0.3], [cx + R * 0.3, cy + R * 0.3]],
        [[cx + R * 0.3, cy - R * 0.3], [cx - R * 0.3, cy + R * 0.3]],
      ], ink, 2));
      break;
    }

    case 'glow': {
      const glowColor = g.accessories.includes('lasers') ? '#ff2a2a' : iris;
      add(fillShape('glow', circle(cx, cy, s * 2.4), glowColor, null, 0, {alpha: 0.3, glow: glowColor}));
      add(fillShape('iris', circle(cx, cy, s * 1.45), lighten(glowColor, 0.15), ink, 3, {glow: glowColor}));
      add(fillShape('pupil', ellipse(cx + lookX * s * 0.4, cy, s * 0.25, s * 1.1), ink));
      break;
    }
  }

  // blinking squashes open eyes toward a line
  if (anim.blink < 0.999 && OPEN_KINDS.has(kind)) {
    if (anim.blink < 0.2) {
      return [lineShape('lid', quad([cx - s * 1.6, cy], [cx, cy + s * 0.5], [cx + s * 1.6, cy]), lineInk, 6)];
    }

    return shapes.map(sh => ({...sh, polys: sh.polys.map(p => scale(p, 1, anim.blink, cx, cy))}));
  }

  return shapes;
}

export function eyes(f) {
  const {g, w, h} = f;
  const y = g.eyeY * h;
  const x = g.eyeSpacing * w;
  const s = g.eyeSize;

  return {
    shapes: [...eye(g.eyeKind, -x, y, s, -1, f), ...eye(g.eyeKindR, x, y, s, 1, f)],
    positions: [[-x, y], [x, y]],
    radius: s * Math.max(EYE_RADIUS[g.eyeKind] ?? 1.6, EYE_RADIUS[g.eyeKindR] ?? 1.6),
  };
}

export function brows(f, eyeInfo) {
  const {g, lineInk: ink} = f;

  if (g.brows === 'none') {
    return [];
  }

  const [[lx, ly], [rx]] = eyeInfo.positions;
  const y = ly - eyeInfo.radius - g.eyeSize * 1.1;
  const len = g.eyeSize * 1.8;
  const out = [];

  if (g.brows === 'unibrow') {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push([lerp(lx - len, rx + len, t), y - Math.sin(t * TAU * 2) * 5 - Math.sin(t * Math.PI) * 6]);
    }
    return [lineShape('brow', pts, ink, 8)];
  }

  for (const [x, side] of [[lx, -1], [rx, 1]]) {
    const inner = [x - side * len, y];
    const outer = [x + side * len, y];

    if (g.brows === 'angry') {
      inner[1] += 10;
      outer[1] -= 8;
    } else if (g.brows === 'worried') {
      inner[1] -= 10;
      outer[1] += 6;
    } else {
      inner[1] -= 4;
      outer[1] -= 4;
    }

    const control = [x, g.brows === 'raised' ? y - 14 : (inner[1] + outer[1]) / 2 - 3];
    out.push(lineShape('brow', quad(inner, control, outer, 10), ink, 7));
  }

  return out;
}

export function cheeks(f, eyeInfo) {
  const {g, w} = f;

  if (!g.cheeks) {
    return [];
  }

  const [[lx, ly], [rx]] = eyeInfo.positions;
  const y = ly + eyeInfo.radius + g.eyeSize * 1.3;

  return [lx - w * 0.06, rx + w * 0.06].map(x =>
    fillShape('cheek', ellipse(x, y, w * 0.13, w * 0.065), '#ff7aa2', null, 0, {alpha: 0.5}));
}

// returns the shapes and the y where a mouth should hang from
export function nose(f) {
  const {g, w, h, ink} = f;
  const y = g.noseY * h;
  // a nose the same color as the fur disappears, so fall back to pink
  const color = contrast(g.noseColor, g.fur) < 1.3 ? '#ff9eb5' : g.noseColor;
  const outline = luminance(color) > 0.3 ? ink : null;

  switch (g.noseKind) {
    case 'round':
      return {shapes: [fillShape('nose', ellipse(0, y, w * 0.07, h * 0.045), color, outline, 4)], bottom: y + h * 0.045};

    case 'triangle': {
      const nw = w * 0.1;
      const nh = h * 0.13;
      const right = bezier([0, y - nh], [nw, y - nh], [nw * 0.9, y - nh * 0.75], [0, y], 14);
      const left = right.map(([x, yy]) => [-x, yy]).reverse();
      return {shapes: [fillShape('nose', [...right, ...left.slice(1, -1)], color, outline, 4)], bottom: y};
    }

    case 'heart':
      return {shapes: [fillShape('nose', heart(0, y - w * 0.03, w * 0.075), color, outline, 3)], bottom: y + w * 0.045};

    case 'button':
      return {shapes: [fillShape('nose', circle(0, y, w * 0.035), color, outline, 3)], bottom: y + w * 0.035};

    case 'wide':
      return {shapes: [fillShape('nose', roundRect(-w * 0.1, y - h * 0.035, w * 0.2, h * 0.07, h * 0.035), color, outline, 4)], bottom: y + h * 0.035};

    default:
      return {shapes: [], bottom: y};
  }
}

export function mouth(f, top) {
  const {g, w, h, ink} = f;
  const mw = g.mouthW * w;
  const mh = g.mouthH * h;
  const y = top;
  const out = [];
  const stroke = (pts, width = 7) => out.push(lineShape('mouth', pts, f.lineInk, width));

  const w3 = (width = mw * 0.6) => [
    bezier([0, y], [0, y + mh * 0.6], [-width * 0.9, y + mh * 0.6], [-width, y - mh * 0.05], 14),
    bezier([0, y], [0, y + mh * 0.6], [width * 0.9, y + mh * 0.6], [width, y - mh * 0.05], 14),
  ];

  switch (g.mouthKind) {
    case 'split': {
      const drop = g.mouthDrop ? h * 0.13 : 0;
      const sy = y + drop;
      const polys = drop ? [[[0, y], [0, sy]]] : [];

      for (const o of [-1, 1]) {
        polys.push(bezier([0, sy], [o * mw * 0.25, sy + mh], [o * mw * 0.75, sy + mh], [o * mw, sy + mh * 0.1], 16));
      }

      stroke(polys, 8);
      break;
    }

    case 'w':
      stroke(w3());
      break;

    case 'smile':
      stroke(bezier([-mw * 0.9, y + mh * 0.3], [-mw * 0.4, y + mh * 1.2], [mw * 0.4, y + mh * 1.2], [mw * 0.9, y + mh * 0.3]), 8);
      break;

    case 'frown':
      stroke(bezier([-mw * 0.7, y + mh * 1.0], [-mw * 0.3, y + mh * 0.2], [mw * 0.3, y + mh * 0.2], [mw * 0.7, y + mh * 1.0]), 8);
      break;

    case 'o':
      out.push(fillShape('mouthFill', ellipse(0, y + mh * 0.75, mw * 0.28, mh * 0.5), '#5a1a24', ink, 5));
      break;

    case 'blep':
      // flat top tucked under the mouth line, rounded bottom
      out.push(fillShape('tongue', arc(mw * 0.08, y + mh * 0.25, mw * 0.22, mh * 0.75, 0, Math.PI, 16), '#ff7b9c', ink, 4));
      stroke(w3());
      break;

    case 'meow': {
      const top3 = [
        ...bezier([-mw * 0.7, y + mh * 0.1], [-mw * 0.4, y + mh * 0.45], [-mw * 0.1, y + mh * 0.4], [0, y], 10),
        ...bezier([0, y], [mw * 0.1, y + mh * 0.4], [mw * 0.4, y + mh * 0.45], [mw * 0.7, y + mh * 0.1], 10).slice(1),
      ];
      const bottom = bezier([mw * 0.7, y + mh * 0.1], [mw * 0.5, y + mh * 2.2], [-mw * 0.5, y + mh * 2.2], [-mw * 0.7, y + mh * 0.1], 16);
      out.push(fillShape('mouthFill', [...top3, ...bottom.slice(1, -1)], '#5a1a24', ink, 6));
      out.push(fillShape('tongue', ellipse(0, y + mh * 1.45, mw * 0.32, mh * 0.28), '#ff7b9c'));
      break;
    }

    case 'fangs':
      for (const o of [-1, 1]) {
        const x = o * mw * 0.3;
        out.push(fillShape('teeth', [[x - mw * 0.1, y + mh * 0.3], [x + mw * 0.1, y + mh * 0.3], [x, y + mh * 0.95]], WHITE, ink, 3));
      }
      stroke(w3(mw * 0.55));
      break;

    case 'flat':
      stroke([[-mw * 0.55, y + mh * 0.55], [mw * 0.55, y + mh * 0.55]], 7);
      break;

    case 'wobbly': {
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        pts.push([lerp(-mw * 0.7, mw * 0.7, t), y + mh * 0.6 + Math.sin(t * TAU * 2.5) * mh * 0.12]);
      }
      stroke(pts, 6);
      break;
    }

    case 'cheshire': {
      const W = w * 0.72;
      const y0 = y - h * 0.08;
      const yc1 = y + h * 0.3;
      const yc2 = y + h * 0.62;
      const top = quad([-W, y0], [0, yc1], [W, y0], 24);
      const bottom = quad([W, y0], [0, yc2], [-W, y0], 24);
      out.push(fillShape('teeth', [...top, ...bottom.slice(1, -1)], WHITE, ink, 6));

      const at = (t, yc) => (1 - t) ** 2 * y0 + 2 * t * (1 - t) * yc + t * t * y0;
      const teeth = [];
      for (let i = 1; i < 12; i++) {
        const t = i / 12;
        const x = W * (2 * t - 1);
        teeth.push([[x, at(t, yc1)], [x, at(t, yc2)]]);
      }
      const middle = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        middle.push([W * (2 * t - 1), (at(t, yc1) + at(t, yc2)) / 2]);
      }
      out.push(lineShape('mouth', [...teeth, middle], ink, 3));
      break;
    }
  }

  return out;
}

export function whiskers(f, rng) {
  const {g, w, h} = f;

  if (g.whiskerKind === 'none') {
    return [];
  }

  const color = f.lineInk;
  const baseY = g.noseY * h + h * 0.06;
  const spread = h * 0.11;
  const polys = [];

  if (g.whiskerKind === 'pads') {
    const dots = [];
    for (const o of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3 - (row === 1 ? 0 : 1); col++) {
          dots.push(circle(o * (w * 0.14 + col * w * 0.06 + (row === 1 ? 0 : w * 0.03)), baseY - spread * 0.7 + row * spread * 0.6, 3.2, 10));
        }
      }
    }
    return [fillShape('whisker', dots, color)];
  }

  for (const o of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      const start = [o * w * (0.48 + (i === 0 ? 0.02 : 0)), baseY + i * spread];
      let reach = 1.12;

      if (g.whiskerKind === 'long') {
        reach = 1.5;
      }

      let end = [o * w * reach, baseY + i * spread * 1.6];

      if (g.whiskerKind === 'messy') {
        end = [o * w * rng.float(0.95, 1.25), baseY + i * spread * 1.6 + rng.float(-30, 30)];
      }

      if (g.whiskerKind === 'droopy' || g.whiskerKind === 'long') {
        const droop = g.whiskerDroop * h * 2;
        polys.push(bezier(start, lerpMid(start, end, 0.5, -droop * 0.3), lerpMid(start, end, 0.85, droop * 0.2), [end[0], end[1] + droop]));
      } else if (g.whiskerKind === 'curly') {
        const curl = spiral(0, 0, 18, 1.4, 30).map(([x, y]) => [end[0] - o * x, end[1] - y]).reverse();
        polys.push([start, ...curl]);
      } else {
        polys.push([start, end]);
      }
    }
  }

  return [lineShape('whisker', polys, color, 5)];
}

function lerpMid(a, b, t, dy) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t) + dy];
}

export {almond};
