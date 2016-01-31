'use strict';

var bezierTo = require('./bezier-to.js');

module.exports = function (ctx, options) {
  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  ctx.beginPath();

  // left side
  bezierTo(
    ctx,
    0, options.noseOffsetY,
    -options.mouthWidth * 0.25, options.noseOffsetY + options.mouthHeight,
    -options.mouthWidth * 0.75, options.noseOffsetY + options.mouthHeight,
    -options.mouthWidth, options.noseOffsetY * 1.05);

  // right side
  bezierTo(
    ctx,
    0, options.noseOffsetY,
    options.mouthWidth * 0.25, options.noseOffsetY + options.mouthHeight,
    options.mouthWidth * 0.75, options.noseOffsetY + options.mouthHeight,
    options.mouthWidth, options.noseOffsetY * 1.05);

  ctx.stroke();

  ctx.restore();
};
