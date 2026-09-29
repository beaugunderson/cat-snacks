// Seeded randomness: every cat is reproducible from its seed string.

export function hash(str) {
  // cyrb53: a small, well-distributed 53-bit string hash
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed) {
    this.seed = String(seed);
    this.next = mulberry32(hash(this.seed) % 4294967296);
  }

  // an independent stream, so changing one trait doesn't reshuffle the others
  fork(label) {
    return new Rng(`${this.seed}:${label}`);
  }

  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  int(min, max) {
    return Math.floor(this.float(min, max + 1));
  }

  chance(p) {
    return this.next() < p;
  }

  sign() {
    return this.next() < 0.5 ? -1 : 1;
  }

  pick(list) {
    return list[Math.floor(this.next() * list.length)];
  }

  // weights: {name: weight} or [[value, weight], ...]
  weighted(weights) {
    const entries = Array.isArray(weights) ? weights : Object.entries(weights);
    const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0);
    let roll = this.next() * total;

    for (const [value, w] of entries) {
      roll -= Math.max(0, w);
      if (roll < 0) {
        return value;
      }
    }

    return entries[entries.length - 1][0];
  }

  shuffle(list) {
    const out = list.slice();

    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
  }

  gauss(mean = 0, sd = 1) {
    const u = 1 - this.next();
    const v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}

const SYLLABLES = ['mew', 'purr', 'tuna', 'mrr', 'blep', 'mlem', 'chirp', 'floof', 'beans',
  'zoom', 'kit', 'nap', 'loaf', 'snek', 'whisk', 'paw', 'fluff', 'nip', 'yowl', 'toe'];

export function randomSeed() {
  const pick = () => SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)];
  return `${pick()}-${pick()}-${Math.floor(Math.random() * 1000)}`;
}
