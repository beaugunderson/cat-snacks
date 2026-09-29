// Geometry is plain arrays of [x, y] points. Curves are flattened into
// polylines up front so every style can reinterpret the same shapes: jitter
// them, simplify them, rasterize them, hatch them.

export const TAU = Math.PI * 2;

export const lerp = (a, b, t) => a + (b - a) * t;
export const lerpPt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export function ellipse(cx, cy, rx, ry, n = 48, rotation = 0) {
  const pts = [];
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    pts.push([cx + x * cos - y * sin, cy + x * sin + y * cos]);
  }

  return pts;
}

export const circle = (cx, cy, r, n = 36) => ellipse(cx, cy, r, r, n);

// exponent 2 is an ellipse; larger exponents approach a rounded rectangle
export function superellipse(rx, ry, exponent, n = 96) {
  const pts = [];
  const e = 2 / exponent;

  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pts.push([rx * Math.sign(c) * Math.abs(c) ** e, ry * Math.sign(s) * Math.abs(s) ** e]);
  }

  return pts;
}

export function bezier(p0, p1, p2, p3, n = 20) {
  const pts = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }

  return pts;
}

export function quad(p0, p1, p2, n = 16) {
  const pts = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([
      u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
      u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
    ]);
  }

  return pts;
}

// chain of segments: path([x, y]).line(p).curve(c1, c2, p).quad(c, p).pts
export function path(start) {
  const pts = [start];
  const last = () => pts[pts.length - 1];

  const api = {
    pts,
    line(p) {
      pts.push(p);
      return api;
    },
    curve(c1, c2, p, n) {
      pts.push(...bezier(last(), c1, c2, p, n).slice(1));
      return api;
    },
    quad(c, p, n) {
      pts.push(...quad(last(), c, p, n).slice(1));
      return api;
    },
    arc(cx, cy, r, a0, a1, n = 16) {
      for (let i = 1; i <= n; i++) {
        const a = lerp(a0, a1, i / n);
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return api;
    },
  };

  return api;
}

export function arc(cx, cy, rx, ry, a0, a1, n = 20) {
  const pts = [];

  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n);
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }

  return pts;
}

export function star(cx, cy, r, inner, points = 5, rotation = -Math.PI / 2) {
  const pts = [];

  for (let i = 0; i < points * 2; i++) {
    const a = rotation + (i / (points * 2)) * TAU;
    const rr = i % 2 === 0 ? r : r * inner;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }

  return pts;
}

export function heart(cx, cy, size, n = 40) {
  const pts = [];

  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([cx + (x / 17) * size, cy - (y / 17) * size]);
  }

  return pts;
}

export function rect(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

export function roundRect(x, y, w, h, r, n = 6) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [];
  const corners = [
    [x + w - r, y + r, -Math.PI / 2],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, Math.PI / 2],
    [x + r, y + r, Math.PI],
  ];

  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }

  return pts;
}

export const translate = (poly, dx, dy) => poly.map(([x, y]) => [x + dx, y + dy]);

export function scale(poly, sx, sy = sx, cx = 0, cy = 0) {
  return poly.map(([x, y]) => [cx + (x - cx) * sx, cy + (y - cy) * sy]);
}

export function rotate(poly, angle, cx = 0, cy = 0) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return poly.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  });
}

export const mirrorX = poly => poly.map(([x, y]) => [-x, y]);

export function signedArea(poly) {
  let a = 0;

  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }

  return a / 2;
}

// consistent winding so overlapping clip regions union under the nonzero rule
export const normalizeWinding = poly => (signedArea(poly) < 0 ? poly.slice().reverse() : poly);

export function centroid(poly) {
  let x = 0;
  let y = 0;

  for (const p of poly) {
    x += p[0];
    y += p[1];
  }

  return [x / poly.length, y / poly.length];
}

export function bounds(polys) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const poly of polys) {
    for (const [x, y] of poly) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return {minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY};
}

export function length(poly, closed = false) {
  let total = 0;

  for (let i = 1; i < poly.length; i++) {
    total += dist(poly[i - 1], poly[i]);
  }

  if (closed && poly.length > 1) {
    total += dist(poly[poly.length - 1], poly[0]);
  }

  return total;
}

