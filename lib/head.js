'use strict';

module.exports = function (ctx, options) {
  ctx.ellipse(options.centerX, options.centerY,
              options.headWidth, options.headHeight,
              0, 0, 2 * Math.PI);
};
