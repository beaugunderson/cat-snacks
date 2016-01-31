'use strict';

var Canvas = require('canvas-utilities').Canvas;
var Image = require('canvas').Image;

var cat = require('./generate-cat.js');

// TODO get this from cat?
var catWidth = 600;

var howMany = 16;
var perRow = 4;
var spacingPx = 10;

var perCol = howMany / perRow;
var width = (catWidth * perRow) + (spacingPx * (perRow - 1));
var height = (catWidth * perCol) + (spacingPx * (perCol - 1));

function catGrid(canvas) {
  var ctx = canvas.getContext('2d');

  var buffers = [];

  function drawGridOnCanvas() {
    for (var i = 0; i < howMany; i++) {
      var col = i % perRow;
      var row = Math.floor(i / perRow);
      var unit = catWidth + spacingPx;
      var x = spacingPx + (unit * col);
      var y = spacingPx + (unit * row);

      var img = new Image;
      img.src = buffers[i];
      ctx.drawImage(img, x, y);
    }
  }

  for (var i = 0; i < howMany; i++) {
    cat(function (err, buffer) {
      buffers.push(buffer);
      if (buffers.length == howMany) {
        drawGridOnCanvas();
      }
    });
  }
}

module.exports = function (cb) {
  var canvas = new Canvas(width, height);

  catGrid(canvas);

  canvas.toBuffer(cb);
};
