'use strict';

module.exports = function (ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
  ctx.save();

  ctx.beginPath();

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;

  ctx.moveTo(x1, y1);
  ctx.lineTo(cx1, cy1);
  ctx.moveTo(x2, y2);
  ctx.lineTo(cx2, cy2);

  ctx.stroke();

  ctx.beginPath();

  ctx.ellipse(cx1, cy1, 3, 3, 0, 0, 2 * Math.PI);
  ctx.ellipse(cx2, cy2, 3, 3, 0, 0, 2 * Math.PI);

  ctx.fill();

  ctx.restore();
};
