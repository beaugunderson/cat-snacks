'use strict';

var background = require('../parts/background.js');
var bezierTo = require('./bezier-to.js');
var Canvas = require('canvas-utilities').Canvas;
var config = require('./config.js');
var controlPoint = require('./control-point.js');
var eyes = require('../parts/eyes.js');
var headMarkings = require('../parts/head-markings.js');
var headMask = require('../parts/head-mask.js');
var headOutline = require('../parts/head-outline.js');
var mouth = require('../parts/mouth.js');
var nose = require('../parts/nose.js');
var whiskers = require('../parts/whiskers.js');
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

  mouth(ctx, options);
  nose(ctx, options);
  eyes(ctx, options);

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
