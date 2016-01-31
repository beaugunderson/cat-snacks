var cat = require('./generate-cat');

var canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;

cat(canvas);

document.querySelector('body').appendChild(canvas);