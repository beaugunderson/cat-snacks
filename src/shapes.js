// A shape is one drawable thing in the scene: some polylines plus how the
// classic style would paint them. Other styles reinterpret the same shapes.
//
//   role    what the shape is (head, iris, whisker...) so styles can treat
//           parts differently
//   polys   array of point arrays
//   closed  filled region (true) or open stroke (false)
//   fill, stroke, width, alpha, glow, text

const wrap = polys => (typeof polys[0][0] === 'number' ? [polys] : polys);

export function fillShape(role, polys, fill, stroke = null, width = 0, extra = {}) {
  return {role, polys: wrap(polys), closed: true, fill, stroke, width, ...extra};
}

export function lineShape(role, polys, stroke, width, extra = {}) {
  return {role, polys: wrap(polys), closed: false, fill: null, stroke, width, ...extra};
}

export function textShape(text, x, y, size, fill, extra = {}) {
  return {role: 'text', polys: [[[x, y]]], closed: false, fill, stroke: null, width: 0, text, size, ...extra};
}
