'use strict';

var bezierTo = require('../lib/bezier-to.js');
var _ = require('lodash');

function roundNose(ctx, options) {
  ctx.ellipse(0, options.noseOffsetY,
              options.headWidth * _.random(0.05, 0.1),
              options.headHeight * _.random(0.025, 0.065),
              0, 0, 2 * Math.PI);
}

function triangleNose(ctx, options) {
  var noseWidth = options.headWidth * _.random(0.1, 0.2);
  var noseHeight = options.headHeight * _.random(0.1, 0.2);

  function side(offset) {
    bezierTo(
      ctx,
       0, options.noseOffsetY - noseHeight,
       offset * noseWidth, options.noseOffsetY - noseHeight,
       offset * noseWidth * 0.9, options.noseOffsetY - (noseHeight * 0.75),
       0, options.noseOffsetY);
  }

  side(-1);
  side(1);
}

module.exports = function (ctx, options) {
  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  ctx.fillStyle = options.noseColor;

  if (_.random(0, 100) >= 50) {
    ctx.strokeStyle = options.noseColor;
  }

  ctx.beginPath();

  _.sample([roundNose, triangleNose])(ctx, options);

  ctx.fill();
  ctx.stroke();

  ctx.restore();
};
