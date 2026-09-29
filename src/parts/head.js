import {bezier, centroid, edgeAt, lerp, lerpPt, mirrorX, path, quad, scale, superellipse} from '../geom.js';

// Head and ears, in head-local coordinates: the head is centered on the
// origin, y points down.

export function headOutline(g) {
  const w = g.headW;
  const h = g.headH;

  if (g.headShape === 'triangular') {
    const a = g.headAngle;
    return path([0, -h])
      .quad([-w * a, -h], [-w, 0])
      .quad([-w, h], [0, h])
      .quad([w, h], [w, 0])
      .quad([w * a, -h], [0, -h])
      .pts.slice(0, -1);
  }

  let pts = superellipse(w, h, g.headN, 96);

  if (g.jowl) {
    // widen the bottom and narrow the top (or the reverse, for negative jowl)
    pts = pts.map(([x, y]) => [x * (1 + g.jowl * (y / h)), y]);
  }

  return pts;
}

function rightEar(g, head) {
  const h = g.headH;
  const spread = 2 - g.earSpread;
  let outerAngle = -0.4 * spread;
  let innerAngle = -0.98 * spread;
  let height = 0.5 * h * g.earSize;

  if (g.earShape === 'big') {
    outerAngle = -0.22 * spread;
    innerAngle = -1.12 * spread;
    height *= 1.45;
  } else if (g.earShape === 'tiny') {
    outerAngle = -0.62 * spread;
    innerAngle = -1.02 * spread;
    height *= 0.5;
  } else if (g.earShape === 'folded') {
    outerAngle = -0.55 * spread;
    innerAngle = -1.1 * spread;
    height *= 0.5;
  } else if (g.earShape === 'tufted') {
    height *= 1.2;
  }

  // sink the base points a little inside the head so the shapes overlap
  const outer = scale([edgeAt(head, outerAngle)], 0.9)[0];
  const inner = scale([edgeAt(head, innerAngle)], 0.9)[0];
  const midY = (outer[1] + inner[1]) / 2;
  const tip = [lerp(inner[0], outer[0], 0.6 + g.earLean), midY - height];
  const anchor = [(outer[0] + inner[0]) * 0.35, (outer[1] + inner[1]) * 0.35];
  const extras = [];
  let pts;

  switch (g.earShape) {
    case 'curved':
    case 'big': {
      const lift = h * 0.2 * g.earSize;
      pts = bezier(outer, [outer[0] + (outer[0] - inner[0]) * 0.1, tip[1] - lift], [tip[0], tip[1] - lift], inner, 24);
      break;
    }

    case 'rounded':
    case 'tiny': {
      const a = lerpPt(outer, tip, 0.75);
      const b = lerpPt(inner, tip, 0.75);
      pts = path(outer).line(a).quad(tip, b, 10).line(inner).pts;
      break;
    }

    case 'folded': {
      const peak = [lerp(inner[0], outer[0], 0.35), midY - height];
      const flap = [outer[0] + (outer[0] - inner[0]) * 0.25, midY - height * 0.1];
      pts = path(inner)
        .quad([inner[0], peak[1]], peak, 10)
        .quad([flap[0], peak[1] - height * 0.2], flap, 10)
        .line(outer)
        .pts;
      break;
    }

    case 'tufted':
    case 'pointy':
    default:
      pts = [outer, tip, inner];
  }

  if (g.earShape === 'tufted') {
    const up = [tip[0] + (tip[0] - anchor[0]) * 0.08, tip[1] - h * 0.28];
    extras.push(quad(tip, [tip[0] + 6, lerp(tip[1], up[1], 0.5)], up, 8));
    extras.push(quad(tip, [tip[0] - 10, lerp(tip[1], up[1], 0.4)], [up[0] - 14, up[1] + 16], 8));
  }

  const outline = [...pts, anchor];
  const triangleCenter = centroid([outer, tip, inner]);
  const insides = g.earShape === 'folded' ? null : scale(outline, 0.58, 0.62, triangleCenter[0], triangleCenter[1] + 6);

  return {outline, insides, tip, outer, inner, tufts: extras};
}

export function ears(g, head) {
  const right = rightEar(g, head);
  const flip = ear => ({
    outline: mirrorX(ear.outline).reverse(),
    insides: ear.insides && mirrorX(ear.insides).reverse(),
    tip: mirrorX([ear.tip])[0],
    outer: mirrorX([ear.outer])[0],
    inner: mirrorX([ear.inner])[0],
    tufts: ear.tufts.map(mirrorX),
  });

  return [flip(right), right];
}
