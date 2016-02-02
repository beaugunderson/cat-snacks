'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.save()
  ctx.translate(options.centerX, options.centerY);

  // how far up the glasses the rim should appear
  var rimDivider = _.random(2, 5)
  var rimSize = _.random(7, 12)
  var rimColor = _.sample(["#000", "#8B0000", " #A52A2A", "#6617b5", "#b56617", "#1766b5", "#daf650"])
  // the radius from center of eye to rim of glasses for each axis
  var xRad = options.eyeSize * _.random(2.5, 4)
  var yRad = options.eyeSize * _.random(1.75, 2.5)
  var isWearingSunglassesAtNight = _.random(0, 1) < 0.5
  var glassesTintLevel = _.random(0, 0.5)
  var glassesTint = _.sample([[0, 0, 0], [22, 55, 33], [40, 80, 60], [255, 105, 180], [25, 50, 13], [239, 89, 123], [243, 243, 21], [139, 69, 19], [10, 15, 5]])

  // does node have string interps yet? no? ok, fine, TODO make this less awful.
  ctx.fillStyle = "rgba(" + glassesTint[0] + ", " + glassesTint[1] + ", " + glassesTint[2] + ", " + glassesTintLevel + ")";
  ctx.lineWidth = rimSize;
  ctx.strokeStyle = rimColor;

  // left side
  ctx.beginPath();
  ctx.rect(-options.headWidth * 0.4 - xRad, options.eyeOffsetY - yRad, xRad * 2, yRad * 2);
  ctx.stroke();
  if (isWearingSunglassesAtNight) ctx.fill();

  // right side
  ctx.beginPath();
  ctx.rect(options.headWidth * 0.4 - xRad, options.eyeOffsetY - yRad, xRad * 2, yRad * 2);
  ctx.stroke();
  if (isWearingSunglassesAtNight) ctx.fill();

  // the bridge
  // TODO: sometimes draw a bezier curve from edge of one rect to the other... :<
  ctx.moveTo(-options.headWidth * 0.4 + xRad, options.eyeOffsetY + yRad / rimDivider);
  ctx.lineTo(options.headWidth * 0.4 - xRad, options.eyeOffsetY + yRad / rimDivider);
  ctx.stroke();


  ctx.restore()

};
