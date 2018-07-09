

var Gpio = require('pigpio').Gpio;
var hsv2rgb = require('./hsv2rgb.js');
var request = require('request');

const config = require('./config.json');

var redLED = new Gpio(17, {mode: Gpio.OUTPUT});
var greenLED = new Gpio(18, {mode: Gpio.OUTPUT});
var blueLED = new Gpio(27, {mode: Gpio.OUTPUT});

var targetState = {
    on: true,
    bri : 254,
    hue : 0,
    sat : 0
};


function updateLightState(){

    var url = `http://${config.bridgeIP}/api/${config.bridgeKey}/lights/${config.masterID}`;

    request.get(url, (state) => {

        console.log(state);

    });


}

var repeat = setInterval(updateLightState, config.pollRate);

