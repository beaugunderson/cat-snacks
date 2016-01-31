'use strict';

var Canvas = require('canvas-utilities').Canvas;
var cat = require('./generate-cat');

module.exports = function catBuffer(cb) {
  var canvas = new Canvas(600, 600);

  cat(canvas);

  canvas.toBuffer(cb);
};
