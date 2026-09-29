import {createCanvas} from 'canvas';
import {beforeAll, describe, expect, test} from 'vitest';
import {BACKGROUND_NAMES} from '../src/backgrounds.js';
import * as catalog from '../src/catalog.js';
import {EFFECTS} from '../src/effects.js';
import {FRAMES} from '../src/frames.js';
import {createGenome, renderCat, setCanvasFactory} from '../src/index.js';
import {ACCESSORY_NAMES} from '../src/parts/accessories.js';
import {EYE_RADIUS} from '../src/parts/face.js';
import {PATTERN_NAMES} from '../src/parts/markings.js';
import {contrast, toHex} from '../src/color.js';
import {Rng} from '../src/rng.js';
import {pointInPoly} from '../src/geom.js';
import {buildScene} from '../src/scene.js';
import {STYLES} from '../src/styles/index.js';
import {STYLE_META} from '../src/styles/meta.js';

beforeAll(() => setCanvasFactory(createCanvas));

const SIZE = 120;

function pixel(canvas, x, y) {
  return [...canvas.getContext('2d').getImageData(x, y, 1, 1).data];
}

function fingerprint(canvas) {
  const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  let hash = 0;
  for (let i = 0; i < data.length; i += 7) {
    hash = (hash * 31 + data[i]) >>> 0;
  }
  return hash;
}

describe('catalog', () => {
  test('every catalog name has an implementation', () => {
    expect(Object.keys(STYLES).sort()).toEqual([...catalog.STYLES].sort());
    expect(Object.keys(STYLE_META).sort()).toEqual([...catalog.STYLES].sort());
    expect(ACCESSORY_NAMES.sort()).toEqual([...catalog.ACCESSORIES].sort());
    expect(PATTERN_NAMES.sort()).toEqual([...catalog.PATTERNS].sort());
    expect(BACKGROUND_NAMES.sort()).toEqual([...catalog.BACKGROUNDS].sort());
    expect(Object.keys(EFFECTS).sort()).toEqual([...catalog.EFFECTS].sort());
    expect(Object.keys(EYE_RADIUS).sort()).toEqual([...catalog.EYE_KINDS].sort());
    expect(Object.keys(FRAMES).sort()).toEqual([...catalog.FRAMES].sort());
  });
});

describe('genome', () => {
  test('the same seed always makes the same cat', () => {
    expect(createGenome('whiskers')).toEqual(createGenome('whiskers'));
    expect(createGenome('whiskers')).not.toEqual(createGenome('whiskerz'));
  });

  test('overrides win over style tweaks', () => {
    const g = createGenome('x', {style: 'kawaii', eyeKind: 'x', cheeks: false});
    expect(g.eyeKind).toBe('x');
    expect(g.cheeks).toBe(false);
  });

  test('changing the style keeps the head shape', () => {
    const a = createGenome('loaf', {style: 'classic'});
    const b = createGenome('loaf', {style: 'neon'});
    expect(b.headShape).toBe(a.headShape);
    expect(b.earShape).toBe(a.earShape);
  });

  test('chaos 0 cats are tamer than chaos 1 cats', () => {
    const count = chaos => Array.from({length: 200}, (_, i) => createGenome(`c${i}`, {chaos}))
      .reduce((n, g) => n + g.accessories.length + g.effects.length, 0);
    expect(count(0)).toBeLessThan(count(1) / 2);
  });

  test('chaos 0 cats are ordinary cats', () => {
    const weirdEyes = new Set(['heart', 'star', 'x', 'spiral', 'void', 'button', 'glow']);
    const weirdMouths = new Set(['cheshire', 'fangs']);

    for (let i = 0; i < 300; i++) {
      const g = createGenome(`calm-${i}`, {chaos: 0});
      // rubberhose always adds its own vignette; that's the style, not chaos
      expect(g.style === 'rubberhose' ? [] : g.effects).toEqual([]);
      expect(g.accessories.filter(a => catalog.FERAL_ACCESSORIES.includes(a))).toEqual([]);
      expect(weirdEyes.has(g.eyeKind) || weirdEyes.has(g.eyeKindR)).toBe(false);
      expect(weirdMouths.has(g.mouthKind)).toBe(false);
      expect(g.patterns).not.toContain('galaxy');
    }
  });

  test('styles that are already a medium never get a whole-picture color transform', () => {
    const media = catalog.STYLES.filter(s => STYLE_META[s].medium);
    expect(media.sort()).toEqual([
      'blueprint', 'chalk', 'comic', 'cubist', 'doodle', 'embroidery', 'line', 'neon', 'pixel', 'popart',
      'stainedglass', 'tattoo', 'ukiyoe', 'watercolor', 'woodcut',
    ]);

    for (const style of media) {
      for (let i = 0; i < 60; i++) {
        const g = createGenome(`medium-${style}-${i}`, {style, chaos: 1});
        expect(g.effects.filter(e => catalog.EFFECT_GROUPS.transform.includes(e))).toEqual([]);
      }
    }
  });

  test('a pinned effect still applies to a medium style', () => {
    expect(createGenome('pinned', {style: 'pixel', effects: ['dither']}).effects).toEqual(['dither']);
  });

  test('heads are never squashed flatter than 0.58 of their width', () => {
    for (let i = 0; i < 400; i++) {
      const g = createGenome(`aspect-${i}`, {chaos: 1});
      expect(g.headH / g.headW).toBeGreaterThanOrEqual(0.58 - 1e-9);
    }
  });

  test('every cat has a name, and the same seed always gets the same one', () => {
    const names = new Set();
    for (let i = 0; i < 50; i++) {
      const g = createGenome(`named-${i}`);
      expect(g.name).toBe(createGenome(`named-${i}`).name);
      expect(g.name.length).toBeGreaterThan(2);
      names.add(g.name);
    }
    expect(names.size).toBeGreaterThan(40);
  });

  test('genomes round-trip through JSON', () => {
    const g = createGenome('json');
    expect(JSON.parse(JSON.stringify(g))).toEqual(g);
  });
});

