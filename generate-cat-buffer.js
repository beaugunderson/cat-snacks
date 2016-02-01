'use strict';

var Canvas = require('canvas-utilities').Canvas;
var cat = require('./generate-cat');

module.exports = function catBuffer(dimension, drawControlPoints, cb) {
  var canvas = new Canvas(dimension, dimension);

  cat(canvas, dimension, drawControlPoints);

  canvas.toBuffer(cb);
};
