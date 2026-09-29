import {darken, lighten, luminance, nearest, rgba, toHex, toRgb} from '../color.js';
import {TAU, bounds, deform, poisson, pointInPoly, roundRect, star} from '../geom.js';
import {FONT, clipTo, drawLayers, outsideOthers, paintBody, paintShape, paintText, trace} from './paint.js';
import {hatch} from './marks.js';

// Ukiyo-e, stained glass, tattoo flash, claymation, comic book, embroidery.
// Decorations around the cat (seal, banner, burst, hoop) are skipped for
// transparent renders, which are meant to be just the cat.

const bodyUnion = body => body.flatMap(s => s.polys);

// ukiyo-e ---------------------------------------------------------------------

// a red artist's seal in the corner, with a paw print cut into it
function seal(ctx, x, y, size, color) {
  ctx.save();
  trace(ctx, [roundRect(x, y, size, size, size * 0.12)], true);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = '#f2e8cf';
  const cx = x + size / 2;
  const cy = y + size * 0.58;
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 0.18, size * 0.15, 0, 0, TAU);
  for (const [dx, dy] of [[-0.24, -0.2], [-0.08, -0.3], [0.08, -0.3], [0.24, -0.2]]) {
    ctx.moveTo(cx + dx * size + size * 0.07, cy + dy * size);
    ctx.ellipse(cx + dx * size, cy + dy * size, size * 0.07, size * 0.08, 0, 0, TAU);
  }
  ctx.fill();
  ctx.restore();
}

export const ukiyoe = {
  draw(ctx, scene, g, env) {
    drawLayers(ctx, scene, {
      body(c, body) {
        paintBody(c, body, {widthScale: 0.6});
        // bokashi: the woodblock printer's gradient, dark along the top edge of the head
        const b = bounds(bodyUnion(body));
        const fade = c.createLinearGradient(0, b.minY, 0, b.minY + b.h * 0.45);
        fade.addColorStop(0, rgba(darken(g.fur, 0.35), 0.55));
        fade.addColorStop(1, rgba(darken(g.fur, 0.35), 0));
        c.save();
        clipTo(c, bodyUnion(body));
        c.fillStyle = fade;
        c.fillRect(b.minX, b.minY, b.w, b.h);
        c.restore();
      },
      shape: (c, s) => paintShape(c, s, {width: s.width * 0.6, glow: null}),
    });

    if (!env.transparent) seal(ctx, 522, 518, 54, '#c73e1d');
  },
};

// stained glass ---------------------------------------------------------------

const LEAD = '#1a1a1a';

function glassFill(c, polys, color) {
  const b = bounds(polys);
  const glow = c.createRadialGradient(
    b.minX + b.w * 0.4, b.minY + b.h * 0.35, 2,
    b.minX + b.w * 0.5, b.minY + b.h * 0.5, Math.max(b.w, b.h) * 0.7);
  glow.addColorStop(0, lighten(color, 0.2));
  glow.addColorStop(1, darken(color, 0.1));
  trace(c, polys, true);
  c.fillStyle = glow;
  c.fill();
}

