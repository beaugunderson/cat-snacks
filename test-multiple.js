'use strict';

var cat = require('./generate-cat.js');
var fs = require('fs');

for (var i = 1; i <= 16; i++) {
  (function(number) {
    cat(function (err, buffer) {
      var filename = './output-grid-' + number + '.png';
      fs.writeFileSync(filename, buffer);
    });
  })(i);
}