describe('dither', () => {
  test('is two-color error diffusion that follows the tones underneath', () => {
    for (const seed of ['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7']) {
      const canvas = createCanvas(96, 96);
      const ctx = canvas.getContext('2d');
      const ramp = ctx.createLinearGradient(0, 0, 96, 0);
      ramp.addColorStop(0, '#000000');
      ramp.addColorStop(1, '#ffffff');
      ctx.fillStyle = ramp;
      ctx.fillRect(0, 0, 96, 96);

      EFFECTS.dither(canvas, {g: {}, size: 96, t: null, rng: new Rng(seed), createCanvas});

      const data = ctx.getImageData(0, 0, 96, 96).data;
      const brightness = new Map();

      for (let i = 0; i < data.length; i += 4) {
        brightness.set(`${data[i]},${data[i + 1]},${data[i + 2]}`, data[i] + data[i + 1] + data[i + 2]);
      }

      expect(brightness.size).toBe(2);

      // count the paper (the brighter of the two colors) in each quarter of the ramp
      const paper = Math.max(...brightness.values());
      const light = [0, 0, 0, 0];

      for (let y = 0; y < 96; y++) {
        for (let x = 0; x < 96; x++) {
          const i = (y * 96 + x) * 4;
          if (data[i] + data[i + 1] + data[i + 2] === paper) light[Math.floor(x / 24)]++;
        }
      }

      expect(light[0]).toBeLessThan(light[1]);
      expect(light[1]).toBeLessThan(light[2]);
      expect(light[2]).toBeLessThan(light[3]);
    }
  });
});

describe('face part geometry', () => {
  const all = s => s.polys.flat();

  // y of the lowest mouth line directly above or below x (the lip), or null
  function lipAt(lines, x) {
    let best = null;
    for (const poly of lines.flatMap(s => s.polys)) {
      for (let i = 1; i < poly.length; i++) {
        const [x1, y1] = poly[i - 1];
        const [x2, y2] = poly[i];
        if ((x1 - x) * (x2 - x) <= 0 && x1 !== x2) {
          const y = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
          best = best == null ? y : Math.max(best, y);
        }
      }
    }
    return best;
  }

  test.each([['blep', 'tongue'], ['fangs', 'teeth']])('%s: the %s hangs below the lip, never above it', (mouthKind, role) => {
    for (const seed of ['p0', 'p1', 'p2', 'p3', 'p4', 'p5']) {
      const face = buildScene(createGenome(seed, {mouthKind, accessories: []})).face;
      const lines = face.filter(s => s.role === 'mouth');
      const parts = face.filter(s => s.role === role);
      expect(parts.length).toBeGreaterThan(0);

      for (const [x, y] of parts.flatMap(all)) {
        const lip = lipAt(lines, x);
        // half the lip's line width of overlap is fine; anything more pokes out above it
        if (lip != null) expect(y).toBeGreaterThanOrEqual(lip - 3.5);
      }
    }
  });

  test('meow: the tongue stays inside the open mouth', () => {
    for (const seed of ['p0', 'p1', 'p2', 'p3', 'p4', 'p5']) {
      const face = buildScene(createGenome(seed, {mouthKind: 'meow', accessories: []})).face;
      const mouth = face.find(s => s.role === 'mouthFill').polys[0];
      const tongue = face.find(s => s.role === 'tongue');
      for (const p of all(tongue)) {
        expect(pointInPoly(p, mouth)).toBe(true);
      }
    }
  });

  test('messy whiskers fan out without crossing each other', () => {
    const cross = ([a, b], [c, d]) => {
      const side = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
      return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
    };

    for (let i = 0; i < 40; i++) {
      const whisker = buildScene(createGenome(`messy-${i}`, {whiskerKind: 'messy'})).face.find(s => s.role === 'whisker');
      for (const side of [-1, 1]) {
        const mine = whisker.polys.filter(p => Math.sign(p[0][0]) === side).map(p => [p[0], p[p.length - 1]]);
        for (let a = 0; a < mine.length; a++) {
          for (let b = a + 1; b < mine.length; b++) {
            expect(cross(mine[a], mine[b])).toBe(false);
          }
        }
      }
    }
  });

  test('whisker pads sit beside the mouth, not on it', () => {
    for (let i = 0; i < 20; i++) {
      const face = buildScene(createGenome(`pads-${i}`, {whiskerKind: 'pads', mouthKind: 'split'})).face;
      const reach = Math.max(...face.filter(s => s.role === 'mouth').flatMap(all).map(([x]) => Math.abs(x)));
      const pads = face.find(s => s.role === 'whisker');
      for (const dot of pads.polys) {
        const inner = Math.min(...dot.map(([x]) => Math.abs(x)));
        expect(inner).toBeGreaterThan(reach);
      }
    }
  });
});

