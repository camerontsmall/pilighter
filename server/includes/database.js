/* Database class */

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

function JsonDB(app, wsServer, debug = true){

    var storage = [];

    var prefix = '/db';

    var db = this;
    
    var updateNotifiers = [];
    
    this.addUpdateNotifier = function(fn){ updateNotifiers.push(fn); }

    this.clear = function(){
        var affected = [];
        for(i in storage){
            affected.push(storage[i]._id);
        }
        storage = null;
        storage = [];
        db.notifyClients(affected, "DELETE");
        if(debug) console.log('db: Cleared database');
    }

    this.get = function(id){
        if(!isValidID(id)) return false;
        for(i in storage){
            if(storage[i]._id == id){
                return storage[i];
            }
        }
        return false;
    }

    /* Output everything */
    this.getAll = function(){
        return storage;
    }

    /* Output records with ids matching regex */
    this.getRegex = function(regex){
        var re = new RegExp(regex);
        var results = [];

        for(i in storage){
            if(re.test(storage[i]._id)){
                results.push(storage[i]);
            }   
        }

        return results;
    }

    /* For massive queries or where a promise is required */
    this.getRegexAsync = function(regex){

        return new Promise(function(resolve, reject){
            var data = this.getRegex(regex);
            resolve(data);
        });
    }

    this.post = function(id, data, upsert = false){
        //id must be string and not already in db
        if(!isValidID(id)) return false;

        //Prevent crash
        if(data == null) data = {};

        //Write ID
        data._id = id;

        //If record exists overwrite it
        for(i in storage){
            if(storage[i]._id == data._id){

                if(upsert){
                    //Upsert record
                    for(n in data){
                        storage[i][n] = data[n];
                    }
                    if(debug) console.log("db: Upserted record " + data._id);
                }else{
                    //overwrite record
                    storage[i] = data;
                    if(debug) console.log("db: Updated record " + data._id);
                }
                db.notifyClients([id], "UPDATE");
                return storage[i];
            }
        }
        //Else add new record
        storage.push(data);
        if(debug) console.log("db: Inserted record " + data._id);
        db.notifyClients([data._id], "INSERT");
        return data;
    }

    this.delete = function(id){ 
        if(!isValidID(id)) return false;

        for(i in storage){
            if(storage[i]._id == id){
                var value = storage[i];
                storage.splice(i,1);
                if(debug) console.log("db: Deleted record " + id);
                db.notifyClients([id], "DELETE");
                return value;
            }
        }

        if(debug) console.log("db: Cannot delete record " + id + " as it does not exist");
        return false;
    }

    /* Delete items in the database whose ids match the provided regexp */
    this.deleteRegex = function(regex){
        var re = new RegExp(regex);
        var matches = false;
        var affected = [];
        for(i in storage){
            var id = storage[i]._id;
            if(re.test(id)){
                matches = true;
                affected.push(id);
                storage[i]._marked = true;
            }   
        }
        //Loop through storage until all marked items are gone
        var done = false;
        while(done == false){
            done = true;
            for(i in storage){
                doc = storage[i];
                if(doc._marked){
                    done = false;
                    storage.splice(i,1);
                    if(debug) console.log('db: Deleted record ' + doc._id);
                    break;
                }
            }
        }
        db.notifyClients(affected,"DELETE");
        return matches;
    }
    
    this.deleteRegexAsync = function(regex){
        
        return new Promise(function(resolve, reject){
            this.deleteRegex(regex);
        });
    }

    //Replace entire database with new values
    this.restore = function(data){
        storage = data;
        var affected = [];
        for(n in storage){
            affected.push(storage[n]._id);
        }
        db.notifyClients(affected, "INSERT");
    }

    app.get(prefix + '/all', function(req, res){
        var data = db.getAll();
        res.json(data);
    });
    
    app.get(prefix + '/regex/:REGEX', function(req, res){
        var data = db.getRegex(req.params.REGEX);
        res.json(data);
    });

    app.get(prefix + '/:ID', function(req, res){
        var data = db.get(req.params.ID);
        if(data == false){
            res.status(404).send("Record not found");
            
        }else{
            res.json(data);
        }
    });

    app.post(prefix + '/:ID', jsonParser, function(req, res){
        var data = db.post(req.params.ID, req.body, true);
        if(data){
            res.status(200).send(data);
        }else{
            res.status(400).send("Unknown error occurred");
        }
    });

    /* Overwrite records instead of upserting */
    app.put(prefix + '/:ID', jsonParser, function(req, res){
        var data = db.post(req.params.ID, req.body, false);
        if(data){
            res.status(200).send(data);
        }else{
            res.status(400).send("Unknown error occurred");
        }
    });

    app.delete(prefix + '/regex/:REGEX', function(req, res){
        if(db.deleteRegex(req.params.REGEX)){
            res.status(200).send();
        }else{
            res.status(404).send();
        }
    });

    app.delete(prefix + '/:ID', function(req, res){
        var data = db.delete(req.params.ID);
        if(data){
            res.status(200).send(data);
        }else{
            res.status(404).send();
        }
    });

    var connections = [];
    var connectionCount = 0;

    wsServer.on('request', function(wsReq){
        var protocol = wsReq.requestedProtocols[0];
        if(protocol == 'json-db'){

            var id = connectionCount++;
            var conn = wsReq.accept(protocol);
            var addr = conn.remoteAddress;
            //Add to list of connections
            connections.push(conn);
            //todo: replace address with something more useful
            console.log('ws: Client ' + id + ' at ' + addr + ' connected');

            conn.on('close', function(){
                console.log('ws: Client ' + id + ' at ' + addr + ' disconnected');
            });
        }else{
            wsReq.reject();
        }
    });

    this.notifyClients = function(affected, action){
        var affected_string = affected.join(',');
        var send_string = affected_string + ":"+ action;
        for(n in connections){
            connections[n].sendUTF(send_string);
        }
        //Call local notifiers
        for(n in updateNotifiers){
            updateNotifiers[n].call(null, affected, action);
        }
    }

    if(debug) console.log("db: Initialized");
}

/* Check if an ID is valid */
function isValidID(id){
    if(typeof id != 'string'){
        console.log("db: ID must be a string");
        return false;
    }
    if(id == ""){
        console.log("db: ID cannot be blank");
        return false;
    }
    if(/[^a-zA-Z0-9_-]/.test(id)){
        console.log("db: ID can only contain letters, numbers, dashes or underscores '" + id + "'");
        return false;
    }
    return true;
}

module.exports = JsonDB;

module.exports.isValidID = isValidID;