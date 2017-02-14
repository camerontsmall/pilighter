
function PiLighterAPI(app, wsServer, db, lightManager){
    
    this.name = "pi";

    //WebSocket interface
    var connectionCount = 0;
    var connections = [];

    wsServer.on('request', function(wsReq){
        try{
            var protocol = wsReq.requestedProtocols[0];
            if(protocol == 'pilighter'){

                var id = connectionCount++;
                var conn = wsReq.accept(protocol);
                var addr = conn.remoteAddress;
                //Add to list of connections
                connections.push(conn);
                //todo: replace address with something more useful
                console.log('pi: Client ' + id + ' at ' + addr + ' connected');

                lightManager.registerLight(addr, control);

                conn.on('close', function(){
                    console.log('pi: Client ' + id + ' at ' + addr + ' disconnected');

                    lightManager.deRegisterLight(addr, control);
                });
            }
        }catch(e){console.log(e);}
       
    });

     function setLightPower(ip, power){
       for(n in connections){
            var conn = connections[n];
           if(conn.remoteAddress == ip){
                conn.sendUTF('pow:' + power);
           }
       }
    }
    
    function setBrightness(ip, bri){
        for(n in connections){
            var conn = connections[n];
           if(conn.remoteAddress == ip){
                conn.sendUTF('bri:' + bri);
           }
       }
    }

    function setSaturation(ip, sat){
        for(n in connections){
            var conn = connections[n];
           if(conn.remoteAddress == ip){
                conn.sendUTF('sat:' + sat);
           }
       }
    }

    function setHue(ip, hue){
        for(n in connections){
            var conn = connections[n];
           if(conn.remoteAddress == ip){
                conn.sendUTF('hue:' + hue);
           }
       }
    }

    var control = {};
    this.control = control;

    control.power = setLightPower;
    control.brightness = setBrightness;
    control.saturation = setSaturation;
    control.hue = setHue;

}

module.exports = PiLighterAPI;