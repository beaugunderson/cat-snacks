import {hsl, mix} from '../color.js';
import * as P from '../palettes.js';

// How often each style is picked and how it bends the genome toward its look.
// Tweaks run before user overrides, so pinned traits always win. `paperFur`
// marks styles that draw fur as hatching on paper rather than a solid fill,
// so face lines stay dark even on a dark cat. `medium` marks styles that are
// already a look of their own (a drawing medium or a collage): stacking a
// whole-picture color transform on top of them turns them to mud, so they
// never roll one.

const pastel = r => hsl(r.float(0, 360), r.float(0.45, 0.75), r.float(0.8, 0.88));

export const STYLE_META = {
  classic: {
    label: 'Classic',
    weight: c => 4 - 2.5 * c,
  },

  kawaii: {
    label: 'Kawaii',
    weight: () => 1.5,
    tweak: (g, r) => {
      const headW = g.headW * 0.95;
      const eye = r.weighted({anime: 5, round: 2, happy: 1, content: 1, heart: g.chaos, star: g.chaos});

      return {
        headShape: r.pick(['ellipse', 'chonk', 'squircle']),
        headN: r.float(2, 2.4),
        headW,
        headH: headW * r.float(0.74, 0.86),
        jowl: r.float(0, 0.12),
        earShape: r.pick(['curved', 'rounded', 'pointy', 'folded']),
        eyeKind: eye,
        eyeKindR: r.chance(0.15) ? 'happy' : eye,
        eyeSize: r.float(13, 16),
        eyeSpacing: r.float(0.42, 0.5),
        eyeY: -r.float(0.0, 0.12),
        cheeks: true,
        brows: 'none',
        derp: false,
        mouthKind: r.pick(['w', 'blep', 'o', 'w', 'smile']),
        noseKind: r.pick(['button', 'heart', 'round']),
        noseY: r.float(0.08, 0.16),
        whiskerKind: r.pick(['none', 'pads', 'straight']),
        fur: r.chance(0.65) ? pastel(r) : r.pick(['#ffffff', '#f2e6d0', '#edcbaa', '#dacae0']),
        ink: r.pick(['#4a3440', '#3b2d4f', '#5a3a2e']),
        earInner: r.pick(P.EAR_INNER),
        noseColor: r.pick(['#f59bb0', '#e4b3bd', '#d66772']),
        bgColor: pastel(r),
        background: r.pick(['solid', 'dots', 'hearts', 'stars', 'circle', 'checker']),
        accessories: r.chance(0.4) && !g.accessories.includes('sparkles') ? [...g.accessories, 'sparkles'] : g.accessories,
      };
    },
  },

  line: {
    label: 'Line art',
    medium: true,
    weight: () => 1,
    paperFur: true,
    tweak: (_g, r) => ({
      ink: r.chance(0.6) ? P.INK : r.pick(['#1d3557', '#9b2226', '#2d6a4f', '#5a189a']),
      bgColor: r.pick([P.PAPER, '#ffffff', '#fdf6e3', '#f1faee']),
      background: r.pick(['paper', 'solid', 'solid', 'dots']),
    }),
  },

  doodle: {
    label: 'Doodle',
    medium: true,
    weight: () => 1,
    paperFur: true,
    tweak: (_g, r) => ({
      ink: r.pick(['#1f2a6b', P.INK, '#2b2d42']),
      bgColor: '#fbfaf5',
      background: r.chance(0.6) ? 'notebook' : 'paper',
    }),
  },

  chalk: {
    label: 'Chalkboard',
    medium: true,
    weight: () => 0.8,
    tweak: (_g, r) => ({
      ink: '#f4f1ea',
      bgColor: r.pick(['#2f3b33', '#26302b', '#1f2a2e']),
      background: 'chalkboard',
      fur: r.pick(['#f4f1ea', '#f7d8e0', '#fff3b0', '#cde7f0', '#d8f3dc']),
    }),
  },

  neon: {
    label: 'Neon',
    medium: true,
    weight: () => 1,
    tweak: (_g, r) => {
      const [a, b, c] = r.shuffle(P.NEON);
      return {
        fur: a,
        ink: b,
        eyeColor: c,
        eyeColorR: c,
        noseColor: b,
        earInner: c,
        accent: c,
        accent2: a,
        bgColor: r.pick(['#0b0418', '#07051a', '#10021c', '#020a14']),
        background: r.pick(['grid', 'grid', 'space', 'solid']),
      };
    },
  },

  pixel: {
    label: 'Pixel art',
    medium: true,
    weight: () => 1,
  },

  lowpoly: {
    label: 'Low poly',
    weight: () => 1,
    tweak: (g, r) => ({
      headShape: r.pick([g.headShape, 'onigiri', 'triangular']),
      earShape: r.pick(['pointy', 'tufted', 'big']),
    }),
  },

  woodcut: {
    label: 'Woodcut',
    medium: true,
    weight: () => 0.9,
    paperFur: true,
    tweak: (_g, r) => ({
      ink: r.chance(0.7) ? '#15110f' : r.pick(['#1d3557', '#7a1f1f', '#23395b']),
      bgColor: r.pick([P.PAPER, '#efe6d2', '#f3e9d7']),
      background: 'paper',
    }),
  },

  rubberhose: {
    label: 'Rubber hose',
    weight: () => 0.9,
    tweak: (g, r) => ({
      fur: r.pick(['#1d1a1f', '#1d1a1f', '#f4efe4']),
      fur2: '#f4efe4',
      fur3: '#f4efe4',
      patterns: r.chance(0.7) ? ['tuxedo'] : [],
      ink: '#111111',
      eyeKind: 'pie',
      eyeKindR: 'pie',
      eyeSize: r.float(14, 17),
      eyeSpacing: r.float(0.2, 0.26),
      eyeY: -r.float(0.2, 0.3),
      brows: 'none',
      derp: false,
      noseKind: 'round',
      noseColor: '#111111',
      mouthKind: r.weighted({smile: 1, meow: 1, w: 1, cheshire: g.chaos}),
      whiskerKind: r.pick(['straight', 'droopy', 'long']),
      earInner: '#f4efe4',
      bgColor: r.pick(['#efe3c8', '#e8dcc0', '#f1e7d0']),
      background: r.pick(['solid', 'sunburst', 'circle']),
      effects: ['vignette'],
    }),
  },

  watercolor: {
    label: 'Watercolor',
    medium: true,
    weight: () => 1,
    tweak: (_g, r) => ({
      ink: r.pick(['#3b2f2f', '#2b2d42', '#4a3b33']),
      bgColor: r.pick([P.PAPER, '#fbf7ee', '#f5efe6']),
      background: 'paper',
    }),
  },

  blueprint: {
    label: 'Blueprint',
    medium: true,
    weight: () => 0.6,
    tweak: (_g, r) => ({
      ink: '#e8f1ff',
      bgColor: r.pick(['#1b4f9c', '#174a8b', '#0f3d7a']),
      background: 'blueprint',
      effects: [],
    }),
  },

  papercut: {
    label: 'Paper cutout',
    weight: () => 1,
    tweak: (_g, r) => ({
      bgColor: pastel(r),
      background: r.pick(['solid', 'circle', 'burst', 'waves']),
    }),
  },

  gloss: {
    label: 'Glossy',
    weight: () => 1,
  },

  cubist: {
    label: 'Cubist',
    medium: true,
    weight: c => 0.2 + 0.8 * c,
    tweak: (g, r) => ({
      fur: mix(g.fur, r.pick(['#c1440e', '#3d5a80', '#e0a458', '#6b705c']), 0.35),
      background: r.pick(['solid', 'stripes', 'checker']),
    }),
  },

  popart: {
    label: 'Pop art',
    medium: true,
    weight: c => 0.2 + 0.8 * c,
    tweak: () => ({background: 'solid'}),
  },

  ukiyoe: {
    label: 'Ukiyo-e',
    medium: true,
    weight: () => 0.9,
    tweak: (_g, r) => ({
      fur: r.pick(['#d9a441', '#f2e8cf', '#2b4c7e', '#8c6a4f', '#e4d3b0', '#3a3a3a', '#c9784b']),
      ink: '#1b1b1b',
      noseColor: '#c73e1d',
      earInner: '#e8a598',
      accent: '#c73e1d',
      accent2: '#2b4c7e',
      bgColor: '#efe4c8',
      bgColor2: r.pick(['#2b4c7e', '#8fa9b8', '#c73e1d']),
      background: r.chance(0.7) ? 'seigaiha' : 'paper',
    }),
  },

  stainedglass: {
    label: 'Stained glass',
    medium: true,
    weight: () => 0.8,
    tweak: (_g, r) => {
      const jewel = () => r.pick(['#1f6fb2', '#c0392b', '#27ae60', '#8e44ad', '#f39c12', '#16a085', '#d35400']);
      const eye = r.pick(['#f1c40f', '#1abc9c', '#e74c3c', '#5dade2']);
      return {
        fur: jewel(),
        eyeColor: eye,
        eyeColorR: eye,
        noseColor: r.pick(['#e74c3c', '#f5b7b1']),
        earInner: jewel(),
        accent: jewel(),
        accent2: jewel(),
        background: 'glasspanes',
      };
    },
  },

  tattoo: {
    label: 'Tattoo flash',
    medium: true,
    weight: () => 0.8,
    tweak: (_g, r) => ({
      fur: r.pick(['#f6be00', '#c8102e', '#00843d', '#f3e6c8', '#e8a87c', '#1b1b1b']),
      eyeColor: r.pick(['#00843d', '#c8102e', '#3a6ea5']),
      noseColor: '#c8102e',
      accent: '#c8102e',
      accent2: '#00843d',
      ink: '#111111',
      bgColor: '#f3e6c8',
      background: 'paper',
    }),
  },

  clay: {
    label: 'Claymation',
    weight: () => 1,
    tweak: (_g, r) => ({
      whiskerKind: r.pick(['none', 'straight', 'droopy', 'pads']),
      bgColor: r.pick(['#f2d7b6', '#cfe3e8', '#e9d5f0', '#dfe9c9']),
      background: r.pick(['solid', 'circle', 'dots']),
    }),
  },

  comic: {
    label: 'Comic book',
    medium: true,
    weight: () => 1,
    tweak: (_g, r) => ({
      ink: '#111111',
      bgColor: r.pick(['#ffe66d', '#4cc9f0', '#ff6b6b', '#b8f2e6']),
      bgColor2: '#ffffff',
      background: r.chance(0.7) ? 'speedlines' : 'halftone',
    }),
  },

  embroidery: {
    label: 'Embroidery',
    medium: true,
    weight: () => 0.8,
    tweak: (_g, r) => ({
      bgColor: r.pick(['#f4efe6', '#e8e0cf', '#dfe8e6', '#f2e3e3']),
      background: 'fabric',
      whiskerKind: r.pick(['straight', 'droopy', 'none']),
    }),
  },
};
