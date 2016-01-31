'use strict';

var Canvas = require('canvas-utilities').Canvas;
var Color = require('color');

var fs = require('fs');
var _ = require('lodash');

var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 600;

var canvas = new Canvas(CANVAS_WIDTH, CANVAS_HEIGHT);
var ctx = canvas.getContext('2d');

var CENTER_X = CANVAS_WIDTH / 2;
var CENTER_Y = CANVAS_WIDTH / 2;

var HEAD_COLORS = [
  '#ffffff',
  '#cccccc',
  '#edcbaa',
  '#dacae0'
];

var EYE_COLORS = [
  //'#013391',
  '#000000',
  //'#704E0C',
  '#333333'
];

function cat(drawControlPoints) {
  // Math.seedrandom('meow');

  // Make lodash use our seeded random
  //_ = _.runInContext();

  var HEAD_WIDTH = _.random(CANVAS_WIDTH * 0.3, CANVAS_WIDTH * 0.4);
  var HEAD_HEIGHT = _.random(CANVAS_HEIGHT * 0.15, CANVAS_HEIGHT * 0.275);

  var NOSE_OFFSET_Y = CENTER_Y + (HEAD_HEIGHT * _.random(-0.05, 0.2));
  var EYE_OFFSET_Y = CENTER_Y - (HEAD_HEIGHT * _.random(0.25, 0.35));

  var MOUTH_WIDTH = HEAD_WIDTH * _.random(0.25, 0.35);
  var MOUTH_HEIGHT = HEAD_HEIGHT * _.random(0.15, 0.35);

  var CAT_COLOR = _.sample(HEAD_COLORS);
  var EYE_COLOR = _.sample(EYE_COLORS);

  var EAR_FACTOR_X = _.random(0.9, 1.15);
  var EAR_FACTOR_Y = _.random(0.9, 1.1);

  ctx.fillStyle = '#999999';

  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = 'white';
  ctx.lineCap = 'round';
  ctx.lineWidth = '8';

  var controlPoints = [];

  function controlPoint(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
    ctx.beginPath();

    var oldFillStyle = ctx.fillStyle;
    var oldStrokeStyle = ctx.strokeStyle;
    var oldLineWidth = ctx.lineWidth;

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;

    ctx.moveTo(x1, y1);
    ctx.lineTo(cx1, cy1);
    ctx.moveTo(x2, y2);
    ctx.lineTo(cx2, cy2);

    ctx.stroke();

    ctx.lineWidth = oldLineWidth;

    ctx.beginPath();

    ctx.ellipse(cx1, cy1, 3, 3, 0, 0, 2 * Math.PI);
    ctx.ellipse(cx2, cy2, 3, 3, 0, 0, 2 * Math.PI);

    ctx.fill();

    ctx.fillStyle = oldFillStyle;
    ctx.strokeStyle = oldStrokeStyle;
  }

  function bezierTo(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
    controlPoints.push([x1, y1, cx1, cy1, cx2, cy2, x2, y2]);

    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
  }

  function head() {
    ctx.ellipse(CENTER_X, CENTER_Y,
                HEAD_WIDTH, HEAD_HEIGHT,
                0, 0, 2 * Math.PI);
  }

  function headMask() {
    ctx.beginPath();
    head();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.stroke();

    ctx.beginPath();
    ears();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.stroke();
  }

  function headMarkings() {
    ctx.globalCompositeOperation = 'source-atop';

    _.sample([function () {
      _.sample([function () {
        // chin
        ctx.fillStyle = Color(CAT_COLOR).darken(0.1).hexString();
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // face
        ctx.beginPath();
        ctx.ellipse(CENTER_X,
                    CENTER_Y - HEAD_HEIGHT * _.random(0.6, 0.9),
                    250,
                    HEAD_HEIGHT * 1.5,
                    0, 0, 2 * Math.PI);
        ctx.fillStyle = CAT_COLOR;
        ctx.fill();
      }, function () {
        ctx.fillStyle = CAT_COLOR;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (_.random(0, 100) >= 66) {
          ctx.beginPath();
          earInsides();
          ctx.fill();
        }
      }])();
    }, function () {
      // background
      ctx.fillStyle = Color(CAT_COLOR).lighten(0.15).hexString();
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      var spotSize = _.random(65, 85);

      ctx.beginPath();
      ctx.ellipse(CENTER_X + ((HEAD_WIDTH * 0.45) * _.sample([1, -1])),
                  CENTER_Y - HEAD_HEIGHT * _.random(0.25, 0.55),
                  spotSize * _.random(1.0, 1.5),
                  spotSize,
                  0, 0, 2 * Math.PI);
      ctx.fillStyle = Color(CAT_COLOR).darken(0.1).hexString();
      ctx.fill();
    }])();
  }

  function headOutline() {
    ctx.fillStyle = 'black';
    ctx.globalCompositeOperation = 'destination-over';

    ctx.lineWidth = 9;

    // head
    ctx.beginPath();
    head();
    ctx.stroke();

    ctx.beginPath();
    ears();
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = 'black';
  }

  function eyes() {
    ctx.beginPath();

    var eyeSize = HEAD_WIDTH * _.random(0.065, 0.08);

    // left eye
    ctx.ellipse(CENTER_X - HEAD_WIDTH * 0.4,
                EYE_OFFSET_Y,
                eyeSize,
                eyeSize,
                0, 0, 2 * Math.PI);

    // right eye
    ctx.ellipse(CENTER_X + HEAD_WIDTH * 0.4,
                EYE_OFFSET_Y,
                eyeSize,
                eyeSize,
                Math.PI / 2, 0, 2 * Math.PI);

    ctx.fillStyle = EYE_COLOR;
    ctx.fill();
  }

  function ear(flip) {
    var offset = flip ? -1 : 1;

    bezierTo(CENTER_X - HEAD_WIDTH * 0.8 * offset,
             CENTER_Y - HEAD_HEIGHT * 0.5,

             // control point 1
             CENTER_X - HEAD_WIDTH * (0.8 * EAR_FACTOR_X) * offset,
             CENTER_Y - HEAD_HEIGHT * (1.35 * EAR_FACTOR_Y),

             // control point 2
             CENTER_X - HEAD_WIDTH * (0.65 * EAR_FACTOR_X) * offset,
             CENTER_Y - HEAD_HEIGHT * (1.35 * EAR_FACTOR_Y),

             CENTER_X - HEAD_WIDTH * 0.4 * offset,
             CENTER_Y - HEAD_HEIGHT * 0.8);
  }

  function ears() {
    ear(false);
    ear(true);
  }

  function earInside(flip) {
    var offset = flip ? -1 : 1;

    bezierTo(CENTER_X - HEAD_WIDTH * 0.725 * offset,
             CENTER_Y - HEAD_HEIGHT * 0.55,

             // control point 1
             CENTER_X - HEAD_WIDTH * (0.725 * EAR_FACTOR_X) * offset,
             CENTER_Y - HEAD_HEIGHT * (1.2 * EAR_FACTOR_Y),

             // control point 2
             CENTER_X - HEAD_WIDTH * (0.7 * EAR_FACTOR_X) * offset,
             CENTER_Y - HEAD_HEIGHT * (1.2 * EAR_FACTOR_Y),

             CENTER_X - HEAD_WIDTH * 0.45 * offset,
             CENTER_Y - HEAD_HEIGHT * 0.75);
  }

  function earInsides() {
    ctx.fillStyle = Color(CAT_COLOR).lighten(_.sample([-0.1, 0.3])).hexString();

    earInside(false);
    earInside(true);
  }

  function mouth() {
    ctx.beginPath();

    // left side
    bezierTo(CENTER_X, NOSE_OFFSET_Y,
             CENTER_X - MOUTH_WIDTH * 0.25, NOSE_OFFSET_Y + MOUTH_HEIGHT,
             CENTER_X - MOUTH_WIDTH * 0.75, NOSE_OFFSET_Y + MOUTH_HEIGHT,
             CENTER_X - MOUTH_WIDTH, NOSE_OFFSET_Y * 1.05);

    // right side
    bezierTo(CENTER_X, NOSE_OFFSET_Y,
             CENTER_X + MOUTH_WIDTH * 0.25, NOSE_OFFSET_Y + MOUTH_HEIGHT,
             CENTER_X + MOUTH_WIDTH * 0.75, NOSE_OFFSET_Y + MOUTH_HEIGHT,
             CENTER_X + MOUTH_WIDTH, NOSE_OFFSET_Y * 1.05);

    ctx.stroke();
  }

  function nose() {
    ctx.beginPath();
    ctx.ellipse(CENTER_X,
                NOSE_OFFSET_Y,
                HEAD_WIDTH * _.random(0.05, 0.1),
                HEAD_HEIGHT * _.random(0.025, 0.065),
                0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  function whiskerSide(flip) {
    var offset = flip ? -1 : 1;

    var whiskerOffset = NOSE_OFFSET_Y * 1.025;
    var whiskerSpread = HEAD_HEIGHT * _.random(0.1, 0.2);

    ctx.beginPath();

    ctx.moveTo(CENTER_X + HEAD_WIDTH * 0.475 * offset,
               whiskerOffset - whiskerSpread);
    ctx.lineTo(CENTER_X + HEAD_WIDTH * 1.1 * offset,
               whiskerOffset - whiskerSpread * 1.5);

    ctx.moveTo(CENTER_X + HEAD_WIDTH * 0.5 * offset, whiskerOffset);
    ctx.lineTo(CENTER_X + HEAD_WIDTH * 1.125 * offset, whiskerOffset);

    ctx.moveTo(CENTER_X + HEAD_WIDTH * 0.475 * offset,
               whiskerOffset + whiskerSpread);
    ctx.lineTo(CENTER_X + HEAD_WIDTH * 1.1 * offset,
               whiskerOffset + whiskerSpread * 1.5);

    ctx.stroke();
  }

  function whiskers() {
    ctx.lineWidth = 5;

    whiskerSide(false);
    whiskerSide(true);

    ctx.lineWidth = 8;
  }

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  headMask();

  headMarkings();

  headOutline();

  nose();
  eyes();
  mouth();

  if (_.random(0, 100) >= 66) {
    whiskers();
  }

  if (drawControlPoints) {
    controlPoints.forEach(point => controlPoint.apply(null, point));
  }
}

cat();

// setInterval(cat, 500);

canvas.toBuffer(function (err, buffer) {
  fs.writeFileSync('./output.png', buffer);
});
