'use strict';

var Helper = require("./helper");
var _ = require('lodash');

function IntentHandler() {
  var helper = new Helper();
  var soundQuestionText = "So, what  sound would you like to hear? ",
    nextText = " <s>Would you like to hear another sound?</s>";

  var getFirstSoundsIntent = {
      "utterances": {
        "slots": {"SoundSlot": "LIST_OF_SOUNDS"},
        'utterances': ['{Play} {-|SoundSlot} {sound}']
      },
      name: 'getFirstSoundsIntent',
      callFunc: handleGetFirstSoundsIntent
    },
    nameOnlyIntent = {
      "utterances": {
        "slots": {"SoundSlot": "LIST_OF_SOUNDS"},
        'utterances': ['{|Play|Play the sound of|How about} {-|SoundSlot}']
      },
      name: 'nameOnlyIntent',
      callFunc: handleGetFirstSoundsIntent
    },
    soundCollageIntent = {
      "utterances": {
        "slots": {},
        'utterances': ['{Play a sound collage|Sound collage|Do sound collage}']
      },
      name: 'soundCollageIntent',
      callFunc: handleGetSoundCollageIntentIntent
    },
    soundsListIntent = {
      "utterances": {
        'slots': {},
        'utterances': ['{|List} {Sample  sounds |Sample sounds |Sample |Available sounds|some sounds}']
      },
      name: 'soundsListIntent',
      callFunc: handleSoundsListIntent
    };

  var helpIntent = {
      name: 'AMAZON.HelpIntent',
      utterances: {},
      callFunc: handleHelpIntent
    },
    cancelIntent = {
      name: 'AMAZON.CancelIntent',
      utterances: {},
      callFunc: goodBye
    },
    repeatIntent = {
      name: 'AMAZON.RepeatIntent',
      utterances: {},
      callFunc: handleRepeatIntent
    },
    stopIntent = {
      name: 'AMAZON.StopIntent',
      utterances: {},
      callFunc: goodBye
    },
    yesIntent = {
      name: 'AMAZON.YesIntent',
      utterances: {},
      callFunc: handleYesIntent
    },
    noIntent = {
      name: 'AMAZON.NoIntent',
      utterances: {},
      callFunc: goodBye
    };

  function playSound(req, res) {
    var current = res.session('current'),
      output = '', repeatText = '', title = '';

    if (current) {
      _.each(current.sounds, function (sound) {
        var soundText = getSoundText(sound);
        output += '<p><s>This is the sound of ' + soundText + '.</s> ' + getSoundAudio(sound) + '</p>';
        title +=  soundText;
      });
      output += nextText;
      res.session('repeatText', nextText);
      res.say(output).reprompt(output).card('', title).shouldEndSession(false);
    }
  }

  function playSoundCollage(req, res) {
    var current = res.session('current'),
      output = '', repeatText = '';

    if (current) {
      _.each(current.sounds, function (sound) {
        output += '<p>' + getSoundAudio(sound) + '</p>';
      });
      output += 'There it is. ' + nextText;
      res.session('repeatText', nextText);
      res.say(output).reprompt(nextText).shouldEndSession(false);
    }
  }

  function getSoundText(name) {
    var specialCharacters = '()/\-'.split('');
    _.each(specialCharacters, function (char) {
        name = _.replace(name, char, ' ');
    });
    return name;
  }

  function getSoundFileName(name) {
    return 'https://lunch-where.herokuapp.com/sounds/animal-sounds/' + _.replace(name, /\s/g, '%20') + '-2.mp3';
  }
  function getSoundAudio(name) {
    return '<audio src="' + getSoundFileName(name) + '"/>';
  }

  function soundNotFound(req, res, sound) {
    var sorryText = 'Sorry. I am having trouble finding this  sound. ';

    tryDifferentSound(req, res, {
      text: sorryText,
      sound: sound
    });
  }

  function tryDifferentSound(req, res, soundInfo) {
    var sorryText = soundInfo.text,
      sound = soundInfo.sound,
      randomSounds =  _.map(helper.getRandomSounds(3), getSoundText),
      output = sorryText + ' Please try another  sound, such as ' + randomSounds[0] + ', '
        + randomSounds[1] + ' or ' + randomSounds[2] + '. ';

    output += '<s>' + soundQuestionText + '</s>';
    res.session('repeatText', output);
    res.say(output).reprompt(output).shouldEndSession(false);
  }

  function handleSoundsListIntent(req, res) {
    var sounds = _.map(helper.getRandomSounds(10), getSoundText),
      output = 'Here is a sample list of  sounds, <p>' + _.join(sounds, ', ') + ' .' + soundQuestionText + '</p>';
    res.session('repeatText', output);
    res.say(output).reprompt(output).shouldEndSession(false);
  }

  function handleGetFirstSoundsIntent(req, res) {
    var sound = req.slot('SoundSlot');

    if (!sound) {
      handleLaunchRequest(req, res);
      return;
    }

    var sounds = helper.findSound(sound);
    if (sounds && sounds.length > 0) {
      setCurrentSession(res, sounds, sound);
      playSound(req, res);
    } else {
      soundNotFound(req, res, sound);
    }
  }

  function goodBye(req, res) {
    var goodBye = 'Thanks. Hope you have enjoyed the sound box. Goodbye!';
    res.say(goodBye).shouldEndSession(true);
  }

  function handleGetSoundCollageIntentIntent(req, res) {
      var sounds = helper.getRandomSoundCollage(3);
      setCurrentSession(res, sounds, true);
      playSoundCollage(req, res);
  }

  function handleYesIntent(req, res) {
    var current = res.session('current');
    var soundsUsed = current.soundsPlayed;
    console.log('handle yes', soundsUsed);
    var sounds = helper.getRandomSounds(1, soundsUsed);
    setCurrentSession(res, sounds, '');
    playSound(req, res);
  }

  function handleHelpIntent(req, res) {
    var speechText = "For a specific  sounds, for example <p>nightingale</p>,  " +
      "please say <p>How does nightingale sound like</p>. Or you can simply say <p>nightingale</p>. " +
      "To get a sample list of the  sounds we have, say <p>List sample  sounds</p>. Now, what sound would you like to hear?";
    var repromptText = "Which  sound would you like to hear?";
    res.say(speechText).reprompt(repromptText).shouldEndSession(false);
  }

  function handleRepeatIntent(req, res) {
    var repeatText = res.session('repeatText');

    if (repeatText) {
      res.say(repeatText).reprompt(repeatText).shouldEndSession(false);
    } else {
      handleLaunchRequest();
    }
  }

  function setCurrentSession(res, sounds, isForCollage) {
    var session = res.session('current'),
      soundsInSession = _.get(session, 'soundsPlayed', []);

    res.session('current', {
      soundsPlayed: isForCollage?soundsInSession : _.concat(soundsInSession, sounds),
      sounds: sounds
    });
  }

  function handleLaunchRequest(req, res) {
    var sounds = helper.getRandomSounds(1);
    setCurrentSession(res, sounds, '');
    playSound(req, res);
  }

  return {
    getFirstSoundsIntent: getFirstSoundsIntent,
    nameOnlyIntent: nameOnlyIntent,
    soundCollageIntent: soundCollageIntent,
    yesIntent: yesIntent,
    noIntent: noIntent,
    helpIntent: helpIntent,
    cancelIntent: cancelIntent,
    repeatIntent: repeatIntent,
    stopIntent: stopIntent,
    soundsListIntent: soundsListIntent,
    handleLaunchRequest: handleLaunchRequest
  };
}

module.exports = IntentHandler;