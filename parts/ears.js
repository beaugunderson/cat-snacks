'use strict';

var bezierTo = require('../lib/bezier-to.js');
var _ = require('lodash');

function pointyEars(ctx, options) {
  options.usedFunctions.ears.insides = 'pointy';

  function side(offset) {
    ctx.moveTo(options.headWidth * 0.8 * offset,
               -options.headHeight * 0.5);

    ctx.lineTo(options.headWidth * (0.65 * options.earFactorX) * offset,
               -options.headHeight * (1.15 * options.earFactorY));

    ctx.lineTo(options.headWidth * 0.4 * offset,
               -options.headHeight * 0.8);
  }

  side(-1);
  side(1);
}

function curvedEars(ctx, options) {
  options.usedFunctions.ears.insides = 'curved';

  function side(offset) {
    bezierTo(
      ctx,
      options.headWidth * 0.8 * offset,
      -options.headHeight * 0.5,

      // control point 1
      options.headWidth * (0.8 * options.earFactorX) * offset,
      -options.headHeight * (1.35 * options.earFactorY),

      // control point 2
      options.headWidth * (0.65 * options.earFactorX) * offset,
      -options.headHeight * (1.35 * options.earFactorY),

      options.headWidth * 0.4 * offset,
      -options.headHeight * 0.8);
  }

  side(-1);
  side(1);
}

module.exports = function (ctx, options) {
  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  if (!options.usedFunctions.ears) {
    options.usedFunctions.ears = _.sample([
      curvedEars,
      pointyEars
    ]);
  }

  options.usedFunctions.ears(ctx, options);

  ctx.restore();
};
