
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
        var uri =  `http://${ip}/state/`
        request({
            uri : uri,
            method: 'put',
            json: true,
            body: state
        }, function(err, res){
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