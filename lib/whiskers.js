'use strict';

var _ = require('lodash');

function whiskerSide(ctx, options, flip) {
  var offset = flip ? -1 : 1;

  var whiskerOffset = options.noseOffsetY * 1.025;
  var whiskerSpread = options.headHeight * _.random(0.1, 0.2);

  ctx.beginPath();

  ctx.moveTo(options.centerX + options.headWidth * 0.475 * offset,
             whiskerOffset - whiskerSpread);
  ctx.lineTo(options.centerX + options.headWidth * 1.1 * offset,
             whiskerOffset - whiskerSpread * 1.5);

  ctx.moveTo(options.centerX + options.headWidth * 0.5 * offset, whiskerOffset);
  ctx.lineTo(options.centerX + options.headWidth * 1.125 * offset, whiskerOffset);

  ctx.moveTo(options.centerX + options.headWidth * 0.475 * offset,
             whiskerOffset + whiskerSpread);
  ctx.lineTo(options.centerX + options.headWidth * 1.1 * offset,
             whiskerOffset + whiskerSpread * 1.5);

  ctx.stroke();
}

module.exports = function (ctx, options) {
  ctx.lineWidth = 5;

  whiskerSide(ctx, options, false);
  whiskerSide(ctx, options, true);

  ctx.lineWidth = 8;
};
