'use strict';

var bezierTo = require('./bezier-to.js');

function ear(ctx, options, flip) {
  var offset = flip ? -1 : 1;

  bezierTo(
    ctx,
    options.centerX - options.headWidth * 0.8 * offset,
    options.centerY - options.headHeight * 0.5,

    // control point 1
    options.centerX - options.headWidth * (0.8 * options.earFactorX) * offset,
    options.centerY - options.headHeight * (1.35 * options.earFactorY),

    // control point 2
    options.centerX - options.headWidth * (0.65 * options.earFactorX) * offset,
    options.centerY - options.headHeight * (1.35 * options.earFactorY),

    options.centerX - options.headWidth * 0.4 * offset,
    options.centerY - options.headHeight * 0.8);
}

module.exports = function (ctx, options) {
  ear(ctx, options, false);
  ear(ctx, options, true);
};
