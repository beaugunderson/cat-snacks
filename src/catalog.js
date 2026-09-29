// Every choosable trait, in one place: the genome samples from these and the
// playground builds its menus from them. Tests assert each name has a
// matching implementation.

export const HEAD_SHAPES = ['ellipse', 'squircle', 'chonk', 'onigiri', 'triangular', 'pear', 'bean'];

export const EAR_SHAPES = ['pointy', 'curved', 'folded', 'tufted', 'big', 'rounded', 'tiny'];

export const EYE_KINDS = [
  'dot', 'round', 'anime', 'slit', 'sleepy', 'closed', 'happy', 'content', 'heart', 'star',
  'x', 'spiral', 'void', 'pie', 'button', 'glow',
];

export const BROWS = ['none', 'angry', 'worried', 'raised', 'unibrow'];

export const NOSE_KINDS = ['round', 'triangle', 'heart', 'button', 'wide', 'none'];

export const MOUTH_KINDS = ['split', 'w', 'smile', 'o', 'blep', 'meow', 'fangs', 'flat', 'cheshire', 'frown', 'wobbly'];

export const WHISKER_KINDS = ['none', 'straight', 'droopy', 'curly', 'long', 'messy', 'pads'];

export const PATTERNS = [
  'tabby', 'spot', 'chin', 'calico', 'tuxedo', 'point', 'chimera', 'tiger', 'leopard',
  'earTips', 'blaze', 'galaxy', 'freckles',
];

export const ACCESSORY_SLOTS = {
  hat: ['tophat', 'party', 'crown', 'beanie', 'wizard', 'halo', 'horns', 'unicorn', 'propeller', 'flowers', 'cowboy', 'antennae'],
  ear: ['bow', 'earring', 'headphones'],
  eyes: ['glasses', 'roundGlasses', 'shades', 'monocle', 'eyepatch', 'lasers', 'visor', 'anaglyph'],
  face: ['mustache', 'bandaid', 'thirdEye', 'fish', 'bubblegum', 'tears'],
  neck: ['bowtie', 'collar', 'bandana'],
  float: ['sparkles', 'hearts', 'zzz', 'speech', 'sweat', 'anger', 'notes', 'stink'],
};

export const ACCESSORIES = Object.values(ACCESSORY_SLOTS).flat();

// accessories that only show up as chaos rises
export const FERAL_ACCESSORIES = ['lasers', 'thirdEye', 'horns', 'anger', 'stink', 'visor', 'anaglyph'];

export const BACKGROUNDS = [
  'solid', 'circle', 'burst', 'dots', 'stars', 'gradient', 'sunburst', 'checker', 'stripes',
  'confetti', 'fish', 'paws', 'vaporwave', 'space', 'hearts', 'waves', 'spiral', 'halftone',
  'notebook', 'grid', 'paper', 'chalkboard', 'blueprint',
];

// backgrounds a style would pick on its own; the rest only appear via overrides or chaos
export const EVERYDAY_BACKGROUNDS = ['solid', 'circle', 'burst', 'dots', 'stars', 'gradient', 'checker', 'stripes', 'fish', 'paws', 'hearts', 'waves'];
export const FERAL_BACKGROUNDS = ['sunburst', 'confetti', 'vaporwave', 'space', 'spiral', 'halftone'];

// applied to the transparent cat layer before it is composited onto the background
export const LAYER_EFFECTS = ['sticker', 'shadow', 'glow'];

export const EFFECT_GROUPS = {
  transform: ['dither', 'riso', 'thermal', 'duotone'],
  overlay: ['vignette', 'crt', 'glitch', 'rgbsplit'],
};

export const EFFECTS = [...LAYER_EFFECTS, ...Object.values(EFFECT_GROUPS).flat()];

export const STYLES = [
  'classic', 'kawaii', 'line', 'doodle', 'chalk', 'neon', 'pixel', 'lowpoly', 'woodcut',
  'rubberhose', 'watercolor', 'blueprint', 'papercut', 'gloss', 'cubist', 'popart',
];
