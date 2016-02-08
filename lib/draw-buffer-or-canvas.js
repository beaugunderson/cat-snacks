'use strict';

var Canvas = require('canvas-utilities').Canvas;

module.exports = function (ctx, bufferOrCanvas, x, y, width, height) {
  var source = bufferOrCanvas;

  if (bufferOrCanvas.nodeName !== 'CANVAS') {
    var img = new Canvas.Image();
    img.src = bufferOrCanvas;

    source = img;
  }

  if (width && height) {
    ctx.drawImage(source, x, y, width, height);
  } else {
    ctx.drawImage(source, x, y);
  }
};
