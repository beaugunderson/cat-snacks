/**
 * lib/pixelate.js
 *
 * Based on the 8bit package by rogeriopvl (MIT license).
 * https://www.npmjs.com/package/8bit
 */

'use strict';

var Canvas = require('canvas-utilities').Canvas;

function reduceColor(val) {
  return val - (val % 32);
}

module.exports = function (canvas, ctx, pxlWidth) {
  // Step 1: Draw the cat image on a tiny little canvas.

  var pxlHeight = pxlWidth * (canvas.width / canvas.height);
  var pxlCanvas = new Canvas(pxlWidth, pxlHeight);
  var pxlCtx = pxlCanvas.getContext('2d');

  var sourceImg = new Canvas.Image();
  sourceImg.src = canvas.toBuffer();
  pxlCtx.drawImage(sourceImg, 0, 0, pxlWidth, pxlHeight);

  // Step 2: Reduce the colour depth.

  var pxlImageData = pxlCtx.getImageData(0, 0, pxlWidth, pxlHeight);
  var pixels = pxlImageData.data;
  var numPixels = pixels.length;

  for (var i = 0; i < numPixels; i++) {
    pixels[i]     = reduceColor(pixels[i]);
    pixels[i + 1] = reduceColor(pixels[i + 1]);
    pixels[i + 2] = reduceColor(pixels[i + 2]);
  }

  pxlCtx.putImageData(pxlImageData, 0, 0);

  // Step 3: Draw the tiny image over the original canvas,
  // stretching the image without smoothing the pixels.

  var pxlBuffer = pxlCanvas.toBuffer();

  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  var pxlImg = new Canvas.Image();
  pxlImg.src = pxlBuffer;
  ctx.drawImage(pxlImg, 0, 0, canvas.width, canvas.height);

  ctx.mozImageSmoothingEnabled = true;
  ctx.webkitImageSmoothingEnabled = true;
  ctx.imageSmoothingEnabled = true;
};
