// Canvas plumbing shared by every style.

export function applyFrame(ctx, frame) {
  ctx.translate(frame.x, frame.y);
  ctx.rotate(frame.tilt);
  ctx.scale(frame.k, frame.k);
  ctx.translate(-frame.cx, -frame.cy);
}

export function trace(ctx, polys, closed) {
  ctx.beginPath();

  for (const poly of polys) {
    if (!poly.length) {
      continue;
    }

    ctx.moveTo(poly[0][0], poly[0][1]);

    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i][0], poly[i][1]);
    }

    if (closed) {
      ctx.closePath();
    }
  }
}

export function clipTo(ctx, polys) {
  trace(ctx, polys, true);
  ctx.clip();
}

export const FONT = '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif';

export function paintText(ctx, s, color = s.fill) {
  const [[x, y]] = s.polys[0];
  ctx.save();
  ctx.font = `bold ${s.size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(s.text, x, y);
  ctx.restore();
}

// paint a shape the way the classic style would, with optional overrides
export function paintShape(ctx, s, o = {}) {
  const fill = 'fill' in o ? o.fill : s.fill;
  const stroke = 'stroke' in o ? o.stroke : s.stroke;
  const width = o.width ?? s.width;
  const alpha = o.alpha ?? s.alpha ?? 1;
  const glow = 'glow' in o ? o.glow : s.glow;

  if (s.role === 'text') {
    paintText(ctx, s, o.textColor ?? fill);
    return;
  }

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = o.glowBlur ?? 18;
  }

  trace(ctx, s.polys, s.closed);

  if (s.closed && fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }

  if (stroke && width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  ctx.restore();
}

// Outline the whole silhouette without seams: stroke every body shape at
// double width, then cover the inner halves of those strokes with the fills.
export function paintBody(ctx, body, {outline = true, widthScale = 1, fill} = {}) {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (outline) {
    for (const s of body) {
      if (s.stroke) {
        trace(ctx, s.polys, true);
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.width * 2 * widthScale;
        ctx.stroke();
      }
    }
  }

  for (const s of body) {
    trace(ctx, s.polys, true);
    ctx.fillStyle = fill ? fill(s) : s.fill;
    ctx.fill();
  }

  ctx.restore();
}

// Walk the layers in order. The painter decides how each shape looks;
// markings are always clipped to the silhouette.
export function drawLayers(ctx, scene, painter = {}) {
  const shape = painter.shape || ((c, s) => paintShape(c, s));
  const body = painter.body || ((c, shapes) => paintBody(c, shapes));

  ctx.save();
  applyFrame(ctx, scene.frame);

  for (const s of scene.back) {
    shape(ctx, s, 'back');
  }

  body(ctx, scene.body);

  ctx.save();
  clipTo(ctx, scene.bodyClip);
  for (const s of scene.markings) {
    shape(ctx, s, 'markings');
  }
  ctx.restore();

  for (const s of scene.face) {
    shape(ctx, s, 'face');
  }

  for (const s of scene.front) {
    shape(ctx, s, 'front');
  }

  ctx.restore();
}
