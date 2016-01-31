'use strict';

var Color = require('color');
var earInsides = require('./ear-insides.js');
var _ = require('lodash');

module.exports = function (ctx, options) {
  ctx.globalCompositeOperation = 'source-atop';

  _.sample([function () {
    _.sample([function () {
      // chin
      ctx.fillStyle = Color(options.catColor).darken(0.1).hexString();
      ctx.fillRect(0, 0, options.width, options.height);

      // face
      ctx.beginPath();
      ctx.ellipse(options.centerX,
                  options.centerY - options.headHeight * _.random(0.6, 0.9),
                  250,
                  options.headHeight * 1.5,
                  0, 0, 2 * Math.PI);
      ctx.fillStyle = options.catColor;
      ctx.fill();
    }, function () {
      ctx.fillStyle = options.catColor;
      ctx.fillRect(0, 0, options.width, options.height);

      if (_.random(0, 100) >= 66) {
        ctx.beginPath();
        earInsides(ctx, options);
        ctx.fill();
      }
    }])();
  }, function () {
    // background
    ctx.fillStyle = Color(options.catColor).lighten(0.15).hexString();
    ctx.fillRect(0, 0, options.width, options.height);

    var spotSize = _.random(65, 85);

    ctx.beginPath();
    ctx.ellipse(options.centerX + ((options.headWidth * 0.45) * _.sample([1, -1])),
                options.centerY - options.headHeight * _.random(0.25, 0.55),
                spotSize * _.random(1.0, 1.5),
                spotSize,
                0, 0, 2 * Math.PI);
    ctx.fillStyle = Color(options.catColor).darken(0.1).hexString();
    ctx.fill();
  }])();
};
