/*
 Animal Sounds: v 0.0.7

 Examples:

 Example 1:
 User: Alexa ask sound box to play tiger sound
 Alexa: This is the sound of tiger greeting. [audio tiger]. Would you like to hear another sound?
 User: No
 Alexa: Hope you have enjoyed the sound box. Goodbye!
 ...


 Example 2:
 User: Alexa ask sound box to play the sound of monster
 Alexa: This is the sound of Monster laughing. [audio monster laughing]. Would you like to hear another sound?
 User: Yes
 Alexa: This is the sound of Chicks-hatching. [audio Chicks-hatching]. Would you like to hear another sound?
 User: How about bird?
 Alexa: This is the sound of bird chirping. [audio bird-chirping]. Would you like to hear another sound?
 ...

 User: List Sample sounds
 Alexa: Here is a sample list of sounds: Chicken coop, Cobra striking and Dog fight
 ...

 User: Play sound collage
 Alexa: [audio Chicken coop], [audio dinosaur] [audio fire]
 ...

 */

var alexa = require('alexa-app');
var IntentHandler = require('./intent_handler');
var _ = require('lodash');

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1;

var app = new alexa.app('sound-box');
var IntentHandler = new IntentHandler();

var intents = [
  IntentHandler.getFirstSoundsIntent,
  IntentHandler.nameOnlyIntent,
  IntentHandler.soundCollageIntent,
  IntentHandler.helpIntent,
  IntentHandler.repeatIntent,
  IntentHandler.stopIntent,
  IntentHandler.cancelIntent,
  IntentHandler.yesIntent,
  IntentHandler.noIntent,
  IntentHandler.soundsListIntent
];

app.launch(function (req, res) {
  IntentHandler.handleLaunchRequest(req, res);
});

_.each(intents, function (intent) {
  app.intent(intent.name, intent.utterances, function (req, res) {
    intent.callFunc(req, res);
  });
});

module.exports = app;
