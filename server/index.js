var config = require('./config.json');
var lightConfig = require('./lights.json');

/* Dependencies */
const http = require('http');
const express = require('express');
const websocket = require('websocket').server;
const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');

var jsonParser = bodyParser.json();

var jsonDB = require('./includes/database.js');
var LightManager = require('./includes/lightmanager.js');
var HueAPI = require('./includes/hueapi.js');
var PilighterAPI = require('./includes/pilighterapi.js');

/* Server */

var app = express();

app.use(bodyParser.json());

var server = http.createServer(app);

var wsServer = new websocket({
    httpServer : server
});

var db = new jsonDB(app, wsServer);

try{
    db.restore(JSON.parse(fs.readFileSync('appsettings.json')));
}catch(e){
    console.log(e);
}

var lightManager = new LightManager(app, wsServer, db);

var hue = new HueAPI(app, wsServer, db, lightManager);

var pi = new PilighterAPI(app, wsServer, db, lightManager);

function getLightById(id){
    for(n in lightConfig.lights){
        var light = lightConfig.lights[n];
        //console.log(light.id + " ? " + id + " " + (light.id == id));
        if(light.id == id){
            return light;
        }
    }
    return false;
}

function updateSlaves(){

    updateCount = 0;

    lightConfig.lights.forEach(function(light){

        if(light.isSlave){
            var masterLight = getLightById(light.master);
            if(masterLight.type == 'hue' && light.type == 'pi'){
                hue.getState(masterLight.hueID, function(err, res){
                    var state = res.body.state;
                    pi.setState(light.ip, state);
                });
                
            }
            
                updateCount++;
        }
    });
    //console.log("Updating " + updateCount  + " slave lights");

}

hue.getState(1, function(err, res){
    //console.log(res.body);
});

updateSlaves();

setInterval(updateSlaves, 2000);

server.listen(config.port, function () {
    console.log('Listening on port ' + config.port);
});