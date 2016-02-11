'use strict';

var _ = require('lodash');

// TODO: move colors to their own module?
var RIM_COLORS = [
  '#000',
  '#1766b5',
  '#6617b5',
  '#8b0000',
  '#a52a2a',
  '#b56617',
  '#daf650'
];

var TINT_COLORS = [
  [0, 0, 0],
  [10, 15, 5],
  [22, 55, 33],
  [25, 50, 13],
  [40, 80, 60],
  [139, 69, 19],
  [239, 89, 123],
  [243, 243, 21],
  [255, 105, 180]
];

module.exports = function (ctx) {
  var {centerX, centerY, eyeOffsetY, eyeSize, headWidth, scaleFactor} =
    require('../lib/config.js');

  ctx.save();

  ctx.translate(centerX, centerY);

  // how far up the glasses the rim should appear
  var rimDivider = _.random(2, 5);
  var rimSize = _.random(7, 12);
  var rimColor = _.sample(RIM_COLORS);
  // the radius from center of eye to rim of glasses for each axis
  var xRad = eyeSize * _.random(2.5, 4);
  var yRad = eyeSize * _.random(1.75, 2.5);
  var isWearingSunglassesAtNight = _.random(0, 1) < 0.5;
  var glassesTintLevel = _.random(0, 0.5);
  var glassesTint = _.sample(TINT_COLORS);

  ctx.fillStyle = `rgba(${glassesTint[0]}, ${glassesTint[1]}, ${glassesTint[2]}, ${glassesTintLevel})`;
  ctx.lineWidth = rimSize * scaleFactor;
  ctx.strokeStyle = rimColor;

  ctx.beginPath();

  ctx.rect(-headWidth * 0.4 - xRad, eyeOffsetY - yRad, xRad * 2, yRad * 2);
  ctx.rect(headWidth * 0.4 - xRad, eyeOffsetY - yRad, xRad * 2, yRad * 2);

  if (isWearingSunglassesAtNight) {
    ctx.fill();
  }

  ctx.stroke();

  // the bridge
  // TODO: sometimes draw a bezier curve from edge of one rect to the other... :<
  ctx.moveTo(-headWidth * 0.4 + xRad, eyeOffsetY + yRad / rimDivider);
  ctx.lineTo(headWidth * 0.4 - xRad, eyeOffsetY + yRad / rimDivider);

  ctx.stroke();

  ctx.restore();
};
