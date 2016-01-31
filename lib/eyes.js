'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.beginPath();

  var eyeSize = options.headWidth * _.random(0.065, 0.08);

  // left eye
  ctx.ellipse(options.centerX - options.headWidth * 0.4,
              options.eyeOffsetY,
              eyeSize,
              eyeSize,
              0, 0, 2 * Math.PI);

  if (Math.random() < options.oddEyeProb) {
    ctx.fillStyle = options.oddEyeColor;
    ctx.fill();
  }

  // right eye
  ctx.ellipse(options.centerX + options.headWidth * 0.4,
              options.eyeOffsetY,
              eyeSize,
              eyeSize,
              Math.PI / 2, 0, 2 * Math.PI);

  ctx.fillStyle = options.eyeColor;
  ctx.fill();

};
