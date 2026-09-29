import {EFFECT_GROUPS, FERAL_ACCESSORIES} from './catalog.js';

// Every cat gets a name, and a rarity from how unusual its traits are.

const TITLES = [
  'Sir', 'Lady', 'Captain', 'Dr.', 'Professor', 'Baron', 'Duchess', 'Little', 'Big', 'Lord', 'Madame',
  'Agent', 'DJ', 'Chef', 'Saint', 'Count', 'Admiral', 'Princess', 'Mayor', 'Detective',
];

const FIRST = [
  'Biscuit', 'Mochi', 'Noodle', 'Pickles', 'Waffles', 'Beans', 'Tofu', 'Pudding', 'Nugget', 'Clementine',
  'Pancake', 'Muffin', 'Olive', 'Pistachio', 'Dumpling', 'Ziggy', 'Marzipan', 'Crouton', 'Toast', 'Gnocchi',
  'Pepper', 'Mango', 'Sprout', 'Bagel', 'Ravioli', 'Taco', 'Wasabi', 'Sardine', 'Crumpet', 'Kiwi',
];

const LAST = [
  'Mlemsworth', 'von Floof', 'McWhiskers', 'Purrington', 'Fluffbottom', 'de Loaf', 'Snugglesby',
  'Beansworth', "O'Pounce", 'Zoomington', 'Chonkerton', 'Blepson', 'Toebean', 'Napsalot', 'Scratchley',
];

const SUFFIXES = ['III', 'Esq.', 'the Magnificent', 'of the Couch', 'Jr.', 'the Unbothered', 'PhD', 'the Loaf'];

export function catName(rng) {
  const parts = [];

  if (rng.chance(0.55)) parts.push(rng.pick(TITLES));
  parts.push(rng.pick(FIRST));
  if (rng.chance(0.6)) parts.push(rng.pick(LAST));
  if (rng.chance(0.2)) parts.push(rng.pick(SUFFIXES));

  return parts.join(' ');
}

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const ODD_EYES = new Set(['heart', 'star', 'x', 'spiral', 'void', 'button', 'glow']);

// rarity counts the strange things about a cat: odd eyes, feral accessories,
// effects, a second fur pattern, mismatched eyes
export function rarity(g) {
  let score = 0;

  if (ODD_EYES.has(g.eyeKind) || ODD_EYES.has(g.eyeKindR)) score += 1;
  if (g.eyeKind !== g.eyeKindR) score += 1;
  if (g.eyeColor !== g.eyeColorR) score += 1;
  if (g.patterns.includes('galaxy') || g.patterns.includes('chimera')) score += 1;
  if (g.patterns.length > 1) score += 1;
  score += g.accessories.filter(a => FERAL_ACCESSORIES.includes(a)).length;
  score += g.accessories.length >= 3 ? 1 : 0;
  score += g.effects.filter(e => EFFECT_GROUPS.transform.includes(e)).length;
  if (['cheshire', 'fangs'].includes(g.mouthKind)) score += 1;

  return RARITIES[Math.min(RARITIES.length - 1, Math.floor(score / 1.5))];
}
