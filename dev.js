'use strict';

var cat = require('./generate-cat.js');

var canvas = cat(500, false);

document.querySelector('body').appendChild(canvas);
