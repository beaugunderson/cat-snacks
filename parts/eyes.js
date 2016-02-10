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

    if (options.closedEyes) {
      closedEye(offset);
    } else {
      openEye(offset);
    }
  }

  function openEye(offset) {
    ctx.ellipse(offset * options.headWidth * 0.4,
                options.eyeOffsetY,
                options.eyeSize,
                options.eyeSize,
                0, 0, 2 * Math.PI);
  }

  function closedEye(offset) {
    var eyeX = offset * options.headWidth * 0.5;
    var eyeWidth = options.eyeSize * 3;

    if (offset == 1) {
      eyeX -= eyeWidth;
    }

    ctx.fillStyle = 'black';

    ctx.rect(eyeX,
             options.eyeOffsetY,
             eyeWidth,
             options.eyeSize / 2);
  }

  side(-1);

  ctx.fill();

  ctx.fillStyle = options.eyeColor;

  side(1);

  ctx.fill();

  ctx.restore();
};
