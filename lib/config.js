'use strict';

var Color = require('color');
var _ = require('lodash');

var HEAD_COLORS = [
  '#434446',
  '#7e8283',
  '#c67120',
  '#cccccc',
  '#d4cdc5',
  '#dacae0',
  '#e07251',
  '#eab845',
  '#edcbaa',
  '#ffffff'
];

var EYE_COLORS = [
  '#013391',
  '#704E0C',
  '#000000',
  '#333333',
  '#02779e'
];

var NOSE_COLORS = [
  'black',
  '#ffc9c2',
  '#e4b3bd',
  '#d66772'
];

var BACKGROUND_COLORS = [
  '#3e3433',
  '#75a480',
  '#66757f',
  '#999999',
  '#cccccc',
  '#fff18c',
  'white'
];

var HEAD_SHAPES = [
  'ellipse',
  'triangular'
];

function isContrastingEnough(a, b) {
  return Color(a).contrast(Color(b)) >= 1.5;
}

function randomHighContrast(base, choices) {
  var criteria = _.partial(isContrastingEnough, base);

  var highContrast = choices.filter(criteria);

  if (highContrast.length) {
    return _.sample(highContrast);
  }

  return _.sample(choices);
}

module.exports = function (dimension) {
  var options = {
    // dimensions
    width: dimension,
    height: dimension,
    headWidth: _.random(dimension * 0.3, dimension * 0.4),
    headHeight: _.random(dimension * 0.15, dimension * 0.275),
    headShape: _.sample(HEAD_SHAPES),
    headAngleFactor: _.random(0.75, 0.9),
    centerX: dimension / 2,
    centerY: dimension / 2,
    earFactorX: _.random(0.9, 1.15),
    earFactorY: _.random(0.9, 1.1),

    // colors
    catColor: _.sample(HEAD_COLORS),

    // eyes
    oddEyePercentage: 15,
    oddEyeColor: _.sample(EYE_COLORS),

    // markings
    tabbyFactorX: _.random(0.9, 1.2),
    tabbyFactorY: _.random(0.9, 1.1),

    // accessories
    // TODO: increase this probability once there are more accessories
    accessories: _.random(0, 100) >= 90,

    // whiskers
    whiskers: _.random(0, 100) >= 66,
    droop: _.random(0, 1) < 0.5,
    whiskerFactorX: _.random(0.85, 1.01),
    whiskerFactorY: _.random(0.85, 1.01),

    // I originally wrote all of this with the width/height of 600; therefore we
    // need to scale all of the line widths, sizes, etc. to compensate for
    // differing dimensions
    scaleFactor: dimension / 600,

    // to keep track of things that are drawn more than once to get the fill
    // and stroke separately
    usedFunctions: {}
  };

  var contrastsWithBase = _.partial(randomHighContrast, options.catColor);

  options.eyeColor = contrastsWithBase(EYE_COLORS);
  options.noseColor = contrastsWithBase(NOSE_COLORS);
  options.backgroundColor = contrastsWithBase(BACKGROUND_COLORS);

  options.eyeOffsetY = -options.headHeight * _.random(0.25, 0.35);
  options.noseOffsetY = options.headHeight * _.random(-0.05, 0.2);

  options.mouthWidth = options.headWidth * _.random(0.25, 0.35);
  options.mouthHeight = options.headHeight * _.random(0.15, 0.35);
  options.eyeSize = options.headWidth * _.random(0.065, 0.08);

  return options;
};
