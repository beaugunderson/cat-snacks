import {contrast, luminance, toRgb} from './color.js';
import {RISO_INKS} from './palettes.js';

// Effects rewrite a canvas in place, in pixel space. Layer effects receive
// the transparent cat layer; the rest receive the finished picture.
// env: {g, size, t, rng, createCanvas}

const clamp = v => (v < 0 ? 0 : v > 255 ? 255 : v);

// a different random stream per animation frame for effects that should flicker
function frameRng(env, fps = 10) {
  return env.t == null ? env.rng : env.rng.fork(`f${Math.floor(env.t * fps)}`);
}

function copy(canvas, env) {
  const c = env.createCanvas(canvas.width, canvas.height);
  c.getContext('2d').drawImage(canvas, 0, 0);
  return c;
}

function replace(canvas, source) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function pixels(canvas) {
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {ctx, data, px: data.data, w: canvas.width, h: canvas.height};
}

function put({ctx, data}) {
  ctx.putImageData(data, 0, 0);
}

// the layer's opaque pixels filled with one color
function silhouette(layer, color, env) {
  const c = copy(layer, env);
  const ctx = c.getContext('2d');
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

function ring(ctx, image, radius, steps = 24) {
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ctx.drawImage(image, Math.cos(a) * radius, Math.sin(a) * radius);
  }
}

// Exact Euclidean distance transform (Felzenszwalb & Huttenlocher). For one
// row or column: given f[i] = squared distance already known at i (0 inside
// the cat, huge outside), find for every i the smallest f[j] + (i - j)^2 by
// sweeping a lower envelope of parabolas, one rooted at each j.
const FAR = 1e20;

function edt1d(f, n, out, v, z) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;

  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }

  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    out[q] = (q - v[k]) ** 2 + f[v[k]];
  }
}

// how far every pixel is from the nearest opaque pixel of a layer (0 on the cat)
function distanceField(px, w, h) {
  const dist = new Float64Array(w * h);

  for (let i = 0; i < w * h; i++) {
    dist[i] = px[i * 4 + 3] >= 128 ? 0 : FAR;
  }

  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const out = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);

  // columns, then rows; the two 1D passes combine into the exact 2D distance
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = dist[y * w + x];
    edt1d(f, h, out, v, z);
    for (let y = 0; y < h; y++) dist[y * w + x] = out[y];
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = dist[y * w + x];
    edt1d(f, w, out, v, z);
    for (let x = 0; x < w; x++) dist[y * w + x] = Math.sqrt(out[x]);
  }

  return dist;
}

// a layer the same size, colored `rgb` with alpha = opacity(distance) per pixel
function buffer(layer, env, rgb, opacity) {
  const {px, w, h} = pixels(layer);
  const dist = distanceField(px, w, h);
  const out = env.createCanvas(w, h);
  const p = pixels(out);

  for (let i = 0; i < w * h; i++) {
    const a = opacity(dist[i]);
    if (a > 0) {
      p.px[i * 4] = rgb[0];
      p.px[i * 4 + 1] = rgb[1];
      p.px[i * 4 + 2] = rgb[2];
      p.px[i * 4 + 3] = Math.round(Math.min(1, a) * 255);
    }
  }

  put(p);
  return out;
}

function lum(px, i) {
  return (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
}

// The darkest and lightest brightness in a picture, ignoring the outer 2% at
// each end. Color-mapping effects stretch this range to fill 0..1, so a cat
// whose fur is as bright as its background still gets full contrast.
function toneRange(px) {
  const counts = new Uint32Array(256);

  for (let i = 0; i < px.length; i += 4) {
    counts[Math.round(lum(px, i) * 255)]++;
  }

  const total = px.length / 4;
  let seen = 0;
  let lo = 0;
  let hi = 255;

  for (let v = 0; v < 256; v++) {
    seen += counts[v];
    if (seen >= total * 0.02) {
      lo = v;
      break;
    }
  }

  seen = 0;
  for (let v = 255; v >= 0; v--) {
    seen += counts[v];
    if (seen >= total * 0.02) {
      hi = v;
      break;
    }
  }

  if (hi - lo < 8) {
    return {lo: 0, span: 1};
  }

  return {lo: lo / 255, span: (hi - lo) / 255};
}

function stretched(px, i, range) {
  return Math.min(1, Math.max(0, (lum(px, i) - range.lo) / range.span));
}

function gradientMap(canvas, stops) {
  const colors = stops.map(toRgb);
  const p = pixels(canvas);
  const range = toneRange(p.px);

  for (let i = 0; i < p.px.length; i += 4) {
    const l = stretched(p.px, i, range) * (colors.length - 1);
    const k = Math.min(colors.length - 2, Math.floor(l));
    const t = l - k;
    for (let c = 0; c < 3; c++) {
      p.px[i + c] = colors[k][c] + (colors[k + 1][c] - colors[k][c]) * t;
    }
  }

  put(p);
}

// ink and paper pairs for dithering, besides plain black on white
const DITHER_PAIRS = [
  ['#1d1a1f', '#f6f0e1'],
  ['#0f380f', '#9bbc0f'],
  ['#2b1055', '#ffd6e8'],
  ['#1b2a4a', '#e8f1ff'],
];

// Atkinson's neighbors, as [dx, dy] offsets; each receives 1/8 of the error
const ATKINSON = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];

