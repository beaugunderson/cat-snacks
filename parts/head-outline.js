'use strict';

var ears = require('./ears.js');
var head = require('./head.js');

module.exports = function (ctx, options) {
  ctx.save();

  ctx.fillStyle = 'black';
  ctx.globalCompositeOperation = 'destination-over';

  ctx.lineWidth = 9 * options.scaleFactor;

  // head
  ctx.beginPath();
  head(ctx, options);
  ctx.stroke();

  // ears
  ctx.beginPath();
  ears(ctx, options);
  ctx.stroke();

  ctx.fillStyle = 'black';
  ctx.globalCompositeOperation = 'source-over';

  ctx.restore();
};
