'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.fillStyle = options.backgroundColor;
  ctx.globalCompositeOperation = 'destination-over';

  ctx.fillRect(0, 0, options.width, options.height);

  ctx.fillStyle = 'black';
  ctx.globalCompositeOperation = 'source-over';
};
