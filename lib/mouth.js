'use strict';

var bezierTo = require('./bezier-to.js');

module.exports = function (ctx, options) {
  ctx.beginPath();

  // left side
  bezierTo(
    ctx,
    options.centerX, options.noseOffsetY,
    options.centerX - options.mouthWidth * 0.25, options.noseOffsetY + options.mouthHeight,
    options.centerX - options.mouthWidth * 0.75, options.noseOffsetY + options.mouthHeight,
    options.centerX - options.mouthWidth, options.noseOffsetY * 1.05);

  // right side
  bezierTo(
    ctx,
    options.centerX, options.noseOffsetY,
    options.centerX + options.mouthWidth * 0.25, options.noseOffsetY + options.mouthHeight,
    options.centerX + options.mouthWidth * 0.75, options.noseOffsetY + options.mouthHeight,
    options.centerX + options.mouthWidth, options.noseOffsetY * 1.05);

  ctx.stroke();
};
