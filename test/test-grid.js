'use strict';

var fs = require('fs');
var grid = require('../lib/generate-grid.js');

console.log('generating...');

grid(2048, 5, {}, function (err, buffer) {
  console.log('writing...');

  fs.writeFileSync('./output-grid.png', buffer);
});
