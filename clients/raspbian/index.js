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
var memdb = require('./database.js');
var websocket = require('websocket').server;
var bodyparser = require('body-parser');
var Gpio = require('pigpio').Gpio;

var jsonParser = bodyparser.json();

var config = require('./config.json');

var app = express();

var server = http.createServer(app);

var wsApp = new websocket({
    httpServer : server
});


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

    var colours = db.get('colours');
    var red = colours.r;
    var green = colours.g;
    var blue = colours.b;
    console.log("Set colour to " + red + ',' + green + ',' + blue);

    redLED.pwmWrite(red);
    greenLED.pwmWrite(green);
    blueLED.pwmWrite(blue);

}

db.post('colours',{ r : 255, g : 255, b : 255});

app.put('/state', jsonParser, function(req, res){
    try{

        state.on = req.body.state.on;
        state.bri = req.body.state.bri;
        state.hue = req.body.state.hue;
        state.

    }catch(e){
        console.log(e);
    }
});

server.listen(config.port, function(){
    console.log("Server running on " + config.port);
});