export const stainedglass = {
  draw(ctx, scene, g, env) {
    const rng = env.rng;

    drawLayers(ctx, scene, {
      body(c, body) {
        paintBody(c, body.map(s => ({...s, stroke: LEAD, width: 5})), {fill: () => LEAD});

        // the head cut into panes of slightly different glass, joined by lead
        const union = bodyUnion(body);
        const b = bounds(union);
        const seeds = poisson(rng, b.w, b.h, Math.max(b.w, b.h) / 4.2, 30)
          .map(([x, y]) => [b.minX + x, b.minY + y])
          .filter(p => union.some(poly => pointInPoly(p, poly)));

        c.save();
        clipTo(c, union);

        // each small cell belongs to its nearest seed; cells whose neighbor
        // belongs to a different seed sit on a pane border and get lead
        const step = 3;
        const cols = Math.ceil(b.w / step) + 1;
        const rows = Math.ceil(b.h / step) + 1;
        const owner = new Int16Array(cols * rows);

        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const px = b.minX + i * step;
            const py = b.minY + j * step;
            let best = 0;
            let bestD = Infinity;
            seeds.forEach(([sx, sy], k) => {
              const d = (sx - px) ** 2 + (sy - py) ** 2;
              if (d < bestD) {
                bestD = d;
                best = k;
              }
            });
            owner[j * cols + i] = best;
          }
        }

        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const k = owner[j * cols + i];
            const border = (i + 1 < cols && owner[j * cols + i + 1] !== k) || (j + 1 < rows && owner[(j + 1) * cols + i] !== k);
            const shade = ((k * 7919) % 5 - 2) * 0.04;
            c.fillStyle = border ? LEAD : shade >= 0 ? lighten(g.fur, shade) : darken(g.fur, -shade);
            c.fillRect(b.minX + i * step - (border ? 1 : 0), b.minY + j * step - (border ? 1 : 0), step + (border ? 2 : 0.5), step + (border ? 2 : 0.5));
          }
        }

        c.restore();

        body.forEach((s, i) => outsideOthers(c, body, i, () => paintShape(c, s, {fill: null, stroke: LEAD, width: 9})));
      },
      shape(c, s) {
        if (s.role === 'text') {
          paintText(c, s, LEAD);
          return;
        }

        if (s.closed && s.fill && (s.alpha ?? 1) >= 0.5) {
          const color = luminance(s.fill) < 0.05 ? '#1b2a4a' : s.fill;
          glassFill(c, s.polys, color);
          paintShape(c, s, {fill: null, stroke: LEAD, width: Math.max(4, Math.min(s.width || 5, 7)), glow: null});
          return;
        }

        paintShape(c, s, {stroke: s.stroke ? LEAD : null, width: Math.max(4, s.width || 0), glow: null});
      },
    });
  },
};

// tattoo flash ----------------------------------------------------------------

const FLASH = ['#c8102e', '#00843d', '#f6be00', '#1b1b1b', '#f3e6c8', '#e8a87c', '#3a6ea5'];

