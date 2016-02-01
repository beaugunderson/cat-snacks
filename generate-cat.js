'use strict';

var background = require('./lib/background.js');
var bezierTo = require('./lib/bezier-to.js');
var Canvas = require('canvas-utilities').Canvas;
var config = require('./lib/config.js');
var controlPoint = require('./lib/control-point.js');
var eyes = require('./lib/eyes.js');
var headMarkings = require('./lib/head-markings.js');
var headMask = require('./lib/head-mask.js');
var headOutline = require('./lib/head-outline.js');
var mouth = require('./lib/mouth.js');
var nose = require('./lib/nose.js');
var whiskers = require('./lib/whiskers.js');
var _ = require('lodash');

module.exports = function (dimension, drawControlPoints) {
  var canvas = new Canvas(dimension, dimension);
  var ctx = canvas.getContext('2d');

  // Math.seedrandom('meow');

  // Make lodash use our seeded random
  //_ = _.runInContext();

  var options = config(dimension);

  if (bezierTo.points) {
    bezierTo.points = [];
  }

  ctx.fillStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineWidth = 8 * options.scaleFactor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  headMask(ctx, options);
  headMarkings(ctx, options);
  headOutline(ctx, options);

  nose(ctx, options);
  eyes(ctx, options);
  mouth(ctx, options);

  if (_.random(0, 100) >= 66) {
    whiskers(ctx, options);
  }

  background(ctx, options);

  if (drawControlPoints) {
    ctx.save();
    ctx.translate(options.centerX, options.centerY);

    bezierTo.points.forEach(p => controlPoint.apply(null, [ctx].concat(p)));

    ctx.restore();
  }

  return canvas;
};
