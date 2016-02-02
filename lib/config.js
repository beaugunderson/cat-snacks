'use strict';

var _ = require('lodash');

// TODO: define sets of colors that look nice together (so you don't get a face
// color that 's the same as the eye color, for example), or maybe pick based
// on not having a contrast between colors that's too low?
var HEAD_COLORS = [
  '#ffffff',
  '#cccccc',
  '#edcbaa',
  '#dacae0',
  '#d4cdc5'
];

var EYE_COLORS = [
  '#013391',
  '#704E0C',
  '#000000',
  '#333333',
  '#02779e'
];

var BACKGROUND_COLORS = [
  '#3e3433',
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
    eyeColor: _.sample(EYE_COLORS),
    backgroundColor: _.sample(BACKGROUND_COLORS),

    // eyes
    oddEyePercentage: 15,
    oddEyeColor: _.sample(EYE_COLORS),

    // markings
    tabbyFactorX: _.random(0.9, 1.2),
    tabbyFactorY: _.random(0.9, 1.1),

    // whiskers
    droop: _.random(0, 1) < 0.5,
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
  options.eyeSize = options.headWidth * _.random(0.065, 0.08);

  return options;
};
