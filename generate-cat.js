'use strict';

var Canvas = require('canvas-utilities').Canvas;
var _ = require('lodash');

var background = require('./lib/background.js');
var bezierTo = require('./lib/bezier-to.js');
var controlPoint = require('./lib/control-point.js');
var eyes = require('./lib/eyes.js');
var headMarkings = require('./lib/head-markings.js');
var headMask = require('./lib/head-mask.js');
var headOutline = require('./lib/head-outline.js');
var mouth = require('./lib/mouth.js');
var nose = require('./lib/nose.js');
var whiskers = require('./lib/whiskers.js');

// TODO: define sets of colors that look nice together (so you don't get a face
// color that 's the same as the eye color, for example), or maybe pick based
// on not having a contrast between colors that's too low?
var HEAD_COLORS = [
  '#ffffff',
  '#cccccc',
  '#edcbaa',
  '#dacae0'
];

var EYE_COLORS = [
  '#013391',
  '#704E0C',
  '#000000',
  '#333333',
  '#02779e'
];

var BACKGROUND_COLORS = [
  '#75a480',
  '#66757f',
  '#999999',
  '#cccccc',
  'white'
];

var HEAD_SHAPES = [
  'ellipse',
  'triangular'
];

module.exports = function (dimension, drawControlPoints) {
  var canvas = new Canvas(dimension, dimension);
  var ctx = canvas.getContext('2d');

  // Math.seedrandom('meow');

  // Make lodash use our seeded random
  //_ = _.runInContext();

  var options = {
    // dimensions
    width: canvas.width,
    height: canvas.height,
    headWidth: _.random(canvas.width * 0.3, canvas.width * 0.4),
    headHeight: _.random(canvas.height * 0.15, canvas.height * 0.275),
    headShape: _.sample(HEAD_SHAPES),
    headAngleFactor: _.random(0.75, 0.9),
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    earFactorX: _.random(0.9, 1.15),
    earFactorY: _.random(0.9, 1.1),

    // colors
    catColor: _.sample(HEAD_COLORS),
    eyeColor: _.sample(EYE_COLORS),
    backgroundColor: _.sample(BACKGROUND_COLORS),

    // eyes
    oddEyePercentage: 15,
    oddEyeColor: _.sample(EYE_COLORS),

    // markings
    tabbyFactorX: _.random(0.9, 1.2),
    tabbyFactorY: _.random(0.9, 1.1),

    // whiskers
    droop: Math.random() < 0.5,
    whiskerFactorX: _.random(0.85, 1.01),
    whiskerFactorY: _.random(0.85, 1.01),

    // I originally wrote all of this with the width/height of 600; therefore we
    // need to scale all of the line widths, sizes, etc. to compensate for
    // differing dimensions
    scaleFactor: dimension / 600
  };

  options.eyeOffsetY = -options.headHeight * _.random(0.25, 0.35);
  options.noseOffsetY = options.headHeight * _.random(-0.05, 0.2);

  options.mouthWidth = options.headWidth * _.random(0.25, 0.35);
  options.mouthHeight = options.headHeight * _.random(0.15, 0.35);

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
