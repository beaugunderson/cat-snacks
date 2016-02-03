'use strict';

var bezierTo = require('../lib/bezier-to.js');
var _ = require('lodash');

// TODO: could use some tweaking
function detachedSmile(ctx, options) {
  var startY = options.mouthHeight + _.random(1.1, 1.2);

  bezierTo(
    ctx,
    0 - options.mouthWidth / _.random(1.0, 3.0),
      startY + options.mouthHeight * 0.5,
    options.mouthWidth * 0.25, startY + options.mouthHeight,
    options.mouthWidth * 0.75, startY + options.mouthHeight,
    options.mouthWidth * 1.1, startY * 1.05);
}

function splitMouth(ctx, options) {
  var dropMouthOffset = 0;

  if (_.random(0, 100) >= 50) {
    dropMouthOffset = options.headHeight * _.random(0.125, 0.15);

    ctx.moveTo(0, options.noseOffsetY);
    ctx.lineTo(0, options.noseOffsetY + dropMouthOffset);
  }

  var startY = options.noseOffsetY + dropMouthOffset;

  function side(offset) {
    bezierTo(
      ctx,
      0, startY,
      offset * options.mouthWidth * 0.25, startY + options.mouthHeight,
      offset * options.mouthWidth * 0.75, startY + options.mouthHeight,
      offset * options.mouthWidth, startY * 1.05);
  }

  side(-1);
  side(1);
}

module.exports = function (ctx, options) {
  ctx.save();

  ctx.translate(options.centerX, options.centerY);

  ctx.beginPath();

  _.sample([
    splitMouth,
    detachedSmile
  ])(ctx, options);

  ctx.stroke();

  ctx.restore();
};
