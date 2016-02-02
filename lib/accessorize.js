'use strict';

var _ = require('lodash');


var glasses = require('../parts/glasses')
var accessories = [glasses]


module.exports = function (ctx, options) {
  // TODO: sometimes apply multiple accessories?
  var accessory = _.sample(accessories)
  accessory(ctx, options)
};
