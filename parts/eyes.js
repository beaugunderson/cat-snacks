'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  ctx.beginPath();

  if (_.random(0, 100) <= options.oddEyePercentage) {
    ctx.fillStyle = options.oddEyeColor;
  } else {
    ctx.fillStyle = options.eyeColor;
  }

  // left eye
  ctx.ellipse(-options.headWidth * 0.4,
              options.eyeOffsetY,
              options.eyeSize,
              options.eyeSize,
              0, 0, 2 * Math.PI);

  ctx.fill();

  ctx.beginPath();

  // right eye
  ctx.ellipse(options.headWidth * 0.4,
              options.eyeOffsetY,
              options.eyeSize,
              options.eyeSize,
              Math.PI / 2, 0, 2 * Math.PI);

  ctx.fillStyle = options.eyeColor;
  ctx.fill();

  ctx.restore();
};
