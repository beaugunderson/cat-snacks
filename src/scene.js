import {ACCESSORY_SLOTS} from './catalog.js';
import {luminance} from './color.js';
import {bounds, normalizeWinding, translate} from './geom.js';
import {accessories} from './parts/accessories.js';
import {brows, cheeks, eyes, mouth, nose, whiskers} from './parts/face.js';
import {ears, headOutline} from './parts/head.js';
import {markings} from './parts/markings.js';
import {Rng} from './rng.js';
import {STYLE_META} from './styles/meta.js';
import {fillShape, lineShape} from './shapes.js';

// Turns a genome (plus an optional animation time in seconds) into layers of
// shapes in a 600x600 design space. Styles decide how to paint them.

const FRAMED = new Set([...ACCESSORY_SLOTS.hat, ...ACCESSORY_SLOTS.ear, ...ACCESSORY_SLOTS.neck]);

function animation(g, t) {
  if (t == null) {
    return {blink: 1, lookX: 0, lookY: 0, bob: 0, tilt: 0, time: null};
  }

  const local = t + g.phase;
  const period = 3.2 + (g.phase % 2.5);
  const p = local % period;
  const blink = p < 0.2 ? 1 - Math.sin((p / 0.2) * Math.PI) : 1;

  return {
    blink,
    lookX: Math.sin(local * 0.6) * 0.8,
    lookY: Math.sin(local * 0.37) * 0.35,
    bob: Math.sin(local * 2.2) * 5,
    tilt: Math.sin(local * 1.1) * 0.04,
    time: t,
  };
}

export function buildScene(g, t = null) {
  const rng = new Rng(g.seed).fork('scene');
  const anim = animation(g, t);
  const ink = g.ink;
  const w = g.headW;
  const h = g.headH;
  // lines drawn straight onto dark fur switch to a light ink so they stay visible
  const darkFace = luminance(g.fur) < 0.1 && !g.patterns.includes('tuxedo') && !STYLE_META[g.style]?.paperFur;
  const f = {g, w, h, ink, anim, lineInk: darkFace ? '#f2ede4' : ink};

  const head = headOutline(g);
  const earList = ears(g, head);

  const body = [
    ...earList.map(e => fillShape('ear', e.outline, g.fur, ink, 9)),
    fillShape('head', head, g.fur, ink, 9),
  ];

  const eyeInfo = eyes(f);
  const noseInfo = nose(f);

  const face = [
    ...earList.flatMap(e => e.tufts.map(p => lineShape('tuft', p, ink, 5))),
    ...cheeks(f, eyeInfo),
    ...mouth(f, noseInfo.bottom),
    ...noseInfo.shapes,
    ...whiskers(f, rng.fork('whiskers')),
    ...eyeInfo.shapes,
    ...brows(f, eyeInfo),
  ];

  const headBounds = bounds([head]);

  const anchors = {
    g, w, h, ink, t: anim.time,
    accent: g.accent,
    accent2: g.accent2,
    top: headBounds.minY,
    bottom: headBounds.maxY,
    ears: earList,
    eyes: eyeInfo.positions,
    eyeRadius: eyeInfo.radius,
    eyeSize: g.eyeSize,
    noseBottom: noseInfo.bottom,
    mouthY: noseInfo.bottom + g.mouthH * h * 0.4,
  };

  const extras = accessories(anchors, rng.fork('accessories'));

  // fit the head, ears, face (whiskers reach well past the head) and worn accessories into the frame
  const framed = [...body, ...face, ...extras.back, ...extras.front.filter(s => FRAMED.has(s.source))];
  const b = bounds(framed.flatMap(s => s.polys));
  const k = Math.min(1.25, 520 / b.h, 540 / b.w);

  const frame = {
    x: 300,
    y: 300 + anim.bob,
    k,
    cx: (b.minX + b.maxX) / 2,
    cy: (b.minY + b.maxY) / 2 + 12,
    tilt: anim.tilt,
  };

  return {
    g,
    anim,
    frame,
    back: extras.back,
    body,
    bodyClip: body.map(s => normalizeWinding(s.polys[0])),
    markings: markings(f, rng.fork('markings'), head, earList),
    face,
    front: keepInView(extras.front, frame),
    anchors,
  };
}

// slide each floating accessory (speech bubble, zzz, hearts...) back inside
// the canvas if it hangs off an edge
function keepInView(shapes, frame) {
  const margin = 12;
  const out = shapes.slice();

  for (const name of ACCESSORY_SLOTS.float) {
    const idx = out.map((s, i) => (s.source === name ? i : -1)).filter(i => i >= 0);

    if (!idx.length) {
      continue;
    }

    const lb = bounds(idx.flatMap(i => out[i].polys));
    const toCanvasX = x => frame.x + frame.k * (x - frame.cx);
    const toCanvasY = y => frame.y + frame.k * (y - frame.cy);
    let dx = 0;
    let dy = 0;

    if (toCanvasX(lb.minX) < margin) dx = (margin - toCanvasX(lb.minX)) / frame.k;
    else if (toCanvasX(lb.maxX) > 600 - margin) dx = (600 - margin - toCanvasX(lb.maxX)) / frame.k;

    if (toCanvasY(lb.minY) < margin) dy = (margin - toCanvasY(lb.minY)) / frame.k;
    else if (toCanvasY(lb.maxY) > 600 - margin) dy = (600 - margin - toCanvasY(lb.maxY)) / frame.k;

    if (dx || dy) {
      for (const i of idx) {
        out[i] = {...out[i], polys: out[i].polys.map(p => translate(p, dx, dy))};
      }
    }
  }

  return out;
}

export const LAYERS = ['back', 'body', 'markings', 'face', 'front'];

export function allShapes(scene) {
  return LAYERS.flatMap(layer => scene[layer]);
}
