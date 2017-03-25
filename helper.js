'use strict';
var _ = require('lodash');
var availableSounds = require('./data/available-sounds.json');

function Helper() {

  Helper.prototype.getRandomSounds = getRandomSounds;
  Helper.prototype.findSound = findSound;
  Helper.prototype.getRandomSoundCollage = getRandomSoundCollage;

  function getRandomSounds(size, exclude) {
    var Sounds = _.clone(availableSounds);
    if (exclude && _.get(exclude, 'length') < Sounds.length) {
      var excludes = _.clone(excludes);
      excludes = _.map(excludes, function (ex) {
          return ex.toLowerCase();
      });
      console.log(excludes);
      Sounds = _.filter(Sounds, function (sound) {
        return excludes.indexOf(sound.toLowerCase()) < 0 ;
      });
    }
    return _.take(_.shuffle(Sounds), size);
  }

  function findSound(Sound) {
    var Sound = Sound.toLowerCase(),
      sounds = [];
    _.each(availableSounds, function (sound) {
      var arr = sound.toLowerCase().trim();
      if (arr.indexOf(Sound) >= 0 ) {
        sounds.push(sound);
      }
    });
    return _.take(_.shuffle(sounds), 2);
  }

  function getRandomSoundCollage(size) {
    return _.take(_.shuffle(availableSounds), size);
  }

}

module.exports = Helper;