// a ribbon banner across the bottom with the word in it
function banner(ctx, word, ink) {
  const y = 520;
  const w = 330;
  const x = 300 - w / 2;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = ink;

  // folded ends, drawn first so the main band covers their inner edge
  for (const side of [-1, 1]) {
    const ex = side < 0 ? x - 34 : x + w + 34;
    const bx = side < 0 ? x + 14 : x + w - 14;
    trace(ctx, [[[bx, y + 8], [ex, y + 8], [ex + side * -16, y + 30], [ex, y + 52], [bx, y + 52]]], true);
    ctx.fillStyle = '#b30d27';
    ctx.fill();
    ctx.stroke();
  }

  trace(ctx, [[[x, y], [x + w, y], [x + w, y + 44], [x, y + 44]]], true);
  ctx.fillStyle = '#f3e6c8';
  ctx.fill();
  ctx.stroke();

  ctx.font = `bold 30px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ink;
  ctx.fillText(word, 300, y + 24);
  ctx.restore();
}

export const tattoo = {
  draw(ctx, scene, _g, env) {
    const rng = env.rng;
    const palette = FLASH.map(toRgb);
    // snap every color to the flash sheet's few inks
    const snap = color => (typeof color === 'string' && color.startsWith('#') ? toHex(nearest(toRgb(color), palette)) : color);

    drawLayers(ctx, scene, {
      body(c, body) {
        paintBody(c, body.map(s => ({...s, fill: snap(s.fill), stroke: '#111111'})), {widthScale: 1.5});

        // black shading swept in from the lower right, like a tattooer's whip shade
        const union = bodyUnion(body);
        const b = bounds(union);
        const shade = c.createLinearGradient(b.minX + b.w * 0.55, b.minY + b.h * 0.45, b.maxX, b.maxY);
        shade.addColorStop(0, 'rgba(17, 17, 17, 0)');
        shade.addColorStop(1, 'rgba(17, 17, 17, 0.55)');
        c.save();
        clipTo(c, union);
        c.fillStyle = shade;
        c.fillRect(b.minX, b.minY, b.w, b.h);
        c.restore();
      },
      shape(c, s) {
        if (s.role === 'text') {
          paintText(c, s, '#111111');
          return;
        }
        paintShape(c, s, {fill: snap(s.fill), stroke: s.stroke ? '#111111' : null, width: (s.width || 0) * 1.4, glow: null});
      },
    });

    if (env.transparent) return;

    // flash-sheet sparkles around the design
    ctx.save();
    ctx.fillStyle = '#111111';
    for (const [x, y] of [[60, 80], [540, 110], [70, 430], [548, 400]]) {
      trace(ctx, [star(x + rng.float(-15, 15), y + rng.float(-15, 15), 14, 0.2, 4)], true);
      ctx.fill();
    }
    ctx.restore();

    banner(ctx, rng.pick(['MEOW', 'MOM', 'TUNA', 'NAP LIFE', 'BAD KITTY', '9 LIVES', 'NO RAGRETS', 'FEED ME']), '#111111');
  },
};

// claymation ------------------------------------------------------------------

export const clay = {
  draw(ctx, scene, g, env) {
    const rng = env.rng;

    const lumpy = s => ({...s, polys: s.polys.map(p => (p.length > 8 ? deform(p, rng, 0.04, 2) : p))});

    const molded = (c, s, depth = 1) => {
      const b = bounds(s.polys);
      const shade = c.createRadialGradient(
        b.minX + b.w * 0.35, b.minY + b.h * 0.3, Math.max(4, b.w * 0.05),
        b.minX + b.w * 0.55, b.minY + b.h * 0.6, Math.max(b.w, b.h) * 0.75);
      shade.addColorStop(0, lighten(s.fill, 0.1));
      shade.addColorStop(1, darken(s.fill, 0.14));
      c.save();
      c.globalAlpha *= s.alpha ?? 1;
      c.shadowColor = 'rgba(30, 15, 5, 0.35)';
      c.shadowBlur = 8 * depth;
      c.shadowOffsetX = 2 * depth;
      c.shadowOffsetY = 4 * depth;
      trace(c, s.polys, true);
      c.fillStyle = shade;
      c.fill();
      c.restore();
    };

    // thick rolled snakes of clay for lines, with a highlight along the top
    const rolled = (c, s) => {
      const width = Math.max(6, (s.width || 5) * 1.4);
      c.save();
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.shadowColor = 'rgba(30, 15, 5, 0.35)';
      c.shadowBlur = 6;
      c.shadowOffsetY = 3;
      trace(c, s.polys, s.closed);
      c.strokeStyle = s.stroke;
      c.lineWidth = width;
      c.stroke();
      c.shadowColor = 'transparent';
      c.translate(-width * 0.12, -width * 0.18);
      trace(c, s.polys, s.closed);
      c.strokeStyle = rgba(lighten(s.stroke, 0.35), 0.5);
      c.lineWidth = width * 0.3;
      c.stroke();
      c.restore();
    };

    drawLayers(ctx, scene, {
      body(c, body) {
        const soft = body.map(lumpy);
        // shadows from the whole piece, then the fills on top so no seams show
        for (const s of soft) molded(c, s, 2);
        for (const s of soft) {
          trace(c, s.polys, true);
          c.fillStyle = s.fill;
          c.fill();
        }
        const union = bodyUnion(soft);
        const b = bounds(union);
        c.save();
        clipTo(c, union);
        molded(c, {polys: union, fill: g.fur});
        // thumbprints pressed into the surface
        c.strokeStyle = rgba(darken(g.fur, 0.2), 0.25);
        c.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
          const x = rng.float(b.minX + b.w * 0.2, b.maxX - b.w * 0.2);
          const y = rng.float(b.minY + b.h * 0.2, b.maxY - b.h * 0.2);
          const a = rng.float(0, TAU);
          for (let k = 1; k <= 4; k++) {
            c.beginPath();
            c.ellipse(x, y, 5 * k, 3.5 * k, a, 0.3, Math.PI - 0.3);
            c.stroke();
          }
        }
        c.restore();
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s);
          return;
        }
        if (layer === 'markings') {
          paintShape(c, s, {stroke: null});
          return;
        }
        if (s.closed && s.fill) {
          molded(c, lumpy(s));
        }
        if (s.stroke && (s.width || 0) > 0 && !s.closed) {
          rolled(c, s);
        }
      },
    });
  },
};

// comic book ------------------------------------------------------------------

// Ben-Day dots over the lower-right half of a shape, the printer's shading
function benday(c, polys, color) {
  const b = bounds(polys);
  c.save();
  clipTo(c, polys);
  c.fillStyle = rgba(darken(color, 0.3), 0.55);
  const step = 7;
  for (let y = b.minY; y < b.maxY; y += step) {
    for (let x = b.minX + ((y / step) % 2) * step * 0.5; x < b.maxX; x += step) {
      // dots grow toward the shadowed corner
      const t = ((x - b.minX) / b.w + (y - b.minY) / b.h) / 2;
      if (t < 0.45) continue;
      c.beginPath();
      c.arc(x, y, Math.min(step * 0.42, (t - 0.45) * step * 1.6), 0, TAU);
      c.fill();
    }
  }
  c.restore();
}

function burst(ctx, word, x, y, rng) {
  ctx.save();
  trace(ctx, [star(x, y, 62, 0.62, 12, rng.float(0, 1))], true);
  ctx.fillStyle = '#ffe000';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.fill();
  ctx.stroke();
  ctx.translate(x, y);
  ctx.rotate(rng.float(-0.25, 0.1));
  ctx.font = `900 ${word.length > 5 ? 22 : 28}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#111111';
  ctx.strokeText(word, 0, 2);
  ctx.fillStyle = '#e4002b';
  ctx.fillText(word, 0, 2);
  ctx.restore();
}

