'use strict';

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [ r * 255, g * 255, b * 255 ];
}


var http = require('http');
var express = require('express');
var bodyparser = require('body-parser');
var Gpio = require('pigpio').Gpio;

var jsonParser = bodyparser.json();

var app = express();

var server = http.createServer(app);

app.use(express.static('web'));

var redLED = new Gpio(17, {mode: Gpio.OUTPUT});
var greenLED = new Gpio(18, {mode: Gpio.OUTPUT});
var blueLED = new Gpio(27, {mode: Gpio.OUTPUT});

var ticksLeft = 25;

var targetState = {
    on: true,
    bri : 254,
    hue : 0,
    sat : 0
}


var stateRGB = {
    red : 0,
    green : 0,
    blue: 0
}

var targetStateRGB = {
    red : 0,
    green : 0,
    blue: 0
}

function convertColours(){

    var oldRed = Math.floor(targetStateRGB.red);
    var oldGreen = Math.floor(targetStateRGB.green);
    var oldBlue = Math.floor(targetStateRGB.blue);

    if(targetState.on){
        
        bri = targetState.bri / 254;
        hue = targetState.hue / 65535;
        sat = targetState.sat / 254;

        var rgb = hsvToRgb(hue, sat, bri);

        targetStateRGB.red = rgb[0];
        targetStateRGB.green = rgb[1];
        targetStateRGB.blue = rgb[2];

    }else{

        targetStateRGB.red = 0;
        targetStateRGB.green = 0;
        targetStateRGB.blue = 0;
    }

    if((targetStateRGB.red != oldRed) || (targetStateRGB.green != oldGreen) || (targetStateRGB.blue != oldBlue)){
         ticksLeft = 25;
         console.log((targetStateRGB.red) + ":" + (targetStateRGB.green) + ":" + (targetStateRGB.blue));
    }

    //console.log(`R:${red} G:${green} B:${blue}`);

}

function updateOutput(){

    var red = Math.floor(stateRGB.red);
    var green = Math.floor(stateRGB.green);
    var blue = Math.floor(stateRGB.blue);

    try{
        redLED.pwmWrite(red);
        greenLED.pwmWrite(green);
        blueLED.pwmWrite(blue);
    }catch(e){
        console.log(e);
        console.log(stateRGB);
    };
    

}

function fadeTo(){

    if(ticksLeft >= 1){
        var redDiff = (targetStateRGB.red - stateRGB.red) / (ticksLeft);
        var greenDiff = (targetStateRGB.green - stateRGB.green) / (ticksLeft);
        var blueDiff = (targetStateRGB.blue - stateRGB.blue) / (ticksLeft);

        stateRGB.red = stateRGB.red + redDiff;
        stateRGB.green = stateRGB.green + greenDiff;
        stateRGB.blue = stateRGB.blue + blueDiff;

        if(redDiff != 0 || greenDiff != 0 || blueDiff != 0) ticksLeft--;
    }else{
        stateRGB.red = targetStateRGB.red;
        stateRGB.green = targetStateRGB.green;
        stateRGB.blue = targetStateRGB.blue;
    }


    updateOutput();
}

setInterval(fadeTo, 20);

app.put('/state', jsonParser, function(req, res){
    try{
        var inState = req.body;

        if(inState.on !== undefined) targetState.on = inState.on;
        if(inState.bri !== undefined) targetState.bri = inState.bri;
        if(inState.hue !== undefined) targetState.hue = inState.hue;
        if(inState.sat !== undefined) targetState.sat = inState.sat;
        if(inState.xy !== undefined) targetState.xy = inState.xy;

        convertColours();

        res.send(200);
    }catch(e){
        console.log(e);
        res.status(400).send();
    }
});

app.get('/state', function(req, res){
    var json = JSON.stringify(targetState);
    res.send(json);
});

server.listen(80, function(){
    console.log("Server running on " + 80);
});