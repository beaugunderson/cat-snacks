#!/usr/bin/env node
import {writeFileSync} from 'node:fs';
import {parseArgs} from 'node:util';
import {createCanvas} from 'canvas';
import {STYLES, createGenome, randomSeed, renderCat, renderGrid, setCanvasFactory} from '../src/index.js';

setCanvasFactory(createCanvas);

const {values} = parseArgs({
  options: {
    seed: {type: 'string'},
    style: {type: 'string'},
    chaos: {type: 'string'},
    size: {type: 'string', default: '1024'},
    grid: {type: 'string'},
    gallery: {type: 'boolean'},
    out: {type: 'string', short: 'o', default: 'cat.png'},
    set: {type: 'string', multiple: true},
    json: {type: 'boolean'},
    help: {type: 'boolean', short: 'h'},
  },
});

if (values.help) {
  console.log(`usage: cat-snacks [options]

  --seed <s>       seed string (random if omitted)
  --style <name>   pin the style (classic, kawaii, neon, pixel, ...)
  --chaos <0-1>    how feral to get (default 0.6)
  --set key=value  pin any genome trait; lists are comma-separated
                   (e.g. --set accessories=crown,shades --set effects=glitch)
  --size <px>      output size (default 1024)
  --grid <n>       an n x n grid of cats instead of one
  --gallery        the same cat drawn in every style, labeled
  --json           print the genome
  -o, --out <file> output png (default cat.png)`);
  process.exit(0);
}

const LISTS = new Set(['accessories', 'effects', 'patterns']);

function parseValue(key, raw) {
  if (LISTS.has(key)) return raw ? raw.split(',') : [];
  if (raw === 'true' || raw === 'false') return raw === 'true';
  if (raw !== '' && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

const overrides = {};

for (const pair of values.set || []) {
  const [key, ...rest] = pair.split('=');
  overrides[key] = parseValue(key, rest.join('='));
}

if (values.style) overrides.style = values.style;
if (values.chaos) overrides.chaos = Number(values.chaos);

const size = Number(values.size);
const seed = values.seed || randomSeed();
let canvas;

if (values.gallery) {
  const n = Math.ceil(Math.sqrt(STYLES.length));
  const cell = Math.floor(size / n);
  canvas = createCanvas(cell * n, cell * n);
  const ctx = canvas.getContext('2d');

  STYLES.forEach((style, i) => {
    const x = (i % n) * cell;
    const y = Math.floor(i / n) * cell;
    ctx.drawImage(renderCat(createGenome(seed, {...overrides, style}), {size: cell}), x, y);
    ctx.font = `bold ${Math.round(cell / 14)}px sans-serif`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#111111';
    ctx.strokeText(style, x + 10, y + cell / 12);
    ctx.fillText(style, x + 10, y + cell / 12);
  });
} else if (values.grid) {
  const n = Number(values.grid);
  const genomes = Array.from({length: n * n}, (_, i) => createGenome(`${seed}/${i}`, overrides));
  canvas = renderGrid(genomes, {size});
} else {
  const genome = createGenome(seed, overrides);
  if (values.json) console.log(JSON.stringify(genome, null, 2));
  canvas = renderCat(genome, {size});
}

writeFileSync(values.out, canvas.toBuffer('image/png'));
console.log(`${values.out}  seed=${seed}`);
