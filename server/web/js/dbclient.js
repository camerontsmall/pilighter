/* Client for the in-memory dataase */
function dbClient(){

    var prefix = '/db';

    var db = this;

    var $ROOT = window.location.hostname + ":" + window.location.port;

    var ws;

    function connectWebSocket(){

        var ws = new WebSocket('ws://' + $ROOT, ['json-db']);

        ws.onmessage = function(mEvent){
            var mess = mEvent.data.split(':');
            var action = mess[1];
            var affected = mess[0].split(',');
            db.notifyParties(affected, action);
            console.log('db: ' + action + " '" + affected + "'");
        }

        ws.onclose = function(mEvent){
            console.log("db: Lost websocket connection. Trying again in 5 seconds");
            setTimeout(connectWebSocket, 5000);
        }
    }

    connectWebSocket();

    var updateNotifiers = [];

    this.getAll = function(){
        var url = prefix + '/all';
        return $.get(url);
    }

    this.get = function(id){
        var url = prefix + '/' + id;
        return $.get(url);
    }

    this.getRegex = function(regex){
        var url = prefix + '/regex/' + encodeURIComponent(regex);
        return $.get(url);
    }

    this.post = function(id, data){
        var url = prefix + '/' + id;
        json = JSON.stringify(data);
        return $.ajax({url: url, method: 'POST', contentType: 'application/json', processData : false, data: json });
    }

    this.put = function(id, data){
        var url = prefix + '/' + id;
        json = JSON.stringify(data);
        return $.ajax({url: url, method: 'PUT', contentType: 'application/json', processData : false, data: json });
    }

    this.delete = function(id){
        var url = prefix + '/' + id;
        return $.ajax({url: url, method : 'DELETE'});
    }

    this.deleteRegex = function(regex){
        var url = prefix + '/' + regex;
        return $.ajax({url: url, method: 'DELETE'});
    }

    this.addUpdateNotifier = function(fn){
        updateNotifiers.push(fn);
    }
    
    //Trigger callback function when a request is made
    this.notifyParties = function(affected, action){
        for(n in updateNotifiers){
            updateNotifiers[n].call(null,affected, action);
        }
    }


}