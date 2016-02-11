'use strict';

var _ = require('lodash');

module.exports = function (ctx) {
  var {accessories, centerX, centerY, closedEyes, eyeColor, eyeOffsetY,
    eyeSize, headWidth, oddEyeColor, oddEyePercentage} =
      require('../lib/config.js');

  ctx.save();

  ctx.translate(centerX, centerY);

  if (_.random(0, 100) <= oddEyePercentage) {
    ctx.fillStyle = oddEyeColor;
  } else {
    ctx.fillStyle = eyeColor;
  }

  function side(offset) {
    ctx.beginPath();

    if (closedEyes) {
      closedEye(offset);
    } else {
      openEye(offset);
    }
  }

  function openEye(offset) {
    ctx.ellipse(offset * headWidth * 0.4,
                eyeOffsetY,
                eyeSize,
                eyeSize,
                0, 0, 2 * Math.PI);
  }

  function closedEye(offset) {
    var eyeX = offset * headWidth * 0.5;
    var eyeWidth = eyeSize * 3;

    if (offset == 1) {
      eyeX -= eyeWidth;
    }

    ctx.fillStyle = 'black';

    ctx.rect(eyeX,
             eyeOffsetY,
             eyeWidth,
             eyeSize / 2);
  }

  side(-1);

  ctx.fill();

  ctx.fillStyle = eyeColor;

  side(1);

  ctx.fill();

  ctx.restore();
};
