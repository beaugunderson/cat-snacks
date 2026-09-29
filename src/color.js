// Tiny color helpers. Colors are '#rrggbb' strings throughout.

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function toRgb(hex) {
  let h = hex.replace('#', '');

  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }

  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function toHex([r, g, b]) {
  const part = v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

export function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;

  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }

  return [h * 60, s, l];
}

export function hslToRgb([h, s, l]) {
  h = (((h % 360) + 360) % 360) / 360;

  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const channel = t => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255];
}

// hue in degrees, saturation and lightness 0-1
export function hsl(h, s, l) {
  return toHex(hslToRgb([h, clamp(s), clamp(l)]));
}

export function adjust(hex, {h = 0, s = 0, l = 0} = {}) {
  const [hh, ss, ll] = rgbToHsl(toRgb(hex));
  return hsl(hh + h, ss + s, ll + l);
}

export const lighten = (hex, amount) => adjust(hex, {l: amount});
export const darken = (hex, amount) => adjust(hex, {l: -amount});
export const shiftHue = (hex, degrees) => adjust(hex, {h: degrees});

export function mix(a, b, t) {
  const ca = toRgb(a);
  const cb = toRgb(b);
  return toHex(ca.map((v, i) => v + (cb[i] - v) * t));
}

export function rgba(hex, alpha) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function luminance(hex) {
  const lin = toRgb(hex).map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function pickContrasting(rng, base, choices, minimum = 1.5) {
  const good = choices.filter(c => contrast(base, c) >= minimum);
  return rng.pick(good.length ? good : choices);
}

export function nearest(rgb, palette) {
  let best = palette[0];
  let bestDistance = Infinity;

  for (const p of palette) {
    const d = (p[0] - rgb[0]) ** 2 + (p[1] - rgb[1]) ** 2 + (p[2] - rgb[2]) ** 2;

    if (d < bestDistance) {
      bestDistance = d;
      best = p;
    }
  }

  return best;
}
