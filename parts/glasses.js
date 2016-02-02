'use strict';

var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.save()
  ctx.translate(options.centerX, options.centerY);

  // how far up the glasses the rim should appear
  var rimDivider = _.random(2, 5)
  var rimSize = _.random(7, 12)
  // the radius from center of eye to rim of glasses for each axis
  var xRad = options.eyeSize * _.random(2.5, 4)
  var yRad = options.eyeSize * _.random(1.75, 2.5)
  var glassesColor = _.sample(["#000", "#6617b5", "#b56617", "#1766b5", "#daf650"])


  ctx.lineWidth = rimSize
  ctx.strokeStyle = glassesColor

  ctx.beginPath()
  ctx.rect(-options.headWidth * 0.4 - xRad, options.eyeOffsetY - yRad, xRad * 2, yRad * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.rect(options.headWidth * 0.4 - xRad, options.eyeOffsetY - yRad, xRad * 2, yRad * 2)
  ctx.stroke()

  ctx.moveTo(-options.headWidth * 0.4 + xRad, options.eyeOffsetY + yRad / rimDivider)
  ctx.lineTo(options.headWidth * 0.4 - xRad, options.eyeOffsetY + yRad / rimDivider)
  ctx.stroke()


  // TODO: sometimes draw a bezier curve from edge of one rect to the other... :<

  ctx.restore()

};
