import {luminance} from '../color.js';
import {bounds, deform} from '../geom.js';
import {drawLayers, outsideOthers, paintText, trace} from './paint.js';
import {hatch, roughStroke} from './marks.js';

// Styles that imitate a hand and a medium: marker, chalk, carved wood, paint.

function sketchPainter(g, env, {ink, strokeWidth, passes, amount, fillSpacing, fillWidth, fillAlpha, chalky}) {
  const rng = env.rng;
  let angleFlip = 1;

  // chalk: faint dusty passes for the fur, fewer firm bright ones for the
  // silhouette and face so they stand out from the hatching
  const outline = (c, polys, closed, color, width, firm = false) => {
    if (chalky) {
      roughStroke(c, polys, closed, firm
        ? {rng, color, width: width * 0.7, amount: amount * 1.1, passes: 3, alpha: 0.85}
        : {rng, color, width: width * 0.45, amount: amount * 1.4, passes: 5, alpha: 0.45});
    } else {
      roughStroke(c, polys, closed, {rng, color, width, amount, passes});
    }
  };

  const scribble = (c, polys, color, spacing = fillSpacing) => {
    angleFlip = -angleFlip;
    hatch(c, polys, {
      angle: angleFlip * rng.float(0.5, 0.8), spacing, color, width: fillWidth, rng,
      wobble: spacing * 0.15, alpha: fillAlpha,
    });
  };

  return {
    body(c, body) {
      for (const s of body) {
        trace(c, s.polys, true);
        c.fillStyle = g.bgColor;
        c.fill();
      }
      body.forEach((s, i) => outsideOthers(c, body, i, () => scribble(c, s.polys, s.fill), {laterOnly: true}));
      body.forEach((s, i) => outsideOthers(c, body, i, () => outline(c, s.polys, true, ink, strokeWidth, true)));
    },
    shape(c, s, layer) {
      if (s.role === 'text') {
        paintText(c, s, ink);
        return;
      }

      if (s.closed && s.fill) {
        const b = bounds(s.polys);
        const small = Math.max(b.w, b.h) < 30;
        const color = chalky && luminance(s.fill) < 0.1 ? ink : s.fill;

        if (small) {
          trace(c, s.polys, true);
          c.save();
          c.globalAlpha *= (s.alpha ?? 1) * (chalky ? 0.85 : 1);
          c.fillStyle = color;
          c.fill();
          c.restore();
        } else {
          scribble(c, s.polys, color, layer === 'markings' ? fillSpacing * 0.8 : fillSpacing);
        }
      }

      if (s.stroke && s.width > 0) {
        outline(c, s.polys, s.closed, luminance(s.stroke) < 0.1 ? ink : s.stroke, Math.min(s.width, strokeWidth * 1.2), layer === 'face');
      } else if (s.closed && layer !== 'markings' && s.role !== 'shine' && s.role !== 'cheek' && !s.alpha) {
        outline(c, s.polys, true, ink, strokeWidth * 0.6, layer === 'face');
      }
    },
  };
}

export const doodle = {
  draw(ctx, scene, g, env) {
    drawLayers(ctx, scene, sketchPainter(g, env, {
      ink: g.ink, strokeWidth: 3.5, passes: 2, amount: 1.4, fillSpacing: 7, fillWidth: 2.4, fillAlpha: 0.9,
    }));
  },
};

export const chalk = {
  draw(ctx, scene, g, env) {
    drawLayers(ctx, scene, sketchPainter(g, env, {
      ink: g.ink, strokeWidth: 6, passes: 5, amount: 1.8, fillSpacing: 10, fillWidth: 2, fillAlpha: 0.35, chalky: true,
    }));
  },
};

// light areas stay paper; darker fills get denser, crossed hatching
export const woodcut = {
  draw(ctx, scene, g, env) {
    const ink = g.ink;
    const paper = g.bgColor;
    const rng = env.rng;

    const cut = (c, s, angle) => {
      const l = luminance(s.fill);
      if (l > 0.75) {
        return;
      }
      const spacing = 3 + l * 14;
      hatch(c, s.polys, {angle, spacing, color: ink, width: 1.8, rng, wobble: 0.7});
      if (l < 0.3) {
        hatch(c, s.polys, {angle: angle + 1.4, spacing: spacing * 1.2, color: ink, width: 1.6, rng, wobble: 0.7});
      }
    };

    drawLayers(ctx, scene, {
      body(c, body) {
        for (const s of body) {
          trace(c, s.polys, true);
          c.fillStyle = paper;
          c.fill();
        }
        body.forEach((s, i) => outsideOthers(c, body, i, () => cut(c, s, 0.7), {laterOnly: true}));
        body.forEach((s, i) => outsideOthers(c, body, i, () =>
          roughStroke(c, s.polys, true, {rng, color: ink, width: 6, amount: 1, passes: 1, spacing: 10})));
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s, ink);
          return;
        }

        if (s.closed && s.fill) {
          const b = bounds(s.polys);
          const small = Math.max(b.w, b.h) < 34;
          const l = luminance(s.fill);

          trace(c, s.polys, true);
          c.save();
          c.fillStyle = small && l < 0.5 ? ink : paper;
          if (layer !== 'markings') c.fill();
          c.restore();

          if (!small) {
            cut(c, s, layer === 'markings' ? -0.7 : 0.2);
          }
        }

        if (s.stroke && s.width > 0) {
          roughStroke(c, s.polys, s.closed, {rng, color: ink, width: Math.max(3, s.width * 0.8), amount: 0.8, passes: 1, spacing: 8});
        } else if (s.closed && layer !== 'markings' && s.role !== 'shine' && s.role !== 'cheek') {
          roughStroke(c, s.polys, true, {rng, color: ink, width: 3, amount: 0.8, passes: 1, spacing: 8});
        }
      },
    });
  },
};

// translucent glazes built from deformed copies, with a loose ink line on top
export const watercolor = {
  draw(ctx, scene, g, env) {
    const rng = env.rng;
    const ink = g.ink;

    const wash = (c, s, strength = 1) => {
      const b = bounds(s.polys);
      const size = Math.max(b.w, b.h);
      const layers = size < 30 ? 3 : 9;
      const amount = size < 30 ? 0.3 : 0.9;

      c.save();
      c.fillStyle = s.fill;
      c.globalAlpha = Math.min(1, (size < 30 ? 0.5 : 0.1) * strength * (s.alpha ?? 1) * 1.3);

      for (let i = 0; i < layers; i++) {
        trace(c, s.polys.map(p => deform(p, rng, amount * 0.25, 3)), true);
        c.fill();
      }

      c.restore();
    };

    drawLayers(ctx, scene, {
      body(c, body) {
        body.forEach((s, i) => outsideOthers(c, body, i, () => wash(c, s, 1.2), {laterOnly: true}));
        body.forEach((s, i) => outsideOthers(c, body, i, () =>
          roughStroke(c, s.polys, true, {rng, color: ink, width: 2.2, amount: 1, passes: 1, alpha: 0.8, spacing: 12})));
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s, ink);
          return;
        }

        if (s.closed && s.fill) {
          wash(c, s, layer === 'markings' ? 1 : 1.4);
        }

        if (s.stroke && s.width > 0) {
          roughStroke(c, s.polys, s.closed, {rng, color: luminance(s.stroke) < 0.15 ? ink : s.stroke, width: Math.max(2, s.width * 0.45), amount: 0.8, passes: 1, alpha: 0.85, spacing: 8});
        }
      },
    });
  },
};
