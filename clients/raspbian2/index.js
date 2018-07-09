

var Gpio = require('pigpio').Gpio;
var colourConversions = require('./colours.js');
var request = require('request');

const config = require('./config.json');

var redLED = new Gpio(17, {mode: Gpio.OUTPUT});
var greenLED = new Gpio(18, {mode: Gpio.OUTPUT});
var blueLED = new Gpio(27, {mode: Gpio.OUTPUT});


function updateLightState(){

    var url = `http://${config.bridgeIP}/api/${config.bridgeKey}/lights/${config.masterID}`;

    request.get({
        uri : url,
        json : true
    }, (err, res) => {

        if(err){ console.log(err); return; }
        
        try{
            
            var state = res.body.state;
            var rgb = colourConversions.hueStateToRgb(state);
            setRGBValues(rgb);
        }catch(err){
            console.log(err);
        }
    });

}

function setRGBValues(rgb){

    console.log(rgb);

    var red = Math.floor(rgb.r);
    var green = Math.floor(rgb.g);
    var blue = Math.floor(rgb.b);

    try{
        redLED.pwmWrite(red);
        greenLED.pwmWrite(green);
        blueLED.pwmWrite(blue);
    }catch(e){
        console.log(e);
    };
}

var repeat = setInterval(updateLightState, config.pollRate);

setRGBValues({r : 225, g : 255, b : 255});