describe('silhouettes', () => {
  // every style that paints the cat's body, except pixel (too coarse to sample), the
  // collages, and stained glass, whose lead lines cross the head on purpose
  const painted = catalog.STYLES.filter(s => !['pixel', 'cubist', 'popart', 'stainedglass'].includes(s));

  // average luminance of a 7x7 window around a scene point
  function tone(canvas, frame, [sx, sy]) {
    const x = Math.round(frame.x + frame.k * (sx - frame.cx));
    const y = Math.round(frame.y + frame.k * (sy - frame.cy));
    const d = canvas.getContext('2d').getImageData(x - 3, y - 3, 7, 7).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    return sum / (d.length / 4) / 255;
  }

  test.each(painted)('%s: no ear edge shows inside the head', style => {
    const g = createGenome('silhouette', {
      style, fur: '#c9a27e', patterns: [], accessories: [], effects: [], frame: 'none', background: 'solid',
      earShape: 'pointy', earInsides: false, whiskerKind: 'none', headShape: 'squircle', headN: 3,
      // keep the eyes low and apart so the forehead sample is open fur in every style
      eyeY: 0.05, eyeSpacing: 0.42,
    });
    const scene = buildScene(g);
    const ear = scene.anchors.ears[1];
    const anchor = ear.outline.at(-1);
    // a point on the ear's closing edge, which lies inside the head, and a point
    // on open forehead between the ears: both should just be fur
    const edge = [(ear.inner[0] + anchor[0]) / 2, (ear.inner[1] + anchor[1]) / 2];
    const deeper = [edge[0] * 0.35, edge[1] * 0.9];
    const canvas = renderCat(g, {size: 600});
    expect(Math.abs(tone(canvas, scene.frame, edge) - tone(canvas, scene.frame, deeper))).toBeLessThan(0.08);
  });
});

describe('neon', () => {
  test('draws the head and ears as one outline: no ear tube inside the head', () => {
    const g = createGenome('neon-ears', {
      style: 'neon', patterns: [], accessories: [], effects: [], frame: 'none', background: 'solid', bgColor: '#000000',
      earShape: 'pointy', earInsides: false, whiskerKind: 'none', headShape: 'ellipse',
    });
    const scene = buildScene(g);
    const {frame} = scene;
    const ear = scene.anchors.ears[1];
    // the ear's closing edge, which runs from its inner base down inside the head
    const inside = [(ear.inner[0] + ear.outline.at(-1)[0]) / 2, (ear.inner[1] + ear.outline.at(-1)[1]) / 2];
    const x = Math.round(frame.x + frame.k * (inside[0] - frame.cx));
    const y = Math.round(frame.y + frame.k * (inside[1] - frame.cy));
    const [r, gg, b] = pixel(renderCat(g, {size: 600}), x, y);
    expect(r + gg + b).toBeLessThan(150);
  });
});

