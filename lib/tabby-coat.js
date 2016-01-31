'use strict';

var bezierTo = require('./bezier-to.js');
var Color = require('color');
var _ = require('lodash');

function tabbyMarkingSide(ctx, options, flip) {
  var offset = flip ? -1 : 1;
  var markingWidth = options.headWidth * 0.3 * options.tabbyFactorX;
  var markingHeight = options.headHeight * 0.45 * options.tabbyFactorY;

  bezierTo(
    ctx,
    options.centerX + markingWidth * offset,
    options.centerY - options.headHeight,

    // control point 1
    options.centerX + (markingWidth * 0.5) * offset,
    options.centerY - markingHeight,

    // control point 2
    options.centerX + (markingWidth * 0.2) * offset,
    options.centerY - markingHeight,

    options.centerX + (markingWidth * 0.6) * offset,
    options.centerY - options.headHeight);
}

function tabbyMarkingCenter(ctx, options) {
  var markingWidth = options.headWidth * 0.1 * options.tabbyFactorX;
  var markingHeight = options.headHeight * 0.5 * options.tabbyFactorY;

  bezierTo(
    ctx,
    options.centerX - markingWidth,
    options.centerY - options.headHeight,

    // control point 1
    options.centerX - (markingWidth * 0.1),
    options.centerY - markingHeight,

    // control point 2
    options.centerX + (markingWidth * 0.1),
    options.centerY - markingHeight,

    options.centerX + markingWidth,
    options.centerY - options.headHeight);
}

module.exports = function earInsides(ctx, options) {
  ctx.fillStyle = Color(options.catColor)
    .darken(0.1)
    .hexString();

  tabbyMarkingSide(ctx, options, false);
  tabbyMarkingSide(ctx, options, true);
  tabbyMarkingCenter(ctx, options);
};
