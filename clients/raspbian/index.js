/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


'use strict';

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

        var rgb = hslToRgb(hue, sat, bri);

        targetStateRGB.red = rgb[0];
        targetStateRGB.green = rgb[1];
        targetStateRGB.blue = rgb[2]o;

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