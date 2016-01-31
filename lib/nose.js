'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.beginPath();
  ctx.ellipse(options.centerX,
              options.noseOffsetY,
              options.headWidth * _.random(0.05, 0.1),
              options.headHeight * _.random(0.025, 0.065),
              0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};
