'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  if (_.random(0, 100) <= options.oddEyePercentage) {
    ctx.fillStyle = options.oddEyeColor;
  } else {
    ctx.fillStyle = options.eyeColor;
  }

  function side(offset) {
    ctx.beginPath();

    ctx.ellipse(offset * options.headWidth * 0.4,
                options.eyeOffsetY,
                options.eyeSize,
                options.eyeSize,
                0, 0, 2 * Math.PI);
  }

  side(-1);

  ctx.fill();

  ctx.fillStyle = options.eyeColor;

  side(1);

  ctx.fill();

  ctx.restore();
};
