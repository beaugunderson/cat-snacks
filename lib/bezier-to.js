'use strict';

module.exports = function (ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
  if (!module.exports.points) {
    module.exports.points = [];
  }

  module.exports.points.push([x1, y1, cx1, cy1, cx2, cy2, x2, y2]);

  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
};
