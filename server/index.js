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
    lightConfig.lights.forEach(function(light){
        if(light.id == id){
            return light;
        }
    });
    return false;
}

function updateSlaves(){

    lightConfig.lights.forEach(function(light){

        if(light.isSlave){
            var masterLight = getLightById(light.master);

            if(masterLight.type == 'hue' && light.type == 'pi'){
                hue.getState(masterLight.hueID, function(res){

                    pi.setState(light.ip, res.body.state);

                });
            }
        }

    });

}

hue.getState(1, function(err, res){
    console.log(res.body);
});

updateSlaves();

setInterval(updateSlaves, 500);

server.listen(config.port, function () {
    console.log('Listening on port ' + config.port);
});