'use strict';

var bezierTo = require('./bezier-to.js');
var Color = require('color');
var _ = require('lodash');

function earInside(ctx, options, flip) {
  var offset = flip ? -1 : 1;

  bezierTo(
    ctx,
    options.centerX - options.headWidth * 0.725 * offset,
    options.centerY - options.headHeight * 0.55,

    // control point 1
    options.centerX - options.headWidth * (0.725 * options.earFactorX) * offset,
    options.centerY - options.headHeight * (1.2 * options.earFactorY),

    // control point 2
    options.centerX - options.headWidth * (0.7 * options.earFactorX) * offset,
    options.centerY - options.headHeight * (1.2 * options.earFactorY),

    options.centerX - options.headWidth * 0.45 * offset,
    options.centerY - options.headHeight * 0.75);
}

module.exports = function earInsides(ctx, options) {
  ctx.fillStyle = Color(options.catColor)
    .lighten(_.sample([-0.1, 0.3]))
    .hexString();

  earInside(ctx, options, false);
  earInside(ctx, options, true);
};
