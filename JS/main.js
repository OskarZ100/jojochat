let username = "";
let ws;
let pfp = "images/pfps/test.png";
let currentScreen = 0; 
let oraPoints = 0;
let oraCPScost = 10;
let oraClickcost = 10;
let clickPower = 1;
let pointsPerSecond = 0;

const buttons = [
    { id: "menu-chat-box", screen: 0, name: "chat", ui:"chat-ui" },
    { id: "menu-information-box", screen: 1, name: "information", ui:"info-ui" },
    { id: "menu-store-box", screen: 2, name: "store", ui:"store-ui"},
    { id: "menu-ora-box", screen: 3, name: "ora mini game", ui:"ora-ui"},
    { id: "menu-horse-box", screen: 4, name: "horse betting", ui:"horse-ui"},
    { id: "menu-account-box", screen: 5, name: "account", ui:"account-ui"}

];
/*
The screen tracker 
0 is the chat screen I only want chat to function when on this screen 
1 is the info screen 
2 is the store screen
3 is ora
4 is horse
5 is account
*/ 
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
    const container = document.createElement('div'); // Main container
    container.style.display = "flex"; // Align image and text

    //css in here to make it a little more readable
    const textProfile = document.createElement('img');
    textProfile.src = pfp;
    textProfile.style.width = "30px"; // Size the image
    textProfile.style.height = "30px";
    textProfile.style.borderRadius = "50%";
    textProfile.style.marginRight = "10px";
    textProfile.style.marginTop = "10px";

    const textElement = document.createElement('div');
    textElement.textContent = `${data.user}: ${data.text}`;

    container.appendChild(textProfile);
    container.appendChild(textElement);

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.appendChild(container);
    if(currentScreen == 0){
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value;
    const maxLength = 100;

    if (text && text.length <= maxLength) {
        const data = {
            user: username,
            text: text
        };
        ws.send(JSON.stringify(data));
        input.value = '';
    } else if (text.length > maxLength) {
        alert(`Message too long! Max ${maxLength} characters. Your message is ${text.length} characters long.`);
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
    //document.body.appendChild(header);
    startWebSocket();
}


buttons.forEach(btn => {
    document.getElementById(btn.id).addEventListener('click', () => {
        let oldId = document.getElementById(buttons[currentScreen].ui);
        if (currentScreen !== btn.screen) {
            oldId.style.display = "none";
            currentScreen = btn.screen;
            let newId = document.getElementById(buttons[currentScreen].ui);
            newId.style.display = "block";
            console.log(`Switched to screen ${btn.screen}`);
            // Add function to update UI here
        } else {
            console.log(`Already on screen ${btn.screen}`);
            alert(`already on ${btn.name} screen right now`);
        }
    });
});




//update the ora UI
function updateOraUI(){
    document.getElementById("ora-amt").textContent = `TOTAL - ${oraPoints}`;
    document.getElementById("ora-perSecond").textContent = `${pointsPerSecond}/s`;
    document.getElementById("ora-clickUp").textContent = `Upgrade Click - $${oraClickcost}`;
    document.getElementById("ora-secondUp").textContent = `Upgrade CPS - $${oraCPScost}`;
    document.getElementById("profile-ora").textContent = `ORA POINTS: ${oraPoints}`;
}

function click(){
    oraPoints += clickPower;
    console.log(clickPower);
    document.getElementById("ora-amt").textContent = `TOTAL - ${oraPoints}`;
    document.getElementById("profile-ora").textContent = `ORA POINTS: ${oraPoints}`;
}

document.getElementById("ora-clicker").addEventListener('click', (event) =>{
    click();
});

document.getElementById("ora-clickUp").addEventListener('click', (event) => {
    if(oraPoints >= oraClickcost){
        oraPoints -= oraClickcost;
        //increase the amount of the cost
        clickPower = Math.floor((clickPower+1) * 1.5);
        oraClickcost = Math.floor(oraClickcost * 2);
        updateOraUI();
    }else{
        alert("you broke!!!");
    }
});

document.getElementById("ora-secondUp").addEventListener('click', (event) => {
    if(oraPoints >= oraCPScost){
        oraPoints -= oraCPScost;
        //increase the amount of the cost
        pointsPerSecond = Math.floor((pointsPerSecond + 1) * 1.3);
        oraCPScost = Math.floor(oraCPScost * 1.8);
        updateOraUI();
    }else{
        alert("you broke!!!");
    }
});

setInterval(() => {
    oraPoints += pointsPerSecond;
    updateOraUI();
}, 1000);