export const EFFECTS = {
  // layer effects --------------------------------------------------------------

  // a white die-cut border: a solid buffer with a one-pixel soft edge
  sticker(layer, env) {
    const r = env.size * 0.018;
    const border = buffer(layer, env, [255, 255, 255], d => r + 0.5 - d);
    const shadow = silhouette(border, 'rgba(0, 0, 0, 0.28)', env);
    const out = env.createCanvas(layer.width, layer.height);
    const ctx = out.getContext('2d');

    ctx.drawImage(shadow, r * 0.5, r * 0.8);
    ctx.drawImage(border, 0, 0);
    ctx.drawImage(layer, 0, 0);
    replace(layer, out);
  },

  shadow(layer, env) {
    const s = env.size * 0.025;
    const shadow = silhouette(layer, 'rgba(0, 0, 0, 0.09)', env);
    const out = env.createCanvas(layer.width, layer.height);
    const ctx = out.getContext('2d');

    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.translate(s, s * 1.3);
      ring(ctx, shadow, i * s * 0.25, 10);
      ctx.restore();
    }

    ctx.drawImage(layer, 0, 0);
    replace(layer, out);
  },

  // a buffer around the cat's silhouette whose opacity eases to nothing
  glow(layer, env) {
    const pulse = env.t == null ? 1 : 0.8 + 0.2 * Math.sin(env.t * 3);
    const reach = env.size * 0.06 * pulse;
    // a glow has to be a light: the first bright color the cat carries
    const color = [env.g.accent, env.g.accent2, env.g.eyeColor].find(c => c && luminance(c) > 0.25) ?? '#ffe066';
    const aura = buffer(layer, env, toRgb(color), d => (d >= reach ? 0 : 0.9 * (1 - d / reach) ** 1.6));
    const ctx = aura.getContext('2d');
    ctx.drawImage(layer, 0, 0);
    replace(layer, aura);
  },

  // transforms -----------------------------------------------------------------

  // Atkinson error diffusion, the original Macintosh look. Each pixel snaps to
  // ink or paper and hands 1/8 of its rounding error to each of six
  // neighbors; the remaining 2/8 is dropped on purpose, which keeps
  // highlights and shadows crisp instead of speckled.
  dither(canvas, env) {
    const [ink, paper] = (env.rng.chance(0.6) ? ['#000000', '#ffffff'] : env.rng.pick(DITHER_PAIRS)).map(toRgb);

    // work at roughly a classic Mac screen's resolution, then scale back up
    const scale = Math.max(1, Math.round(env.size / 512));
    const w = Math.ceil(canvas.width / scale);
    const h = Math.ceil(canvas.height / scale);
    const small = env.createCanvas(w, h);
    small.getContext('2d').drawImage(canvas, 0, 0, w, h);

    const p = pixels(small);
    const tone = new Float32Array(w * h);

    for (let i = 0; i < w * h; i++) {
      tone[i] = lum(p.px, i * 4);
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const light = tone[i] >= 0.5;
        const error = (tone[i] - (light ? 1 : 0)) / 8;

        for (const [dx, dy] of ATKINSON) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny < h) {
            tone[ny * w + nx] += error;
          }
        }

        const color = light ? paper : ink;
        p.px[i * 4] = color[0];
        p.px[i * 4 + 1] = color[1];
        p.px[i * 4 + 2] = color[2];
        p.px[i * 4 + 3] = 255;
      }
    }

    put(p);

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, w * scale, h * scale);
    ctx.restore();
  },

  riso(canvas, env) {
    // the first ink draws the shapes, so it has to stand out from the paper;
    // the second is only color and can be any ink
    const paperHex = '#f5f0e6';
    const dark = RISO_INKS.filter(ink => contrast(ink, paperHex) >= 4);
    const inkA = env.rng.pick(dark);
    const inkB = env.rng.pick(RISO_INKS.filter(ink => ink !== inkA));
    const [ink1, ink2, paper] = [inkA, inkB, paperHex].map(toRgb);
    const src = pixels(copy(canvas, env));
    const dst = pixels(canvas);
    const {w, h} = dst;
    const off = Math.round(env.size * 0.008);
    const rng = frameRng(env, 6);
    const range = toneRange(src.px);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const j = (Math.min(h - 1, y + off) * w + Math.min(w - 1, x + off)) * 4;
        const a = Math.min(1, Math.max(0, 1 - stretched(src.px, i, range) + (rng.next() - 0.5) * 0.35));
        const r2 = src.px[j];
        const g2 = src.px[j + 1];
        const b2 = src.px[j + 2];
        const warm = Math.min(1, Math.max(0, (Math.max(r2, g2, b2) - Math.min(r2, g2, b2)) / 255 + (rng.next() - 0.5) * 0.3));

        for (let c = 0; c < 3; c++) {
          const layer1 = 1 - a * (1 - ink1[c] / 255);
          const layer2 = 1 - warm * 0.85 * (1 - ink2[c] / 255);
          dst.px[i + c] = paper[c] * layer1 * layer2;
        }
      }
    }

    put(dst);
  },

  thermal(canvas) {
    gradientMap(canvas, ['#000010', '#2b0a6b', '#a4167a', '#ff4b1f', '#ffc30f', '#ffffe0']);
  },

  duotone(canvas, env) {
    const pairs = [
      ['#1b1464', '#ff6f91'], ['#0b3d20', '#f0e68c'], ['#2d0a31', '#00f5d4'],
      ['#3a0ca3', '#f72585'], ['#14213d', '#fca311'], ['#000000', '#ff2a2a'],
    ];
    gradientMap(canvas, env.rng.pick(pairs));
  },

  // overlays -------------------------------------------------------------------

  vignette(canvas) {
    const ctx = canvas.getContext('2d');
    const {width: w, height: h} = canvas;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(20, 10, 0, 0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  },

  crt(canvas, env) {
    EFFECTS.rgbsplit(canvas, env);
    const p = pixels(canvas);
    const line = Math.max(2, Math.round(env.size / 200));
    const roll = env.t == null ? 0 : Math.floor(env.t * 60) % (line * 2);

    for (let y = 0; y < p.h; y++) {
      const dark = Math.floor((y + roll) / line) % 2 === 0 ? 0.72 : 1.05;
      for (let x = 0; x < p.w; x++) {
        const i = (y * p.w + x) * 4;
        p.px[i] = clamp(p.px[i] * dark);
        p.px[i + 1] = clamp(p.px[i + 1] * dark * 1.03);
        p.px[i + 2] = clamp(p.px[i + 2] * dark);
      }
    }

    put(p);
    EFFECTS.vignette(canvas);
  },

  glitch(canvas, env) {
    const rng = frameRng(env, 8);
    const src = copy(canvas, env);
    const ctx = canvas.getContext('2d');
    const {width: w, height: h} = canvas;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // small shifts in a handful of bands: glitchy, but the face survives
    for (let i = 0; i < rng.int(4, 9); i++) {
      const y = rng.float(0, h);
      const sh = rng.float(h * 0.005, h * 0.04);
      const dx = rng.gauss(0, w * 0.03);
      ctx.drawImage(src, 0, y, w, sh, dx, y, w, sh);
    }

    for (let i = 0; i < rng.int(2, 6); i++) {
      ctx.fillStyle = rng.pick(['rgba(255, 0, 80, 0.5)', 'rgba(0, 255, 240, 0.5)', 'rgba(255, 255, 255, 0.6)']);
      ctx.fillRect(rng.float(0, w), rng.float(0, h), rng.float(w * 0.05, w * 0.3), rng.float(2, h * 0.02));
    }

    ctx.restore();
    EFFECTS.rgbsplit(canvas, {...env, rng});
  },

  rgbsplit(canvas, env) {
    const src = pixels(copy(canvas, env));
    const dst = pixels(canvas);
    const off = Math.max(2, Math.round(env.size * 0.008));
    const {w, h} = dst;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const left = (y * w + Math.max(0, x - off)) * 4;
        const right = (y * w + Math.min(w - 1, x + off)) * 4;
        dst.px[i] = src.px[left];
        dst.px[i + 2] = src.px[right + 2];
      }
    }

    put(dst);
  },
};

export const EFFECT_NAMES = Object.keys(EFFECTS);
