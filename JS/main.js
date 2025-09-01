let username = "";
let ws;

function startWebSocket() {
    ws = new WebSocket("wss://echo.websocket.org");

    ws.onopen = () => {
        console.log("Connected to WebSocket!");
        document.getElementById('loading').style.display = 'none';
    };

    ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
        const messageElement = document.createElement('div');
        messageElement.textContent = username + ": " + event.data;
        document.getElementById('chat-messages').appendChild(messageElement);
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        document.getElementById('loading').textContent = 'FAILED TO CONNECT TO THE CHAT RETRY';
    };
}




document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Stops page reload
    username = document.getElementById('welcome-name').value;
    console.log("Username entered:", username); // Test it
    document.getElementById('overlay').remove();
    document.getElementById('welcome-box').remove();
    document.getElementById('chat-ui').style.display = 'block';
    document.getElementById('loading').style.display = 'block';
    loggedIn(username);
});

function loggedIn(username){
    const header = document.createElement('h2');
    header.textContent = `Logged in as: ${username}`;
    document.body.appendChild(header);
    startWebSocket();
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value;
    if (message) {
        ws.send(message);
        input.value = ''; // Clear input
    }
}




