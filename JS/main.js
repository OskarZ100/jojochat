let username = "";
let ws;
let pfp = "images/pfps/test.png";
let currentScreen = 0; 
let oraPoints = 0;
let oraCPScost = 10;
let oraClickcost = 10;
let clickPower = 1;
let pointsPerSecond = 0;
let account_pfps = [];
let account_effects = [];
let currentEffect = "none";
let currentlyPlayingEffect = false;

const casePfpStorage = [
    //common pfps
    {name: "Speedwagon", source: "images/pfps/speedwagon.jpg"},
    {name: "Zeppeli", source: "images/pfps/zeppeli.webp"},
    {name: "Smokey", source: "images/pfps/smokey.jpg"},
    {name: "Koichi", source: "images/pfps/koichi.jpg"},
    {name: "Hayato", source: "images/pfps/hayato.png"},
    {name: "Shigechi", source: "images/pfps/Shigechi"},
    {name: "Pesci", source: "images/pfps/Pesci.webp"},
    {name: "Formaggio", source: "images/pfps/Formaggio.webp"},
    //rare pfps 
    {name: "Dante (Young)", source: "images/pfps/Dante (Young).webp"},
    {name: "Nero (DT)", source: "images/pfps/Nero (DT).jpg"},
    {name: "Lady", source: "images/pfps/Lady.jpg"},
    {name: "V", source: "images/pfps/V.jpg"},
    {name: "Lucia", source: "images/pfps/Lucia.jpg"},
    {name: "Arkham", source: "images/pfps/Arkham.webp"},
    {name: "Jester", source: "images/pfps/Jester.jpg"},
    {name: "Trish", source: "images/pfps/Trish.jpg"},
    //ledgenary pfps
    {name: "Giorno (GER)", source: "images/pfps/Giorno (GER).webp"},
    {name: "Vergil (Sin DT)", source: "images/pfps/Vergil (Sin DT).jpg"},
    {name: "samuel hyde", source: "images/pfps/samuel hyde.jpg"},
    {name: "Dante (DMC5)", source: "images/pfps/Dante (DMC5).jpg"},
    {name: "DIO", source: "images/pfps/DIO.jpg"},
    {name: "Nero (Young)", source: "images/pfps/Nero (Young).webp"},
    {name: "Kars (Ultimate)", source: "images/pfps/Kars (Ultimate).webp"},
    {name: "hmmmm", source: "images/pfps/hmmm.webp"},

    //effects
    {name: "Bruh", source: "", trigger: "bruh"},
    {name: "dmc reference", source: "", trigger: "devil may cry"},
    {name: "activation word", source: "", trigger: "ronald mcdonald"},
    //rare
    {name: "za wardo", source: "", trigger: "the world"},
    {name: "snipe", source: "", trigger: "sniped"},
    {name: "nothing happens", source: "", trigger: "happen"},
    //legend
    {name: "got a city to brun", source: "", trigger: "wake up"},
    {name: "joeyy", source: "", trigger: "nice to be nice"},
    {name: "lobotomy", source: "", trigger: "lobotomy"},
]



const buttons = [
    { id: "menu-chat-box", screen: 0, name: "chat", ui:"chat-ui" },
    { id: "menu-information-box", screen: 1, name: "information", ui:"info-ui" },
    { id: "menu-store-box", screen: 2, name: "store", ui:"store-ui"},
    { id: "menu-ora-box", screen: 3, name: "ora mini game", ui:"ora-ui"},
    //{ id: "menu-horse-box", screen: 4, name: "horse betting", ui:"horse-ui"},
    { id: "menu-account-box", screen: 4, name: "account", ui:"account-ui"}

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


function playEffect(whichEffect){
    console.log("play dat");
}

//Displaying the message onto the screen 
function displayMessage(data) {
    const container = document.createElement('div'); // Main container
    container.style.display = "flex"; // Align image and text
    if (data.effectIndex !== -1) {
        const effect = casePfpStorage[data.effectIndex];
        if (!currentlyPlayingEffect) {
            currentlyPlayingEffect = true;
            playEffect(effect);
            setTimeout(() => { 
                currentlyPlayingEffect = false; 
                console.log("stop");
            }, 3000);
        }
    }

    //css in here to make it a little more readable
    const textProfile = document.createElement('img');
    textProfile.src = data.pfp;
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
            text: text,
            pfp: pfp,
            effectIndex: currentEffect !== "none" ? 
                casePfpStorage.findIndex(item => item.trigger === currentEffect.trigger) : -1
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




document.querySelectorAll('.store-option').forEach(option => {
  option.addEventListener('click', () => {
    const type = option.dataset.type; // "pfp" or "effect"
    const item = option.dataset.item; // item ID
    let cost = 0;
    switch(item){
        case "case1":
            cost = 1;
            break;
        case "case2":
            cost = 200;
            break;
        case "case3":
            cost = 300;
            break;
    } 


    if (oraPoints >= cost) {
      oraPoints -= cost;
      updateOraUI();
      // Add to user's inventory based on type
      if (type === "pfp") {
        unlockPFP(item);
      } else if (type === "effects") {
        unlockEffect(item);
      }
    } else {
      alert("Not enough ORA points!");
    }
  });
});





function unlockEffect(item){
    var unlocked = "";
    let index;
    switch(item){
        case "case1":
            index = Math.floor(Math.random() * 3) + 24;
            break;
        case "case2":
            index = Math.floor(Math.random() * 3) + 27;
            break;
        case "case3": 
            index = Math.floor(Math.random() * 3) + 30;
            break;
    }
    console.log(casePfpStorage[index]);
    account_effects.push(casePfpStorage[index]);
    let adding = document.createElement('h1');
    adding.textContent = casePfpStorage[index].name;
    adding.addEventListener('click', () => {
        currentEffect = casePfpStorage[index]; 
        document.getElementById("current-effect").textContent = currentEffect.name; 
    });
    document.getElementById("effect-collection").appendChild(adding);
}

function unlockPFP(item){
    var unlocked = "";
    let index;
    switch(item){
        case "case3":
            index = Math.floor(Math.random() * 8) + 16;
            break;
        case "case2":
            index = Math.floor(Math.random() * 8) + 8;
            break;
        case "case1":
                index = Math.floor(Math.random() * 8);
            break;
    }
    console.log(casePfpStorage[index]);
    account_pfps.push(casePfpStorage[index]);
    let adding = document.createElement('img');
    adding.src = casePfpStorage[index].source;

    adding.addEventListener('click', () => {
        pfp = casePfpStorage[index].source; // Change global pfp
        document.getElementById("current-pfp").src = pfp; // Update account preview
    });


    document.getElementById("pfp-collection").appendChild(adding);
}


document.getElementById("first-pfp").addEventListener('click', () => {
    pfp = "images/pfps/test.png"; 
    document.getElementById("current-pfp").src = pfp; 
});

document.getElementById("first-effect").addEventListener('click', () => {
    currentEffect = "none"; 
    document.getElementById("current-effect").textContent = currentEffect; 
});