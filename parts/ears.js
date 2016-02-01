'use strict';

var bezierTo = require('../lib/bezier-to.js');

function ear(ctx, options, flip) {
  var offset = flip ? -1 : 1;

  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  bezierTo(
    ctx,
    -options.headWidth * 0.8 * offset,
    -options.headHeight * 0.5,

    // control point 1
    -options.headWidth * (0.8 * options.earFactorX) * offset,
    -options.headHeight * (1.35 * options.earFactorY),

    // control point 2
    -options.headWidth * (0.65 * options.earFactorX) * offset,
    -options.headHeight * (1.35 * options.earFactorY),

    -options.headWidth * 0.4 * offset,
    -options.headHeight * 0.8);

  ctx.restore();
}

module.exports = function (ctx, options) {
  ear(ctx, options, false);
  ear(ctx, options, true);
};