export const comic = {
  draw(ctx, scene, g, env) {
    const rng = env.rng;

    drawLayers(ctx, scene, {
      body(c, body) {
        paintBody(c, body.map(s => ({...s, stroke: '#111111'})), {widthScale: 1.3});
        benday(c, bodyUnion(body), g.fur);
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s, '#111111');
          return;
        }
        paintShape(c, s, {stroke: s.stroke ? '#111111' : null, width: (s.width || 0) * 1.2, glow: null});
        if (layer !== 'markings' && s.closed && s.fill && Math.max(bounds(s.polys).w, bounds(s.polys).h) > 40) {
          benday(c, s.polys, s.fill);
        }
      },
    });

    if (env.transparent) return;

    const corner = rng.pick([[90, 90], [510, 90], [96, 510], [504, 510]]);
    burst(ctx, rng.pick(['MEOW!', 'POW!', 'BLEP!', 'MRRP!', 'ZOOM!', 'HISS!', 'PURR!']), corner[0], corner[1], rng);
  },
};

// embroidery ------------------------------------------------------------------

// satin stitch: long parallel threads laid close together, with a sheen
function satin(c, polys, color, angle) {
  hatch(c, polys, {angle, spacing: 3.2, color, width: 3, alpha: 1});
  hatch(c, polys, {angle, spacing: 6.4, color: lighten(color, 0.12), width: 1.2, alpha: 0.7});
}

function backstitch(c, polys, closed, color, width) {
  c.save();
  c.setLineDash([9, 3]);
  c.lineCap = 'round';
  trace(c, polys, closed);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
  c.restore();
}

// the wooden hoop the fabric is stretched in
function hoop(ctx) {
  ctx.save();
  ctx.lineWidth = 26;
  ctx.strokeStyle = '#c8955c';
  ctx.beginPath();
  ctx.arc(300, 300, 285, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#8a5a2b';
  for (const r of [272, 298]) {
    ctx.beginPath();
    ctx.arc(300, 300, r, 0, TAU);
    ctx.stroke();
  }
  // the brass clasp at the top
  trace(ctx, [roundRect(284, -2, 32, 30, 5)], true);
  ctx.fillStyle = '#c9a646';
  ctx.fill();
  ctx.strokeStyle = '#6e5a1c';
  ctx.stroke();
  ctx.restore();
}

export const embroidery = {
  draw(ctx, scene, g, env) {
    const thread = darken(g.fur, 0.45);

    drawLayers(ctx, scene, {
      body(c, body) {
        body.forEach((s, i) => outsideOthers(c, body, i, () => satin(c, s.polys, s.fill, 0.5), {laterOnly: true}));
        body.forEach((s, i) => outsideOthers(c, body, i, () => backstitch(c, s.polys, true, thread, 4)));
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s, thread);
          return;
        }
        if (s.closed && s.fill) {
          const b = bounds(s.polys);
          if (Math.max(b.w, b.h) < 16) {
            // French knots for the tiny bits
            paintShape(c, s, {stroke: darken(s.fill, 0.2), width: 1.5, glow: null});
          } else {
            satin(c, s.polys, s.fill, layer === 'markings' ? -0.5 : 1.1);
          }
        }
        if (s.stroke && (s.width || 0) > 0) {
          backstitch(c, s.polys, s.closed, luminance(s.stroke) < 0.1 ? thread : s.stroke, Math.max(3, Math.min(s.width, 6)));
        }
      },
    });

    if (!env.transparent) hoop(ctx);
  },
};

