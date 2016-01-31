'use strict';

var bezierTo = require('./bezier-to.js');
var Color = require('color');

function tabbyForeheadStripeSide(ctx, options, flip) {
  var offset = flip ? -1 : 1;
  var markingWidth = options.headWidth * 0.3 * options.tabbyFactorX;
  var markingHeight = options.headHeight * 0.45 * options.tabbyFactorY;

  bezierTo(
    ctx,
    markingWidth * offset,
    -options.headHeight,

    // control point 1
    markingWidth * 0.5 * offset,
    -markingHeight,

    // control point 2
    markingWidth * 0.2 * offset,
    -markingHeight,

    markingWidth * 0.6 * offset,
    -options.headHeight);
}

function tabbyForeheadStripeCenter(ctx, options) {
  var markingWidth = options.headWidth * 0.1 * options.tabbyFactorX;
  var markingHeight = options.headHeight * 0.5 * options.tabbyFactorY;

  bezierTo(
    ctx,
    -markingWidth,
    -options.headHeight,

    // control point 1
    -markingWidth * 0.1,
    -markingHeight,

    // control point 2
    markingWidth * 0.1,
    -markingHeight,

    markingWidth,
    -options.headHeight);
}

module.exports = function tabbyMarkings(ctx, options) {
  ctx.fillStyle = Color(options.catColor)
    .darken(0.1)
    .hexString();

  tabbyForeheadStripeSide(ctx, options, false);
  tabbyForeheadStripeSide(ctx, options, true);
  tabbyForeheadStripeCenter(ctx, options);
};
