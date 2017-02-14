/* Ties together multiple light control systems */

function LightManager(app, wsServer, db){
    var lights;
    
    this.registerLight = function(id, state, controller){
       
    }

    this.deRegisterLight = function(id, state, controller){

    }

    this.enact = function(commandString){

    }

    this.addToGroup = function(lightID, groupID){
        var group = db.get(groupID);
    }
}

module.exports = LightManager;