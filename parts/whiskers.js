'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.globalCompositeOperation = 'source-over';

  ctx.save();

  ctx.lineWidth = 5 * options.scaleFactor;

  ctx.translate(options.centerX, options.centerY);

  // TODO: dial this in, add some randomness.
  // Using `0` as false because i am a bad person.
  var droopiness = options.droop ? options.headHeight / 12 : 0;
  var whiskerSpread = options.headHeight * _.random(0.1, 0.2);
  var whiskerOffset = options.noseOffsetY * 1.025;

  function side(offset) {
    ctx.beginPath();

    // i am sorry
    var x1Start = options.headWidth * 0.475 * offset;
    var y1Start = whiskerOffset - whiskerSpread;
    var x1End = options.headWidth * 1.1 * offset;
    var y1End = whiskerOffset - whiskerSpread * 1.5;

    var x2Start = options.headWidth * 0.5 * offset;
    var y2Start = whiskerOffset;
    var x2End = options.headWidth * 1.125 * offset;
    var y2End = whiskerOffset;

    var x3Start = options.headWidth * 0.475 * offset;
    var y3Start = whiskerOffset + whiskerSpread;
    var x3End = options.headWidth * 1.1 * offset;
    var y3End = whiskerOffset + whiskerSpread * 1.5;

    if (options.droop) {
      // TODO: add an option for more random/messy whiskers
      ctx.moveTo(x1Start, y1Start);
      ctx.bezierCurveTo(x1Start, y1Start,
                        x1End * options.whiskerFactorX, y1End * options.whiskerFactorY,
                        x1End, y1End - droopiness);

      ctx.moveTo(x2Start, y2Start);
      ctx.bezierCurveTo(x2Start, y2Start,
                        x2End * options.whiskerFactorX, y2End * options.whiskerFactorY,
                        x2End, y2End - droopiness);

      ctx.moveTo(x3Start, y3Start);
      ctx.bezierCurveTo(x3Start, y3Start,
                        x3End * options.whiskerFactorX, y3End * options.whiskerFactorY,
                        x3End, y3End - droopiness);
    } else {
      ctx.moveTo(x1Start, y1Start);
      ctx.lineTo(x1End, y1End);

      ctx.moveTo(x2Start, y2Start);
      ctx.lineTo(x2End, y2End);

      ctx.moveTo(x3Start, y3Start);
      ctx.lineTo(x3End, y3End);
    }

    ctx.stroke();
  }

  side(-1);
  side(1);

  ctx.restore();

  ctx.globalCompositeOperation = 'source-atop';
};
