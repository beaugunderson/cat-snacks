'use strict';

var cat = require('../lib/generate-cat.js');
var fs = require('fs');

var canvas = cat(1024);

canvas.toBuffer(function (err, buffer) {
  fs.writeFileSync('./output.png', buffer);
});
