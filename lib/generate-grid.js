'use strict';

var async = require('async');
var drawBufferOrCanvas = require('./draw-buffer-or-canvas.js');
var Canvas = require('canvas-utilities').Canvas;
var cat = require('./generate-cat.js');

module.exports = function (dimension, divisions, cb) {
  var canvas = new Canvas(dimension, dimension);
  var ctx = canvas.getContext('2d');

  var spacingPx = 5;
  var catDimension = (dimension - (spacingPx * (divisions + 1))) / divisions;

  function drawCatOnCanvas(row, column, bufferOrCanvas) {
    var unit = catDimension + spacingPx;

    var x = spacingPx + (unit * column);
    var y = spacingPx + (unit * row);

    drawBufferOrCanvas(ctx, bufferOrCanvas, x, y);
  }

  var coordinates = [];

  for (var i = 0; i < divisions; i++) {
    for (var j = 0; j < divisions; j++) {
      coordinates.push([i, j]);
    }
  }

  // for the browser
  if (!canvas.toBuffer) {
    coordinates.forEach(function (coordinate) {
      var catCanvas = cat(catDimension, {pixelate: false});

      drawCatOnCanvas(coordinate[0], coordinate[1], catCanvas);
    });

    return canvas;
  }

  async.each(coordinates, function (coordinate, cbEachSeries) {
    var catCanvas = cat(catDimension, {pixelate: false});

    catCanvas.toBuffer(function (err, buffer) {
      drawCatOnCanvas(coordinate[0], coordinate[1], buffer);

      cbEachSeries();
    });
  }, function () {
    canvas.toBuffer(cb);
  });
};
