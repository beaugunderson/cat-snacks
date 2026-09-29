import {darken, lighten, luminance, rgba} from '../color.js';
import {bounds, ellipse} from '../geom.js';
import {allShapes} from '../scene.js';
import {applyFrame, clipTo, drawLayers, paintBody, paintShape, paintText, trace} from './paint.js';
import {hatch} from './marks.js';

// Styles that paint the shapes more or less directly: fills and strokes with
// different treatments.

const scaled = k => (ctx, s) => paintShape(ctx, s, {width: s.width * k});

export const classic = {
  draw: (ctx, scene) => drawLayers(ctx, scene),
};

export const rubberhose = {
  draw: (ctx, scene) => drawLayers(ctx, scene, {
    body: (c, body) => paintBody(c, body, {widthScale: 1.25}),
    shape: scaled(1.2),
  }),
};

export const kawaii = {
  draw(ctx, scene) {
    drawLayers(ctx, scene, {
      body(c, body) {
        paintBody(c, body, {widthScale: 0.75});
        // a soft sheen on the forehead
        const head = body[body.length - 1];
        const b = bounds(head.polys);
        c.save();
        clipTo(c, head.polys);
        trace(c, [ellipse(b.minX + b.w * 0.32, b.minY + b.h * 0.25, b.w * 0.2, b.h * 0.12, 30, -0.4)], true);
        c.fillStyle = rgba('#ffffff', 0.35);
        c.fill();
        c.restore();
      },
      shape: scaled(0.8),
    });
  },
};

// no outlines; every piece casts a shadow like layered construction paper
export const papercut = {
  draw(ctx, scene) {
    const shadow = c => {
      c.shadowColor = 'rgba(40, 20, 10, 0.35)';
      c.shadowBlur = 10;
      c.shadowOffsetX = 3;
      c.shadowOffsetY = 5;
    };

    drawLayers(ctx, scene, {
      body(c, body) {
        for (const s of body) {
          c.save();
          shadow(c);
          trace(c, s.polys, true);
          c.fillStyle = s.fill;
          c.fill();
          c.restore();
        }
      },
      shape(c, s) {
        if (s.role === 'text') {
          paintText(c, s);
          return;
        }

        c.save();
        shadow(c);
        paintShape(c, s, s.closed && s.fill ? {stroke: null} : {width: s.width * 1.1});
        c.restore();
      },
    });
  },
};

function shadedFill(ctx, s, strength = 1) {
  const b = bounds(s.polys);
  const grad = ctx.createLinearGradient(b.minX, b.minY, b.maxX * 0.4 + b.minX * 0.6, b.maxY);
  grad.addColorStop(0, lighten(s.fill, 0.14 * strength));
  grad.addColorStop(1, darken(s.fill, 0.12 * strength));
  return grad;
}

// soft gradients and a big specular highlight, like a vinyl toy
export const gloss = {
  draw(ctx, scene) {
    drawLayers(ctx, scene, {
      body(c, body) {
        paintBody(c, body, {widthScale: 0.45, fill: s => {
          const b = bounds(s.polys);
          const grad = c.createRadialGradient(
            b.minX + b.w * 0.35, b.minY + b.h * 0.3, b.w * 0.05,
            b.minX + b.w * 0.5, b.minY + b.h * 0.55, b.w * 0.75);
          grad.addColorStop(0, lighten(s.fill, 0.16));
          grad.addColorStop(1, darken(s.fill, 0.16));
          return grad;
        }});

        const head = body[body.length - 1];
        const b = bounds(head.polys);
        c.save();
        clipTo(c, head.polys);
        trace(c, [ellipse(b.minX + b.w * 0.3, b.minY + b.h * 0.22, b.w * 0.18, b.h * 0.09, 30, -0.5)], true);
        c.fillStyle = rgba('#ffffff', 0.55);
        c.fill();
        c.restore();
      },
      shape(c, s) {
        if (s.closed && s.fill && s.role !== 'text' && !s.fill.startsWith('rgba')) {
          paintShape(c, s, {fill: shadedFill(c, s), width: s.width * 0.6});
        } else {
          paintShape(c, s, {width: s.width * 0.8});
        }
      },
    });
  },
};

// single-weight ink lines on paper; filled areas become hatching
export const line = {
  draw(ctx, scene, g, env) {
    const ink = g.ink;
    const paper = g.bgColor;
    const solid = new Set(['pupil', 'eye', 'nose']);

    drawLayers(ctx, scene, {
      body: (c, body) => paintBody(c, body.map(s => ({...s, stroke: ink, width: 4})), {fill: () => paper}),
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s, ink);
          return;
        }

        if (!s.closed) {
          paintShape(c, s, {stroke: ink, width: Math.min(s.width, 5), glow: null});
          return;
        }

        if (layer === 'markings') {
          hatch(c, s.polys, {angle: s.role === 'earInner' ? 0.9 : -0.7, spacing: 7, color: ink, width: 1.6, rng: env.rng, wobble: 0.6});
          return;
        }

        const dark = s.fill && luminance(s.fill) < 0.25;
        // translucent things (lens tints, blush) stay see-through: outline only
        const seeThrough = (s.alpha ?? 1) < 1;
        const fill = seeThrough ? null : solid.has(s.role) && dark ? ink : s.role === 'shine' ? paper : s.fill ? paper : null;
        paintShape(c, s, {fill, stroke: s.role === 'shine' ? null : ink, width: 3.5, alpha: 1, glow: null});

        if (s.role === 'tongue' || s.role === 'mouthFill' || s.role === 'cheek' || s.role === 'iris') {
          hatch(c, s.polys, {angle: 0.8, spacing: 5, color: ink, width: 1.2});
        }
      },
    });
  },
};