describe('glow', () => {
  test('falls off smoothly with distance from the cat, like a buffer', () => {
    const size = 400;
    const layer = createCanvas(size, size);
    const ctx = layer.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(150, 150, 100, 100);

    EFFECTS.glow(layer, {g: {accent: '#ff8800'}, size, t: null, rng: new Rng('glow'), createCanvas});

    // walk right from the square's edge along its middle row
    const alphas = [];
    for (let x = 252; x < 320; x++) {
      alphas.push(pixel(layer, x, 200)[3]);
    }

    expect(alphas[0]).toBeGreaterThan(120);
    expect(alphas[alphas.length - 1]).toBe(0);

    for (let i = 1; i < alphas.length; i++) {
      // never brightens moving outward, and no visible banding steps
      expect(alphas[i]).toBeLessThanOrEqual(alphas[i - 1]);
      expect(alphas[i - 1] - alphas[i]).toBeLessThan(25);
    }
  });
});

test('glow is a light even when the accent color is black', () => {
  const layer = createCanvas(200, 200);
  const ctx = layer.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(75, 75, 50, 50);

  EFFECTS.glow(layer, {g: {accent: '#111111', accent2: '#111111', eyeColor: '#333333'}, size: 200, t: null, rng: new Rng('g'), createCanvas});

  const [r, g, b] = pixel(layer, 128, 100);
  expect(r + g + b).toBeGreaterThan(300);
});

describe('color mapping effects', () => {
  // a low-contrast picture: everything sits between 40% and 60% gray
  function murky() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    const ramp = ctx.createLinearGradient(0, 0, 64, 0);
    ramp.addColorStop(0, '#666666');
    ramp.addColorStop(1, '#999999');
    ctx.fillStyle = ramp;
    ctx.fillRect(0, 0, 64, 64);
    return canvas;
  }

  test.each(['duotone', 'thermal', 'riso'])('%s spreads a murky picture across its whole palette', name => {
    // riso picks its inks at random; every pick has to leave the cat readable
    for (const seed of ['murk', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9']) {
      const canvas = murky();
      EFFECTS[name](canvas, {g: {}, size: 64, t: null, rng: new Rng(seed), createCanvas});
      const hex = x => toHex(pixel(canvas, x, 32).slice(0, 3));
      expect(contrast(hex(1), hex(62))).toBeGreaterThan(3);
    }
  });

});