// evenly spaced points along a polyline
export function resample(poly, spacing, closed = false) {
  const src = closed ? [...poly, poly[0]] : poly;
  const out = [src[0]];
  let carry = 0;

  for (let i = 1; i < src.length; i++) {
    const a = src[i - 1];
    const b = src[i];
    const d = dist(a, b);
    let pos = spacing - carry;

    while (pos <= d) {
      out.push(lerpPt(a, b, pos / d));
      pos += spacing;
    }

    carry = d - (pos - spacing);
  }

  if (closed && out.length > 1 && dist(out[out.length - 1], out[0]) < spacing * 0.5) {
    out.pop();
  }

  return out.length > 2 || !closed ? out : poly;
}

export function jitter(poly, rng, amount) {
  return poly.map(([x, y]) => [x + rng.gauss(0, amount), y + rng.gauss(0, amount)]);
}

// recursive midpoint displacement (the watercolor-blob technique)
export function deform(poly, rng, amount, depth = 3) {
  let pts = poly;

  for (let d = 0; d < depth; d++) {
    const next = [];

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const len = dist(a, b);
      const mid = lerpPt(a, b, rng.float(0.35, 0.65));
      const nx = -(b[1] - a[1]) / (len || 1);
      const ny = (b[0] - a[0]) / (len || 1);
      const push = rng.gauss(0, amount * len * 0.35);

      next.push(a, [mid[0] + nx * push, mid[1] + ny * push]);
    }

    pts = next;
    amount *= 0.85;
  }

  return pts;
}

export function pointInPoly([x, y], poly) {
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];

    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

// the point on a closed outline closest to the given direction from the origin
export function edgeAt(poly, angle, [cx, cy] = [0, 0]) {
  let best = poly[0];
  let bestDiff = Infinity;

  for (const p of poly) {
    const a = Math.atan2(p[1] - cy, p[0] - cx);
    let diff = Math.abs(a - angle) % TAU;
    diff = Math.min(diff, TAU - diff);

    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }

  return best;
}

// grow (amount > 0) or shrink a roughly convex outline around its centroid
export function inflate(poly, amount) {
  const [cx, cy] = centroid(poly);

  return poly.map(([x, y]) => {
    const d = Math.hypot(x - cx, y - cy) || 1;
    return [x + ((x - cx) / d) * amount, y + ((y - cy) / d) * amount];
  });
}

export function spiral(cx, cy, r, turns = 2.5, n = 80, phase = 0) {
  const pts = [];

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = phase + t * turns * TAU;
    pts.push([cx + Math.cos(a) * r * t, cy + Math.sin(a) * r * t]);
  }

  return pts;
}

export function blob(rng, cx, cy, r, wobble = 0.3, n = 18) {
  const pts = [];
  const offset = rng.float(0, TAU);
  const lobes = rng.int(2, 5);

  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const rr = r * (1 + wobble * Math.sin(a * lobes + offset) * rng.float(0.6, 1));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }

  return pts;
}

// Bridson-style poisson disc sampling within a rectangle
export function poisson(rng, width, height, radius, maxPoints = 400) {
  const cell = radius / Math.SQRT2;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const grid = new Array(cols * rows).fill(null);
  const points = [];
  const active = [];

  const add = p => {
    points.push(p);
    active.push(p);
    grid[Math.floor(p[1] / cell) * cols + Math.floor(p[0] / cell)] = p;
  };

  const fits = ([x, y]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return false;
    }

    const gx = Math.floor(x / cell);
    const gy = Math.floor(y / cell);

    for (let j = Math.max(0, gy - 2); j <= Math.min(rows - 1, gy + 2); j++) {
      for (let i = Math.max(0, gx - 2); i <= Math.min(cols - 1, gx + 2); i++) {
        const q = grid[j * cols + i];
        if (q && dist(q, [x, y]) < radius) {
          return false;
        }
      }
    }

    return true;
  };

  add([rng.float(0, width), rng.float(0, height)]);

  while (active.length && points.length < maxPoints) {
    const idx = Math.floor(rng.next() * active.length);
    const base = active[idx];
    let found = false;

    for (let k = 0; k < 30; k++) {
      const a = rng.float(0, TAU);
      const d = rng.float(radius, radius * 2);
      const p = [base[0] + Math.cos(a) * d, base[1] + Math.sin(a) * d];

      if (fits(p)) {
        add(p);
        found = true;
        break;
      }
    }

    if (!found) {
      active.splice(idx, 1);
    }
  }

  return points;
}
