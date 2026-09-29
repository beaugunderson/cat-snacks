import {darken, hsl, lighten, nearest, toRgb} from '../color.js';
import {centroid} from '../geom.js';
import {allShapes} from '../scene.js';
import {drawLayers, paintBody, paintShape, trace} from './paint.js';
import {simplify} from './marks.js';

// Styles that rebuild the picture: true pixel art, faceted polygons, and
// collages made from other renders.

// Pixel art: paint the cat tiny, snap to its own palette, add a one-pixel
// outline, and blow it back up without smoothing.
export const pixel = {
  draw(ctx, scene, g, env) {
    const n = env.rng.pick([32, 40, 48]);
    const small = env.createCanvas(n, n);
    const sctx = small.getContext('2d');
    sctx.scale(n / 600, n / 600);

    drawLayers(sctx, scene, {
      body: (c, body) => paintBody(c, body, {widthScale: 1.4}),
      shape: (c, s) => paintShape(c, s, {width: s.width * 1.6, glow: null}),
    });

    const colors = new Set([g.ink]);
    for (const s of allShapes(scene)) {
      for (const color of [s.fill, s.stroke]) {
        if (typeof color === 'string' && color.startsWith('#')) colors.add(color);
      }
    }
    const palette = [...colors].map(toRgb);
    const ink = toRgb(g.ink);

    const data = sctx.getImageData(0, 0, n, n);
    const px = data.data;
    const solid = new Uint8Array(n * n);

    for (let i = 0; i < n * n; i++) {
      const o = i * 4;
      if (px[o + 3] < 110) {
        px[o + 3] = 0;
        continue;
      }
      const [r, gg, b] = nearest([px[o], px[o + 1], px[o + 2]], palette);
      px[o] = r;
      px[o + 1] = gg;
      px[o + 2] = b;
      px[o + 3] = 255;
      solid[i] = 1;
    }

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const i = y * n + x;
        if (solid[i]) continue;
        const touches = (x > 0 && solid[i - 1]) || (x < n - 1 && solid[i + 1]) || (y > 0 && solid[i - n]) || (y < n - 1 && solid[i + n]);
        if (touches) {
          const o = i * 4;
          [px[o], px[o + 1], px[o + 2]] = ink;
          px[o + 3] = 255;
        }
      }
    }

    sctx.putImageData(data, 0, 0);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, env.size, env.size);
    ctx.restore();
  },
};

// Low poly: outlines cut down to a few vertices; big regions split into
// triangles that catch the light at different angles.
export const lowpoly = {
  draw(ctx, scene, _g, env) {
    const rng = env.rng;

    const facets = (c, poly, color) => {
      const pts = simplify(poly, Math.max(5, Math.min(14, Math.round(poly.length / 7))));
      const [cx, cy] = centroid(pts);
      const center = [cx + rng.float(-10, 10), cy + rng.float(-10, 10)];

      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const my = (a[1] + b[1] + center[1]) / 3;
        const mx = (a[0] + b[0] + center[0]) / 3;
        // light from the top left
        const light = -(my - cy) * 0.0012 - (mx - cx) * 0.0006 + rng.float(-0.04, 0.04);
        const shade = light >= 0 ? lighten(color, light) : darken(color, -light);
        trace(c, [[center, a, b]], true);
        c.fillStyle = shade;
        c.strokeStyle = shade;
        c.lineWidth = 1;
        c.fill();
        c.stroke();
      }
    };

    // curves get fewer vertices; short polylines (already straight segments) are left alone
    const angular = s => ({
      ...s,
      polys: s.polys.map(p => {
        if (p.length <= 8) return p;
        return simplify(p, s.closed ? Math.min(10, Math.round(p.length / 4)) : Math.round(p.length / 4), s.closed);
      }),
    });

    drawLayers(ctx, scene, {
      body(c, body) {
        const hard = body.map(s => ({...s, polys: s.polys.map(p => simplify(p, 14))}));
        paintBody(c, hard, {widthScale: 0.5});
        for (const s of body) {
          facets(c, s.polys[0], s.fill);
        }
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintShape(c, s);
          return;
        }

        const sharp = angular(s);
        if (layer === 'markings' && s.fill && s.polys.length === 1 && s.polys[0].length > 12) {
          c.save();
          c.globalAlpha *= s.alpha ?? 1;
          facets(c, s.polys[0], s.fill);
          c.restore();
          return;
        }

        paintShape(c, sharp, {width: s.width * 0.7});
      },
    });
  },
};