describe('rendering', () => {
  test('a genome renders identically every time', () => {
    const g = createGenome('same', {effects: ['glitch', 'riso']});
    expect(fingerprint(renderCat(g, {size: SIZE}))).toBe(fingerprint(renderCat(g, {size: SIZE})));
  });

  test('transparent mode leaves the corners clear and the face painted', () => {
    const g = createGenome('clear', {style: 'classic', effects: ['vignette'], accessories: []});
    const canvas = renderCat(g, {size: SIZE, transparent: true});
    expect(pixel(canvas, 1, 1)[3]).toBe(0);
    expect(pixel(canvas, SIZE / 2, SIZE / 2)[3]).toBe(255);
  });

  test.each(['popart', 'cubist'])('%s frames the whole collage once, not each piece', style => {
    const g = createGenome('collage', {style, frame: 'stamp', effects: [], background: 'solid', bgColor: '#3366cc'});
    const size = 600;
    const canvas = renderCat(g, {size});
    // just inside the stamp's picture window: the collage's own background,
    // not the kraft envelope of a stamp framing one of its pieces
    const [r, gg, b] = pixel(canvas, 140, 94);
    expect(contrast(toHex([r, gg, b]), '#d9b98a')).toBeGreaterThan(1.3);
  });

  test('transparent renders skip the frame and style decorations', () => {
    for (const style of ['classic', 'tattoo', 'comic', 'embroidery', 'ukiyoe']) {
      const g = createGenome('bare', {style, frame: 'card', effects: [], accessories: []});
      const canvas = renderCat(g, {size: SIZE, transparent: true});
      for (const [x, y] of [[1, 1], [SIZE - 2, 1], [1, SIZE - 2], [SIZE - 2, SIZE - 2]]) {
        expect(pixel(canvas, x, y)[3]).toBe(0);
      }
    }
  });

  test('animation frames differ', () => {
    const g = createGenome('anim', {effects: [], background: 'sunburst'});
    expect(fingerprint(renderCat(g, {size: SIZE, t: 0}))).not.toBe(fingerprint(renderCat(g, {size: SIZE, t: 1.3})));
  });

  test.each(catalog.STYLES)('style %s renders', style => {
    for (const seed of ['a', 'b', 'c']) {
      const canvas = renderCat(createGenome(seed, {style, chaos: 1}), {size: SIZE, t: 0.5});
      expect(canvas.width).toBe(SIZE);
    }
  });

  const cases = [
    ...catalog.HEAD_SHAPES.map(v => ['headShape', v]),
    ...catalog.EAR_SHAPES.map(v => ['earShape', v]),
    ...catalog.EYE_KINDS.map(v => ['eyeKind', v]),
    ...catalog.BROWS.map(v => ['brows', v]),
    ...catalog.NOSE_KINDS.map(v => ['noseKind', v]),
    ...catalog.MOUTH_KINDS.map(v => ['mouthKind', v]),
    ...catalog.WHISKER_KINDS.map(v => ['whiskerKind', v]),
    ...catalog.PATTERNS.map(v => ['patterns', [v]]),
    ...catalog.ACCESSORIES.map(v => ['accessories', [v]]),
    ...catalog.BACKGROUNDS.map(v => ['background', v]),
    ...catalog.EFFECTS.map(v => ['effects', [v]]),
    ...catalog.FRAMES.map(v => ['frame', v]),
  ];

  test.each(cases)('%s = %s renders', (key, value) => {
    const g = createGenome(`trait-${key}`, {style: 'classic', effects: [], [key]: value});
    expect(() => renderCat(g, {size: SIZE})).not.toThrow();
    expect(() => renderCat(g, {size: SIZE, t: 2})).not.toThrow();
  });

  test('glasses in line art leave the eyes visible', () => {
    const base = {style: 'line', eyeKind: 'round', eyeKindR: 'round', effects: [], frame: 'none', background: 'solid'};
    const without = createGenome('specs', {...base, accessories: []});
    const withGlasses = createGenome('specs', {...base, accessories: ['roundGlasses']});
    const [ex, ey] = buildScene(without).anchors.eyes[1];
    const {frame} = buildScene(without);
    // canvas position of the right pupil, at full size so the pupil is several pixels wide
    const x = Math.round(frame.x + frame.k * (ex - frame.cx));
    const y = Math.round(frame.y + frame.k * (ey - frame.cy));
    const pupil = canvas => pixel(canvas, x, y).slice(0, 3).reduce((a, b) => a + b);
    const bare = pupil(renderCat(without, {size: 600}));
    // ink, not paper (paper sums to about 700)
    expect(bare).toBeLessThan(400);
    // putting glasses on must not paint over the pupil
    expect(pupil(renderCat(withGlasses, {size: 600}))).toBeLessThan(bare + 60);
  });

  test('face lines on dark fur are drawn in a light ink', () => {
    const g = createGenome('void-cat', {fur: '#1d1a1f', patterns: [], mouthKind: 'w', whiskerKind: 'straight'});
    const lines = buildScene(g).face.filter(s => s.role === 'mouth' || s.role === 'whisker');
    expect(lines.length).toBeGreaterThan(0);
    for (const s of lines) {
      expect(s.stroke).not.toBe(g.ink);
    }
  });

  test.each(['line', 'doodle', 'woodcut'])('%s keeps dark face lines on dark fur, since its fur is hatching on paper', style => {
    const g = createGenome('hatched-void', {style, fur: '#3a3f4b', patterns: [], mouthKind: 'w', whiskerKind: 'straight'});
    const lines = buildScene(g).face.filter(s => s.role === 'mouth' || s.role === 'whisker');
    for (const s of lines) {
      expect(s.stroke).toBe(g.ink);
    }
  });

  test('whiskers and everything worn stay on the canvas', () => {
    const worn = new Set([...catalog.ACCESSORY_SLOTS.hat, ...catalog.ACCESSORY_SLOTS.ear, ...catalog.ACCESSORY_SLOTS.neck]);

    for (let i = 0; i < 300; i++) {
      const scene = buildScene(createGenome(`edge-${i}`, {chaos: 1}));
      const {x, y, k, cx, cy} = scene.frame;
      const shapes = [...scene.body, ...scene.face, ...scene.back, ...scene.front.filter(s => worn.has(s.source))];

      for (const s of shapes) {
        for (const poly of s.polys) {
          for (const [px, py] of poly) {
            const canvasX = x + k * (px - cx);
            const canvasY = y + k * (py - cy);
            expect(canvasX).toBeGreaterThanOrEqual(0);
            expect(canvasX).toBeLessThanOrEqual(600);
            expect(canvasY).toBeGreaterThanOrEqual(0);
            expect(canvasY).toBeLessThanOrEqual(600);
          }
        }
      }
    }
  });

  test('the scene stays inside the frame', () => {
    for (let i = 0; i < 50; i++) {
      const scene = buildScene(createGenome(`frame-${i}`, {chaos: 1}));
      expect(scene.frame.k).toBeGreaterThan(0.4);
    }
  });
});
