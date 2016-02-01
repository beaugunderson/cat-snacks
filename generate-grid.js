'use strict';

var async = require('async');
var Canvas = require('canvas-utilities').Canvas;
var Image = require('canvas').Image;
var cat = require('./generate-cat.js');

module.exports = function (dimension, divisions, cb) {
  var canvas = new Canvas(dimension, dimension);
  var ctx = canvas.getContext('2d');

  var spacingPx = 5;
  var catDimension = (dimension - (spacingPx * (divisions - 1))) / divisions;

  function drawCatOnCanvas(row, column, buffer) {
    var unit = catDimension + spacingPx;

    var x = spacingPx + (unit * column);
    var y = spacingPx + (unit * row);

    var img = new Image();
    img.src = buffer;
    ctx.drawImage(img, x, y);
  }

  var coordinates = [];

  for (var i = 0; i < divisions; i++) {
    for (var j = 0; j < divisions; j++) {
      coordinates.push([i, j]);
    }
  }

  async.eachSeries(coordinates, function (coordinate, cbEachSeries) {
    var catCanvas = cat(catDimension, false);

    catCanvas.toBuffer(function (err, buffer) {
      drawCatOnCanvas(coordinate[0], coordinate[1], buffer);

      cbEachSeries();
    });
  }, function () {
    canvas.toBuffer(cb);
  });
};
