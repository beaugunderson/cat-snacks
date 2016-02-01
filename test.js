'use strict';

var cat = require('./generate-cat-buffer');
var fs = require('fs');

cat(500, 0, function (err, buffer) {
  fs.writeFileSync('./output.png', buffer);
});