const POP = [
  ['#ff3fa4', '#ffe600', '#00c2ff'],
  ['#00c2ff', '#ff6b00', '#ffe600'],
  ['#9cff00', '#7b2cff', '#ff3fa4'],
  ['#ffd400', '#ff1e56', '#1b1464'],
  ['#ff6b00', '#00d1b2', '#ffffff'],
  ['#f72585', '#4cc9f0', '#ffd60a'],
];

function variant(g, overrides) {
  return {...g, effects: [], ...overrides};
}

// Warhol: the same cat four times in clashing colors
export const popart = {
  full(ctx, g, env) {
    const half = Math.round(env.size / 2);
    const picks = env.rng.shuffle(POP).slice(0, 4);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    picks.forEach(([fur, bg, eye], i) => {
      const cat = env.renderCat(variant(g, {
        style: 'classic',
        fur,
        fur2: darken(fur, 0.15),
        fur3: lighten(fur, 0.15),
        bgColor: bg,
        bgColor2: lighten(bg, 0.1),
        eyeColor: eye,
        eyeColorR: eye,
        background: 'solid',
        accent: eye,
      }), {size: half, t: env.t, transparent: env.transparent});
      ctx.drawImage(cat, (i % 2) * half, Math.floor(i / 2) * half);
    });

    ctx.restore();
  },
};

// Cubist: shards of several renders of the same cat, knocked out of alignment
export const cubist = {
  full(ctx, g, env) {
    const rng = env.rng.fork('cubist');
    const opts = {size: env.size, t: env.t, transparent: env.transparent};
    const shift = rng.float(40, 160);
    const sources = [
      env.renderCat(variant(g, {style: 'classic'}), opts),
      env.renderCat(variant(g, {
        style: 'classic',
        fur: hsl(rng.float(0, 360), 0.45, 0.6),
        bgColor: hsl(rng.float(0, 360), 0.35, 0.45),
        eyeKind: rng.pick(['slit', 'round', 'void']),
        eyeKindR: rng.pick(['slit', 'round', 'dot']),
      }), opts),
      env.renderCat(variant(g, {style: 'lowpoly', fur: darken(g.fur, 0.1)}), opts),
      env.renderCat(variant(g, {style: 'line', bgColor: lighten(g.bgColor, 0.2), background: 'solid'}), opts),
    ];

    const S = env.size;
    const c = [S / 2 + rng.float(-S * 0.08, S * 0.08), S / 2 + rng.float(-S * 0.08, S * 0.08)];
    const cuts = rng.int(6, 9);
    const angles = Array.from({length: cuts}, (_, i) => (i / cuts) * Math.PI * 2 + rng.float(-0.25, 0.25));

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(sources[0], 0, 0);

    for (let i = 0; i < cuts; i++) {
      const a0 = angles[i];
      const a1 = angles[(i + 1) % cuts] + (i === cuts - 1 ? Math.PI * 2 : 0);
      const inner = rng.float(0, S * 0.15);
      const wedge = [
        [c[0] + Math.cos(a0) * inner, c[1] + Math.sin(a0) * inner],
        [c[0] + Math.cos(a0) * S, c[1] + Math.sin(a0) * S],
        [c[0] + Math.cos(a1) * S, c[1] + Math.sin(a1) * S],
        [c[0] + Math.cos(a1) * inner, c[1] + Math.sin(a1) * inner],
      ];

      ctx.save();
      trace(ctx, [wedge], true);
      ctx.clip();
      const mid = (a0 + a1) / 2;
      const d = rng.float(0, S * 0.05) * (shift / 100);
      ctx.translate(S / 2 + Math.cos(mid) * d, S / 2 + Math.sin(mid) * d);
      ctx.rotate(rng.float(-0.12, 0.12));
      const k = rng.float(0.95, 1.12);
      ctx.scale(k, k);
      ctx.drawImage(rng.pick(sources), -S / 2, -S / 2);
      ctx.restore();

      ctx.save();
      trace(ctx, [wedge], true);
      ctx.strokeStyle = g.ink;
      ctx.lineWidth = S * 0.006;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  },
};
