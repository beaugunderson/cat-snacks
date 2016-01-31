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

var HEAD_COLORS = [
  '#ffffff',
  '#cccccc',
  '#edcbaa',
  '#dacae0'
];

var EYE_COLORS = [
  //'#013391',
  '#000000',
  //'#704E0C',
  '#333333'
];

function cat(canvas, drawControlPoints) {
  var ctx = canvas.getContext('2d');

  // Math.seedrandom('meow');

  // Make lodash use our seeded random
  //_ = _.runInContext();

  var options = {
    width: canvas.width,
    height: canvas.height,
    headWidth: _.random(canvas.width * 0.3, canvas.width * 0.4),
    headHeight: _.random(canvas.height * 0.15, canvas.height * 0.275),
    centerX: canvas.width / 2,
    centerY: canvas.height / 2,
    earFactorX: _.random(0.9, 1.15),
    earFactorY: _.random(0.9, 1.1),
    tabbyFactorX: _.random(0.9, 1.2),
    tabbyFactorY: _.random(0.9, 1.1),
    catColor: _.sample(HEAD_COLORS),
    eyeColor: _.sample(EYE_COLORS),
    droop: Math.random() < 0.5,
    whiskerFactorX: _.random(0.85, 1.01),
    whiskerFactorY: _.random(0.85, 1.01)
  };

  options.noseOffsetY = options.centerY +
    (options.headHeight * _.random(-0.05, 0.2));

  options.eyeOffsetY = options.centerY -
    (options.headHeight * _.random(0.25, 0.35));

  options.mouthWidth = options.headWidth * _.random(0.25, 0.35);
  options.mouthHeight = options.headHeight * _.random(0.15, 0.35);

  ctx.fillStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineWidth = '8';

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
    bezierTo.points.forEach(p => controlPoint.apply(null, [ctx].concat(p)));
  }
}

module.exports = function (cb) {
  var canvas = new Canvas(600, 600);

  cat(canvas);

  canvas.toBuffer(cb);
};
