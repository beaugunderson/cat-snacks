'use strict';

var cat = require('../lib/generate-cat.js');
var grid = require('../lib/generate-grid.js');
var $ = require('jquery');

var DIMENSION = 800;


function save() {
  const imageData = $('canvas').get(0)
    .toDataURL('image/png');

  const link = document.createElement('a');
  link.download = 'catsnack.png';
  link.href = imageData;
  link.click();
}

 function catsnacks({catsnacksPrefs = {}}) {
  const { gridLayout = false } = catsnacksPrefs;

  function draw() {
    $('#cat-container').html('')

    if (gridLayout) {
      $('#cat-container').addClass(gridLayout ? 'grid' : '')
        .append(grid(DIMENSION, 5, {drawControlPoints: false}));
    } else {
      $('#cat-container').append(cat(DIMENSION, {}));
    }
  }

  draw();

  $('#another').click(draw);
  $('#save').click(save);
}

$(() => {
  if (chrome && chrome.storage) {
    chrome.storage.sync.get('catsnacksPrefs', catsnacks);
  } else {
    catsnacks({gridLayout: false});
  }
})
