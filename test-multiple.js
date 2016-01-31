'use strict';

var catGrid = require('./generate-grid.js');
var fs = require('fs');

catGrid(function (err, buffer) {
  fs.writeFileSync('./output-grid.png', buffer);
});
