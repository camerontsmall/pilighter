/* Hue API wrapper */

const request = require('request');
const bodyParser = require('body-parser');

var jsonParser = bodyParser.json();

function Hue(app, wsServer, db, options){
    
    this.name = "hue";

    this.lightServer = function(){

    }

    var settings = {};
    
    var lights = {};

    function updateSettings(){
        settings = db.get('hue_settings');

        if(!settings){
            settings = {
                "bridgeIP" : "",
                "token" : ""
            }
            db.post('hue_settings', settings);
        }

    }

    function authoriseBridge(){

        var path = `http://${settings.bridgeIP}/api/`;

        var requestBody = { devicetype : "pilighter" }

        try{
            var req = request({
                uri : path,
                json: true,
                method : "POST",
                body : requestBody
            }, function(e, r, body){
                if(body[0].error){
                    console.log("hue: Request error");
                    return;
                }

                var token = body[0].success.username;

                if(token){
                    console.log("hue: Got token " + token);
                    db.post('hue_settings', {token : token}, true);
                    updateLightList();
                }
                    
            });

        }catch(err){
            console.log(err);
        }

        return req;
    }


    function updateLightList(){
        var path = `http://${settings.bridgeIP}/api/${settings.token}/lights`;
        
        try{
            request({
                uri : path,
                json : true
            }, function(e, r, body){

                if(!lights){ lights = body;  return; }
                
                for(n in lights){

                    

                    var light = lights[n];

                }
            });
        }catch(err){
            console.log(err);
        }
    }

    function setLightOn(id){

    }

    function setLightOff(id){

    }
    
    updateSettings();
    updateLightList();

    db.addUpdateNotifier(function(affected){
        if(affected.indexOf('hue_settings') != -1){
            updateSettings();
        }
    });

    var updateInterval = setInterval(updateLightList, 5000);

    /* Routing */

    app.get('/api/hue/authorise', function(req, res){
       authoriseBridge().pipe(res);
    });
}

module.exports = Hue;