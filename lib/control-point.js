'use strict';

module.exports = function (ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
  var {scaleFactor} = require('./config.js');

  ctx.save();

  ctx.beginPath();

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1 * scaleFactor;

  ctx.moveTo(x1, y1);
  ctx.lineTo(cx1, cy1);
  ctx.moveTo(x2, y2);
  ctx.lineTo(cx2, cy2);

  ctx.stroke();

  ctx.beginPath();

  var dimension = 3 * scaleFactor;

  ctx.ellipse(cx1, cy1, dimension, dimension, 0, 0, 2 * Math.PI);
  ctx.ellipse(cx2, cy2, dimension, dimension, 0, 0, 2 * Math.PI);

  ctx.fill();

  ctx.restore();
};
