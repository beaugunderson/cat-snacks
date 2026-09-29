import {darken, lighten, rgba} from './color.js';
import {TAU, roundRect, star} from './geom.js';
import {RARITIES, rarity} from './names.js';
import {STYLE_META} from './styles/meta.js';
import {FONT, trace} from './styles/paint.js';

// Frames take the finished picture and set it inside something: a polaroid,
// a trading card, a postage stamp, a museum frame. They run after every
// effect, so a glitch never mangles the lettering, and transparent renders
// skip them.

const HAND = '"Marker Felt", "Bradley Hand", "Comic Sans MS", cursive';

function canvasFor(picture, env) {
  const out = env.createCanvas(picture.width, picture.height);
  const ctx = out.getContext('2d');
  ctx.scale(picture.width / 600, picture.height / 600);
  return {out, ctx};
}

// draw text no wider than maxWidth, shrinking the font if needed
function fitText(ctx, text, x, y, maxWidth, size, font, weight = '') {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${font}`.trim();
    s -= 1;
  } while (ctx.measureText(text).width > maxWidth && s > 8);
  ctx.fillText(text, x, y);
}

function speckle(ctx, rng, color, count, size = 2) {
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = rgba(color, rng.float(0.08, 0.3));
    ctx.fillRect(rng.float(0, 600), rng.float(0, 600), rng.float(0.5, size), rng.float(0.5, size));
  }
}

const RARITY_COLORS = {
  common: '#9aa0a6',
  uncommon: '#2e9e5b',
  rare: '#2f6fd6',
  epic: '#8e44ad',
  legendary: '#d4a017',
};

const FLAVOR = [
  'Has never once been on time.',
  'Knocks things off tables professionally.',
  'Sits in boxes that are clearly too small.',
  'Will scream at 4am for no reason.',
  'Believes the red dot is real.',
  'Has opinions about the new couch.',
  'Refuses the expensive bed. Loves the box.',
  'Allergic to closed doors.',
  'Loaf form: perfected.',
  'Fluent in slow blinks.',
];

export const FRAMES = {
  none: picture => picture,

  polaroid(picture, g, env) {
    const {out, ctx} = canvasFor(picture, env);
    const rng = env.rng;

    ctx.fillStyle = '#c19a6b';
    ctx.fillRect(0, 0, 600, 600);
    speckle(ctx, rng, '#5a3b1e', 1400, 3);

    ctx.save();
    ctx.translate(300, 300);
    ctx.rotate(rng.float(-0.06, 0.06));
    ctx.translate(-300, -300);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fbfaf6';
    ctx.fillRect(84, 40, 432, 520);
    ctx.shadowColor = 'transparent';
    ctx.drawImage(picture, 108, 64, 384, 384);
    ctx.fillStyle = '#2b2b3a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitText(ctx, g.name, 300, 505, 380, 32, HAND);

    // a strip of tape holding it up
    ctx.translate(300, 40);
    ctx.rotate(rng.float(-0.15, 0.15));
    ctx.fillStyle = 'rgba(255, 250, 220, 0.6)';
    ctx.fillRect(-55, -16, 110, 32);
    ctx.restore();

    return out;
  },

  card(picture, g, env) {
    const {out, ctx} = canvasFor(picture, env);
    const rng = env.rng;
    const tier = rarity(g);
    const color = RARITY_COLORS[tier];

    ctx.fillStyle = '#1b1b24';
    ctx.fillRect(0, 0, 600, 600);

    trace(ctx, [roundRect(20, 12, 560, 576, 24)], true);
    if (tier === 'legendary') {
      const gold = ctx.createLinearGradient(20, 12, 580, 588);
      gold.addColorStop(0, '#fff3b0');
      gold.addColorStop(0.5, '#d4a017');
      gold.addColorStop(1, '#8a6a1c');
      ctx.fillStyle = gold;
    } else {
      ctx.fillStyle = color;
    }
    ctx.fill();

    trace(ctx, [roundRect(36, 28, 528, 544, 14)], true);
    ctx.fillStyle = '#f8f2e3';
    ctx.fill();

    // name and rarity stars
    ctx.fillStyle = '#1b1b24';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    fitText(ctx, g.name, 52, 58, 360, 26, FONT, 'bold');
    const stars = RARITIES.indexOf(tier) + 1;
    for (let i = 0; i < 5; i++) {
      trace(ctx, [star(545 - i * 24, 58, 10, 0.45, 5)], true);
      ctx.fillStyle = 4 - i < stars ? darken(color, 0.1) : '#d9d2c3';
      ctx.fill();
    }

    // the art window, cropped from the middle of the square picture
    const artH = 380;
    const cropH = (picture.height * artH) / 512;
    ctx.drawImage(picture, 0, (picture.height - cropH) / 2, picture.width, cropH, 44, 84, 512, artH);
    if (tier === 'legendary' || tier === 'epic') {
      const holo = ctx.createLinearGradient(44, 84, 556, 464);
      for (const [stop, c] of [[0, '#ff6ec7'], [0.33, '#7afcff'], [0.66, '#feff9c'], [1, '#ff6ec7']]) {
        holo.addColorStop(stop, rgba(c, 0.14));
      }
      ctx.fillStyle = holo;
      ctx.fillRect(44, 84, 512, artH);
    }
    ctx.strokeStyle = '#1b1b24';
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 84, 512, artH);

    // type line, stats and flavor text
    ctx.fillStyle = '#1b1b24';
    ctx.font = `italic 16px ${FONT}`;
    ctx.fillText(`${STYLE_META[g.style]?.label ?? g.style} cat · ${tier}`, 52, 485);
    const stats = ['NAP', 'ZOOM', 'BLEP', 'SASS', 'LOAF', 'CHONK'];
    const picks = rng.shuffle(stats).slice(0, 3).map(s => `${s} ${rng.int(12, 99)}`);
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillText(picks.join('   '), 52, 515);
    ctx.font = `italic 15px ${FONT}`;
    ctx.fillStyle = '#5a5248';
    fitText(ctx, rng.pick(FLAVOR), 52, 546, 496, 15, FONT, 'italic');

    return out;
  },

  stamp(picture, g, env) {
    const {out, ctx} = canvasFor(picture, env);
    const rng = env.rng;
    const kraft = '#d9b98a';

    ctx.fillStyle = kraft;
    ctx.fillRect(0, 0, 600, 600);
    speckle(ctx, rng, '#7a5a30', 900);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#fbfaf6';
    ctx.fillRect(110, 64, 380, 472);
    ctx.restore();

    // perforations: bites of envelope taken out along every edge
    ctx.fillStyle = kraft;
    for (let x = 110; x <= 490; x += 23.75) {
      for (const y of [64, 536]) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, TAU);
        ctx.fill();
      }
    }
    for (let y = 64; y <= 536; y += 23.6) {
      for (const x of [110, 490]) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, TAU);
        ctx.fill();
      }
    }

    ctx.drawImage(picture, 136, 90, 328, 328);
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(136, 90, 328, 328);

    ctx.fillStyle = '#2b2b3a';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText('CAT POST', 138, 450);
    fitText(ctx, g.name, 138, 490, 250, 17, FONT, 'italic');
    ctx.textAlign = 'right';
    ctx.font = `bold 46px ${FONT}`;
    ctx.fillText(`${rng.int(3, 99)}¢`, 464, 470);

    // postmark over the corner
    const [px, py] = [rng.float(420, 470), rng.float(110, 150)];
    ctx.save();
    ctx.strokeStyle = rgba('#2b3a67', 0.65);
    ctx.fillStyle = rgba('#2b3a67', 0.65);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, 52, 0, TAU);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText('MEOW', px, py - 8);
    ctx.font = `12px ${FONT}`;
    ctx.fillText('SNACK DEPT', px, py + 12);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      for (let x = px + 60; x < 610; x += 4) {
        const y = py - 24 + i * 16 + Math.sin(x * 0.12) * 5;
        if (x === px + 60) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    return out;
  },

  museum(picture, g, env) {
    const {out, ctx} = canvasFor(picture, env);
    const rng = env.rng;
    const wall = rng.pick(['#5b2a2a', '#2f3e46', '#3d3b5c', '#4a5a3a']);

    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, 600, 600);
    const light = ctx.createRadialGradient(300, 0, 20, 300, 180, 420);
    light.addColorStop(0, 'rgba(255, 240, 200, 0.35)');
    light.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, 600, 600);

    // the gilt frame: four bevels lit from the top left
    const [x0, y0, x1, y1, t] = [96, 36, 504, 444, 44];
    const bevels = [
      [[x0, y0], [x1, y0], [x1 - t, y0 + t], [x0 + t, y0 + t], '#f1d77a'],
      [[x1, y0], [x1, y1], [x1 - t, y1 - t], [x1 - t, y0 + t], '#b8860b'],
      [[x1, y1], [x0, y1], [x0 + t, y1 - t], [x1 - t, y1 - t], '#8a6a1c'],
      [[x0, y1], [x0, y0], [x0 + t, y0 + t], [x0 + t, y1 - t], '#d4a017'],
    ];
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#8a6a1c';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
    for (const [a, b, c, d, color] of bevels) {
      trace(ctx, [[a, b, c, d]], true);
      ctx.fillStyle = color;
      ctx.fill();
    }
    // beading along the middle of the frame
    ctx.fillStyle = lighten('#d4a017', 0.2);
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      for (const [bx, by] of [[x0 + t / 2 + u * (x1 - x0 - t), y0 + t / 2], [x0 + t / 2 + u * (x1 - x0 - t), y1 - t / 2], [x0 + t / 2, y0 + t / 2 + u * (y1 - y0 - t)], [x1 - t / 2, y0 + t / 2 + u * (y1 - y0 - t)]]) {
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, TAU);
        ctx.fill();
      }
    }

    ctx.drawImage(picture, x0 + t, y0 + t, x1 - x0 - t * 2, y1 - y0 - t * 2);
    ctx.strokeStyle = '#3b2a0a';
    ctx.lineWidth = 3;
    ctx.strokeRect(x0 + t, y0 + t, x1 - x0 - t * 2, y1 - y0 - t * 2);

    // the placard
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(210, 478, 180, 70);
    ctx.strokeStyle = '#b8a47a';
    ctx.strokeRect(210, 478, 180, 70);
    ctx.fillStyle = '#2b2b2b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitText(ctx, g.name, 300, 500, 164, 15, FONT, 'bold');
    ctx.font = `italic 12px ${FONT}`;
    ctx.fillText(`${STYLE_META[g.style]?.label ?? g.style}`, 300, 520);
    ctx.fillText('Collection of the Loaf', 300, 536);

    return out;
  },
};

export const FRAME_NAMES = Object.keys(FRAMES);
