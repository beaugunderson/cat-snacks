'use strict';

var ears = require('./ears.js');
var head = require('./head.js');

module.exports = function (ctx, options) {
  ctx.beginPath();
  head(ctx, options);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fill();

  ctx.globalCompositeOperation = 'destination-out';
  ctx.stroke();

  ctx.beginPath();
  ears(ctx, options);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fill();

  ctx.globalCompositeOperation = 'destination-out';
  ctx.stroke();
};
