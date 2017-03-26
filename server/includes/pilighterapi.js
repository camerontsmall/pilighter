
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
            url : `http://${ip}}:5055/state`,
            json: true,
            body: state
        });
    }

    var control = {};
    this.control = control;

    control.power = setLightPower;
    control.brightness = setBrightness;
    control.saturation = setSaturation;
    control.hue = setHue;

}

module.exports = PiLighterAPI;