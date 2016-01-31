'use strict';

var _ = require('lodash');

function whiskerSide(ctx, options, flip, droop) {
  var offset = flip ? -1 : 1;

  var whiskerOffset = options.noseOffsetY * 1.025;
  var whiskerSpread = options.headHeight * _.random(0.1, 0.2);

  ctx.beginPath();

  // i am sorry
  var x1Start = options.centerX + options.headWidth * 0.475 * offset;
  var y1Start = whiskerOffset - whiskerSpread;
  var x1End = options.centerX + options.headWidth * 1.1 * offset;
  var y1End = whiskerOffset - whiskerSpread * 1.5;

  var x2Start = options.centerX + options.headWidth * 0.5 * offset;
  var y2Start = whiskerOffset;
  var x2End = options.centerX + options.headWidth * 1.125 * offset;
  var y2End = whiskerOffset;

  var x3Start = options.centerX + options.headWidth * 0.475 * offset;
  var y3Start = whiskerOffset + whiskerSpread;
  var x3End = options.centerX + options.headWidth * 1.1 * offset;
  var y3End = whiskerOffset + whiskerSpread * 1.5;

  // TODO: dial this in, add some randomness
  var droopiness = options.headHeight / 12;

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

module.exports = function (ctx, options) {
  ctx.lineWidth = 5;

  whiskerSide(ctx, options, false, options.droop);
  whiskerSide(ctx, options, true, options.droop);

  ctx.lineWidth = 8;
};
