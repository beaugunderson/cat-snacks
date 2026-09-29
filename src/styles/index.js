import {blueprint, classic, gloss, kawaii, line, neon, papercut, rubberhose} from './flat.js';
import {clay, comic, embroidery, stainedglass, tattoo, ukiyoe} from './extra.js';
import {cubist, lowpoly, pixel, popart} from './raster.js';
import {chalk, doodle, watercolor, woodcut} from './sketchy.js';

// Each style either paints the scene onto the transparent cat layer
// (`draw(ctx, scene, genome, env)`) or produces the whole picture itself
// (`full(ctx, genome, env)`), usually by rendering other styles.

export const STYLES = {
  classic, kawaii, line, doodle, chalk, neon, pixel, lowpoly, woodcut, rubberhose,
  watercolor, blueprint, papercut, gloss, cubist, popart,
  ukiyoe, stainedglass, tattoo, clay, comic, embroidery,
};
