var config = require('./config.json');

/* Dependencies */
const http = require('http');
const express = require('express');
const websocket = require('websocket').server;
const bodyParser = require('body-parser');
const fs = require('fs');

var jsonParser = bodyParser.json();

var jsonDB = require('./includes/database.js');
var hueAPI = require('./includes/hueapi.js');

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

var hue = new hueAPI(app, wsServer, db);

app.use(express.static('web'));

console.log("PiLighter 1.0.0");



server.listen(config.port, function () {
    console.log('Listening on port ' + config.port);
});