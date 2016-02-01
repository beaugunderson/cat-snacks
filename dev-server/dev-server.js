'use strict';

var cat = require('../generate-cat.js');
var $ = require('jquery');

var DIMENSION = 800;

function draw() {
  var controlPoints = $('#control-points').is(':checked');

  $('#cat-container').html('');
  $('#cat-container').append(cat(DIMENSION, controlPoints));
}

$(function () {
  draw();

  $('#another').click(draw);
  $('#control-points').click(draw);
});
