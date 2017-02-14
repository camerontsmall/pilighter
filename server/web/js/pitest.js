/* Client for the in-memory dataase */
function PiTest(){

    var $ROOT = window.location.hostname + ":" + window.location.port;

    var ws;

    function connectWebSocket(){

        var ws = new WebSocket('ws://' + $ROOT, ['pilighter']);

        ws.onmessage = function(mEvent){
            console.log(mEvent.data);
        }

        ws.onclose = function(mEvent){
            console.log("pi: Lost websocket connection. Trying again in 5 seconds");
            setTimeout(connectWebSocket, 5000);
        }
    }

    connectWebSocket();

}