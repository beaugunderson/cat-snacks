'use strict';

var cat = require('./generate-cat-buffer');
var fs = require('fs');

cat(function (err, buffer) {
  fs.writeFileSync('./output.png', buffer);
});
