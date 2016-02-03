'use strict';

var bezierTo = require('../lib/bezier-to.js');
var Color = require('color');
var _ = require('lodash');

function pointyInsides(ctx, options) {
  function side(offset) {
    ctx.beginPath();

    ctx.moveTo(options.headWidth * 0.725 * offset,
               -options.headHeight * 0.55);

    ctx.lineTo(options.headWidth * (0.635 * options.earFactorX) * offset,
               -options.headHeight * (1.05 * options.earFactorY));

    ctx.lineTo(options.headWidth * 0.45 * offset,
               -options.headHeight * 0.75);

    ctx.fill();
  }

  side(-1);
  side(1);
}

function curvedInsides(ctx, options) {
  function side(offset) {
    ctx.beginPath();

    bezierTo(
      ctx,
      options.headWidth * 0.725 * offset,
      -options.headHeight * 0.55,

      // control point 1
      options.headWidth * (0.725 * options.earFactorX) * offset,
      -options.headHeight * (1.2 * options.earFactorY),

      // control point 2
      options.headWidth * (0.7 * options.earFactorX) * offset,
      -options.headHeight * (1.2 * options.earFactorY),

      options.headWidth * 0.45 * offset,
      -options.headHeight * 0.75);

    ctx.fill();
  }

  side(-1);
  side(1);
}

module.exports = function (ctx, options) {
  ctx.save();

  ctx.fillStyle = Color(options.catColor)
    .lighten(_.sample([-0.075, 0.075]))
    .hexString();

  if (options.usedFunctions.ears.insides === 'pointy') {
    pointyInsides(ctx, options);
  } else if (options.usedFunctions.ears.insides === 'curved') {
    curvedInsides(ctx, options);
  }

  ctx.restore();
};
