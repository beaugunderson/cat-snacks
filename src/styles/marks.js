import {bounds, jitter, resample} from '../geom.js';
import {clipTo, trace} from './paint.js';

// Hand-made marks: hatching, wobbly strokes, simplified outlines.

// parallel lines across a region, clipped to it
export function hatch(ctx, polys, {angle = -0.6, spacing = 8, color, width = 2, rng = null, wobble = 0, alpha = 1}) {
  const b = bounds(polys);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const reach = Math.hypot(b.w, b.h) / 2 + spacing;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  ctx.save();
  clipTo(ctx, polys);
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();

  for (let d = -reach; d <= reach; d += spacing) {
    const off = rng && wobble ? rng.gauss(0, wobble) : 0;
    const x0 = cx + cos * -reach - sin * (d + off);
    const y0 = cy + sin * -reach + cos * (d + off);
    const x1 = cx + cos * reach - sin * (d + off);
    const y1 = cy + sin * reach + cos * (d + off);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }

  ctx.stroke();
  ctx.restore();
}

// a stroke drawn a few times with small wobbles, like a marker going over a line
export function roughStroke(ctx, polys, closed, {rng, color, width, amount = 1.5, passes = 2, alpha = 1, spacing = 6}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let pass = 0; pass < passes; pass++) {
    const wobbly = polys.map(p => {
      const pts = p.length > 1 ? resample(p, spacing, closed) : p;
      const out = jitter(pts, rng, amount);
      // overshoot the start a little, the way a hand closes a loop
      return closed && out.length > 2 ? [...out, out[0], out[1]] : out;
    });
    trace(ctx, wobbly, false);
    ctx.stroke();
  }

  ctx.restore();
}

// keep roughly `target` evenly spaced vertices of an outline
export function simplify(poly, target, closed = true) {
  if (poly.length <= target) {
    return poly;
  }

  const out = [];
  const step = poly.length / target;

  for (let i = 0; i < target; i++) {
    out.push(poly[Math.floor(i * step)]);
  }

  // an open line keeps its far end
  if (!closed) {
    out.push(poly[poly.length - 1]);
  }

  return out;
}
