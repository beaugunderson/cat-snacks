'use strict';

var cat = require('./generate-cat.js');
var fs = require('fs');

cat(1024, false, function (err, buffer) {
  fs.writeFileSync('./output.png', buffer);
});
