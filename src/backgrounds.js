import {darken, lighten, rgba, shiftHue} from './color.js';
import {TAU, circle, heart, inflate, poisson, roundRect, star} from './geom.js';
import {trace} from './styles/paint.js';

// Backgrounds paint the full 600x600 design space behind the cat.

const SIZE = 600;
const C = SIZE / 2;

function fillPolys(ctx, polys, color) {
  trace(ctx, polys, true);
  ctx.fillStyle = color;
  ctx.fill();
}

function solid(ctx, g) {
  ctx.fillStyle = g.bgColor;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function scattered(ctx, g, rng, spacing, make) {
  solid(ctx, g);
  const pts = poisson(rng, SIZE + spacing, SIZE + spacing, spacing, 300);
  const polys = pts.map(([x, y], i) => make(x - spacing / 2, y - spacing / 2, i));
  fillPolys(ctx, polys, g.bgColor2);
}

const BACKGROUNDS = {
  solid,

  circle(ctx, g) {
    solid(ctx, g);
    fillPolys(ctx, [circle(C, C, SIZE / 2.1, 90)], g.bgColor2);
  },

  burst(ctx, g, _rng, t) {
    solid(ctx, g);
    const spin = t == null ? 0 : t * 0.3;
    fillPolys(ctx, [star(C, C, SIZE / 2.2, 0.85, 14, spin)], g.bgColor2);
  },

  dots(ctx, g, rng) {
    const size = rng.float(0.05, 0.2) * SIZE;
    scattered(ctx, g, rng, size * 1.3, (x, y) => circle(x, y, size / 2, 24));
  },

  stars(ctx, g, rng, t) {
    const size = rng.float(0.05, 0.2) * SIZE;
    const spin = rng.chance(0.5) ? 0 : 1;
    scattered(ctx, g, rng, size * 1.3, (x, y, i) =>
      star(x, y, size / 2, 0.5, 5, spin * (i * 1.3 + (t || 0) * 0.5) - Math.PI / 2));
  },

  hearts(ctx, g, rng) {
    const size = rng.float(0.06, 0.14) * SIZE;
    scattered(ctx, g, rng, size * 1.6, (x, y) => heart(x, y, size / 2));
  },

  gradient(ctx, g, rng) {
    const angle = rng.float(0, TAU);
    const dx = Math.cos(angle) * C;
    const dy = Math.sin(angle) * C;
    const grad = ctx.createLinearGradient(C - dx, C - dy, C + dx, C + dy);
    grad.addColorStop(0, g.bgColor);
    grad.addColorStop(1, shiftHue(g.bgColor2, rng.float(30, 120)));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
  },

  sunburst(ctx, g, rng, t) {
    solid(ctx, g);
    const rays = rng.int(10, 20) * 2;
    const spin = t == null ? 0 : t * 0.25;
    const wedges = [];

    for (let i = 0; i < rays; i += 2) {
      const a0 = spin + (i / rays) * TAU;
      const a1 = spin + ((i + 1) / rays) * TAU;
      wedges.push([[C, C], [C + Math.cos(a0) * SIZE, C + Math.sin(a0) * SIZE], [C + Math.cos(a1) * SIZE, C + Math.sin(a1) * SIZE]]);
    }

    fillPolys(ctx, wedges, g.bgColor2);
  },

  checker(ctx, g, rng) {
    solid(ctx, g);
    const n = rng.int(6, 12);
    const s = SIZE / n;
    const cells = [];

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if ((x + y) % 2 === 0) {
          cells.push([[x * s, y * s], [(x + 1) * s, y * s], [(x + 1) * s, (y + 1) * s], [x * s, (y + 1) * s]]);
        }
      }
    }

    fillPolys(ctx, cells, g.bgColor2);
  },

  stripes(ctx, g, rng, t) {
    solid(ctx, g);
    const n = rng.int(8, 16);
    const s = (SIZE * 2) / n;
    const shift = t == null ? 0 : (t * 30) % (s * 2);
    const bands = [];

    for (let i = -2; i < n + 2; i++) {
      const x = i * s + shift - SIZE / 2;
      if (i % 2 === 0) {
        bands.push([[x, 0], [x + s, 0], [x + s + SIZE, SIZE], [x + SIZE, SIZE]]);
      }
    }

    fillPolys(ctx, bands, g.bgColor2);
  },

  waves(ctx, g, rng, t) {
    solid(ctx, g);
    const n = rng.int(6, 10);
    const amp = rng.float(8, 20);
    const freq = rng.float(2, 5);
    const bands = [];

    for (let i = 0; i < n; i += 2) {
      const top = [];
      const bottom = [];
      for (let x = 0; x <= SIZE; x += 10) {
        const phase = (x / SIZE) * freq * TAU + (t || 0) * 1.5;
        top.push([x, (i / n) * SIZE + Math.sin(phase) * amp]);
        bottom.push([x, ((i + 1) / n) * SIZE + Math.sin(phase) * amp]);
      }
      bands.push([...top, ...bottom.reverse()]);
    }

    fillPolys(ctx, bands, g.bgColor2);
  },

  confetti(ctx, g, rng, t) {
    solid(ctx, g);
    const colors = [g.bgColor2, g.accent, g.accent2, shiftHue(g.bgColor2, 120), shiftHue(g.bgColor2, 240)];

    for (let i = 0; i < 120; i++) {
      const x = rng.float(0, SIZE);
      const y = (rng.float(0, SIZE) + (t || 0) * rng.float(20, 60)) % SIZE;
      const r = rng.float(0, TAU) + (t || 0) * rng.float(-2, 2);
      const w = rng.float(6, 14);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      ctx.fillStyle = rng.pick(colors);
      if (rng.chance(0.5)) {
        ctx.fillRect(-w / 2, -w / 4, w, w / 2);
      } else {
        trace(ctx, [circle(0, 0, w / 2.5, 10)], true);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  fish(ctx, g, rng) {
    const size = rng.float(40, 70);
    scattered(ctx, g, rng, size * 1.5, (x, y) => {
      const pts = [];
      for (let i = 0; i <= 16; i++) {
        const a = (i / 16) * TAU;
        pts.push([x + Math.cos(a) * size * 0.4, y + Math.sin(a) * size * 0.2]);
      }
      return [...pts, [x + size * 0.4, y], [x + size * 0.65, y - size * 0.2], [x + size * 0.65, y + size * 0.2], [x + size * 0.4, y]];
    });
  },

  paws(ctx, g, rng) {
    solid(ctx, g);
    const size = rng.float(22, 34);
    const polys = [];

    for (const [x, y] of poisson(rng, SIZE + 60, SIZE + 60, size * 3.2, 200)) {
      const a = rng.float(0, TAU);
      const cx = x - 30;
      const cy = y - 30;
      const rot = ([px, py]) => [cx + px * Math.cos(a) - py * Math.sin(a), cy + px * Math.sin(a) + py * Math.cos(a)];
      polys.push(circle(0, size * 0.35, size * 0.55, 20).map(rot));
      for (const [tx, ty] of [[-0.75, -0.45], [-0.28, -0.85], [0.28, -0.85], [0.75, -0.45]]) {
        polys.push(circle(tx * size, ty * size, size * 0.24, 14).map(rot));
      }
    }

    fillPolys(ctx, polys, g.bgColor2);
  },

  vaporwave(ctx, _g, _rng, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, SIZE * 0.62);
    sky.addColorStop(0, '#1a0536');
    sky.addColorStop(1, '#ff4fa0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const sun = ctx.createLinearGradient(0, SIZE * 0.15, 0, SIZE * 0.6);
    sun.addColorStop(0, '#ffe66d');
    sun.addColorStop(1, '#ff3f81');
    trace(ctx, [circle(C, SIZE * 0.45, SIZE * 0.28, 80)], true);
    ctx.fillStyle = sun;
    ctx.fill();

    ctx.fillStyle = '#ff4fa0';
    for (let i = 0; i < 6; i++) {
      const y = SIZE * 0.42 + i * 16;
      ctx.fillRect(0, y, SIZE, 2 + i * 1.6);
    }

    ctx.fillStyle = '#12002b';
    ctx.fillRect(0, SIZE * 0.62, SIZE, SIZE * 0.38);
    ctx.strokeStyle = '#ff2fd6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const horizon = SIZE * 0.62;
    const scroll = ((t || 0) * 0.6) % 1;
    for (let i = 0; i < 10; i++) {
      const y = horizon + (SIZE - horizon) * ((i + scroll) / 10) ** 2;
      ctx.moveTo(0, y);
      ctx.lineTo(SIZE, y);
    }
    for (let i = -10; i <= 10; i++) {
      ctx.moveTo(C + i * 12, horizon);
      ctx.lineTo(C + i * 90, SIZE);
    }
    ctx.stroke();
  },

  space(ctx, _g, rng, t) {
    ctx.fillStyle = '#070718';
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (const color of ['#3a0ca3', '#7209b7', '#0f4c75']) {
      const x = rng.float(0, SIZE);
      const y = rng.float(0, SIZE);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, rng.float(150, 300));
      grad.addColorStop(0, rgba(color, 0.55));
      grad.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    for (let i = 0; i < 160; i++) {
      const twinkle = t == null ? 1 : 0.5 + 0.5 * Math.sin(t * rng.float(1, 4) + i);
      ctx.fillStyle = rgba('#ffffff', rng.float(0.4, 1) * twinkle);
      ctx.fillRect(rng.float(0, SIZE), rng.float(0, SIZE), rng.float(1, 3), rng.float(1, 3));
    }

    const px = rng.float(60, 160);
    const py = rng.float(60, 160);
    fillPolys(ctx, [circle(px, py, 38, 40)], '#f4a261');
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-0.4);
    ctx.scale(1, 0.28);
    ctx.strokeStyle = '#e9c46a';
    ctx.lineWidth = 7;
    trace(ctx, [circle(0, 0, 64, 40)], true);
    ctx.stroke();
    ctx.restore();
  },

  spiral(ctx, g, rng, t) {
    solid(ctx, g);
    const arms = rng.int(6, 12);
    const spin = (t || 0) * 0.8;
    const polys = [];

    for (let arm = 0; arm < arms; arm++) {
      const pts = [[C, C]];
      const offset = (arm / arms) * TAU + spin;
      for (let i = 0; i <= 40; i++) {
        const r = (i / 40) * SIZE;
        pts.push([C + Math.cos(offset + i * 0.12) * r, C + Math.sin(offset + i * 0.12) * r]);
      }
      for (let i = 40; i >= 0; i--) {
        const r = (i / 40) * SIZE;
        const a = offset + i * 0.12 + TAU / arms / 2;
        pts.push([C + Math.cos(a) * r, C + Math.sin(a) * r]);
      }
      polys.push(pts);
    }

    fillPolys(ctx, polys, g.bgColor2);
  },

  halftone(ctx, g, rng) {
    solid(ctx, g);
    const step = rng.float(14, 22);
    const angle = rng.float(0, TAU);
    const dots = [];

    for (let y = -step; y < SIZE + step; y += step) {
      for (let x = -step; x < SIZE + step; x += step) {
        const along = ((x - C) * Math.cos(angle) + (y - C) * Math.sin(angle)) / SIZE + 0.5;
        const r = Math.max(0, Math.min(1, along)) * step * 0.55;
        if (r > 0.6) {
          dots.push(circle(x + ((y / step) % 2) * step * 0.5, y, r, 12));
        }
      }
    }

    fillPolys(ctx, dots, g.bgColor2);
  },

  notebook(ctx) {
    ctx.fillStyle = '#fbfaf5';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = '#9cc3e6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = 60; y < SIZE; y += 28) {
      ctx.moveTo(0, y);
      ctx.lineTo(SIZE, y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#ef8a8a';
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(70, SIZE);
    ctx.stroke();
  },

  grid(ctx, g, _rng, t) {
    ctx.fillStyle = g.bgColor;
    ctx.fillRect(0, 0, SIZE, SIZE);
    const glow = ctx.createRadialGradient(C, C, 0, C, C, SIZE * 0.6);
    glow.addColorStop(0, rgba(g.accent2 || '#ff2e88', 0.25));
    glow.addColorStop(1, rgba(g.accent2 || '#ff2e88', 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = rgba(g.ink, 0.22);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const step = 40;
    const shift = ((t || 0) * 20) % step;
    for (let i = 0; i <= SIZE / step + 1; i++) {
      ctx.moveTo(i * step - shift, 0);
      ctx.lineTo(i * step - shift, SIZE);
      ctx.moveTo(0, i * step - shift);
      ctx.lineTo(SIZE, i * step - shift);
    }
    ctx.stroke();
  },

  paper(ctx, g, rng) {
    ctx.fillStyle = g.bgColor;
    ctx.fillRect(0, 0, SIZE, SIZE);
    const speck = darken(g.bgColor, 0.12);

    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = rgba(rng.chance(0.5) ? speck : lighten(g.bgColor, 0.05), rng.float(0.1, 0.35));
      ctx.fillRect(rng.float(0, SIZE), rng.float(0, SIZE), rng.float(0.5, 2), rng.float(0.5, 2));
    }
  },

  chalkboard(ctx, g, rng) {
    ctx.fillStyle = g.bgColor;
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = rgba('#ffffff', rng.float(0.02, 0.06));
      ctx.lineWidth = rng.float(20, 60);
      ctx.beginPath();
      const y = rng.float(0, SIZE);
      ctx.moveTo(rng.float(-100, 100), y);
      ctx.quadraticCurveTo(C, y + rng.float(-80, 80), SIZE + rng.float(-100, 100), y + rng.float(-60, 60));
      ctx.stroke();
    }

    const ledge = SIZE - 18;
    ctx.fillStyle = '#6b4f2a';
    ctx.fillRect(0, ledge, SIZE, 18);
    ctx.fillStyle = '#86653a';
    ctx.fillRect(0, ledge, SIZE, 3);

    // a stick of chalk (sometimes with a worn-down stub) resting on the ledge,
    // off to one side so the cat's chin doesn't cover it
    const side = rng.sign();
    const sticks = rng.chance(0.4) ? [rng.float(48, 64), rng.float(18, 28)] : [rng.float(48, 64)];
    let x = side > 0 ? rng.float(390, 470) : rng.float(60, 140);

    for (const length of sticks) {
      const color = rng.pick(['#f4f1ea', '#f4f1ea', '#f7d8e0', '#fff3b0', '#cde7f0']);
      const h = 11;
      const y = ledge - h + 1;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      trace(ctx, [roundRect(x + 2, y + 3, length, h, h / 2)], true);
      ctx.fill();
      ctx.fillStyle = color;
      trace(ctx, [roundRect(x, y, length, h, h / 2)], true);
      ctx.fill();
      // a darker worn end and a highlight along the top
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      trace(ctx, [roundRect(x + length - 7, y, 7, h, h / 2)], true);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(x + h / 2, y + 2, length - h, 2);
      ctx.restore();

      x += length + rng.float(8, 16);
    }
  },

  blueprint(ctx, g) {
    ctx.fillStyle = g.bgColor;
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (const [step, alpha] of [[15, 0.12], [75, 0.3]]) {
      ctx.strokeStyle = rgba('#ffffff', alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= SIZE; i += step) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, SIZE);
        ctx.moveTo(0, i);
        ctx.lineTo(SIZE, i);
      }
      ctx.stroke();
    }
  },

  // Japanese wave scales: overlapping rows of concentric half circles
  seigaiha(ctx, g) {
    solid(ctx, g);
    const r = 34;
    ctx.lineWidth = 2.2;

    for (let row = -1; row * r * 0.5 < SIZE + r; row++) {
      const y = row * r * 0.5;
      const shift = row % 2 ? r : 0;

      for (let x = -r * 2 + shift; x < SIZE + r * 2; x += r * 2) {
        // fill each scale so the row in front hides the one behind
        trace(ctx, [circle(x, y, r, 40)], true);
        ctx.fillStyle = g.bgColor;
        ctx.fill();
        for (const k of [1, 0.72, 0.44]) {
          ctx.beginPath();
          ctx.arc(x, y, r * k, Math.PI, TAU);
          ctx.strokeStyle = g.bgColor2;
          ctx.stroke();
        }
      }
    }
  },

  // a leaded-glass window: jittered panes in jewel colors with dark lead between
  glasspanes(ctx, _g, rng) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, SIZE, SIZE);
    const jewels = ['#1f6fb2', '#2e86c1', '#16a085', '#27ae60', '#8e44ad', '#c0392b', '#f39c12', '#d4ac0d'];
    const n = 7;
    const cell = SIZE / n;
    const grid = [];

    for (let y = 0; y <= n; y++) {
      grid.push([]);
      for (let x = 0; x <= n; x++) {
        const edge = x === 0 || y === 0 || x === n || y === n;
        grid[y].push([x * cell + (edge ? 0 : rng.float(-cell * 0.3, cell * 0.3)), y * cell + (edge ? 0 : rng.float(-cell * 0.3, cell * 0.3))]);
      }
    }

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const quad4 = [grid[y][x], grid[y][x + 1], grid[y + 1][x + 1], grid[y + 1][x]];
        const color = rng.pick(jewels);
        const cx = (quad4[0][0] + quad4[2][0]) / 2;
        const cy = (quad4[0][1] + quad4[2][1]) / 2;
        const glow = ctx.createRadialGradient(cx - cell * 0.2, cy - cell * 0.2, 2, cx, cy, cell * 0.9);
        glow.addColorStop(0, lighten(color, 0.18));
        glow.addColorStop(1, darken(color, 0.12));
        trace(ctx, [inflate(quad4, -3.5)], true);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }
  },

  // comic-book speed lines bursting out from the middle
  speedlines(ctx, g, rng, t) {
    solid(ctx, g);
    const spin = t == null ? 0 : t * 0.2;
    const wedges = [];

    for (let i = 0; i < 70; i++) {
      const a = spin + rng.float(0, TAU);
      const spread = rng.float(0.006, 0.02);
      const inner = rng.float(150, 260);
      wedges.push([
        [C + Math.cos(a) * inner, C + Math.sin(a) * inner],
        [C + Math.cos(a - spread) * SIZE, C + Math.sin(a - spread) * SIZE],
        [C + Math.cos(a + spread) * SIZE, C + Math.sin(a + spread) * SIZE],
      ]);
    }

    fillPolys(ctx, wedges, g.bgColor2);
  },

  // woven cloth for embroidery: a fine crosshatch of slightly lighter and darker threads
  fabric(ctx, g) {
    solid(ctx, g);
    ctx.lineWidth = 1.2;

    for (const [angle, color] of [[0, lighten(g.bgColor, 0.05)], [Math.PI / 2, darken(g.bgColor, 0.05)]]) {
      ctx.save();
      ctx.translate(C, C);
      ctx.rotate(angle);
      ctx.strokeStyle = color;
      ctx.beginPath();
      for (let i = -SIZE; i < SIZE; i += 4) {
        ctx.moveTo(-SIZE, i);
        ctx.lineTo(SIZE, i);
      }
      ctx.stroke();
      ctx.restore();
    }
  },
};

export const BACKGROUND_NAMES = Object.keys(BACKGROUNDS);

export function drawBackground(ctx, g, rng, t = null) {
  const draw = BACKGROUNDS[g.background] || solid;
  ctx.save();
  draw(ctx, g, rng.fork(`bg:${g.background}`), t);
  ctx.restore();
}
