'use strict';

var botUtilities = require('bot-utilities');
var cat = require('./generate-cat.js');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(Twit.prototype, botUtilities.twitMixins);

var program = require('commander');

program
  .command('tweet')
  .description('Generate and tweet a rap/news mashup')
  .option('-r, --random', 'only post a percentage of the time')
  .action(botUtilities.randomCommand(function () {
    var T = new Twit(botUtilities.getTwitterAuthFromEnv());

    cat(function (err, buffer) {
      T.updateWithMedia({status: ''}, buffer, function (updateError, response) {
        if (err) {
          return console.error('TUWM error', updateError, response.statusCode);
        }

        console.log('TUWM OK');
      });
    });
  }));

program.parse(process.argv);
