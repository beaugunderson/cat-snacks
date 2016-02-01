'use strict';

var catGrid = require('../lib/generate-grid.js');
var fs = require('fs');

console.log('generating...');

catGrid(2048, 5, function (err, buffer) {
  console.log('writing...');

  fs.writeFileSync('./output-grid.png', buffer);
});
