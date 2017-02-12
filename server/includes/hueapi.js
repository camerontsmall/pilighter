/* Hue API wrapper */

const request = require('request');

function Hue(app, wsServer, db, options){

    var settings = {};

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
                db.post('hue_lights',body);
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

    var updateInterval = setInterval(updateLightList, 5000);

    /* Routing */

    app.get('/api/hue/authorise', function(req, res){
       authoriseBridge().pipe(res);
    });
}

module.exports = Hue;