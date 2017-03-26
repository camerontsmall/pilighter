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

var config = require('./config.json');

var app = express();

var server = http.createServer(app);

app.use(express.static('web'));

var redLED = new Gpio(17, {mode: Gpio.OUTPUT});
var greenLED = new Gpio(18, {mode: Gpio.OUTPUT});
var blueLED = new Gpio(27, {mode: Gpio.OUTPUT});

var state = {
    on: false,
    bri: 254,
    hue: 0,
    sat: 0
}

function updateOutput(){

    var red;
    var green;
    var blue;

    if(state.on){
        
        bri = state.bri / 254;
        hue = state.hue / 65535;
        sat = state.sat / 254;

        var rgb = hslToRgb(hue, sat, bri);
        red = rgb[0];
        green = rgb[1];
        blue = rgb[2];

    }else{
        red = 0;
        green = 0;
        blue = 0;
    }

    redLED.pwmWrite(red);
    greenLED.pwmWrite(green);
    blueLED.pwmWrite(blue);

}

app.put('/state', jsonParser, function(req, res){
    try{
        console.log("state: Got new state");
        console.log(state);
        if(req.body.state.on !== undefined) state.on = req.body.state.on;
        if(req.body.state.bri !== undefined) state.bri = req.body.state.bri;
        if(req.body.state.hue !== undefined) state.hue = req.body.state.hue;
        if(req.body.state.sat !== undefined) state.sat = req.body.state.sat;
        updateOutput();
    }catch(e){
        console.log(e);
    }
});

server.listen(config.port, function(){
    console.log("Server running on " + config.port);
});