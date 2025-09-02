//Import the websocket
const WebSocket = require('ws');
//establish server and port 
const wss = new WebSocket.Server({port:8080});

//On websocket server conenction 
wss.on('connection', (ws) => {
    //check if we recive a message
    ws.on('message', (message) => {
        //display to each client on the websocket
        wss.clients.forEach(client => {
            //make sure the clients we want to display to are actually still conected 
            if(client.readyState === WebSocket.OPEN){
                //send
                client.send(message);
            }
        });
    });
});