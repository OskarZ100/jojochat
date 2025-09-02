let username = "";
let ws;

//Function to hold all the websocket logic 
function startWebSocket() {
    ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
        console.log("Connected to WebSocket!");
        document.getElementById('loading').style.display = 'none';
    };

    ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
         if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                const data = JSON.parse(reader.result);
                displayMessage(data);
            };
            reader.readAsText(event.data);
        } else {
            // Handle if data is text
            const data = JSON.parse(event.data);
            displayMessage(data);
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        document.getElementById('loading').textContent = 'FAILED TO CONNECT TO THE CHAT RETRY';
    };
}

//Displaying the message onto the screen 
function displayMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.user}: ${data.text}`;
    document.getElementById('chat-messages').appendChild(messageElement);
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value;
    if (text) {
        const data = {
            user: username, // Users username
            text: text      // Text they wanted to input
        };
        ws.send(JSON.stringify(data)); // Convert object to JSON string
        input.value = ''; //clear
    }
}

//Setting up the logic of the login 
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
    header.id = "loggedIn-name";
    header.textContent = `Logged in as: ${username}`;
    document.body.appendChild(header);
    startWebSocket();
}