const DARK = 0.04;

// everything becomes glowing tubes on a dark ground
export const neon = {
  draw(ctx, scene, g, env) {
    const tube = color => (luminance(color) < DARK ? g.ink : color);
    const flicker = env.t == null ? 1 : 0.85 + 0.15 * Math.sin(env.t * 17) * Math.sin(env.t * 3.1);

    const glowStroke = (c, polys, closed, color, width) => {
      c.save();
      c.globalAlpha *= flicker;
      c.lineJoin = 'round';
      c.lineCap = 'round';
      c.shadowColor = color;
      c.shadowBlur = 22;
      trace(c, polys, closed);
      c.strokeStyle = color;
      c.lineWidth = width;
      c.stroke();
      c.shadowBlur = 0;
      c.strokeStyle = lighten(color, 0.3);
      c.lineWidth = Math.max(1.5, width * 0.35);
      c.stroke();
      c.restore();
    };

    drawLayers(ctx, scene, {
      body(c, body) {
        for (const s of body) {
          trace(c, s.polys, true);
          c.fillStyle = rgba(g.bgColor, 0.85);
          c.fill();
        }
        for (const s of body) {
          glowStroke(c, s.polys, true, g.fur, 7);
        }
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          c.save();
          c.shadowColor = g.accent;
          c.shadowBlur = 16;
          paintText(c, s, lighten(g.accent, 0.2));
          c.restore();
          return;
        }

        const color = tube(s.fill || s.stroke || g.ink);

        if (layer === 'markings') {
          paintShape(c, s, {fill: rgba(color, 0.18), stroke: null});
          glowStroke(c, s.polys, true, color, 3);
          return;
        }

        if (s.closed && (s.role === 'pupil' || s.role === 'shine')) {
          paintShape(c, s, {fill: s.role === 'shine' ? '#ffffff' : color, stroke: null, glow: color});
          return;
        }

        if (s.alpha && s.alpha < 0.5 && s.closed) {
          paintShape(c, s, {fill: rgba(color, s.alpha), stroke: null, alpha: 1, glow: null});
          return;
        }

        glowStroke(c, s.polys, s.closed, color, Math.max(3, Math.min(s.width || 5, 8)));
      },
    });
  },
};

// technical drawing: white linework, construction lines, dimensions, title block
export const blueprint = {
  draw(ctx, scene, g) {
    const ink = g.ink;
    const thin = {stroke: ink, width: 2, glow: null};

    drawLayers(ctx, scene, {
      body(c, body) {
        for (const s of body) {
          trace(c, s.polys, true);
          c.fillStyle = rgba('#ffffff', 0.06);
          c.fill();
        }
        for (const s of body) {
          paintShape(c, s, {fill: null, stroke: ink, width: 3});
        }
      },
      shape(c, s, layer) {
        if (s.role === 'text') {
          paintText(c, s, ink);
          return;
        }

        c.save();
        if (layer === 'markings') {
          c.setLineDash([6, 5]);
        }
        paintShape(c, s, {...thin, fill: s.closed && s.fill && luminance(s.fill) < 0.1 ? rgba('#ffffff', 0.5) : null});
        c.restore();
      },
    });

    // construction geometry, in the head's own coordinates
    const {anchors} = scene;
    const all = bounds(allShapes(scene).filter(s => s.source == null).flatMap(s => s.polys));

    ctx.save();
    applyFrame(ctx, scene.frame);
    ctx.strokeStyle = rgba(ink, 0.55);
    ctx.fillStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([10, 4, 2, 4]);
    ctx.beginPath();
    ctx.moveTo(0, all.minY - 30);
    ctx.lineTo(0, all.maxY + 30);
    ctx.moveTo(all.minX - 30, 0);
    ctx.lineTo(all.maxX + 30, 0);
    for (const [x, y] of anchors.eyes) {
      ctx.moveTo(x + anchors.eyeRadius + 8, y);
      ctx.arc(x, y, anchors.eyeRadius + 8, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const dim = (x0, y0, x1, y1, label, horizontal) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      for (const [x, y, dir] of [[x0, y0, 1], [x1, y1, -1]]) {
        ctx.beginPath();
        if (horizontal) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + dir * 9, y - 4);
          ctx.lineTo(x + dir * 9, y + 4);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x - 4, y + dir * 9);
          ctx.lineTo(x + 4, y + dir * 9);
        }
        ctx.fill();
      }
      ctx.save();
      ctx.font = '13px Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.translate((x0 + x1) / 2, (y0 + y1) / 2);
      if (!horizontal) ctx.rotate(-Math.PI / 2);
      ctx.fillText(label, 0, -6);
      ctx.restore();
    };

    const headW = Math.round(anchors.w * 2);
    const headH = Math.round(anchors.bottom - anchors.top);
    dim(-anchors.w, anchors.bottom + 28, anchors.w, anchors.bottom + 28, `${headW} mm`, true);
    dim(anchors.w + 36, anchors.top, anchors.w + 36, anchors.bottom, `${headH} mm`, false);
    ctx.restore();

    // title block
    ctx.save();
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(392, 520, 196, 68);
    ctx.beginPath();
    ctx.moveTo(392, 546);
    ctx.lineTo(588, 546);
    ctx.stroke();
    ctx.font = 'bold 15px Menlo, monospace';
    ctx.fillText('CAT-SNACK MK II', 402, 539);
    ctx.font = '11px Menlo, monospace';
    ctx.fillText(`PART ${g.seed.toUpperCase()}`.slice(0, 28), 402, 563);
    ctx.fillText(`${g.headShape.toUpperCase()} / ${g.earShape.toUpperCase()}`, 402, 579);
    ctx.restore();
  },
};
