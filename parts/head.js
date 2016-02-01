'use strict';

module.exports = function (ctx, options) {
  var x = options.centerX;
  var y = options.centerY;
  var w = options.headWidth;
  var h = options.headHeight;

  switch (options.headShape) {

    default:
    case 'ellipse':
      ctx.ellipse(x, y,
                  w, h,
                  0, 0, 2 * Math.PI);
      break;

    case 'triangular':
      ctx.moveTo(x, y - h);
      ctx.quadraticCurveTo(
          x - (w * options.headAngleFactor), y - h,
          x - w, y);
      ctx.quadraticCurveTo(
          x - w, y + h,
          x, y + h);
      ctx.quadraticCurveTo(
          x + w, y + h,
          x + w, y);
      ctx.quadraticCurveTo(
          x + (w * options.headAngleFactor), y - h,
          x, y - h);
      break;

  }
};
