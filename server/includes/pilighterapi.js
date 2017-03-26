
const request = require('request');

function PiLighterAPI(app, wsServer, db, lightManager){
    
    this.name = "pi";

    //WebSocket interface
    var connectionCount = 0;
    var connections = [];

    function setLightPower(ip, power){
       
    }
    
    function setBrightness(ip, bri){
       
    }

    function setSaturation(ip, sat){
        
    }

    function setHue(ip, hue){
        
    }

    function setState(ip, state){
        request.put({
            uri : `http://${ip}}/state`,
            json: true,
            body: state
        }).on('error', function(er){
            console.log(er);
        });
    }

    var control = {};
    this.control = control;

    control.power = setLightPower;
    control.brightness = setBrightness;
    control.saturation = setSaturation;
    control.hue = setHue;

    this.setState = setState;

}

module.exports = PiLighterAPI;