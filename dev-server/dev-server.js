'use strict';

var cat = require('../generate-cat.js');
var grid = require('../generate-grid.js');
var $ = require('jquery');

var DIMENSION = 800;

function draw() {
  var controlPointsChecked = $('#control-points').is(':checked');
  var gridChecked = $('#grid').is(':checked');

  $('#cat-container').html('');

  if (gridChecked) {
    $('#cat-container').addClass('grid');
    $('#cat-container').append(grid(DIMENSION, 5));
  } else {
    $('#cat-container').removeClass('grid');
    $('#cat-container').append(cat(DIMENSION, controlPointsChecked));
  }
}

$(function () {
  draw();

  $('#another').click(draw);
  $('#control-points').click(draw);
  $('#grid').click(draw);
});
