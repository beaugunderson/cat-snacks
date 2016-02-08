'use strict';

var Color = require('color');
var poissonDiscSampler = require('poisson-disc-sampler');
var _ = require('lodash');

function contrastColor(color) {
  var direction = _.sample([1, -1]);

  return Color(color)
    .lighten(direction * _.random(0.025, 0.2))
    .hexString();
}

function star(ctx, x, y, radius, points, ratio) {
  ctx.save();

  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, 0 - radius);

  for (var i = 0; i < points; i++) {
    ctx.rotate(Math.PI / points);
    ctx.lineTo(0, 0 - (radius * ratio));
    ctx.rotate(Math.PI / points);
    ctx.lineTo(0, 0 - radius);
  }

  ctx.fill();

  ctx.restore();
}

function jaggedBackground(ctx, options) {
  ctx.fillStyle = contrastColor(options.backgroundColor);

  star(ctx,
       options.centerX, options.centerY,
       options.width / 2.2, 14, 0.85);

  ctx.fill();

  solidBackground(ctx, options);
}

function starBackground(ctx, options) {
  ctx.fillStyle = contrastColor(options.backgroundColor);

  var rotation = _.random(0, 100) > 50;
  var starSize = _.random(0.05 * options.width, 0.25 * options.width);
  var sampler = poissonDiscSampler(options.width, options.height,
                                   starSize * 1.2);

  var sample;

  while ((sample = sampler())) {
    ctx.save();

    ctx.translate(sample[0], sample[1]);

    if (rotation) {
      ctx.rotate(_.random(0, 360));
    }

    ctx.beginPath();

    star(ctx, 0, 0, starSize / 2, 5, 0.5);

    ctx.fill();

    ctx.restore();
  }

  solidBackground(ctx, options);
}

function dotBackground(ctx, options) {
  ctx.fillStyle = contrastColor(options.backgroundColor);

  var dotSize = _.random(0.05 * options.width, 0.25 * options.width);
  var sampler = poissonDiscSampler(options.width, options.height,
                                   dotSize * 1.2);

  var sample;

  while ((sample = sampler())) {
    ctx.beginPath();

    ctx.ellipse(sample[0], sample[1],
                dotSize / 2, dotSize / 2,
                0, 0, 2 * Math.PI, false);

    ctx.fill();
  }

  solidBackground(ctx, options);
}

function circleBackground(ctx, options) {
  ctx.fillStyle = contrastColor(options.backgroundColor);

  ctx.beginPath();

  ctx.ellipse(options.centerX, options.centerY,
              options.width / 2.1, options.height / 2.1,
              0, 0, 2 * Math.PI, false);
  ctx.fill();

  solidBackground(ctx, options);
}

function solidBackground(ctx, options) {
  ctx.fillStyle = options.backgroundColor;
  ctx.fillRect(0, 0, options.width, options.height);
}

module.exports = function (ctx, options) {
  ctx.globalCompositeOperation = 'destination-over';

  ctx.save();

  _.sample([
    circleBackground,
    jaggedBackground,
    solidBackground,
    dotBackground,
    starBackground
  ])(ctx, options);

  ctx.restore();

  ctx.globalCompositeOperation = 'source-over';
};
