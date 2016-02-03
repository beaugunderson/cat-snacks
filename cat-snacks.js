'use strict';

var botUtilities = require('bot-utilities');
var cat = require('./lib/generate-cat.js');
var grid = require('./lib/generate-grid.js');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(Twit.prototype, botUtilities.twitMixins);

var program = require('commander');

program
  .command('tweet')
  .description('Generate and tweet a beautiful cat')
  .option('-r, --random', 'only post a percentage of the time')
  .option('-g, --grid <n>', 'force a grid tweet', parseInt)
  .action(botUtilities.randomCommand(function (options) {
    var T = new Twit(botUtilities.getTwitterAuthFromEnv());

    var imageDimension = 1024;

    // these functions accept different arguments but both accept a callback as
    // the last argument; here we create partials and pick one at random to
    // generate an image with
    function catPartial(cb) {
      var canvas = cat(imageDimension);

      canvas.toBuffer(cb);
    }

    var gridPartial = _.partial(grid, imageDimension,
                                options.grid || _.sample([2, 3, 4, 5]));
    var generateFn = catPartial;

    // 10% of posts can be a grid
    if (_.random(0, 100) >= 90 || options.grid > 0) {
      generateFn = gridPartial;
    }

    generateFn(function (err, buffer) {
      T.updateWithMedia({status: ''}, buffer, function (updateError, response) {
        if (err) {
          return console.error('TUWM error', updateError, response.statusCode);
        }

        console.log('TUWM OK');
      });
    });
  }));

program.parse(process.argv);
